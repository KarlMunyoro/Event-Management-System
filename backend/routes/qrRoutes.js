import express from 'express'
import db from '../config/db.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

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

// GET /api/qr/:attendanceID — get QR code data for a specific attendance record
router.get('/:attendanceID', authMiddleware, async (req, res) => {
  const { attendanceID } = req.params
  const userID = req.user.userID

  try {
    const [rows] = await db.query(`
      SELECT 
        q.token,
        q.fallbackCode,
        q.generatedAt,
        q.scannedAt,
        a.userID,
        a.hasCheckedIn,
        e.title,
        e.eventDate,
        e.startTime,
        e.endTime,
        v.venueName AS location
      FROM qr_codes q
      JOIN attendance a ON q.attendanceID = a.attendanceID
      JOIN events e ON a.eventID = e.eventID
      JOIN venues v ON e.venueID = v.venueID
      WHERE q.attendanceID = ?
    `, [attendanceID])

    if (rows.length === 0) {
      return res.status(404).json({ message: 'QR code not found' })
    }

    const record = rows[0]

    // Make sure the QR code belongs to the logged in user
    if (record.userID !== userID) {
      return res.status(403).json({ message: 'Not authorized to view this QR code' })
    }

    res.json({
      token: record.token,
      fallbackCode: record.fallbackCode,
      hasCheckedIn: record.hasCheckedIn,
      scannedAt: record.scannedAt,
      event: {
        title: record.title,
        eventDate: record.eventDate,
        startTime: record.startTime,
        endTime: record.endTime,
        location: record.location,
      },
    })
  } catch (err) {
    console.error('QR fetch error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router