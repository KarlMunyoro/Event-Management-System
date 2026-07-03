import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function OrganizerRequestsPage() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingID, setProcessingID] = useState(null)

  useEffect(() => {
    if (role !== 'Admin') {
      navigate('/events')
      return
    }
    load()
  }, [])

  function load() {
    setLoading(true)
    api.get('/admin/organizer-requests')
      .then(res => setRequests(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load requests'))
      .finally(() => setLoading(false))
  }

  async function handleAction(requestID, action) {
    setProcessingID(requestID)
    try {
      await api.put(`/admin/organizer-requests/${requestID}`, { action })
      // Remove the handled request from the list
      setRequests(prev => prev.filter(r => r.requestID !== requestID))
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed')
    } finally {
      setProcessingID(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)', padding: '32px 24px 52px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <button onClick={() => navigate('/admin/dashboard')} style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}>
            ← Back to dashboard
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>Organizer requests</h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>Review and approve requests for organizer access.</p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px 40px', marginTop: '-20px' }}>
        {error && (
          <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#791F1F', marginBottom: '20px' }}>{error}</div>
        )}

        {loading ? (
          <p style={{ fontSize: '13px', color: '#5A6A7A', textAlign: 'center', padding: '40px' }}>Loading...</p>
        ) : requests.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623', borderRadius: '14px', padding: '48px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(30,58,95,0.08)' }}>
            <p style={{ fontSize: '14px', color: '#5A6A7A', margin: 0 }}>No pending requests.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {requests.map(req => (
              <div key={req.requestID} style={{ background: '#fff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(30,58,95,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 4px' }}>{req.clubName}</h3>
                    <p style={{ fontSize: '13px', color: '#1A1A2E', margin: '0 0 2px' }}>{req.fullName}</p>
                    <p style={{ fontSize: '12px', color: '#5A6A7A', margin: '0 0 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {req.email}
                    </p>
                    {req.reason && (
                      <p style={{ fontSize: '13px', color: '#5A6A7A', margin: '8px 0 0', lineHeight: 1.5, background: '#F8F9FB', padding: '10px 12px', borderRadius: '8px' }}>
                        {req.reason}
                      </p>
                    )}
                    <p style={{ fontSize: '11px', color: '#9AA7B5', margin: '10px 0 0' }}>
                      Requested {new Date(req.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAction(req.requestID, 'approve')}
                      disabled={processingID === req.requestID}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#1A5E2E', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.requestID, 'reject')}
                      disabled={processingID === req.requestID}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff', color: '#791F1F', border: '1px solid #F7C1C1', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
