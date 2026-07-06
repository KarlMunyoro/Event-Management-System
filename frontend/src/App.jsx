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
import CheckInPage from './pages/CheckInPage'
import OrganizerScanPage from './pages/OrganizerScanPage'
import OrganizerEventsPage from './pages/OrganizerEventsPage'
import AttendancePage from './pages/AttendancePage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import OrganizerRequestsPage from './pages/OrganizerRequestsPage'
import UserManagementPage from './pages/UserManagementPage'
import ArchivedEventsPage from './pages/ArchivedEventsPage'

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
      <Route path="/checkin" element={<CheckInPage />} />
      <Route path="/organizer/scanner" element={<OrganizerScanPage />} />
      <Route path="/organizer/events" element={<OrganizerEventsPage />} />
      <Route path="/organizer/events/:id/attendance" element={<AttendancePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/organizer-requests" element={<OrganizerRequestsPage />} />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="/archived" element={<ArchivedEventsPage />} />
    </Routes>
  )
}

export default App
