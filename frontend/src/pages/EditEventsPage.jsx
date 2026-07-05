import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, Clock, MapPin, Tag, AlignLeft, Type } from 'lucide-react'
import api from '../services/api'
import Navbar from '../components/Navbar'

const EARLIEST_START_TIME = '07:00'
const LATEST_END_TIME = '21:00'

export default function EditEventPage() {
  const navigate = useNavigate()
  const { id } = useParams()
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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (role !== 'Organizer' && role !== 'Admin') {
      navigate('/events')
      return
    }

    api.get('/events/categories').then(res => setCategories(res.data)).catch(() => {})

    api.get(`/events/${id}`)
      .then(res => {
        const event = res.data
        setForm({
          title: event.title || '',
          description: event.description || '',
          eventDate: event.eventDate ? String(event.eventDate).split('T')[0] : '',
          startTime: event.startTime ? event.startTime.slice(0, 5) : '',
          endTime: event.endTime ? event.endTime.slice(0, 5) : '',
          location: event.location || '',
          categoryID: event.categoryID || '',
        })
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load event')
      })
      .finally(() => setLoading(false))
  }, [id])

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

    if (form.startTime < EARLIEST_START_TIME || form.endTime > LATEST_END_TIME) {
      setError('Events must be held between 7:00 AM and 9:00 PM')
      return
    }

    setSubmitting(true)
    try {
      await api.put(`/events/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate(`/events/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event')
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  async function handleCancelEvent() {
    const reason = window.prompt('Why are you cancelling this event? This reason will be shown to attendees.')
    if (reason === null) return
    if (!reason.trim()) {
      setError('A reason is required to cancel an event')
      return
    }
    setCancelling(true)
    try {
      await api.put(`/events/${id}/cancel`, { reason: reason.trim() }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate('/organizer/events')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel event')
      setCancelling(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#5A6A7A', fontSize: '14px' }}>
        Loading event...
      </div>
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
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(`/events/${id}`)}
            style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}
          >
            ← Back to event
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            Edit event
          </h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>
            Update the details below and save your changes.
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
                  min={EARLIEST_START_TIME}
                  max={LATEST_END_TIME}
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
                  min={EARLIEST_START_TIME}
                  max={LATEST_END_TIME}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <p style={{ fontSize: '11px', color: '#9AA7B5', marginTop: '-12px', marginBottom: '18px' }}>
              Events must be held between 7:00 AM and 9:00 PM.
            </p>

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
              {submitting ? 'Saving changes...' : 'Save changes'}
            </button>

          </form>

          <button
            type="button"
            onClick={handleCancelEvent}
            disabled={cancelling}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              background: 'none',
              color: cancelling ? '#E3A9A9' : '#791F1F',
              border: `1.5px solid ${cancelling ? '#F7C1C1' : '#F7C1C1'}`,
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: cancelling ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelling ? 'Cancelling...' : 'Cancel event'}
          </button>
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