import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Inbox } from 'lucide-react'
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
    : events.filter(e => e.categoryName === activeCategory)

  const categoryColors = {
    Academic: { bg: '#EAF3DE', color: '#27500A' },
    Social: { bg: '#FAEEDA', color: '#633806' },
    Sports: { bg: '#FCEBEB', color: '#791F1F' },
    Career: { bg: '#E6F1FB', color: '#0C447C' },
    Culture: { bg: '#EEEDFE', color: '#3C3489' },
    Workshop: { bg: '#FFF8E1', color: '#7A5C00' },
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
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#F5A623' }}>CampusEvents</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/events" style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', textDecoration: 'none' }}>Events</a>
          <a href="/my-rsvps" style={{ fontSize: '13px', color: '#B0C4DE', textDecoration: 'none' }}>My RSVPs</a>
          <a href="/archived" style={{ fontSize: '13px', color: '#B0C4DE', textDecoration: 'none' }}>Archived</a>
          {role === 'Organizer' && (
            <a href="/organizer/dashboard" style={{ fontSize: '13px', color: '#F5A623', textDecoration: 'none', fontWeight: '600' }}>Dashboard</a>
          )}
          {role === 'Admin' && (
            <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#F5A623', textDecoration: 'none', fontWeight: '600' }}>Admin</a>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#F5A623', color: '#1E3A5F',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', flexShrink: 0,
            }}>
              {fullName?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '12px', color: '#B0C4DE', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fullName}
            </span>
            <button
              onClick={handleLogout}
              style={{
                fontSize: '12px',
                color: '#1E3A5F',
                background: '#F5A623',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)',
        padding: '36px 24px 52px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            Upcoming events
          </h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>
            Welcome back, {fullName}. Browse and RSVP for events on campus.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 40px' }}>

        {/* Category filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          marginTop: '24px',
          overflowX: 'auto',
          paddingBottom: '6px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                border: '1.5px solid',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontWeight: activeCategory === cat ? '600' : '400',
                background: activeCategory === cat ? '#1E3A5F' : '#ffffff',
                color: activeCategory === cat ? '#ffffff' : '#1E3A5F',
                borderColor: activeCategory === cat ? '#1E3A5F' : '#B0C4DE',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events count */}
        {!loading && (
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '14px' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Events list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '13px', color: '#aaa' }}>Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
            <div style={{ marginBottom: '10px' }}><Inbox size={32} color="#aaa" /></div>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>No events found</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Check back later or try a different category</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filtered.map(event => (
              <div
                key={event.eventID}
                onClick={() => navigate(`/events/${event.eventID}`)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #DDE6F0',
                  borderLeft: '4px solid #F5A623',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s ease, transform 0.1s ease',
                  boxShadow: '0 1px 4px rgba(30,58,95,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,58,95,0.12)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(30,58,95,0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E', flex: 1 }}>{event.title}</div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: categoryColors[event.categoryName]?.bg || '#FFF8E1',
                    color: categoryColors[event.categoryName]?.color || '#7A5C00',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {event.categoryName}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#5A6A7A', marginBottom: '8px' }}>
                  <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{new Date(event.eventDate).toDateString()}</span>
                  {event.startTime && <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{event.startTime.slice(0, 5)} – {event.endTime?.slice(0, 5)}</span>}
                  <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{event.location}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#444', lineHeight: '1.6' }}>
                  {event.description?.slice(0, 140)}{event.description?.length > 140 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}