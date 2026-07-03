
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

function adminOnly(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

// ------------------------------------------------------------
// GET /api/admin/dashboard
// ------------------------------------------------------------
router.get('/dashboard', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [pending] = await db.query(
      `SELECT COUNT(*) AS total FROM organizer_requests WHERE status = 'Pending'`
    )
    const [users] = await db.query(`SELECT COUNT(*) AS total FROM users`)
    const [activeEvents] = await db.query(
      `SELECT COUNT(*) AS total FROM events WHERE status = 'Active'`
    )
    const [pendingEvents] = await db.query(
      `SELECT COUNT(*) AS total FROM events WHERE status = 'Pending'`
    )

    res.json({
      pendingRequests: pending[0].total,
      totalUsers: users[0].total,
      activeEvents: activeEvents[0].total,
      pendingEvents: pendingEvents[0].total,
    })
  } catch (err) {
    console.error('Admin dashboard error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ------------------------------------------------------------
// GET /api/admin/organizer-requests  — all pending requests
// ------------------------------------------------------------
router.get('/organizer-requests', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        req.requestID,
        req.clubName,
        req.reason,
        req.status,
        req.requestedAt,
        u.userID,
        u.fullName,
        u.email
      FROM organizer_requests req
      JOIN users u ON req.userID = u.userID
      WHERE req.status = 'Pending'
      ORDER BY req.requestedAt ASC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Organizer requests error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ------------------------------------------------------------
// PUT /api/admin/organizer-requests/:id  — approve or reject
// Approving also promotes the user to Organizer (roleID = 2)
// ------------------------------------------------------------
router.put('/organizer-requests/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params
  const { action } = req.body // 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Action must be approve or reject' })
  }

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const [rows] = await conn.query(
      `SELECT userID, status FROM organizer_requests WHERE requestID = ?`,
      [id]
    )
    if (rows.length === 0) {
      await conn.rollback()
      return res.status(404).json({ message: 'Request not found' })
    }
    if (rows[0].status !== 'Pending') {
      await conn.rollback()
      return res.status(400).json({ message: 'Request has already been reviewed' })
    }

    const newStatus = action === 'approve' ? 'Approved' : 'Rejected'

    await conn.query(
      `UPDATE organizer_requests SET status = ?, reviewedAt = NOW() WHERE requestID = ?`,
      [newStatus, id]
    )

    // Promote the user to Organizer on approval
    if (action === 'approve') {
      await conn.query(
        `UPDATE users SET roleID = 2 WHERE userID = ?`,
        [rows[0].userID]
      )
    }

    await conn.commit()
    res.json({ message: `Request ${newStatus.toLowerCase()} successfully` })
  } catch (err) {
    await conn.rollback()
    console.error('Review request error:', err)
    res.status(500).json({ message: 'Server error' })
  } finally {
    conn.release()
  }
})

// ------------------------------------------------------------
// GET /api/admin/users?search=  — all users, optional search
// ------------------------------------------------------------
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  const { search } = req.query
  try {
    let query = `
      SELECT u.userID, u.fullName, u.email, u.status, u.createdAt, r.roleName AS role
      FROM users u
      JOIN roles r ON u.roleID = r.roleID
    `
    const params = []
    if (search && search.trim()) {
      query += ` WHERE u.fullName LIKE ? OR u.email LIKE ?`
      const like = `%${search.trim()}%`
      params.push(like, like)
    }
    query += ` ORDER BY u.createdAt DESC`

    const [rows] = await db.query(query, params)
    res.json(rows)
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ------------------------------------------------------------
// PUT /api/admin/users/:id  — change role or status
// Admin cannot disable or demote their own account
// ------------------------------------------------------------
router.put('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params
  const { role, status } = req.body
  const requesterID = req.user.userID

  // Prevent self-modification
  if (Number(id) === Number(requesterID)) {
    return res.status(400).json({ message: 'You cannot change your own account' })
  }

  try {
    const [existing] = await db.query('SELECT userID FROM users WHERE userID = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update role if provided
    if (role) {
      const [roleRow] = await db.query('SELECT roleID FROM roles WHERE roleName = ?', [role])
      if (roleRow.length === 0) {
        return res.status(400).json({ message: 'Invalid role' })
      }
      await db.query('UPDATE users SET roleID = ? WHERE userID = ?', [roleRow[0].roleID, id])
    }

    // Update status if provided
    if (status) {
      if (!['Active', 'Disabled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' })
      }
      await db.query('UPDATE users SET status = ? WHERE userID = ?', [status, id])
    }

    res.json({ message: 'User updated successfully' })
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
