import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Tag, AlignLeft, Type } from 'lucide-react'
import api from '../services/api'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('token')

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    categoryID: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (role !== 'Organizer' && role !== 'Admin') {
      navigate('/events')
      return
    }
    api.get('/events/categories').then(res => setCategories(res.data)).catch(() => {})
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.endTime && form.startTime && form.endTime <= form.startTime) {
      setError('End time must be after start time')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/events', form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate(`/events/${res.data.eventID}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  const today = new Date().toISOString().split('T')[0]

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
          <a href="/organizer/dashboard" style={{ fontSize: '13px', color: '#F5A623', textDecoration: 'none' }}>Dashboard</a>
          <a href="/organizer/events" style={{ fontSize: '13px', color: '#F5A623', textDecoration: 'none' }}>My events</a>
          <a href="/organizer/create" style={{ fontSize: '13px', fontWeight: '600', color: '#F5A623', textDecoration: 'none' }}>Create event</a>
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
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}
          >
            ← Back to dashboard
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            Create event
          </h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>
            Fill in the details below to publish a new event.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #DDE6F0',
          borderLeft: '4px solid #F5A623',
          borderRadius: '14px',
          padding: '28px 24px',
          marginTop: '-20px',
          boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
        }}>

          {error && (
            <div style={{
              background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px', color: '#791F1F', marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>
                <Type size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Event title
              </label>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Annual Tech Symposium"
                required
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>
                <AlignLeft size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the event — what to expect, who should attend..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'sans-serif' }}
              />
            </div>

            {/* Date + Category row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={labelStyle}>
                  <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Date
                </label>
                <input
                  name="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={handleChange}
                  min={today}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  <Tag size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Category
                </label>
                <select
                  name="categoryID"
                  value={form.categoryID}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, background: '#fff' }}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.categoryID} value={cat.categoryID}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start time + End time row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={labelStyle}>
                  <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Start time
                </label>
                <input
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  End time
                </label>
                <input
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>
                <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Location / venue
              </label>
              <input
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium, Room B204"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '13px',
                background: submitting ? '#B0C4DE' : '#1E3A5F',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              {submitting ? 'Creating event...' : 'Create event'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  fontSize: '12px',
  color: '#5A6A7A',
  display: 'block',
  marginBottom: '6px',
  fontWeight: '500',
}

const inputStyle = {
  width: '100%',
  border: '1px solid #DDE6F0',
  borderRadius: '8px',
  padding: '9px 12px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1A1A2E',
}
