import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { CheckCircle, XCircle, AlertCircle, ScanLine, User, Calendar, MapPin, RefreshCw, Keyboard } from 'lucide-react'
import api from '../services/api'

export default function OrganizerScanPage() {
  const navigate = useNavigate()
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')
  // phase: 'scanning' | 'loading' | 'result'
  const [phase, setPhase] = useState('scanning')
  const [result, setResult] = useState(null)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const scannerRef = useRef(null)

  useEffect(() => {
    if (role !== 'Organizer' && role !== 'Admin') navigate('/events')
  }, [])

  // Initialise scanner whenever phase returns to 'scanning' (and manual entry isn't open)
  useEffect(() => {
    if (phase !== 'scanning' || showManualEntry) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 240, height: 240 }, rememberLastUsedCamera: true },
      /* verbose= */ false
    )

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {})
        verify(decodedText)
      },
      () => {} // suppress per-frame decode errors
    )

    scannerRef.current = scanner
    return () => {
      scanner.clear().catch(() => {})
      scannerRef.current = null
    }
  }, [phase, showManualEntry])

  async function verify(rawValue) {
    setPhase('loading')

    // Accept either a plain token or a full URL containing ?token=
    let token = rawValue.trim()
    try {
      const url = new URL(rawValue)
      const t = url.searchParams.get('token')
      if (t) token = t
    } catch {
      // not a URL — use raw value as the token
    }

    try {
      const res = await api.get(`/qr/verify?token=${encodeURIComponent(token)}`)
      setResult({ status: res.data.alreadyCheckedIn ? 'duplicate' : 'success', data: res.data })
    } catch (err) {
      setResult({ status: 'error', message: err.response?.data?.message || 'Invalid or unrecognised QR code' })
    }

    setPhase('result')
  }

  async function handleManualSubmit(e) {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) return

    setPhase('loading')
    try {
      const res = await api.get(`/qr/verify?code=${encodeURIComponent(code)}`)
      setResult({ status: res.data.alreadyCheckedIn ? 'duplicate' : 'success', data: res.data })
    } catch (err) {
      setResult({ status: 'error', message: err.response?.data?.message || 'Invalid or unrecognised backup code' })
    }
    setPhase('result')
  }

  function handleScanNext() {
    setResult(null)
    setManualCode('')
    setShowManualEntry(false)
    setPhase('scanning')
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F8', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <div style={{
        background: '#002147',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/Strathmore%20logo.png" alt="SU" style={{ height: '28px', objectFit: 'contain' }} />
          <span
            onClick={() => navigate('/organizer/dashboard')}
            style={{ fontSize: '15px', fontWeight: '700', color: '#C8922A', cursor: 'pointer' }}
          >
            CampusEvents
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            style={{ fontSize: '12px', color: '#B0C4DE', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={{ fontSize: '12px', color: '#002147', background: '#C8922A', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontWeight: '600' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page header */}
      <div style={{
        background: 'linear-gradient(180deg, #002147 0%, #003670 40%, #F0F4F8 100%)',
        padding: '28px 20px 48px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <ScanLine size={32} color="#C8922A" />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
          QR Check-in Scanner
        </h1>
        <p style={{ fontSize: '13px', color: '#B0C4DE' }}>
          Point the camera at an attendee's QR code
        </p>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '460px', margin: '-24px auto 0', padding: '0 16px 40px' }}>

        {/* Scanner view */}
        {phase === 'scanning' && !showManualEntry && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          }}>
            <div style={{ padding: '16px 16px 0', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                Allow camera access when prompted, then hold the QR code steady in the frame.
              </p>
            </div>
            {/* html5-qrcode renders its UI into this div */}
            <div id="qr-reader" style={{ width: '100%' }} />
            <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #F3F4F6' }}>
              <button
                onClick={() => setShowManualEntry(true)}
                style={{
                  background: 'none', border: 'none', color: '#002147', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Keyboard size={14} /> Trouble scanning? Enter backup code
              </button>
            </div>
          </div>
        )}

        {/* Manual backup-code entry */}
        {phase === 'scanning' && showManualEntry && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <Keyboard size={28} color="#002147" />
            </div>
            <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
              Enter the attendee's 6-digit backup code
            </p>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={manualCode}
                onChange={e => setManualCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{
                  width: '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: '28px',
                  fontWeight: '700', letterSpacing: '10px', padding: '14px', border: '1px solid #DDE6F0',
                  borderRadius: '10px', outline: 'none', marginBottom: '16px', color: '#1A1A2E',
                }}
              />
              <button
                type="submit"
                disabled={manualCode.trim().length !== 6}
                style={{
                  width: '100%', padding: '13px', background: manualCode.trim().length !== 6 ? '#B0C4DE' : '#002147',
                  color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                  cursor: manualCode.trim().length !== 6 ? 'not-allowed' : 'pointer', marginBottom: '12px',
                }}
              >
                Verify code
              </button>
            </form>
            <button
              onClick={() => { setShowManualEntry(false); setManualCode('') }}
              style={{
                width: '100%', background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <ScanLine size={14} /> Back to camera scanner
            </button>
          </div>
        )}

        {/* Loading */}
        {phase === 'loading' && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          }}>
            <RefreshCw size={32} color="#002147" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#555' }}>Verifying QR code...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && result && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          }}>

            {result.status === 'success' && (
              <>
                <CheckCircle size={60} color="#16A34A" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '10px 16px', marginBottom: '24px', fontSize: '14px', fontWeight: '700', color: '#15803D' }}>
                  Valid — Entry Approved
                </div>
                <InfoRow icon={<User size={14} color="#555" />} label="Attendee" value={result.data.fullName} />
                <InfoRow icon={<Calendar size={14} color="#555" />} label="Event" value={result.data.eventTitle} />
                <InfoRow icon={<Calendar size={14} color="#555" />} label="Date" value={new Date(result.data.eventDate).toDateString()} />
                <InfoRow icon={<MapPin size={14} color="#555" />} label="Venue" value={result.data.location} />
                <div style={{ marginTop: '20px', background: '#002147', color: '#fff', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '600' }}>
                  Welcome! Please proceed in.
                </div>
              </>
            )}

            {result.status === 'duplicate' && (
              <>
                <AlertCircle size={60} color="#D97706" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 16px', marginBottom: '24px', fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
                  Already Checked In
                </div>
                <InfoRow icon={<User size={14} color="#555" />} label="Attendee" value={result.data.fullName} />
                <InfoRow icon={<Calendar size={14} color="#555" />} label="Event" value={result.data.eventTitle} />
                <InfoRow icon={<MapPin size={14} color="#555" />} label="Venue" value={result.data.location} />
                <p style={{ fontSize: '13px', color: '#888', marginTop: '16px' }}>
                  This attendee has already been checked in. Contact the organizer if this is unexpected.
                </p>
              </>
            )}

            {result.status === 'error' && (
              <>
                <XCircle size={60} color="#DC2626" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', fontSize: '14px', fontWeight: '700', color: '#991B1B' }}>
                  Invalid QR Code
                </div>
                <p style={{ fontSize: '13px', color: '#888' }}>{result.message}</p>
              </>
            )}

            <button
              onClick={handleScanNext}
              style={{
                marginTop: '24px',
                width: '100%',
                background: '#002147',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <ScanLine size={16} /> Scan Next Attendee
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #F3F4F6', textAlign: 'left' }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ fontSize: '12px', color: '#888', width: '65px', flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{value}</div>
    </div>
  )
}
