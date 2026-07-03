import express from 'express'
import jwt from 'jsonwebtoken'
import { register, login, verifyEmail, resendVerification, me, changePassword } from '../controllers/authController.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/resend-verification', resendVerification)
router.get('/verify/:token', verifyEmail)

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

router.get('/me', authMiddleware, me)
router.put('/password', authMiddleware, changePassword)

export default router