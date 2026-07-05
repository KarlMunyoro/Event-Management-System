import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield, Lock, Send } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Password form
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })
  const [pwSubmitting, setPwSubmitting] = useState(false)

  // Organizer request form
  const [reqForm, setReqForm] = useState({ clubName: '', reason: '' })
  const [reqMsg, setReqMsg] = useState({ type: '', text: '' })
  const [reqSubmitting, setReqSubmitting] = useState(false)

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function dismissRoleChangeNotice() {
    setProfile(prev => ({ ...prev, roleChangeReason: null }))
    try {
      await api.put('/auth/acknowledge-role-change')
    } catch {
      // Non-critical — the banner will just reappear next load if this fails.
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPwMsg({ type: '', text: '' })
    if (pw.newPassword !== pw.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    setPwSubmitting(true)
    try {
      await api.put('/auth/password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      })
      setPwMsg({ type: 'success', text: 'Password updated successfully' })
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' })
    } finally {
      setPwSubmitting(false)
    }
  }

  async function handleRequestSubmit(e) {
    e.preventDefault()
    setReqMsg({ type: '', text: '' })
    setReqSubmitting(true)
    try {
      await api.post('/organizer-requests', reqForm)
      setReqMsg({ type: 'success', text: 'Request submitted. An admin will review it.' })
      setReqForm({ clubName: '', reason: '' })
    } catch (err) {
      setReqMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit request' })
    } finally {
      setReqSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)', padding: '32px 24px 52px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>Profile &amp; settings</h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>Manage your account and access.</p>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px 40px', marginTop: '-20px' }}>

        {/* Role change notice */}
        {profile?.roleChangeReason && (
          <div style={{ ...cardStyle, marginBottom: '20px', borderLeftColor: '#F5A623', background: '#FFF8E1' }}>
            <h2 style={{ ...sectionTitle, color: '#7A5C00' }}>
              <Shield size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Your role was changed
            </h2>
            <p style={{ fontSize: '13px', color: '#5A6A7A', marginBottom: '16px' }}>
              An admin changed your role to <strong>{profile.role}</strong>. Reason: {profile.roleChangeReason}
            </p>
            <button
              onClick={dismissRoleChangeNotice}
              style={{
                background: 'none', border: '1.5px solid #F5A623', color: '#7A5C00',
                borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Profile card */}
        <div style={cardStyle}>
          {loading ? (
            <p style={{ fontSize: '13px', color: '#5A6A7A' }}>Loading...</p>
          ) : profile ? (
            <>
              <Row icon={<User size={15} color="#5A6A7A" />} label="Name" value={profile.fullName} />
              <Row icon={<Mail size={15} color="#5A6A7A" />} label="Email" value={profile.email} />
              <Row icon={<Shield size={15} color="#5A6A7A" />} label="Role" value={profile.role} last />
            </>
          ) : (
            <p style={{ fontSize: '13px', color: '#791F1F' }}>Could not load profile.</p>
          )}
        </div>

        {/* Change password */}
        <div style={{ ...cardStyle, marginTop: '20px' }}>
          <h2 style={sectionTitle}><Lock size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Change password</h2>

          {pwMsg.text && <Banner type={pwMsg.type} text={pwMsg.text} />}

          <form onSubmit={handlePasswordSubmit}>
            <label style={labelStyle}>Current password</label>
            <input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required style={inputStyle} />
            <label style={labelStyle}>New password</label>
            <input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required style={inputStyle} />
            <label style={labelStyle}>Confirm new password</label>
            <input type="password" value={pw.confirmPassword} onChange={e => setPw({ ...pw, confirmPassword: e.target.value })} required style={{ ...inputStyle, marginBottom: '18px' }} />
            <button type="submit" disabled={pwSubmitting} style={primaryBtn(pwSubmitting)}>
              {pwSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Request organizer access (students only) */}
        {profile?.role === 'Student' && (
          <div style={{ ...cardStyle, marginTop: '20px' }}>
            <h2 style={sectionTitle}><Send size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Request organizer access</h2>
            <p style={{ fontSize: '12px', color: '#5A6A7A', marginBottom: '16px' }}>
              Want to create and manage events? Submit a request for an admin to review.
            </p>

            {reqMsg.text && <Banner type={reqMsg.type} text={reqMsg.text} />}

            <form onSubmit={handleRequestSubmit}>
              <label style={labelStyle}>Club / department name</label>
              <input type="text" value={reqForm.clubName} onChange={e => setReqForm({ ...reqForm, clubName: e.target.value })} placeholder="e.g. Computer Science Club" required style={inputStyle} />
              <label style={labelStyle}>Reason</label>
              <textarea value={reqForm.reason} onChange={e => setReqForm({ ...reqForm, reason: e.target.value })} placeholder="Tell us why you need organizer access..." rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'sans-serif', marginBottom: '18px' }} />
              <button type="submit" disabled={reqSubmitting} style={primaryBtn(reqSubmitting)}>
                {reqSubmitting ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

function Row({ icon, label, value, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: last ? 'none' : '1px solid #F4F6F9' }}>
      {icon}
      <span style={{ fontSize: '12px', color: '#5A6A7A', width: '60px' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#1A1A2E', fontWeight: '500' }}>{value}</span>
    </div>
  )
}

function Banner({ type, text }) {
  const styles = type === 'success'
    ? { background: '#EAF7EE', border: '1px solid #BFE4C8', color: '#1A5E2E' }
    : { background: '#FCEBEB', border: '1px solid #F7C1C1', color: '#791F1F' }
  return (
    <div style={{ ...styles, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
      {text}
    </div>
  )
}

const cardStyle = {
  background: '#fff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623',
  borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
}
const sectionTitle = { fontSize: '15px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 16px' }
const labelStyle = { fontSize: '12px', color: '#5A6A7A', display: 'block', marginBottom: '6px', fontWeight: '500' }
const inputStyle = {
  width: '100%', border: '1px solid #DDE6F0', borderRadius: '8px', padding: '9px 12px',
  fontSize: '13px', outline: 'none', boxSizing: 'border-box', color: '#1A1A2E', marginBottom: '14px',
}
const primaryBtn = (busy) => ({
  width: '100%', padding: '12px', background: busy ? '#B0C4DE' : '#1E3A5F', color: '#fff',
  border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
  cursor: busy ? 'not-allowed' : 'pointer',
})
