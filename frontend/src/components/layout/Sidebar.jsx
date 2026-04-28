import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard, MessageSquare, PlusCircle,
  Shield, LogOut, GraduationCap, User
} from 'lucide-react'

const navItems = [
  { to: '/feed', icon: LayoutDashboard, label: 'Feed' },
  { to: '/submit', icon: PlusCircle, label: 'Submit' },
  { to: '/my-complaints', icon: MessageSquare, label: 'My Complaints' },
]

export default function Sidebar() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'var(--acid)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={20} color="#0a0a18" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.3px' }}>
              CampusVoice
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
              v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>
          Main Menu
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 10px',
              borderRadius: '8px',
              marginBottom: '2px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#0a0a18' : 'var(--muted)',
              background: isActive ? 'var(--acid)' : 'transparent',
              transition: 'all 0.15s ease',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'var(--surface2)'
                e.currentTarget.style.color = 'var(--text)'
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes('acid')) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--muted)'
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} color={isActive ? '#0a0a18' : 'currentColor'} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '16px 8px 8px' }}>
              Admin
            </div>
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#0a0a18' : '#ff6b6b',
                background: isActive ? '#ff6b6b' : 'rgba(255,107,107,0.08)',
                transition: 'all 0.15s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <Shield size={16} color={isActive ? '#0a0a18' : '#ff6b6b'} />
                  Admin Panel
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          borderRadius: '10px',
          background: 'var(--surface2)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6b6b99, #4a4a7a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isAdmin ? '⚡ Admin' : '👤 User'}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; e.currentTarget.style.color = '#ff6b6b' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
