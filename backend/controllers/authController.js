import { Resend } from 'resend'
import db from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

function assignRole(email) {
  if (email.endsWith('@admin.strathmore.edu')) return 'Admin'
  if (email.endsWith('@staff.strathmore.edu')) return 'Organizer'
  return 'Student'
}

function isAllowedRegistrationEmail(email) {
  const normalized = email.trim().toLowerCase()
  const senderEmail = (process.env.EMAIL_USER || '').trim().toLowerCase()
  const allowSenderEmailRegistration = process.env.ALLOW_SENDER_EMAIL_REGISTRATION === 'true'

  if (normalized.endsWith('@strathmore.edu')) return true

  if (allowSenderEmailRegistration && senderEmail && normalized === senderEmail) return true

  return false
}


export async function me(req, res) {
  const userID = req.user.userID
  try {
    const [rows] = await db.query(
      `SELECT u.userID, u.fullName, u.email, u.status, u.createdAt, u.roleChangeReason, r.roleName AS role
       FROM users u
       JOIN roles r ON u.roleID = r.roleID
       WHERE u.userID = ?`,
      [userID]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function acknowledgeRoleChange(req, res) {
  const userID = req.user.userID
  try {
    await db.query('UPDATE users SET roleChangeReason = NULL WHERE userID = ?', [userID])
    res.json({ message: 'Acknowledged' })
  } catch (err) {
    console.error('Acknowledge role change error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function changePassword(req, res) {
  const userID = req.user.userID
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' })
  }

  try {
    const [rows] = await db.query('SELECT passwordHash FROM users WHERE userID = ?', [userID])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const match = await bcrypt.compare(currentPassword, rows[0].passwordHash)
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await db.query('UPDATE users SET passwordHash = ? WHERE userID = ?', [newHash, userID])

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}


function shouldExposeDevVerificationLink() {
  return process.env.ALLOW_DEV_VERIFICATION_LINK === 'true' && process.env.NODE_ENV !== 'production'
}

function buildVerifyUrl(userID) {
  const verifyToken = jwt.sign(
    { userID },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api'
  return `${apiBaseUrl}/auth/verify/${verifyToken}`
}

async function sendVerificationEmail({ email, fullName, userID }) {
  const verifyUrl = buildVerifyUrl(userID)

  if (!process.env.RESEND_API_KEY) {
    const err = new Error('Email is not configured. Set RESEND_API_KEY.')
    err.code = 'EMAIL_CONFIG_MISSING'
    throw err
  }
 
  const resend = new Resend(process.env.RESEND_API_KEY)
 
  const sendResult = await resend.emails.send({
    // Until you verify your own domain in Resend, you MUST use
    // this exact sender — Resend provides it for testing:
    from: 'CampusEvents <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your CampusEvents account',
    html: `<p>Hi ${fullName},</p>
           <p>Click the link below to verify your account:</p>
           <p><a href="${verifyUrl}">Verify email</a></p>
           <p>If the button does not work, copy and paste this URL into your browser:</p>
           <p>${verifyUrl}</p>`,
    text: `Hi ${fullName},\n\nVerify your account using this link:\n${verifyUrl}\n\nIf you did not create this account, you can ignore this email.`,
  })
  console.log('📧 Resend response:', JSON.stringify(sendResult))
  console.log('📧 Sent to:', email)
}

async function resolveRoleID(roleName) {
  const [rows] = await db.query(
    'SELECT roleID FROM roles WHERE roleName = ? LIMIT 1',
    [roleName]
  )

  if (rows.length === 0) {
    throw new Error(`Role not found in roles table: ${roleName}`)
  }

  return rows[0].roleID
}

async function saveNormalizedUserRole(userID, roleID) {
  try {
    await db.query(
      'INSERT INTO user_roles (userID, roleID) VALUES (?, ?)',
      [userID, roleID]
    )
  } catch (err) {
    // Keep registration successful even if role-mapping tables differ.
    if (err?.code !== 'ER_DUP_ENTRY' && err?.code !== 'ER_NO_SUCH_TABLE') {
      console.warn('⚠️ Role mapping skipped:', err.message)
    }
  }
}

async function getUserWithRoleByEmail(email) {
  try {
    const [rows] = await db.query(
      `SELECT u.*, r.roleName AS role
       FROM users u
       LEFT JOIN roles r ON r.roleID = u.roleID
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    )
    return rows[0] || null
  } catch (err) {
    // Backward-compatible fallback for denormalized or different schemas.
    if (err?.code === 'ER_NO_SUCH_TABLE' || err?.code === 'ER_BAD_FIELD_ERROR') {
      try {
        const [rows] = await db.query(
          `SELECT u.*, r.roleName AS role
           FROM users u
           LEFT JOIN user_roles ur ON ur.userID = u.userID
           LEFT JOIN roles r ON r.roleID = ur.roleID
           WHERE u.email = ?
           LIMIT 1`,
          [email]
        )
        if (rows.length > 0) return rows[0]
      } catch (innerErr) {
        if (innerErr?.code !== 'ER_NO_SUCH_TABLE' && innerErr?.code !== 'ER_BAD_FIELD_ERROR') {
          throw innerErr
        }
      }

      const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
      return rows[0] || null
    }
    throw err
  }
}

export const register = async (req, res) => {
  const { fullName, email, password } = req.body

  try {
    if (!isAllowedRegistrationEmail(email)) {
      return res.status(400).json({
        message: 'Use a Strathmore email to register.',
      })
    }

    const [existing] = await db.query('SELECT userID FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const role = assignRole(email)
    const roleID = await resolveRoleID(role)

    const [result] = await db.query(
      'INSERT INTO users (fullName, email, passwordHash, roleID) VALUES (?, ?, ?, ?)',
      [fullName, email, passwordHash, roleID]
    )

    await saveNormalizedUserRole(result.insertId, roleID)

    const verifyUrl = buildVerifyUrl(result.insertId)

    // Strict flow: registration should only succeed when verification email is sent.
    try {
      await sendVerificationEmail({
        email,
        fullName,
        userID: result.insertId,
      })

      return res.status(201).json({
        message: 'Account created. Verification link sent to your email.',
        fullName,
        emailSent: true,
      })
    } catch (emailErr) {
      console.warn('⚠️ Email sending failed:', emailErr.message)

      try {
        await db.query('DELETE FROM users WHERE userID = ?', [result.insertId])
      } catch (rollbackErr) {
        console.error('Failed to rollback user after email failure:', rollbackErr)
      }

      const payload = {
        message: 'Registration failed because verification email could not be sent. Please check email configuration and try again.',
        emailSent: false,
      }

      if (shouldExposeDevVerificationLink()) {
        payload.verificationLink = verifyUrl
      }

      return res.status(502).json(payload)
    }
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await getUserWithRoleByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const userRole = user.role || assignRole(user.email)

    if (!user.emailVerifiedAt) {
      return res.status(403).json({ message: 'Please verify your email before signing in' })
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ message: 'Your account has been disabled' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userID: user.userID, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, role: userRole, fullName: user.fullName, userID: user.userID })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const verifyEmail = async (req, res) => {
  const { token } = req.params
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await db.query(
      'UPDATE users SET emailVerifiedAt = NOW() WHERE userID = ?',
      [decoded.userID]
    )
    res.redirect(`${clientUrl}/email-verification?status=success`)
  } catch (err) {
    res.redirect(`${clientUrl}/email-verification?status=error`)
  }
}

export const resendVerification = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const user = await getUserWithRoleByEmail(email)
    if (!user) {
      return res.json({ message: 'If an account exists, a verification email has been sent.' })
    }

    if (Object.prototype.hasOwnProperty.call(user, 'emailVerifiedAt') && user.emailVerifiedAt) {
      return res.json({ message: 'Your email is already verified. You can sign in.' })
    }

    const verifyUrl = buildVerifyUrl(user.userID)

    try {
      await sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        userID: user.userID,
      })
      return res.json({ message: 'Verification email sent. Please check your inbox.', emailSent: true })
    } catch (emailErr) {
      console.warn('⚠️ Resend email failed:', emailErr.message)
      const payload = {
        message: 'Could not send verification email. Check email settings and try again.',
        emailSent: false,
      }
      if (shouldExposeDevVerificationLink()) {
        payload.verificationLink = verifyUrl
      }
      return res.status(200).json(payload)
    }
  } catch (err) {
    console.error('Resend verification error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}