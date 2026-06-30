import { Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import EventsFeedPage from './pages/EventsFeedPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import EmailVerificationStatusPage from './pages/EmailVerificationStatusPage'
import EventDetailPage from './pages/EventDetailPage'
import MyRSVPsPage from './pages/MyRSVPsPage'
import QRCodePage from './pages/QRCodePage'
import FeedbackPage from './pages/FeedbackPage'
import OrganizerDashboardPage from './pages/OrganizerDashboardPage'
import CreateEventPage from './pages/CreateEventPage'
import EditEventPage from './pages/EditEventsPage'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/email-verification" element={<EmailVerificationStatusPage />} />
      <Route path="/events" element={<EventsFeedPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/organizer/events/:id/edit" element={<EditEventPage />} />
      <Route path="/my-rsvps" element={<MyRSVPsPage />} />
      <Route path="/qr/:attendanceID" element={<QRCodePage />} />
      <Route path="/feedback/:eventID" element={<FeedbackPage />} />
      <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />} />
      <Route path="/organizer/create" element={<CreateEventPage />} />
    </Routes>
  )
}

export default App