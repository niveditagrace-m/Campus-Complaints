import { useState } from 'react'
import { ChevronUp, Eye, Clock } from 'lucide-react'
import { getCategoryInfo, getStatusInfo, formatDate } from '../../utils/constants'

export default function ComplaintCard({ complaint, hasVoted, onVote, isAdmin = false }) {
  const [voting, setVoting] = useState(false)
  const category = getCategoryInfo(complaint.category)
  const status = getStatusInfo(complaint.status)

  const handleVote = async (e) => {
    e.stopPropagation()
    if (voting) return
    setVoting(true)
    await onVote?.(complaint.id)
    setVoting(false)
  }

  return (
    <div className="card-hover animate-fade-in" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      gap: '16px',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left accent */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: '3px',
        background: category.color,
        borderRadius: '14px 0 0 14px',
      }} />

      {/* Vote Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '48px' }}>
        <button
          onClick={handleVote}
          disabled={!onVote || voting}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            border: `1.5px solid ${hasVoted ? 'var(--acid)' : 'var(--border)'}`,
            background: hasVoted ? 'rgba(127,255,0,0.1)' : 'var(--surface2)',
            color: hasVoted ? 'var(--acid)' : 'var(--muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: onVote ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            gap: '1px',
            opacity: voting ? 0.6 : 1,
          }}
          onMouseEnter={e => {
            if (onVote) {
              e.currentTarget.style.borderColor = 'var(--acid)'
              e.currentTarget.style.background = 'rgba(127,255,0,0.08)'
            }
          }}
          onMouseLeave={e => {
            if (!hasVoted) {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--surface2)'
            }
          }}
        >
          <ChevronUp size={14} />
          <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1, fontFamily: 'JetBrains Mono' }}>
            {complaint.votes_count || 0}
          </span>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
          <h3 style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.4,
            letterSpacing: '-0.2px',
          }}>
            {complaint.title}
          </h3>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 9px',
              borderRadius: '20px',
              background: `rgba(${hexToRgb(category.color)}, 0.12)`,
              color: category.color,
              whiteSpace: 'nowrap',
            }}>
              {category.icon} {category.label}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 9px',
              borderRadius: '20px',
              background: status.bg,
              color: status.color,
              whiteSpace: 'nowrap',
            }}>
              {status.label}
            </span>
          </div>
        </div>

        <p style={{
          margin: '0 0 12px',
          fontSize: '13px',
          color: 'var(--muted)',
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {complaint.description}
        </p>

        {complaint.image_url && (
          <div style={{ marginBottom: '12px' }}>
            <img
              src={complaint.image_url}
              alt="Complaint"
              style={{
                height: '100px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid var(--border)',
              }}
            />
          </div>
        )}

        {complaint.admin_remarks && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(71,184,255,0.08)',
            border: '1px solid rgba(71,184,255,0.2)',
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '11px', color: '#47b8ff', fontWeight: 600, marginBottom: '4px' }}>
              🛡 Admin Remark
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text)' }}>{complaint.admin_remarks}</div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '20px', height: '20px',
              borderRadius: '5px',
              background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px',
            }}>
              {complaint.is_anonymous ? '👤' : '🎓'}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
              {complaint.author_name || 'Anonymous'}
            </span>
          </div>
          <span style={{ color: 'var(--border)', fontSize: '10px' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted)', fontSize: '12px' }}>
            <Clock size={11} />
            {formatDate(complaint.created_at)}
          </div>
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1],16)},${parseInt(result[2],16)},${parseInt(result[3],16)}` : '127,255,0'
}
