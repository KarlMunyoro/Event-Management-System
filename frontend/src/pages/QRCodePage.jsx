import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { AlertTriangle, Calendar, MapPin, Check } from 'lucide-react'
import api from '../services/api'

export default function QRCodePage() {
  const { attendanceID } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchQRCode()
  }, [attendanceID])

  async function fetchQRCode() {
    try {
      const res = await api.get(`/qr/${attendanceID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load QR code')
    } finally {
      setLoading(false)
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
            Your QR Code
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px 40px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '13px', color: '#aaa' }}>Loading QR code...</p>
          </div>
        ) : error ? (
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
        ) : (
          <div style={{
            background: '#ffffff',
            border: '1px solid #DDE6F0',
            borderLeft: '4px solid #F5A623',
            borderRadius: '14px',
            padding: '28px 24px',
            marginTop: '-20px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
          }}>

            {/* Event info */}
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E', marginBottom: '4px' }}>
              {data.event.title}
            </div>
            <div style={{ fontSize: '12px', color: '#5A6A7A', marginBottom: '20px' }}>
              <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{new Date(data.event.eventDate).toDateString()} &nbsp;|&nbsp; <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{data.event.location}
            </div>

            {/* Check-in status */}
            {data.hasCheckedIn && (
              <div style={{
                background: '#E6F1FB',
                border: '1px solid #B5D4F4',
                borderRadius: '10px',
                padding: '10px 16px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#0C447C',
                fontWeight: '600',
              }}>
                <Check size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} /> Already checked in
              </div>
            )}

            {/* QR Code */}
            <div style={{ display: 'inline-block', padding: '18px', background: '#F8F9FB', borderRadius: '14px', marginBottom: '20px' }}>
              <QRCodeSVG
                value={data.token}
                size={180}
                bgColor="#F8F9FB"
                fgColor="#1E3A5F"
                level="M"
              />
            </div>

            {/* Fallback code */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                6-digit fallback code
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '10px', color: '#1A1A2E' }}>
                {data.fallbackCode}
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '16px' }}>
              Show this QR code or the fallback code at the event entrance
            </p>
          </div>
        )}
      </div>
    </div>
  )
}