import express from 'express'
import db from '../config/db.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, c.categoryName
      FROM events e
      JOIN categories c ON e.categoryID = c.categoryID
      WHERE e.status = 'Active'
      ORDER BY e.eventDate ASC
    `)
    res.json(events)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router