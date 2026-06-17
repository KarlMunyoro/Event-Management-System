import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function EventsFeedPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')

  const categories = ['All', 'Academic', 'Social', 'Sports', 'Career', 'Culture', 'Workshop']

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const res = await api.get('/events')
      setEvents(res.data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  const filtered = activeCategory === 'All'
    ? events
    : events.filter(e => e.category === activeCategory)

  const categoryColors = {
    Academic: { bg: '#EAF3DE', color: '#27500A' },
    Social: { bg: '#FAEEDA', color: '#633806' },
    Sports: { bg: '#FCEBEB', color: '#791F1F' },
    Career: { bg: '#E6F1FB', color: '#0C447C' },
    Culture: { bg: '#EEEDFE', color: '#3C3489' },
    Workshop: { bg: '#F1EFE8', color: '#444441' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* Navbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '15px', fontWeight: '600' }}>CampusEvents</span>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/events" style={{ fontSize: '13px', fontWeight: '500', color: '#111', textDecoration: 'none' }}>Events</a>
          <a href="/my-rsvps" style={{ fontSize: '13px', color: '#777', textDecoration: 'none' }}>My RSVPs</a>
          <a href="/archived" style={{ fontSize: '13px', color: '#777', textDecoration: 'none' }}>Archived</a>
          {role === 'Organizer' && (
            <a href="/organizer/dashboard" style={{ fontSize: '13px', color: '#534AB7', textDecoration: 'none', fontWeight: '500' }}>Dashboard</a>
          )}
          {role === 'Admin' && (
            <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#534AB7', textDecoration: 'none', fontWeight: '500' }}>Admin</a>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color: '#185FA5' }}>
              {fullName?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} style={{ fontSize: '12px', color: '#777', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Upcoming events</h1>
          <p style={{ fontSize: '13px', color: '#777' }}>Welcome back, {fullName}. Browse and RSVP for events on campus.</p>
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                border: '1px solid',
                cursor: 'pointer',
                background: activeCategory === cat ? '#111' : '#fff',
                color: activeCategory === cat ? '#fff' : '#555',
                borderColor: activeCategory === cat ? '#111' : '#e0e0e0',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events list */}
        {loading ? (
          <p style={{ fontSize: '13px', color: '#777' }}>Loading events...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
            <p style={{ fontSize: '14px' }}>No events found</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Check back later or try a different category</p>
          </div>
        ) : (
          filtered.map(event => (
            <div
              key={event.eventID}
              onClick={() => navigate(`/events/${event.eventID}`)}
              style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '16px', marginBottom: '12px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{event.title}</div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  background: categoryColors[event.categoryName]?.bg || '#f0f0f0',
                  color: categoryColors[event.categoryName]?.color || '#444',
                }}>
                  {event.categoryName}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#777', marginBottom: '6px' }}>
                📅 {new Date(event.eventDate).toDateString()} &nbsp;|&nbsp; 📍 {event.location}
              </div>
              <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.5' }}>
                {event.description?.slice(0, 120)}{event.description?.length > 120 ? '...' : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}