import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Calendar, Ticket, BarChart2, MapPin, Smartphone } from 'lucide-react'
import api from '../services/api'

export default function OrganizerDashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (role !== 'Organizer') {
      navigate('/events')
      return
    }
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const res = await api.get('/organizer/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <div style={{
        background: '#1E3A5F',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <span
          onClick={() => navigate('/events')}
          style={{ fontSize: '16px', fontWeight: '700', color: '#F5A623', cursor: 'pointer' }}
        >
          CampusEvents
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/events" style={{ fontSize: '13px', color: '#B0C4DE', textDecoration: 'none' }}>Events</a>
          <a href="/my-rsvps" style={{ fontSize: '13px', color: '#B0C4DE', textDecoration: 'none' }}>My RSVPs</a>
          <a href="/archived" style={{ fontSize: '13px', color: '#B0C4DE', textDecoration: 'none' }}>Archived</a>
          <a href="/organizer/dashboard" style={{ fontSize: '13px', fontWeight: '600', color: '#F5A623', textDecoration: 'none' }}>Dashboard</a>
          <a href="/organizer/events" style={{ fontSize: '13px', color: '#F5A623', textDecoration: 'none' }}>My events</a>
          <a href="/organizer/create" style={{ fontSize: '13px', color: '#F5A623', textDecoration: 'none' }}>Create event</a>
          <a href="/organizer/scanner" style={{ fontSize: '13px', color: '#F5A623', textDecoration: 'none' }}>Scanner</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#F5A623', color: '#1E3A5F',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700',
            }}>
              {fullName?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '12px', color: '#B0C4DE', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fullName}
            </span>
            <button
              onClick={handleLogout}
              style={{ fontSize: '12px', color: '#1E3A5F', background: '#F5A623', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontWeight: '600' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)',
        padding: '32px 24px 52px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            Organizer dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>
            Welcome back, {fullName}.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 40px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '13px', color: '#aaa' }}>Loading dashboard...</p>
          </div>
        ) : error ? (
          <div style={{
            background: '#ffffff', border: '1px solid #DDE6F0', borderRadius: '14px',
            padding: '40px 24px', marginTop: '-20px', textAlign: 'center',
            boxShadow: '0 2px 12px rgba(30,58,95,0.06)',
          }}>
            <div style={{ marginBottom: '12px' }}><AlertTriangle size={32} color="#791F1F" /></div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#791F1F' }}>{error}</p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '-20px',
              marginBottom: '24px',
            }}>
              <StatCard label="Upcoming events" value={data.stats.totalUpcomingEvents} icon={<Calendar size={20} />} />
              <StatCard label="RSVPs this month" value={data.stats.totalRSVPsThisMonth} icon={<Ticket size={20} />} />
              <StatCard label="Avg attendance rate" value={`${data.stats.avgAttendanceRate}%`} icon={<BarChart2 size={20} />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {/* Upcoming events */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  My upcoming events
                </div>
                {data.upcomingEvents.length === 0 ? (
                  <div style={{ background: '#ffffff', border: '1px solid #DDE6F0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#aaa' }}>No upcoming events yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {data.upcomingEvents.map(event => (
                      <div
                        key={event.eventID}
                        onClick={() => navigate(`/events/${event.eventID}`)}
                        style={{
                          background: '#ffffff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623',
                          borderRadius: '10px', padding: '12px 14px', cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '4px' }}>{event.title}</div>
                        <div style={{ fontSize: '11px', color: '#5A6A7A' }}>
                          <Calendar size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{new Date(event.eventDate).toDateString()} · <MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{event.location}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => navigate('/organizer/create')}
                    style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Create event
                  </button>
                  <button
                    onClick={() => navigate('/organizer/events')}
                    style={{ background: '#ffffff', color: '#1E3A5F', border: '1.5px solid #1E3A5F', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    View all
                  </button>
                </div>
              </div>

              {/* Recent attendance */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  Recent attendance
                </div>
                {data.recentAttendance.length === 0 ? (
                  <div style={{ background: '#ffffff', border: '1px solid #DDE6F0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#aaa' }}>No archived events yet</p>
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', border: '1px solid #DDE6F0', borderRadius: '12px', padding: '14px' }}>
                    {data.recentAttendance.map((event, i) => (
                      <div
                        key={event.eventID}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: i !== data.recentAttendance.length - 1 ? '1px solid #EEF2F7' : 'none',
                        }}
                      >
                        <span style={{ fontSize: '12px', color: '#1A1A2E' }}>{event.title}</span>
                        <span style={{ fontSize: '12px', color: '#5A6A7A' }}>
                          {event.totalCheckedIn || 0} / {event.totalRSVPs} ({event.totalRSVPs > 0 ? Math.round(((event.totalCheckedIn || 0) / event.totalRSVPs) * 100) : 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '11px', fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', marginTop: '20px' }}>
                  Quick actions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => navigate('/organizer/scanner')}
                    style={{ textAlign: 'left', background: '#ffffff', border: '1px solid #DDE6F0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#1A1A2E', cursor: 'pointer' }}
                  >
                    <Smartphone size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Open QR scanner
                  </button>
                  <button
                    onClick={() => navigate('/organizer/events')}
                    style={{ textAlign: 'left', background: '#ffffff', border: '1px solid #DDE6F0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#1A1A2E', cursor: 'pointer' }}
                  >
                    <BarChart2 size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> View attendance reports
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #DDE6F0', borderRadius: '12px',
      padding: '16px', boxShadow: '0 2px 8px rgba(30,58,95,0.06)',
    }}>
      <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>{value}</div>
    </div>
  )
}