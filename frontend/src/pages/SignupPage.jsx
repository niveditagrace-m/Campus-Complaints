import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApiService } from '../services/api'
import { GraduationCap, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const { signUp } = { signUp: authApiService.signUp }
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await authApiService.signUp(form.email, form.password, form.name)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div className="animate-fade-in" style={{
          maxWidth: '400px', width: '100%',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
          <h2 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '22px' }}>Check your email</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--text)' }}>{form.email}</strong>. Click it to activate your account.
          </p>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '10px',
            background: 'var(--acid)', color: '#0a0a18',
            fontSize: '14px', fontWeight: 700, textDecoration: 'none',
          }}>
            Go to Login <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px', opacity: 0.3,
      }} />

      <div className="animate-fade-in" style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '40px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '44px', height: '44px', background: 'var(--acid)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} className="glow-acid">
            <GraduationCap size={24} color="#0a0a18" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>CampusVoice</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>Create your account</div>
          </div>
        </div>

        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Join the community</h1>
        <p style={{ margin: '0 0 28px', fontSize: '14px', color: 'var(--muted)' }}>Be heard. Make change happen.</p>

        <form onSubmit={handleSubmit}>
          {['name', 'email', 'password'].map((field) => (
            <div key={field} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {field === 'name' ? 'Full Name' : field === 'email' ? 'Email' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={field === 'password' ? (showPwd ? 'text' : 'password') : field}
                  value={form[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={field === 'name' ? 'John Doe' : field === 'email' ? 'you@campus.edu' : '••••••••'}
                  required
                  style={{
                    width: '100%', padding: `11px ${field === 'password' ? '44px' : '14px'} 11px 14px`,
                    borderRadius: '10px', border: '1px solid var(--border)',
                    background: 'var(--surface2)', color: 'var(--text)',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s', fontFamily: 'Sora, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--acid)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                {field === 'password' && (
                  <button type="button" onClick={() => setShowPwd(p => !p)} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px',
                  }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
              color: '#ff6b6b', fontSize: '13px', marginBottom: '16px',
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: loading ? 'var(--surface2)' : 'var(--acid)',
              color: loading ? 'var(--muted)' : '#0a0a18',
              fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s ease', fontFamily: 'Sora, sans-serif',
            }}
          >
            {loading ? 'Creating account...' : (<>Create Account <ArrowRight size={16} /></>)}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--acid)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
