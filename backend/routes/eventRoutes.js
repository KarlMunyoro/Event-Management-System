import express from 'express'
import db from '../config/db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

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

router.get('/', async (req, res) => {
  try {
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
}
)
// UPDATE an event
router.put('/:id', requireAuth, requireRole('Organizer', 'Admin'), async (req, res) => {
  const { title, description, eventDate, startTime, endTime, location, categoryID } = req.body
  const eventID = req.params.id

  if (!title || !eventDate || !startTime || !endTime || !location || !categoryID) {
    return res.status(400).json({ message: 'All fields are required' })
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
