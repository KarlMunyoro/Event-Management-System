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

// GET /api/feedback/check/:eventID — check if student already left feedback, and get event/attendance info
router.get('/check/:eventID', authMiddleware, async (req, res) => {
  const userID = req.user.userID
  const { eventID } = req.params

  try {
    const [attendance] = await db.query(
      'SELECT attendanceID, hasCheckedIn FROM attendance WHERE userID = ? AND eventID = ?',
      [userID, eventID]
    )

    if (attendance.length === 0) {
      return res.status(403).json({ message: 'You did not RSVP for this event' })
    }

    const attendanceID = attendance[0].attendanceID

    const [event] = await db.query(
      'SELECT title, eventDate, status FROM events WHERE eventID = ?',
      [eventID]
    )

    const [existingFeedback] = await db.query(
      'SELECT starRating, comment FROM feedback WHERE attendanceID = ?',
      [attendanceID]
    )

    res.json({
      attendanceID,
      event: event[0],
      alreadySubmitted: existingFeedback.length > 0,
      existingFeedback: existingFeedback[0] || null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/feedback — submit feedback for an attendance record
router.post('/', authMiddleware, async (req, res) => {
  const { attendanceID, starRating, comment } = req.body
  const userID = req.user.userID

  if (!starRating || starRating < 1 || starRating > 5) {
    return res.status(400).json({ message: 'Star rating must be between 1 and 5' })
  }

  try {
    // Confirm this attendance record belongs to the logged in user
    const [attendance] = await db.query(
      'SELECT userID FROM attendance WHERE attendanceID = ?',
      [attendanceID]
    )

    if (attendance.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found' })
    }

    if (attendance[0].userID !== userID) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this attendance' })
    }

    // Check for duplicate feedback
    const [existing] = await db.query(
      'SELECT feedbackID FROM feedback WHERE attendanceID = ?',
      [attendanceID]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' })
    }

    await db.query(
      'INSERT INTO feedback (attendanceID, starRating, comment, submittedAt) VALUES (?, ?, ?, NOW())',
      [attendanceID, starRating, comment || null]
    )

    res.status(201).json({ message: 'Feedback submitted successfully' })
  } catch (err) {
    console.error('Feedback submission error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router