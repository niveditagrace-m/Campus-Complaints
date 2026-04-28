import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { complaintsService } from '../services/api'
import { CATEGORIES } from '../utils/constants'
import { Upload, X, Send, EyeOff } from 'lucide-react'

export default function SubmitPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef()
  const [form, setForm] = useState({
    title: '', description: '', category: '', isAnonymous: false,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) { setError('Please select a category'); return }
    setError('')
    setLoading(true)

    const { data, error } = await complaintsService.create({
      title: form.title,
      description: form.description,
      category: form.category,
      imageFile,
      isAnonymous: form.isAnonymous,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/feed')
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'var(--surface2)',
    color: 'var(--text)', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.15s', fontFamily: 'Sora, sans-serif',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '660px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Submit a Complaint
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
          Your feedback drives real improvements on campus
        </p>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px',
      }}>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Brief summary of your complaint"
              required
              maxLength={120}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--acid)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
              {form.title.length}/120
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Category *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: `1.5px solid ${form.category === cat.value ? cat.color : 'var(--border)'}`,
                    background: form.category === cat.value ? `rgba(${hexToRgb(cat.color)}, 0.1)` : 'var(--surface2)',
                    color: form.category === cat.value ? cat.color : 'var(--muted)',
                    fontSize: '12px',
                    fontWeight: form.category === cat.value ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                    fontFamily: 'Sora, sans-serif',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '3px' }}>{cat.icon}</div>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the issue in detail — where, when, what happened..."
              required
              rows={5}
              maxLength={1000}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
              onFocus={e => e.target.style.borderColor = 'var(--acid)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
              {form.description.length}/1000
            </div>
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Image (Optional)
            </label>
            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="Preview" style={{
                  height: '120px', borderRadius: '10px', objectFit: 'cover',
                  border: '1px solid var(--border)',
                }} />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }} style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#ff6b6b', border: 'none', color: 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: '10px',
                  padding: '24px', textAlign: 'center', cursor: 'pointer',
                  background: 'var(--surface2)', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--acid)'; e.currentTarget.style.background = 'rgba(127,255,0,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface2)' }}
              >
                <Upload size={20} color="var(--muted)" style={{ marginBottom: '6px' }} />
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Click to upload · Max 5MB
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          {/* Anonymous Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: '10px',
            background: form.isAnonymous ? 'rgba(127,255,0,0.06)' : 'var(--surface2)',
            border: `1px solid ${form.isAnonymous ? 'rgba(127,255,0,0.3)' : 'var(--border)'}`,
            marginBottom: '24px', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onClick={() => setForm(p => ({ ...p, isAnonymous: !p.isAnonymous }))}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <EyeOff size={16} color={form.isAnonymous ? 'var(--acid)' : 'var(--muted)'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: form.isAnonymous ? 'var(--acid)' : 'var(--text)' }}>
                  Post Anonymously
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Your name will be hidden from the public feed
                </div>
              </div>
            </div>
            <div style={{
              width: '40px', height: '22px', borderRadius: '11px',
              background: form.isAnonymous ? 'var(--acid)' : 'var(--border)',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: form.isAnonymous ? '21px' : '3px',
                width: '16px', height: '16px',
                borderRadius: '50%', background: 'white',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>

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
              width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
              background: loading ? 'var(--surface2)' : 'var(--acid)',
              color: loading ? 'var(--muted)' : '#0a0a18',
              fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s', fontFamily: 'Sora, sans-serif',
            }}
          >
            {loading ? 'Submitting...' : (<><Send size={16} /> Submit Complaint</>)}
          </button>
        </form>
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1],16)},${parseInt(result[2],16)},${parseInt(result[3],16)}` : '127,255,0'
}
