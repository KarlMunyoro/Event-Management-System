import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const fullName = localStorage.getItem('fullName') || ''
  const role = localStorage.getItem('role')

  // Highlight whichever link matches the current path
  const currentPath = window.location.pathname

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  function linkStyle(href, baseColor) {
    const isActive = currentPath === href
    return {
      fontSize: '13px',
      color: baseColor,
      textDecoration: 'none',
      fontWeight: isActive ? '700' : '400',
      opacity: isActive ? 1 : 0.85,
    }
  }

  return (
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

        {/* Shown to everyone */}
        <a href="/events" style={linkStyle('/events', '#B0C4DE')}>Events</a>
        <a href="/my-rsvps" style={linkStyle('/my-rsvps', '#B0C4DE')}>My RSVPs</a>
        <a href="/archived" style={linkStyle('/archived', '#B0C4DE')}>Archived</a>
        <a href="/profile" style={linkStyle('/profile', '#B0C4DE')}>Profile</a>

        {/* Organizer only */}
        {role === 'Organizer' && (
          <>
            <a href="/organizer/dashboard" style={linkStyle('/organizer/dashboard', '#F5A623')}>Dashboard</a>
            <a href="/organizer/events" style={linkStyle('/organizer/events', '#F5A623')}>My events</a>
            <a href="/organizer/create" style={linkStyle('/organizer/create', '#F5A623')}>Create event</a>
            <a href="/organizer/scanner" style={linkStyle('/organizer/scanner', '#F5A623')}>Scanner</a>
          </>
        )}

        {/* Admin only */}
        {role === 'Admin' && (
          <>
            <a href="/admin/dashboard" style={linkStyle('/admin/dashboard', '#F5A623')}>Dashboard</a>
            <a href="/admin/organizer-requests" style={linkStyle('/admin/organizer-requests', '#F5A623')}>Requests</a>
            <a href="/admin/users" style={linkStyle('/admin/users', '#F5A623')}>Users</a>
          </>
        )}

        {/* User avatar + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#F5A623', color: '#1E3A5F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700',
          }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <span style={{
            fontSize: '12px', color: '#B0C4DE', maxWidth: '120px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {fullName}
          </span>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '12px', color: '#1E3A5F', background: '#F5A623',
              border: 'none', borderRadius: '6px', padding: '5px 12px',
              cursor: 'pointer', fontWeight: '600',
            }}
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}
