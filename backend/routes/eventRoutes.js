import express from 'express'
import db from '../config/db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

const EARLIEST_START_TIME = '07:00'
const LATEST_END_TIME = '21:00'

// Events may only run between 7am and 9pm.
function isOutsideAllowedHours(startTime, endTime) {
  return startTime < EARLIEST_START_TIME || endTime > LATEST_END_TIME
}

// Marks any Active event whose day has passed as Archived.
// Called before fetching feeds so data is always current (no cron needed).
async function archivePastEvents() {
  await db.query(
    `UPDATE events SET status = 'Archived'
     WHERE status = 'Active' AND eventDate < CURDATE()`
  )
}

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT categoryID, categoryName FROM categories ORDER BY categoryName ASC')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', requireAuth, requireRole('Organizer', 'Admin'), async (req, res) => {
  const { title, description, eventDate, startTime, endTime, location, categoryID } = req.body
  const organizerID = req.user.userID

  if (!title || !eventDate || !startTime || !endTime || !location || !categoryID) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  if (isOutsideAllowedHours(startTime, endTime)) {
    return res.status(400).json({ message: 'Events must be held between 7:00 AM and 9:00 PM' })
  }

  try {
    let [venues] = await db.query('SELECT venueID FROM venues WHERE venueName = ?', [location.trim()])
    let venueID
    if (venues.length > 0) {
      venueID = venues[0].venueID
    } else {
      const [result] = await db.query('INSERT INTO venues (venueName) VALUES (?)', [location.trim()])
      venueID = result.insertId
    }

    const [result] = await db.query(
      'INSERT INTO events (title, description, eventDate, startTime, endTime, venueID, categoryID, organizerID, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title.trim(), description?.trim() || '', eventDate, startTime, endTime, venueID, categoryID, organizerID, 'Active']
    )

    res.status(201).json({ eventID: result.insertId, message: 'Event created successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Live feed — only Active events. Archives past ones first.
router.get('/', async (req, res) => {
  try {
    await archivePastEvents()

    const [events] = await db.query(`
      SELECT e.*, c.categoryName, v.venueName AS location
      FROM events e
      JOIN categories c ON e.categoryID = c.categoryID
      JOIN venues v ON e.venueID = v.venueID
      WHERE e.status = 'Active'
      ORDER BY e.eventDate ASC
    `)
    res.json(events)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Archived events — MUST stay above '/:id' so "archived" isn't read as an ID.
// Students/Admins see all archived events annotated with their attendance +
// feedback state; Organizers see their own archived events with totals.
router.get('/archived', requireAuth, async (req, res) => {
  const userID = req.user.userID
  const role = req.user.role

  try {
    await archivePastEvents()

    if (role === 'Organizer') {
      const [events] = await db.query(`
        SELECT
          e.eventID, e.title, e.description, e.eventDate, e.startTime, e.endTime,
          e.status, e.removedReason,
          c.categoryName, v.venueName AS location,
          COUNT(a.attendanceID) AS totalRSVPs,
          COALESCE(SUM(a.hasCheckedIn), 0) AS totalCheckedIn
        FROM events e
        JOIN categories c ON e.categoryID = c.categoryID
        JOIN venues v ON e.venueID = v.venueID
        LEFT JOIN attendance a ON a.eventID = e.eventID
        WHERE e.status IN ('Archived', 'Cancelled') AND e.organizerID = ?
        GROUP BY e.eventID
        ORDER BY e.eventDate DESC
      `, [userID])

      return res.json({ role, events })
    }

    const [events] = await db.query(`
      SELECT
        e.eventID, e.title, e.description, e.eventDate, e.startTime, e.endTime,
        e.status, e.removedReason,
        c.categoryName, v.venueName AS location,
        a.attendanceID,
        a.hasCheckedIn,
        CASE WHEN f.feedbackID IS NOT NULL THEN 1 ELSE 0 END AS hasFeedback
      FROM events e
      JOIN categories c ON e.categoryID = c.categoryID
      JOIN venues v ON e.venueID = v.venueID
      LEFT JOIN attendance a ON a.eventID = e.eventID AND a.userID = ?
      LEFT JOIN feedback f ON f.attendanceID = a.attendanceID
      WHERE e.status IN ('Archived', 'Cancelled')
      ORDER BY e.eventDate DESC
    `, [userID])

    res.json({ role, events })
  } catch (err) {
    console.error('Archived events error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Cancel an event (soft delete) — MUST stay above '/:id'.
router.put('/:id/cancel', requireAuth, requireRole('Organizer', 'Admin'), async (req, res) => {
  const eventID = req.params.id
  const { reason } = req.body

  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'A reason is required to cancel an event' })
  }

  try {
    const [existingEvents] = await db.query('SELECT organizerID FROM events WHERE eventID = ?', [eventID])
    if (existingEvents.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const isOwner = existingEvents[0].organizerID === req.user.userID
    if (!isOwner && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You do not have permission to cancel this event' })
    }

    await db.query(
      'UPDATE events SET status = ?, removedReason = ? WHERE eventID = ?',
      ['Cancelled', reason.trim(), eventID]
    )

    res.json({ message: 'Event cancelled successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, c.categoryName, v.venueName AS location
      FROM events e
      JOIN categories c ON e.categoryID = c.categoryID
      JOIN venues v ON e.venueID = v.venueID
      WHERE e.eventID = ?
    `, [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// UPDATE an event
router.put('/:id', requireAuth, requireRole('Organizer', 'Admin'), async (req, res) => {
  const { title, description, eventDate, startTime, endTime, location, categoryID } = req.body
  const eventID = req.params.id

  if (!title || !eventDate || !startTime || !endTime || !location || !categoryID) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  if (isOutsideAllowedHours(startTime, endTime)) {
    return res.status(400).json({ message: 'Events must be held between 7:00 AM and 9:00 PM' })
  }

  try {
    const [existingEvents] = await db.query('SELECT organizerID FROM events WHERE eventID = ?', [eventID])
    if (existingEvents.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const isOwner = existingEvents[0].organizerID === req.user.userID
    if (!isOwner && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You do not have permission to edit this event' })
    }

    let [venues] = await db.query('SELECT venueID FROM venues WHERE venueName = ?', [location.trim()])
    let venueID
    if (venues.length > 0) {
      venueID = venues[0].venueID
    } else {
      const [result] = await db.query('INSERT INTO venues (venueName) VALUES (?)', [location.trim()])
      venueID = result.insertId
    }

    await db.query(
      'UPDATE events SET title = ?, description = ?, eventDate = ?, startTime = ?, endTime = ?, venueID = ?, categoryID = ? WHERE eventID = ?',
      [title.trim(), description?.trim() || '', eventDate, startTime, endTime, venueID, categoryID, eventID]
    )

    res.json({ message: 'Event updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router