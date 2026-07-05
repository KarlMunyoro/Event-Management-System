import express from 'express'
import db from '../config/db.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const router = express.Router()

// Middleware to verify JWT token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// POST /api/rsvp — confirm RSVP and generate QR code
router.post('/', authMiddleware, async (req, res) => {
  const { eventID } = req.body
  const userID = req.user.userID

  try {
    // Check if already RSVPed
    const [existing] = await db.query(
      'SELECT attendanceID FROM attendance WHERE userID = ? AND eventID = ?',
      [userID, eventID]
    )

    if (existing.length > 0) {
      // Already RSVPed — return existing QR code
      const [qr] = await db.query(
        'SELECT * FROM qr_codes WHERE attendanceID = ?',
        [existing[0].attendanceID]
      )
      return res.json({
        message: 'Already RSVPed',
        alreadyRSVPed: true,
        qrCode: qr[0],
      })
    }

    // Insert attendance record
    const [result] = await db.query(
      'INSERT INTO attendance (userID, eventID, hasCheckedIn, rsvpAt) VALUES (?, ?, false, NOW())',
      [userID, eventID]
    )

    const attendanceID = result.insertId

    // Generate unique token and 6-digit fallback code
    const token = crypto.randomBytes(32).toString('hex')
    const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Insert QR code record
    await db.query(
      'INSERT INTO qr_codes (attendanceID, token, fallbackCode, generatedAt) VALUES (?, ?, ?, NOW())',
      [attendanceID, token, fallbackCode]
    )

    res.status(201).json({
      message: 'RSVP confirmed',
      alreadyRSVPed: false,
      qrCode: { token, fallbackCode },
    })
  } catch (err) {
    console.error('RSVP error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/rsvp/check/:eventID — check if user has RSVPed
router.get('/check/:eventID', authMiddleware, async (req, res) => {
  const userID = req.user.userID
  const { eventID } = req.params

  try {
    const [rows] = await db.query(
      `SELECT a.attendanceID, q.token, q.fallbackCode
       FROM attendance a
       LEFT JOIN qr_codes q ON q.attendanceID = a.attendanceID
       WHERE a.userID = ? AND a.eventID = ?`,
      [userID, eventID]
    )

    if (rows.length === 0) {
      return res.json({ hasRSVP: false })
    }

    res.json({
      hasRSVP: true,
      qrCode: { token: rows[0].token, fallbackCode: rows[0].fallbackCode },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/rsvp/my — get all RSVPs for the logged in user
router.get('/my', authMiddleware, async (req, res) => {
  const userID = req.user.userID

  try {
    const [rows] = await db.query(`
      SELECT 
        a.attendanceID,
        a.hasCheckedIn,
        a.rsvpAt,
        e.eventID,
        e.title,
        e.eventDate,
        e.startTime,
        e.endTime,
        e.status AS eventStatus,
        e.removedReason,
        c.categoryName,
        v.venueName AS location,
        q.token,
        q.fallbackCode
      FROM attendance a
      JOIN events e ON a.eventID = e.eventID
      JOIN categories c ON e.categoryID = c.categoryID
      JOIN venues v ON e.venueID = v.venueID
      LEFT JOIN qr_codes q ON q.attendanceID = a.attendanceID
      WHERE a.userID = ?
      ORDER BY e.eventDate ASC
    `, [userID])

    res.json(rows)
  } catch (err) {
    console.error('My RSVPs error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router