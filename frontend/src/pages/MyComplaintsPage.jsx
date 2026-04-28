import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { complaintsService } from '../services/api'
import ComplaintCard from '../components/complaints/ComplaintCard'
import { MessageSquare, Trash2 } from 'lucide-react'

export default function MyComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchMyComplaints = async () => {
    setLoading(true)
    const { data, error } = await complaintsService.getMy()
    if (error) {
      setError(error.message)
    } else {
      setComplaints(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchMyComplaints() }, [user?.id])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return
    setDeleting(id)
    const { error } = await complaintsService.delete(id)
    if (!error) setComplaints(prev => prev.filter(c => c.id !== id))
    setDeleting(null)
  }

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <MessageSquare size={20} color="var(--acid)" />
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            My Complaints
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
          Track the status of your submitted complaints
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: stats.total, color: 'var(--text)', bg: 'var(--surface)' },
          { label: 'Pending', value: stats.pending, color: '#ffb347', bg: 'rgba(255,179,71,0.08)' },
          { label: 'In Progress', value: stats.inProgress, color: '#47b8ff', bg: 'rgba(71,184,255,0.08)' },
          { label: 'Resolved', value: stats.resolved, color: '#7fff00', bg: 'rgba(127,255,0,0.08)' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg,
            border: `1px solid ${stat.color === 'var(--text)' ? 'var(--border)' : `${stat.color}33`}`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color, fontFamily: 'JetBrains Mono', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              height: '130px', borderRadius: '14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              opacity: 1 - i * 0.3,
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{
          padding: '24px', borderRadius: '14px', textAlign: 'center',
          background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)',
          color: '#ff6b6b', fontSize: '14px',
        }}>
          ⚠ {error}
        </div>
      ) : complaints.length === 0 ? (
        <div style={{
          padding: '60px 24px', textAlign: 'center',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '14px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>No complaints yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 20px' }}>
            You haven't submitted any complaints
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {complaints.map(complaint => (
            <div key={complaint.id} style={{ position: 'relative' }}>
              <ComplaintCard complaint={complaint} hasVoted={false} onVote={null} />
              <button
                onClick={() => handleDelete(complaint.id)}
                disabled={deleting === complaint.id}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  padding: '6px 10px', borderRadius: '8px',
                  border: '1px solid rgba(255,107,107,0.3)',
                  background: 'rgba(255,107,107,0.08)',
                  color: '#ff6b6b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', transition: 'all 0.15s',
                  fontFamily: 'Sora, sans-serif',
                  opacity: deleting === complaint.id ? 0.5 : 1,
                }}
              >
                <Trash2 size={12} />
                {deleting === complaint.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
