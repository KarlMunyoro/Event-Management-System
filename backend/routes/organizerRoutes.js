import express from 'express'
import db from '../config/db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()


router.get('/events', requireAuth, requireRole('Organizer'), async (req, res) => {
  const organizerID = req.user.userID

  try {
    const [events] = await db.query(
      `SELECT e.*, v.venueName AS location
       FROM events e
       JOIN venues v ON e.venueID = v.venueID
       WHERE e.organizerID = ?`,
      [organizerID]
    )
    res.json(events)
  } catch (err) {
    console.error('Organizer events error:', err)
    res.status(500).json({ message: 'Server error' })  
  }
})

// GET /api/organizer/dashboard
router.get('/dashboard', requireAuth, requireRole('Organizer'), async (req, res) => {
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

// GET /api/organizer/events/:id/attendance
// Returns RSVP count, check-in count, and all feedback for one event (organizer's own).
router.get('/events/:id/attendance', requireAuth, requireRole('Organizer'), async (req, res) => {
  const organizerID = req.user.userID
  const { id } = req.params

  try {
    // Verify the event belongs to this organizer
    const [event] = await db.query(
      `SELECT e.eventID, e.title, e.eventDate, e.status, v.venueName AS location
       FROM events e
       JOIN venues v ON e.venueID = v.venueID
       WHERE e.eventID = ? AND e.organizerID = ?`,
      [id, organizerID]
    )

    if (event.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // RSVP + check-in totals
    const [totals] = await db.query(
      `SELECT
         COUNT(*) AS totalRSVPs,
         COALESCE(SUM(hasCheckedIn), 0) AS totalCheckedIn
       FROM attendance
       WHERE eventID = ?`,
      [id]
    )

    // All feedback for this event, with the student's name
    const [feedback] = await db.query(
      `SELECT
         f.feedbackID,
         f.starRating,
         f.comment,
         f.submittedAt,
         u.fullName
       FROM feedback f
       JOIN attendance a ON f.attendanceID = a.attendanceID
       JOIN users u ON a.userID = u.userID
       WHERE a.eventID = ?
       ORDER BY f.submittedAt DESC`,
      [id]
    )

    // Average rating
    const [avg] = await db.query(
      `SELECT ROUND(AVG(f.starRating), 1) AS avgRating
       FROM feedback f
       JOIN attendance a ON f.attendanceID = a.attendanceID
       WHERE a.eventID = ?`,
      [id]
    )

    res.json({
      event: event[0],
      stats: {
        totalRSVPs: totals[0].totalRSVPs,
        totalCheckedIn: Number(totals[0].totalCheckedIn),
        avgRating: avg[0].avgRating || 0,
        feedbackCount: feedback.length,
      },
      feedback,
    })
  } catch (err) {
    console.error('Attendance/feedback error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router