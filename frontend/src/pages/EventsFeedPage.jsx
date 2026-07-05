import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Inbox } from 'lucide-react'
import api from '../services/api'
import Navbar from '../components/Navbar'

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 32%, #F8F9FB 78%)', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
     <Navbar />

      {/* Main content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '18px 16px 40px' }}>

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