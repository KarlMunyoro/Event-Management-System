import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import rsvpRoutes from './routes/rsvpRoutes.js'
import qrRoutes from './routes/qrRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import organizerRoutes from './routes/organizerRoutes.js'
import organizerRequestRoutes from './routes/organizerRequestRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/organizer-requests', organizerRequestRoutes)
app.use('/api/rsvp', rsvpRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/qr', qrRoutes)
app.use('/api/organizer', organizerRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend is running' })
})

app.listen(5000, () => {
  console.log('✅ Server running on port 5000')
})