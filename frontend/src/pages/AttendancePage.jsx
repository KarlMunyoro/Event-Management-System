import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, CheckCircle, Star, MessageSquare, Calendar, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function AttendancePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const role = localStorage.getItem('role')

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (role !== 'Organizer' && role !== 'Admin') {
      navigate('/events')
      return
    }
    api.get(`/organizer/events/${id}/attendance`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load attendance'))
      .finally(() => setLoading(false))
  }, [id])

  const checkInRate = data && data.stats.totalRSVPs > 0
    ? Math.round((data.stats.totalCheckedIn / data.stats.totalRSVPs) * 100)
    : 0

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)', padding: '32px 24px 52px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <button onClick={() => navigate('/organizer/events')} style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}>
            ← Back to my events
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            Attendance &amp; feedback
          </h1>
          {data && (
            <p style={{ fontSize: '13px', color: '#B0C4DE', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span>{data.event.title}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {new Date(data.event.eventDate).toLocaleDateString()}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {data.event.location}
              </span>
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 16px 40px', marginTop: '-20px' }}>

        {error && (
          <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#791F1F', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ fontSize: '13px', color: '#5A6A7A', textAlign: 'center', padding: '40px' }}>Loading...</p>
        ) : data && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <StatCard icon={<Users size={18} color="#1E3A5F" />} label="Total RSVPs" value={data.stats.totalRSVPs} />
              <StatCard icon={<CheckCircle size={18} color="#1A5E2E" />} label="Checked in" value={`${data.stats.totalCheckedIn} (${checkInRate}%)`} />
              <StatCard icon={<Star size={18} color="#F5A623" />} label="Avg rating" value={data.stats.avgRating ? `${data.stats.avgRating} / 5` : '—'} />
              <StatCard icon={<MessageSquare size={18} color="#2E5480" />} label="Feedback" value={data.stats.feedbackCount} />
            </div>

            {/* Feedback list */}
            <div style={{ background: '#fff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623', borderRadius: '14px', boxShadow: '0 2px 12px rgba(30,58,95,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #EEF1F5' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>Feedback</h2>
              </div>

              {data.feedback.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#5A6A7A', textAlign: 'center', padding: '40px 20px' }}>
                  No feedback submitted yet.
                </p>
              ) : (
                data.feedback.map(fb => (
                  <div key={fb.feedbackID} style={{ padding: '16px 20px', borderBottom: '1px solid #F4F6F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E' }}>{fb.fullName}</span>
                      <span style={{ display: 'inline-flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={13} color="#F5A623" fill={n <= fb.starRating ? '#F5A623' : 'none'} />
                        ))}
                      </span>
                    </div>
                    {fb.comment && (
                      <p style={{ fontSize: '13px', color: '#5A6A7A', margin: '4px 0 0', lineHeight: 1.5 }}>{fb.comment}</p>
                    )}
                    <p style={{ fontSize: '11px', color: '#9AA7B5', margin: '6px 0 0' }}>
                      {new Date(fb.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #DDE6F0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(30,58,95,0.05)' }}>
      <div style={{ marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A2E' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#5A6A7A', marginTop: '2px' }}>{label}</div>
    </div>
  )
}
