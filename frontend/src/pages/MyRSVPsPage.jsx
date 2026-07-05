import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Inbox, CheckCircle, Check, Hourglass, Ban } from 'lucide-react'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function MyRSVPsPage() {
  const navigate = useNavigate()
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  const categoryColors = {
    Academic: { bg: '#EAF3DE', color: '#27500A' },
    Social: { bg: '#FAEEDA', color: '#633806' },
    Sports: { bg: '#FCEBEB', color: '#791F1F' },
    Career: { bg: '#E6F1FB', color: '#0C447C' },
    Culture: { bg: '#EEEDFE', color: '#3C3489' },
    Workshop: { bg: '#FFF8E1', color: '#7A5C00' },
  }

  useEffect(() => {
    fetchMyRSVPs()
  }, [])

  async function fetchMyRSVPs() {
    try {
      const res = await api.get('/rsvp/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRsvps(res.data)
    } catch (err) {
      console.error('Failed to fetch RSVPs:', err)
    } finally {
      setLoading(false)
    }
  }

  const upcoming = rsvps.filter(r => r.eventStatus === 'Active')
  const archived = rsvps.filter(r => r.eventStatus === 'Archived' || r.eventStatus === 'Cancelled' || r.eventStatus === 'Removed')

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>

      <Navbar />

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)',
        padding: '32px 24px 52px',
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            My RSVPs
          </h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>
            All events you have confirmed attendance for.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 16px 40px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '13px', color: '#aaa' }}>Loading your RSVPs...</p>
          </div>
        ) : rsvps.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #DDE6F0',
            borderRadius: '14px',
            padding: '60px 24px',
            marginTop: '-20px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(30,58,95,0.06)',
          }}>
            <div style={{ marginBottom: '12px' }}><Inbox size={40} color="#aaa" /></div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E', marginBottom: '6px' }}>No RSVPs yet</p>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>You have not RSVPed for any events yet.</p>
            <button
              onClick={() => navigate('/events')}
              style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Browse events
            </button>
          </div>
        ) : (
          <>
            {/* Upcoming RSVPs */}
            {upcoming.length > 0 && (
              <div style={{ marginTop: '-20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', marginTop: '28px' }}>
                  Upcoming — {upcoming.length} event{upcoming.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {upcoming.map(rsvp => (
                    <RSVPCard
                      key={rsvp.attendanceID}
                      rsvp={rsvp}
                      navigate={navigate}
                      categoryColors={categoryColors}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Archived RSVPs */}
            {archived.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', marginTop: '32px' }}>
                  Past events — {archived.length} event{archived.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {archived.map(rsvp => (
                    <RSVPCard
                      key={rsvp.attendanceID}
                      rsvp={rsvp}
                      navigate={navigate}
                      categoryColors={categoryColors}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RSVPCard({ rsvp, navigate, categoryColors, isPast }) {
  const catColor = categoryColors[rsvp.categoryName] || { bg: '#FFF8E1', color: '#7A5C00' }
  const isCancelled = rsvp.eventStatus === 'Cancelled' || rsvp.eventStatus === 'Removed'

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #DDE6F0',
      borderLeft: `4px solid ${isCancelled ? '#F7C1C1' : isPast ? '#B0C4DE' : '#F5A623'}`,
      borderRadius: '12px',
      padding: '16px 18px',
      boxShadow: '0 1px 4px rgba(30,58,95,0.06)',
      opacity: isPast ? 0.85 : 1,
    }}>

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <div
          onClick={() => navigate(`/events/${rsvp.eventID}`)}
          style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E', cursor: 'pointer', flex: 1 }}
        >
          {rsvp.title}
        </div>
        <span style={{
          fontSize: '11px', fontWeight: '500', padding: '3px 10px',
          borderRadius: '20px', background: catColor.bg, color: catColor.color,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {rsvp.categoryName}
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: '#5A6A7A', marginBottom: '12px' }}>
        <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{new Date(rsvp.eventDate).toDateString()}</span>
        {rsvp.startTime && <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{rsvp.startTime.slice(0, 5)} – {rsvp.endTime?.slice(0, 5)}</span>}
        <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{rsvp.location}</span>
      </div>

      {/* Status badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {isCancelled ? (
          <span style={{
            fontSize: '11px', fontWeight: '500', padding: '3px 10px',
            borderRadius: '20px', background: '#FCEBEB', color: '#791F1F',
          }}>
            <Ban size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> Event cancelled
          </span>
        ) : (
          <>
            <span style={{
              fontSize: '11px', fontWeight: '500', padding: '3px 10px',
              borderRadius: '20px', background: '#EAF3DE', color: '#27500A',
            }}>
              <Check size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> RSVP confirmed
            </span>
            {rsvp.hasCheckedIn ? (
              <span style={{
                fontSize: '11px', fontWeight: '500', padding: '3px 10px',
                borderRadius: '20px', background: '#E6F1FB', color: '#0C447C',
              }}>
                <Check size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> Checked in
              </span>
            ) : !isPast ? (
              <span style={{
                fontSize: '11px', fontWeight: '500', padding: '3px 10px',
                borderRadius: '20px', background: '#FFF8E1', color: '#7A5C00',
              }}>
                <Hourglass size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> Not yet checked in
              </span>
            ) : null}
          </>
        )}
      </div>

      {isCancelled && rsvp.removedReason && (
        <div style={{ fontSize: '12px', color: '#791F1F', marginBottom: '12px' }}>
          Reason: {rsvp.removedReason}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {!isPast && !isCancelled && rsvp.token && (
          <button
            onClick={() => navigate(`/qr/${rsvp.attendanceID}`)}
            style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1.5px solid #1E3A5F',
              background: '#ffffff',
              color: '#1E3A5F',
              cursor: 'pointer',
            }}
          >
            View QR code
          </button>
        )}
        <button
          onClick={() => navigate(`/events/${rsvp.eventID}`)}
          style={{
            fontSize: '12px',
            fontWeight: '500',
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1.5px solid #DDE6F0',
            background: '#ffffff',
            color: '#5A6A7A',
            cursor: 'pointer',
          }}
        >
          View event
        </button>
        {isPast && !isCancelled && (
          <button
            onClick={() => navigate(`/feedback/${rsvp.eventID}`)}
            style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#F5A623',
              color: '#1E3A5F',
              cursor: 'pointer',
            }}
          >
            Leave feedback
          </button>
        )}
      </div>
    </div>
  )
}