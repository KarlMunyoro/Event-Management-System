import express from 'express'
import { register, login, verifyEmail, resendVerification } from '../controllers/authController.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/resend-verification', resendVerification)
router.get('/verify/:token', verifyEmail)

export default router