import db from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

function assignRole(email) {
  if (email.endsWith('@admin.strathmore.edu')) return 'Admin'
  if (email.endsWith('@staff.strathmore.edu')) return 'Organizer'
  return 'Student'
}

export const register = async (req, res) => {
  const { fullName, email, password } = req.body

  try {
    const [existing] = await db.query('SELECT userID FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const role = assignRole(email)

    const [result] = await db.query(
      'INSERT INTO users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)',
      [fullName, email, passwordHash, role]
    )

    const token = jwt.sign(
      { userID: result.insertId, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const verifyToken = jwt.sign(
      { userID: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // try to send email but do not crash if it fails
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your CampusEvents account',
        html: `<p>Hi ${fullName},</p>
               <p>Click the link below to verify your account:</p>
               <a href="${process.env.CLIENT_URL}/verify-email/${verifyToken}">Verify email</a>`,
      })
    } catch (emailErr) {
      console.warn('⚠️ Email sending failed:', emailErr.message)
    }

    res.status(201).json({
      message: 'Account created successfully',
      token,
      role,
      fullName,
    })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = rows[0]

    if (user.status === 'Disabled') {
      return res.status(403).json({ message: 'Your account has been disabled' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, role: user.role, fullName: user.fullName })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const verifyEmail = async (req, res) => {
  const { token } = req.params

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await db.query(
      'UPDATE users SET emailVerifiedAt = NOW() WHERE userID = ?',
      [decoded.userID]
    )
    res.json({ message: 'Email verified successfully' })
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired verification link' })
  }
}