import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function UserManagementPage() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')
  const myUserID = Number(localStorage.getItem('userID'))

  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (role !== 'Admin') {
      navigate('/events')
      return
    }
    load()
  }, [])

  function load(query = '') {
    setLoading(true)
    api.get('/admin/users', { params: query ? { search: query } : {} })
      .then(res => setUsers(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false))
  }

  function handleSearch(e) {
    e.preventDefault()
    load(search)
  }

  async function changeRole(userID, newRole) {
    const reason = window.prompt(`Why are you changing this user's role to ${newRole}? This reason will be shown to them.`)
    if (reason === null) return
    if (!reason.trim()) {
      setError('A reason is required to change a role')
      return
    }
    try {
      await api.put(`/admin/users/${userID}`, { role: newRole, reason: reason.trim() })
      setUsers(prev => prev.map(u => u.userID === userID ? { ...u, role: newRole } : u))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role')
    }
  }

  async function toggleStatus(userID, currentStatus) {
    const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active'
    try {
      await api.put(`/admin/users/${userID}`, { status: newStatus })
      setUsers(prev => prev.map(u => u.userID === userID ? { ...u, status: newStatus } : u))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change status')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'sans-serif' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(180deg, #1E3A5F 0%, #2E5480 40%, #F8F9FB 100%)', padding: '32px 24px 52px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button onClick={() => navigate('/admin/dashboard')} style={{ background: 'none', border: 'none', color: '#B0C4DE', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}>
            ← Back to dashboard
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>User management</h1>
          <p style={{ fontSize: '13px', color: '#B0C4DE' }}>Search users, change roles, and enable or disable accounts.</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 40px', marginTop: '-20px' }}>
        {error && (
          <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#791F1F', marginBottom: '16px' }}>{error}</div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} color="#9AA7B5" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              style={{ width: '100%', border: '1px solid #DDE6F0', borderRadius: '10px', padding: '10px 12px 10px 36px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #DDE6F0', borderLeft: '4px solid #F5A623', borderRadius: '14px', boxShadow: '0 2px 12px rgba(30,58,95,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <p style={{ fontSize: '13px', color: '#5A6A7A', textAlign: 'center', padding: '40px' }}>Loading...</p>
          ) : users.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#5A6A7A', textAlign: 'center', padding: '40px' }}>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #EEF1F5' }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isSelf = u.userID === myUserID
                    return (
                      <tr key={u.userID} style={{ borderBottom: '1px solid #F4F6F9' }}>
                        <td style={{ ...tdStyle, fontWeight: '600', color: '#1A1A2E' }}>
                          {u.fullName}{isSelf && <span style={{ fontSize: '11px', color: '#9AA7B5', fontWeight: '400' }}> (you)</span>}
                        </td>
                        <td style={tdStyle}>{u.email}</td>
                        <td style={tdStyle}>
                          <select
                            value={u.role}
                            onChange={e => changeRole(u.userID, e.target.value)}
                            disabled={isSelf}
                            style={{ border: '1px solid #DDE6F0', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', background: isSelf ? '#F4F6F9' : '#fff', cursor: isSelf ? 'not-allowed' : 'pointer' }}
                          >
                            <option value="Student">Student</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                            background: u.status === 'Active' ? '#EAF7EE' : '#FCEBEB',
                            color: u.status === 'Active' ? '#1A5E2E' : '#791F1F',
                            border: `1px solid ${u.status === 'Active' ? '#BFE4C8' : '#F7C1C1'}`,
                          }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <button
                            onClick={() => toggleStatus(u.userID, u.status)}
                            disabled={isSelf}
                            style={{
                              fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px',
                              border: '1px solid #DDE6F0', background: isSelf ? '#F4F6F9' : '#fff',
                              color: isSelf ? '#9AA7B5' : (u.status === 'Active' ? '#791F1F' : '#1A5E2E'),
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {u.status === 'Active' ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const thStyle = {
  fontSize: '11px', fontWeight: '600', color: '#5A6A7A', textAlign: 'left',
  padding: '14px 16px', textTransform: 'uppercase', letterSpacing: '0.03em',
}
const tdStyle = {
  fontSize: '13px', color: '#5A6A7A', padding: '12px 16px', verticalAlign: 'middle',
}
