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

function organizerOnly(req, res, next) {
  if (req.user.role !== 'Organizer') {
    return res.status(403).json({ message: 'Organizer access required' })
  }
  next()
}

// GET /api/organizer/dashboard
router.get('/dashboard', authMiddleware, organizerOnly, async (req, res) => {
  const organizerID = req.user.userID

  try {
    // Upcoming events created by this organizer
    const [upcomingEvents] = await db.query(`
      SELECT e.eventID, e.title, e.eventDate, e.startTime, e.endTime, e.status,
             v.venueName AS location, c.categoryName
      FROM events e
      JOIN venues v ON e.venueID = v.venueID
      JOIN categories c ON e.categoryID = c.categoryID
      WHERE e.organizerID = ? AND e.status = 'Active'
      ORDER BY e.eventDate ASC
      LIMIT 5
    `, [organizerID])

    // Total upcoming events count
    const [eventCount] = await db.query(
      `SELECT COUNT(*) AS total FROM events WHERE organizerID = ? AND status = 'Active'`,
      [organizerID]
    )

    // Total RSVPs across all this organizer's events this month
    const [rsvpCount] = await db.query(`
      SELECT COUNT(*) AS total
      FROM attendance a
      JOIN events e ON a.eventID = e.eventID
      WHERE e.organizerID = ? AND MONTH(a.rsvpAt) = MONTH(CURDATE()) AND YEAR(a.rsvpAt) = YEAR(CURDATE())
    `, [organizerID])

    // Recent attendance summary per event (archived events with check-in data)
    const [recentAttendance] = await db.query(`
      SELECT 
        e.eventID, e.title,
        COUNT(a.attendanceID) AS totalRSVPs,
        SUM(a.hasCheckedIn) AS totalCheckedIn
      FROM events e
      LEFT JOIN attendance a ON a.eventID = e.eventID
      WHERE e.organizerID = ? AND e.status = 'Archived'
      GROUP BY e.eventID, e.title
      ORDER BY e.eventDate DESC
      LIMIT 5
    `, [organizerID])

    // Average attendance rate
    const totalRSVPsAll = recentAttendance.reduce((sum, e) => sum + e.totalRSVPs, 0)
    const totalCheckedInAll = recentAttendance.reduce((sum, e) => sum + (e.totalCheckedIn || 0), 0)
    const avgAttendanceRate = totalRSVPsAll > 0
      ? Math.round((totalCheckedInAll / totalRSVPsAll) * 100)
      : 0

    res.json({
      upcomingEvents,
      stats: {
        totalUpcomingEvents: eventCount[0].total,
        totalRSVPsThisMonth: rsvpCount[0].total,
        avgAttendanceRate,
      },
      recentAttendance,
    })
  } catch (err) {
    console.error('Organizer dashboard error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router