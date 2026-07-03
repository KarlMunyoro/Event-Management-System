import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle, XCircle, AlertCircle, Keyboard } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function ScannerPage() {
  const navigate = useNavigate()
  const fullName = localStorage.getItem('fullName')
  const role = localStorage.getItem('role')

  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // { type: 'success'|'duplicate'|'error', data }
  const [manualCode, setManualCode] = useState('')
  const [processing, setProcessing] = useState(false)
  const scannerRef = useRef(null)
  const lastScanRef = useRef({ value: '', time: 0 })

  useEffect(() => {
    if (role !== 'Organizer' && role !== 'Admin') {
      navigate('/events')
    }
    return () => {
      // Cleanup camera on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  async function startScanner() {
    setResult(null)
    setScanning(true)
    // Wait a tick so the #reader div is mounted
    setTimeout(async () => {
      try {
        const html5Qr = new Html5Qrcode('reader')
        scannerRef.current = html5Qr
        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => onScanSuccess(decodedText),
          () => {} // ignore per-frame decode errors
        )
      } catch (err) {
        setScanning(false)
        setResult({ type: 'error', data: { message: 'Could not access camera. Check permissions.' } })
      }
    }, 100)
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch (e) {}
      scannerRef.current = null
    }
    setScanning(false)
  }

  async function onScanSuccess(decodedText) {
    // Debounce: html5-qrcode fires rapidly; ignore repeats within 3s
    const now = Date.now()
    if (decodedText === lastScanRef.current.value && now - lastScanRef.current.time < 3000) {
      return
    }
    lastScanRef.current = { value: decodedText, time: now }
    await verify({ token: decodedText })
  }

  async function verify(params) {
    setProcessing(true)
    try {
      const res = await api.get('/qr/verify', { params })
      if (res.data.alreadyCheckedIn) {
        setResult({ type: 'duplicate', data: res.data })
      } else {
        setResult({ type: 'success', data: res.data })
      }
    } catch (err) {
      setResult({
        type: 'error',
        data: { message: err.response?.data?.message || 'Verification failed' },
      })
    } finally {
      setProcessing(false)
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualCode.trim()) return
    await verify({ code: manualCode.trim() })
    setManualCode('')
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)', padding: '32px 24px 52px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button onClick={() => navigate('/organizer/dashboard')} style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}>
            ← Back to dashboard
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>Attendance scanner</h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>Scan a student's QR code or enter their 6-digit backup code.</p>
        </div>
      </div>

      {/* Card */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px 40px' }}>
        <div style={{
          background: '#ffffff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623',
          borderRadius: '14px', padding: '24px', marginTop: '-20px', boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
        }}>

          {/* Result banner */}
          {result && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px',
              borderRadius: '10px', marginBottom: '20px',
              background: result.type === 'success' ? '#EAF7EE' : result.type === 'duplicate' ? '#FEF6E7' : '#FCEBEB',
              border: `1px solid ${result.type === 'success' ? '#BFE4C8' : result.type === 'duplicate' ? '#F5D89A' : '#F7C1C1'}`,
            }}>
              {result.type === 'success' && <CheckCircle size={20} color="#1A5E2E" style={{ flexShrink: 0 }} />}
              {result.type === 'duplicate' && <AlertCircle size={20} color="#8A5A00" style={{ flexShrink: 0 }} />}
              {result.type === 'error' && <XCircle size={20} color="#791F1F" style={{ flexShrink: 0 }} />}
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 2px', color: result.type === 'success' ? '#1A5E2E' : result.type === 'duplicate' ? '#8A5A00' : '#791F1F' }}>
                  {result.type === 'success' && 'Check-in confirmed'}
                  {result.type === 'duplicate' && 'Already checked in'}
                  {result.type === 'error' && 'Not verified'}
                </p>
                {result.data.fullName ? (
                  <p style={{ fontSize: '13px', margin: 0, color: '#3A4A5A' }}>
                    {result.data.fullName} — {result.data.eventTitle}
                  </p>
                ) : (
                  <p style={{ fontSize: '13px', margin: 0, color: '#3A4A5A' }}>{result.data.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Camera area */}
          {scanning ? (
            <div>
              <div id="reader" style={{ width: '100%', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }} />
              <button onClick={stopScanner} style={{ width: '100%', padding: '11px', background: '#FCEBEB', color: '#791F1F', border: '1px solid #F7C1C1', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                Stop camera
              </button>
            </div>
          ) : (
            <button onClick={startScanner} disabled={processing} style={{
              width: '100%', padding: '14px', background: '#1E3A5F', color: '#fff', border: 'none',
              borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <Camera size={18} /> Start camera scan
            </button>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#EEF1F5' }} />
            <span style={{ fontSize: '11px', color: '#9AA7B5', fontWeight: '600' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#EEF1F5' }} />
          </div>

          {/* Manual entry */}
          <form onSubmit={handleManualSubmit}>
            <label style={{ fontSize: '12px', color: '#5A6A7A', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              <Keyboard size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Enter 6-digit backup code
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                style={{ flex: 1, border: '1px solid #DDE6F0', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '0.1em' }}
              />
              <button type="submit" disabled={processing || !manualCode.trim()} style={{
                padding: '10px 18px', background: '#F5A623', color: '#1E3A5F', border: 'none',
                borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                cursor: processing || !manualCode.trim() ? 'not-allowed' : 'pointer',
                opacity: processing || !manualCode.trim() ? 0.6 : 1,
              }}>
                Verify
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
