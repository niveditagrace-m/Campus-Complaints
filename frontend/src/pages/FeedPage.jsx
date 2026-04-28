import { useState } from 'react'
import { useComplaints } from '../hooks/useComplaints'
import ComplaintCard from '../components/complaints/ComplaintCard'
import FilterBar from '../components/complaints/FilterBar'
import { useAuth } from '../hooks/useAuth'
import { PlusCircle, RefreshCw, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FeedPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({ category: 'all', status: 'all' })
  const { complaints, userVotes, loading, error, refetch, handleVote } = useComplaints(filters)

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <TrendingUp size={20} color="var(--acid)" />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Complaint Feed
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
            {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} · sorted by votes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={refetch}
            style={{
              padding: '8px 14px', borderRadius: '10px',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.15s', fontFamily: 'Sora, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--acid)'; e.currentTarget.style.color = 'var(--acid)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            to="/submit"
            style={{
              padding: '8px 16px', borderRadius: '10px',
              background: 'var(--acid)', color: '#0a0a18',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <PlusCircle size={14} /> New
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '16px 20px', marginBottom: '20px',
      }}>
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '130px', borderRadius: '14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 1 - i * 0.2,
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{
          padding: '24px', borderRadius: '14px', textAlign: 'center',
          background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)',
          color: '#ff6b6b', fontSize: '14px',
        }}>
          ⚠ Failed to load complaints: {error}
          <br />
          <button onClick={refetch} style={{
            marginTop: '10px', padding: '6px 14px', borderRadius: '8px',
            border: '1px solid #ff6b6b', background: 'transparent',
            color: '#ff6b6b', cursor: 'pointer', fontSize: '13px', fontFamily: 'Sora',
          }}>
            Try again
          </button>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{
          padding: '60px 24px', textAlign: 'center',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '14px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>No complaints found</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 20px' }}>
            {filters.category !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your filters'
              : 'Be the first to raise a concern'}
          </p>
          <Link to="/submit" style={{
            padding: '10px 20px', borderRadius: '10px',
            background: 'var(--acid)', color: '#0a0a18',
            fontWeight: 700, textDecoration: 'none', fontSize: '14px',
          }}>
            Submit Complaint
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {complaints.map((complaint, i) => (
            <div key={complaint.id} style={{ animationDelay: `${i * 50}ms` }}>
              <ComplaintCard
                complaint={complaint}
                hasVoted={userVotes.has(complaint.id)}
                onVote={user ? handleVote : null}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
