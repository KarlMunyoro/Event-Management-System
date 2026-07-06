// ============================================================
//  organizerRequestRoutes.js  (NEW FILE)
//  Mount in index.js:  app.use('/api/organizer-requests', organizerRequestRoutes)
// ============================================================
import express from 'express'
import db from '../config/db.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })
  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// GET /api/organizer-requests/mine — the current user's most recent request
router.get('/mine', authMiddleware, async (req, res) => {
  const userID = req.user.userID
  try {
    const [rows] = await db.query(
      `SELECT requestID, clubName, reason, status, requestedAt, reviewedAt
       FROM organizer_requests
       WHERE userID = ?
       ORDER BY requestedAt DESC
       LIMIT 1`,
      [userID]
    )
    res.json(rows[0] || null)
  } catch (err) {
    console.error('Fetch own organizer request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/organizer-requests — submit a new organizer access request
router.post('/', authMiddleware, async (req, res) => {
  const userID = req.user.userID
  const { clubName, reason } = req.body

  if (!clubName || !clubName.trim()) {
    return res.status(400).json({ message: 'Club name is required' })
  }

  try {
    await db.query(
      'INSERT INTO organizer_requests (userID, clubName, reason) VALUES (?, ?, ?)',
      [userID, clubName.trim(), reason?.trim() || null]
    )
    res.status(201).json({ message: 'Request submitted successfully' })
  } catch (err) {
    console.error('Organizer request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
