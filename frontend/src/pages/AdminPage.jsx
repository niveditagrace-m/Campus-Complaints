import { useState, useEffect } from 'react'
import { adminService } from '../services/api'
import { CATEGORIES, STATUSES, getCategoryInfo, getStatusInfo, formatDate } from '../utils/constants'
import { Shield, ChevronDown, Check, X, MessageSquareDot } from 'lucide-react'
import FilterBar from '../components/complaints/FilterBar'

export default function AdminPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: 'all', status: 'all' })
  const [editing, setEditing] = useState(null) // { id, status, remarks }
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const fetchComplaints = async () => {
    setLoading(true)
    const { data } = await adminService.getAllComplaints(filters)
    setComplaints(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchComplaints() }, [JSON.stringify(filters)])

  const handleEdit = (complaint) => {
    setEditing({ id: complaint.id, status: complaint.status, remarks: complaint.admin_remarks || '' })
    setExpandedId(complaint.id)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    const { data, error } = await adminService.updateComplaint(editing.id, { status: editing.status, admin_remarks: editing.remarks })
    if (!error) {
      setComplaints(prev => prev.map(c => c.id === editing.id ? { ...c, status: data.status, admin_remarks: data.admin_remarks } : c))
      setEditing(null)
      setExpandedId(null)
    }
    setSaving(false)
  }

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Shield size={20} color="#ff6b6b" />
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Admin Panel
          </h1>
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
            background: 'rgba(255,107,107,0.15)', color: '#ff6b6b', letterSpacing: '0.5px',
          }}>ADMIN</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
          Manage and respond to all campus complaints
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: stats.total, color: 'var(--text)', border: 'var(--border)' },
          { label: 'Pending', value: stats.pending, color: '#ffb347', border: '#ffb34733' },
          { label: 'In Progress', value: stats.inProgress, color: '#47b8ff', border: '#47b8ff33' },
          { label: 'Resolved', value: stats.resolved, color: '#7fff00', border: '#7fff0033' },
          { label: 'Rejected', value: stats.rejected, color: '#ff6b6b', border: '#ff6b6b33' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: `1px solid ${s.border}`,
            borderRadius: '12px', padding: '14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '16px 20px', marginBottom: '20px',
      }}>
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 120px 80px 140px',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface2)',
        }}>
          {['Complaint', 'Category', 'Status', 'Votes', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            Loading complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
            No complaints found for the selected filters.
          </div>
        ) : (
          complaints.map((complaint, i) => {
            const category = getCategoryInfo(complaint.category)
            const status = getStatusInfo(complaint.status)
            const isExpanded = expandedId === complaint.id
            const isEditingThis = editing?.id === complaint.id

            return (
              <div key={complaint.id} style={{
                borderBottom: i < complaints.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}>
                {/* Main Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 120px 80px 140px',
                    padding: '14px 20px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--surface2)' : 'transparent',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                      {complaint.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {complaint.author_name} · {formatDate(complaint.created_at)}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      fontSize: '11px', fontWeight: 500, padding: '3px 9px', borderRadius: '20px',
                      background: `rgba(${hexToRgb(category.color)}, 0.12)`, color: category.color,
                    }}>
                      {category.icon} {category.label}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      fontSize: '11px', fontWeight: 500, padding: '3px 9px', borderRadius: '20px',
                      background: status.bg, color: status.color,
                    }}>
                      {status.label}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--acid)', fontSize: '14px' }}>
                    ↑{complaint.votes_count || 0}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleEdit(complaint) }}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--surface2)',
                        color: 'var(--text)', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontFamily: 'Sora, sans-serif', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--acid)'; e.currentTarget.style.color = 'var(--acid)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                    >
                      <MessageSquareDot size={12} /> Manage
                    </button>
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div style={{
                    padding: '0 20px 20px',
                    background: 'var(--surface2)',
                    borderTop: '1px solid var(--border)',
                  }}>
                    <div style={{ paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {/* Description */}
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Description
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                          {complaint.description}
                        </p>
                        {complaint.image_url && (
                          <img src={complaint.image_url} alt="" style={{
                            marginTop: '10px', maxHeight: '120px', borderRadius: '8px',
                            objectFit: 'cover', border: '1px solid var(--border)',
                          }} />
                        )}
                      </div>

                      {/* Edit Panel */}
                      {isEditingThis ? (
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Update Status
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {STATUSES.map(s => (
                              <button
                                key={s.value}
                                onClick={() => setEditing(p => ({ ...p, status: s.value }))}
                                style={{
                                  padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                                  border: `1px solid ${editing.status === s.value ? s.color : 'var(--border)'}`,
                                  background: editing.status === s.value ? s.bg : 'transparent',
                                  color: editing.status === s.value ? s.color : 'var(--muted)',
                                  cursor: 'pointer', fontFamily: 'Sora', transition: 'all 0.15s',
                                }}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Admin Remarks
                          </div>
                          <textarea
                            value={editing.remarks}
                            onChange={e => setEditing(p => ({ ...p, remarks: e.target.value }))}
                            placeholder="Add a note visible to the user..."
                            rows={3}
                            style={{
                              width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                              borderRadius: '8px', border: '1px solid var(--border)',
                              background: 'var(--surface)', color: 'var(--text)',
                              fontSize: '13px', resize: 'vertical', outline: 'none',
                              fontFamily: 'Sora, sans-serif',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--acid)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                          />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              style={{
                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                background: 'var(--acid)', color: '#0a0a18',
                                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '5px',
                                opacity: saving ? 0.6 : 1, fontFamily: 'Sora',
                              }}
                            >
                              <Check size={13} /> {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setEditing(null) }}
                              style={{
                                padding: '8px 14px', borderRadius: '8px',
                                border: '1px solid var(--border)', background: 'transparent',
                                color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Sora',
                              }}
                            >
                              <X size={13} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {complaint.admin_remarks && (
                            <>
                              <div style={{ fontSize: '11px', color: '#47b8ff', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Admin Remarks
                              </div>
                              <p style={{
                                margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: 1.6,
                                padding: '10px 12px', borderRadius: '8px',
                                background: 'rgba(71,184,255,0.06)', border: '1px solid rgba(71,184,255,0.2)',
                              }}>
                                {complaint.admin_remarks}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1],16)},${parseInt(result[2],16)},${parseInt(result[3],16)}` : '127,255,0'
}
