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

// GET /api/qr/verify?token=XXX — public endpoint for organizer scanning
router.get('/verify', async (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ message: 'Token is required' })

  try {
    const [rows] = await db.query(`
      SELECT
        q.token,
        a.attendanceID,
        a.hasCheckedIn,
        u.fullName,
        e.title AS eventTitle,
        e.eventDate,
        v.venueName AS location
      FROM qr_codes q
      JOIN attendance a ON q.attendanceID = a.attendanceID
      JOIN users u ON a.userID = u.userID
      JOIN events e ON a.eventID = e.eventID
      JOIN venues v ON e.venueID = v.venueID
      WHERE q.token = ?
    `, [token])

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid QR code' })
    }

    const record = rows[0]
    const alreadyCheckedIn = record.hasCheckedIn

    if (!alreadyCheckedIn) {
      await db.query('UPDATE attendance SET hasCheckedIn = 1, checkedInAt = NOW() WHERE attendanceID = ?', [record.attendanceID])
      await db.query('UPDATE qr_codes SET scannedAt = NOW() WHERE token = ?', [token])
    }

    res.json({
      valid: true,
      alreadyCheckedIn,
      fullName: record.fullName,
      eventTitle: record.eventTitle,
      eventDate: record.eventDate,
      location: record.location,
    })
  } catch (err) {
    console.error('QR verify error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// REPLACE your existing GET /api/qr/verify route in qrRoutes.js with this.
// Now accepts EITHER ?token=XXX (camera scan) OR ?code=123456 (manual fallback entry).

router.get('/verify', async (req, res) => {
  const { token, code } = req.query
  if (!token && !code) {
    return res.status(400).json({ message: 'Token or code is required' })
  }

  try {
    // Look up by token (from QR scan) or fallbackCode (from manual entry)
    const [rows] = await db.query(`
      SELECT
        q.token,
        a.attendanceID,
        a.hasCheckedIn,
        u.fullName,
        e.title AS eventTitle,
        e.eventDate,
        v.venueName AS location
      FROM qr_codes q
      JOIN attendance a ON q.attendanceID = a.attendanceID
      JOIN users u ON a.userID = u.userID
      JOIN events e ON a.eventID = e.eventID
      JOIN venues v ON e.venueID = v.venueID
      WHERE q.token = ? OR q.fallbackCode = ?
    `, [token || null, code || null])

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid QR code or backup code' })
    }

    const record = rows[0]
    const alreadyCheckedIn = record.hasCheckedIn

    if (!alreadyCheckedIn) {
      await db.query(
        'UPDATE attendance SET hasCheckedIn = 1, checkedInAt = NOW() WHERE attendanceID = ?',
        [record.attendanceID]
      )
      await db.query('UPDATE qr_codes SET scannedAt = NOW() WHERE token = ?', [record.token])
    }

    res.json({
      valid: true,
      alreadyCheckedIn,
      fullName: record.fullName,
      eventTitle: record.eventTitle,
      eventDate: record.eventDate,
      location: record.location,
    })
  } catch (err) {
    console.error('QR verify error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})


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