import { Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import EventsFeedPage from './pages/EventsFeedPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import EmailVerificationStatusPage from './pages/EmailVerificationStatusPage'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/email-verification" element={<EmailVerificationStatusPage />} />
      <Route path="/events" element={<EventsFeedPage />} />
    </Routes>
  )
}

export default App