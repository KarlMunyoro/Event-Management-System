import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Inbox, Users, CheckCircle, Star, Ban } from 'lucide-react'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function ArchivedEventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [loading, setLoading] = useState(true)

  const categoryColors = {
    Academic: { bg: '#EAF3DE', color: '#27500A' },
    Social: { bg: '#FAEEDA', color: '#633806' },
    Sports: { bg: '#FCEBEB', color: '#791F1F' },
    Career: { bg: '#E6F1FB', color: '#0C447C' },
    Culture: { bg: '#EEEDFE', color: '#3C3489' },
    Workshop: { bg: '#FFF8E1', color: '#7A5C00' },
  }

  useEffect(() => {
    api.get('/events/archived')
      .then(res => {
        setEvents(res.data.events)
        setRole(res.data.role)
      })
      .catch(err => console.error('Failed to fetch archived events:', err))
      .finally(() => setLoading(false))
  }, [])

  const isOrganizer = role === 'Organizer'

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 40px' }}>

        <div style={{ marginTop: '24px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 4px' }}>Archived events</h1>
          <p style={{ fontSize: '13px', color: '#5A6A7A', margin: 0 }}>
            {isOrganizer ? 'Your past events and their attendance.' : 'Past events. Leave feedback on ones you attended.'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '13px', color: '#aaa' }}>Loading archived events...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
            <div style={{ marginBottom: '10px' }}><Inbox size={32} color="#aaa" /></div>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>No archived events</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Past events will appear here once they've ended</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {events.map(event => {
              const isCancelled = event.status === 'Cancelled'
              return (
              <div
                key={event.eventID}
                style={{
                  background: '#ffffff',
                  border: '1px solid #DDE6F0',
                  borderLeft: `4px solid ${isCancelled ? '#F7C1C1' : '#B0C4DE'}`,
                  borderRadius: '12px',
                  padding: '16px 18px',
                  boxShadow: '0 1px 4px rgba(30,58,95,0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E', flex: 1 }}>{event.title}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {isCancelled && (
                      <span style={{
                        fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                        background: '#FCEBEB', color: '#791F1F', whiteSpace: 'nowrap',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                      }}>
                        <Ban size={11} /> Cancelled
                      </span>
                    )}
                    <span style={{
                      fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px',
                      background: categoryColors[event.categoryName]?.bg || '#FFF8E1',
                      color: categoryColors[event.categoryName]?.color || '#7A5C00',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {event.categoryName}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#5A6A7A', marginBottom: '8px' }}>
                  <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{new Date(event.eventDate).toDateString()}</span>
                  {event.startTime && <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{event.startTime.slice(0, 5)} – {event.endTime?.slice(0, 5)}</span>}
                  <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{event.location}</span>
                </div>

                {isCancelled && event.removedReason && (
                  <div style={{ fontSize: '12px', color: '#791F1F', marginBottom: '8px' }}>
                    Reason: {event.removedReason}
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#444', lineHeight: '1.6', marginBottom: (isOrganizer || event.attendanceID) ? '12px' : 0 }}>
                  {event.description?.slice(0, 140)}{event.description?.length > 140 ? '...' : ''}
                </div>

                {/* Organizer: attendance summary */}
                {isOrganizer && (
                  <div style={{ display: 'flex', gap: '18px', paddingTop: '12px', borderTop: '1px solid #F4F6F9' }}>
                    <span style={{ fontSize: '12px', color: '#5A6A7A', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={13} color="#1E3A5F" /> {event.totalRSVPs} RSVPs
                    </span>
                    <span style={{ fontSize: '12px', color: '#5A6A7A', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle size={13} color="#1A5E2E" /> {Number(event.totalCheckedIn)} checked in
                    </span>
                    <button
                      onClick={() => navigate(`/organizer/events/${event.eventID}/attendance`)}
                      style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '600', color: '#1E3A5F', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      View details →
                    </button>
                  </div>
                )}

                {/* Student: feedback prompt if they attended */}
                {!isOrganizer && !isCancelled && event.attendanceID && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid #F4F6F9' }}>
                    {event.hasFeedback ? (
                      <span style={{ fontSize: '12px', color: '#1A5E2E', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Star size={13} color="#F5A623" fill="#F5A623" /> Feedback submitted
                      </span>
                    ) : (
                      <>
                        <span style={{ fontSize: '12px', color: '#5A6A7A' }}>You attended this event</span>
                        <button
                          onClick={() => navigate(`/feedback/${event.eventID}`)}
                          style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '700', color: '#1E3A5F', background: '#F5A623', border: 'none', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer' }}
                        >
                          Leave feedback
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
