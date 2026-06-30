import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle, Calendar } from 'lucide-react'
import api from '../services/api'

export default function FeedbackPage() {
  const { eventID } = useParams()
  const navigate = useNavigate()
  const [eventInfo, setEventInfo] = useState(null)
  const [attendanceID, setAttendanceID] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('token')

  useEffect(() => {
    checkFeedback()
  }, [eventID])

  async function checkFeedback() {
    try {
      const res = await api.get(`/feedback/check/${eventID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEventInfo(res.data.event)
      setAttendanceID(res.data.attendanceID)

      if (res.data.alreadySubmitted) {
        setSubmitted(true)
        setRating(res.data.existingFeedback.starRating)
        setComment(res.data.existingFeedback.comment || '')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load feedback form')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (rating === 0) {
      setError('Please select a star rating')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await api.post('/feedback', {
        attendanceID,
        starRating: rating,
        comment,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
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
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/my-rsvps')}
            style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}
          >
            ← Back to My RSVPs
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>
            Leave feedback
          </h1>
          {eventInfo && (
            <p style={{ fontSize: '13px', color: '#B0C4DE', marginTop: '4px' }}>{eventInfo.title}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px 40px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '13px', color: '#aaa' }}>Loading...</p>
          </div>
        ) : error && !eventInfo ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #DDE6F0',
            borderRadius: '14px',
            padding: '40px 24px',
            marginTop: '-20px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(30,58,95,0.06)',
          }}>
            <div style={{ marginBottom: '12px' }}><AlertTriangle size={32} color="#791F1F" /></div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#791F1F' }}>{error}</p>
          </div>
        ) : submitted ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #DDE6F0',
            borderLeft: '4px solid #F5A623',
            borderRadius: '14px',
            padding: '40px 24px',
            marginTop: '-20px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
          }}>
            <div style={{ marginBottom: '14px' }}><CheckCircle size={40} color="#27500A" /></div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A2E', marginBottom: '8px' }}>
              Feedback submitted
            </p>
            <p style={{ fontSize: '13px', color: '#5A6A7A', marginBottom: '20px' }}>
              Thank you for sharing your thoughts on this event.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} style={{ fontSize: '24px', color: star <= rating ? '#F5A623' : '#E0E0E0' }}>★</span>
              ))}
            </div>
            {comment && (
              <p style={{ fontSize: '13px', color: '#444', fontStyle: 'italic', marginBottom: '20px' }}>"{comment}"</p>
            )}
            <button
              onClick={() => navigate('/my-rsvps')}
              style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Back to My RSVPs
            </button>
          </div>
        ) : (
          <div style={{
            background: '#ffffff',
            border: '1px solid #DDE6F0',
            borderLeft: '4px solid #F5A623',
            borderRadius: '14px',
            padding: '28px 24px',
            marginTop: '-20px',
            boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
          }}>

            {eventInfo && (
              <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #EEF2F7' }}>
                <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Event</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{eventInfo.title}</div>
                <div style={{ fontSize: '12px', color: '#5A6A7A', marginTop: '2px' }}>
                  <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{new Date(eventInfo.eventDate).toDateString()}
                </div>
              </div>
            )}

            {/* Star rating */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                Overall rating
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      fontSize: '36px',
                      cursor: 'pointer',
                      color: star <= (hoverRating || rating) ? '#F5A623' : '#E0E0E0',
                      transition: 'color 0.1s ease',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {rating > 0 && (
                <div style={{ fontSize: '12px', color: '#5A6A7A' }}>{rating} out of 5</div>
              )}
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#5A6A7A', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Comments (optional)
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts about this event..."
                rows={4}
                style={{
                  width: '100%',
                  border: '1px solid #DDE6F0',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  fontFamily: 'sans-serif',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#791F1F', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
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
              {submitting ? 'Submitting...' : 'Submit feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}