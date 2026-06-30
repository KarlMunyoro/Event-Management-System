import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react'
import api from '../services/api'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [hasRSVP, setHasRSVP] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [error, setError] = useState('')
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('token')

  function getUserIDFromToken(token) {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userID ?? payload.id ?? payload.sub ?? null
    } catch {
      return null
    }
  }

const userID = getUserIDFromToken(token)

  const categoryColors = {
    Academic: { bg: '#EAF3DE', color: '#27500A' },
    Social: { bg: '#FAEEDA', color: '#633806' },
    Sports: { bg: '#FCEBEB', color: '#791F1F' },
    Career: { bg: '#E6F1FB', color: '#0C447C' },
    Culture: { bg: '#EEEDFE', color: '#3C3489' },
    Workshop: { bg: '#FFF8E1', color: '#7A5C00' },
  }

  useEffect(() => {
    fetchEvent()
    checkRSVP()
  }, [id])

  async function fetchEvent() {
    try {
      const res = await api.get(`/events/${id}`)
      setEvent(res.data)
    } catch (err) {
      console.error('Failed to fetch event:', err)
    } finally {
      setLoading(false)
    }
  }

  async function checkRSVP() {
    try {
      const res = await api.get(`/rsvp/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.hasRSVP) {
        setHasRSVP(true)
        setQrCode(res.data.qrCode)
      }
    } catch (err) {
      console.error('Failed to check RSVP:', err)
    }
  }

  async function handleRSVP() {
    setRsvpLoading(true)
    setError('')
    try {
      const res = await api.post('/rsvp', { eventID: id }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setHasRSVP(true)
      setQrCode(res.data.qrCode)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to RSVP')
    } finally {
      setRsvpLoading(false)
    }
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#aaa', fontSize: '14px' }}>Loading event...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#aaa', fontSize: '14px' }}>Event not found</p>
      </div>
    )
  }

  const catColor = categoryColors[event.categoryName] || { bg: '#FFF8E1', color: '#7A5C00' }

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
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/events')}
            style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}
          >
            ← Back to events
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', flex: 1 }}>{event.title}</h1>
            
            <span style={{
              fontSize: '12px', fontWeight: '600', padding: '4px 12px',
              borderRadius: '20px', background: catColor.bg, color: catColor.color,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {event.categoryName}
            </span>
          </div>
          {(role === 'Admin' || (role === 'Organizer' && String(event.organizerID) === String(userID))) && (
            <button
              onClick={() => navigate(`/organizer/events/${event.eventID}/edit`)}
              style={{
                marginTop: '10px',
                background: 'none',
                border: '1.5px solid #F5A623',
                color: '#F5A623',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Edit event
            </button>
)}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 16px 40px' }}>

        {/* Event info card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #DDE6F0',
          borderRadius: '14px',
          padding: '24px',
          marginTop: '-20px',
          boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
          marginBottom: '16px',
        }}>

          {/* Meta info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #EEF2F7',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E' }}>
                <Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{new Date(event.eventDate).toDateString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E' }}>
                <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{event.startTime?.slice(0, 5)} – {event.endTime?.slice(0, 5)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E' }}>
                <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{event.location}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>About this event</div>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.8' }}>{event.description}</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#791F1F', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* RSVP button or confirmed state */}
          {!hasRSVP ? (
            <button
              onClick={handleRSVP}
              disabled={rsvpLoading}
              style={{
                width: '100%',
                padding: '13px',
                background: rsvpLoading ? '#B0C4DE' : '#1E3A5F',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: rsvpLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              {rsvpLoading ? 'Confirming RSVP...' : 'RSVP for this event'}
            </button>
          ) : (
            <div style={{
              background: '#EAF3DE',
              border: '1px solid #C0DD97',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle size={18} color="#27500A" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#27500A' }}>You are going</div>
                <div style={{ fontSize: '12px', color: '#3B6D11' }}>Your RSVP is confirmed. Show your QR code at the entrance.</div>
              </div>
            </div>
          )}
        </div>

        {/* QR Code section — only shows after RSVP */}
        {hasRSVP && qrCode && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #DDE6F0',
            borderLeft: '4px solid #F5A623',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(30,58,95,0.06)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              Your entry QR code
            </div>

            <div style={{ display: 'inline-block', padding: '16px', background: '#F8F9FB', borderRadius: '12px', marginBottom: '16px' }}>
              <QRCodeSVG
                value={qrCode.token}
                size={160}
                bgColor="#F8F9FB"
                fgColor="#1E3A5F"
                level="M"
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>6-digit fallback code</div>
              <div style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '8px', color: '#1A1A2E' }}>
                {qrCode.fallbackCode}
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '10px' }}>
              Show this QR code or the 6-digit code at the event entrance
            </p>
          </div>
        )}
      </div>
    </div>
  )
}