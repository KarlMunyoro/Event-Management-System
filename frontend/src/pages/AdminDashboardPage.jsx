import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Users, CalendarCheck, FileClock } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (role !== 'Admin') {
      navigate('/events')
      return
    }
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)', padding: '32px 24px 52px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>Admin dashboard</h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>Platform overview and moderation.</p>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 16px 40px', marginTop: '-20px' }}>
        {error && (
          <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#791F1F', marginBottom: '20px' }}>{error}</div>
        )}

        {loading ? (
          <p style={{ fontSize: '13px', color: '#5A6A7A', textAlign: 'center', padding: '40px' }}>Loading...</p>
        ) : stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <StatCard icon={<Clock size={18} color="#8A5A00" />} label="Pending requests" value={stats.pendingRequests} accent="#F5A623"
                onClick={() => navigate('/admin/organizer-requests')} />
              <StatCard icon={<Users size={18} color="#1E3A5F" />} label="Total users" value={stats.totalUsers}
                onClick={() => navigate('/admin/users')} />
              <StatCard icon={<CalendarCheck size={18} color="#1A5E2E" />} label="Active events" value={stats.activeEvents} />
              <StatCard icon={<FileClock size={18} color="#2E5480" />} label="Pending events" value={stats.pendingEvents} />
            </div>

            <div style={{ background: '#fff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(30,58,95,0.08)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 14px' }}>Quick actions</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/admin/organizer-requests')} style={actionBtn}>Review organizer requests</button>
                <button onClick={() => navigate('/admin/users')} style={actionBtnSecondary}>Manage users</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', border: '1px solid #DDE6F0', borderRadius: '12px', padding: '16px',
      boxShadow: '0 2px 8px rgba(30,58,95,0.05)', cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#5A6A7A', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

const actionBtn = {
  background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '10px',
  padding: '11px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
}
const actionBtnSecondary = {
  background: '#fff', color: '#1E3A5F', border: '1px solid #DDE6F0', borderRadius: '10px',
  padding: '11px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
}
