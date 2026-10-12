import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Utensils, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { getRoleHome } from '../auth/roles'

const roleLinks = {
  STUDENT: [{ label: 'Student Portal', to: '/student/dashboard' }],
  STAFF: [{ label: 'Kitchen Ops', to: '/staff/operations' }],
  ADMIN: [
    { label: 'Admin Analytics', to: '/admin/dashboard' },
    { label: 'Waste Logs', to: '/admin/waste-logs' },
    { label: 'User Management', to: '/admin/users' },
  ],
}

const roleLabels = { STUDENT: 'Student', STAFF: 'Mess Staff', ADMIN: 'Warden / Admin' }

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'MM'
}

export default function Navbar() {
  const { user, role, logout, updateProfile, isDemo } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!profileOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [profileOpen])

  const saveProfile = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await updateProfile({ fullName: fullName.trim() })
      setNotice('Your profile name has been updated.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to update your profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/login', { replace: true })
  }

  const displayName = user?.fullName || user?.institutionalId || 'Account'
  const links = roleLinks[role] || []

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink className="brand" to={getRoleHome(role)} aria-label="MealMatrices MessTrack home">
            <span className="brand-mark"><Utensils size={19} strokeWidth={2.4} /></span>
            <span>MealMatrices <span className="brand-light">MessTrack</span></span>
          </NavLink>
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to={getRoleHome(role)} end className="nav-pill">Dashboard</NavLink>
            {links.map(({ label, to }) => (
              <NavLink key={to} to={to} end className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          {isDemo && <span className="demo-session-tag">DEMO SESSION</span>}
          <button className="user-avatar" onClick={() => { setFullName(user?.fullName || ''); setError(''); setNotice(''); setProfileOpen(true) }} aria-label={`Open profile for ${displayName}`}>
            <span>{initials(user?.fullName || user?.institutionalId || '')}</span>
          </button>
        </div>
      </header>
      {profileOpen && (
        <div className="profile-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false) }}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <div className="profile-modal-heading">
              <div><span className="eyebrow">ACCOUNT SETTINGS</span><h2 id="profile-title">User Profile &amp; Settings</h2></div>
              <button className="icon-button" onClick={() => setProfileOpen(false)} aria-label="Close profile"><X size={17} /></button>
            </div>
            <form onSubmit={saveProfile}>
              {isDemo && <div className="demo-profile-notice">Demo profile: changes stay in this browser and are not sent to the backend.</div>}
              <label className="profile-field-label" htmlFor="profile-name">Full Name</label>
              <input className="profile-field" id="profile-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={120} />
              <label className="profile-field-label" htmlFor="profile-id">Institutional ID / Roll No / GR No <span>READ ONLY</span></label>
              <input className="profile-field locked" id="profile-id" value={user?.institutionalId || ''} disabled readOnly />
              <div className="profile-readonly-grid">
                <div><span className="profile-field-label">Assigned Role</span><span className="role-readonly-badge">Role: {roleLabels[role]}</span></div>
                <div><span className="profile-field-label">Room No / Hostel Block</span><span className="readonly-value">{[user?.roomNumber, user?.hostelBlock].filter(Boolean).join(' · ') || 'Not assigned'}</span></div>
              </div>
              <div className="profile-readonly-row"><span className="profile-field-label">Mess Subscription</span><span className="readonly-value">{user?.messSubscription || 'Not assigned'}</span></div>
              {error && <div className="auth-error" role="alert">{error}</div>}
              {notice && <div className="auth-success" role="status">{notice}</div>}
              <div className="profile-modal-actions">
                <button className="btn btn-outline-secondary" type="button" onClick={handleLogout}><LogOut size={15} /> Logout</button>
                <button className="btn btn-primary" type="submit" disabled={saving || !fullName.trim()}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
