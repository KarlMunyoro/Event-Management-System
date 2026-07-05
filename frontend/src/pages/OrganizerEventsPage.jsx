import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Plus, Pencil, Eye, Users, Ban } from 'lucide-react'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function OrganizerEventsPage() {
  const navigate = useNavigate()
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (role !== 'Organizer' && role !== 'Admin') {
      navigate('/events')
      return
    }
    api.get('/organizer/events')
      .then(res => setEvents(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load events'))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  async function handleCancel(eventID) {
    const reason = window.prompt('Why are you cancelling this event? This reason will be shown to attendees.')
    if (reason === null) return
    if (!reason.trim()) {
      setError('A reason is required to cancel an event')
      return
    }
    try {
      await api.put(`/events/${eventID}/cancel`, { reason: reason.trim() })
      setEvents(prev => prev.map(e => e.eventID === eventID ? { ...e, status: 'Cancelled', removedReason: reason.trim() } : e))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel event')
    }
  }

  function statusBadge(status) {
    const map = {
      Active: { bg: '#EAF7EE', color: '#1A5E2E', border: '#BFE4C8' },
      Pending: { bg: '#FEF6E7', color: '#8A5A00', border: '#F5D89A' },
      Rejected: { bg: '#FCEBEB', color: '#791F1F', border: '#F7C1C1' },
      Archived: { bg: '#EEF1F5', color: '#5A6A7A', border: '#DDE6F0' },
      Cancelled: { bg: '#FCEBEB', color: '#791F1F', border: '#F7C1C1' },
      Removed: { bg: '#FCEBEB', color: '#791F1F', border: '#F7C1C1' },
    }
    const s = map[status] || map.Archived
    return (
      <span style={{
        fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      }}>
        {status}
      </span>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <Navbar />

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)',
        padding: '32px 24px 52px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <button
              onClick={() => navigate('/organizer/dashboard')}
              style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}
            >
              ← Back to dashboard
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
              My events
            </h1>
            <p style={{ fontSize: '13px', color: '#B0C4DE' }}>
              Manage the events you've created.
            </p>
          </div>
          <button
            onClick={() => navigate('/organizer/create')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: '#F5A623',
              color: '#1E3A5F', border: 'none', borderRadius: '10px', padding: '10px 16px',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            <Plus size={15} /> Create event
          </button>
        </div>
      </div>

      {/* Content card */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={{
          background: '#ffffff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623',
          borderRadius: '14px', padding: '8px', marginTop: '-20px',
          boxShadow: '0 2px 12px rgba(30,58,95,0.08)', overflow: 'hidden',
        }}>

          {error && (
            <div style={{
              background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px', color: '#791F1F', margin: '16px',
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <p style={{ fontSize: '13px', color: '#5A6A7A', padding: '32px', textAlign: 'center' }}>
              Loading events...
            </p>
          ) : events.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#5A6A7A', marginBottom: '16px' }}>
                You haven't created any events yet.
              </p>
              <button
                onClick={() => navigate('/organizer/create')}
                style={{
                  background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                }}
              >
                Create your first event
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EEF1F5' }}>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Venue</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.eventID} style={{ borderBottom: '1px solid #F4F6F9' }}>
                    <td style={{ ...tdStyle, fontWeight: '600', color: '#1A1A2E' }}>{event.title}</td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} color="#5A6A7A" />
                        {new Date(event.eventDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#5A6A7A" />
                        {event.startTime?.slice(0, 5)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#5A6A7A" />
                        {event.location}
                      </span>
                    </td>
                    <td style={tdStyle}>{statusBadge(event.status)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => navigate(`/events/${event.eventID}`)}
                          style={iconBtnStyle}
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/organizer/events/${event.eventID}/edit`)}
                          style={{ ...iconBtnStyle, background: '#1E3A5F', color: '#fff', borderColor: '#1E3A5F' }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/organizer/events/${event.eventID}/attendance`)}
                          style={iconBtnStyle}
                          title="Attendance & feedback"
                        >
                          <Users size={14} />
                        </button>
                        {event.status !== 'Cancelled' && event.status !== 'Removed' && (
                          <button
                            onClick={() => handleCancel(event.eventID)}
                            style={{ ...iconBtnStyle, color: '#791F1F', borderColor: '#F7C1C1' }}
                            title="Cancel event"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const thStyle = {
  fontSize: '11px', fontWeight: '600', color: '#5A6A7A', textAlign: 'left',
  padding: '14px 16px', textTransform: 'uppercase', letterSpacing: '0.03em',
}

const tdStyle = {
  fontSize: '13px', color: '#5A6A7A', padding: '14px 16px', verticalAlign: 'middle',
}

const iconBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '30px', height: '30px', border: '1px solid #DDE6F0', borderRadius: '8px',
  background: '#fff', color: '#5A6A7A', cursor: 'pointer',
}
