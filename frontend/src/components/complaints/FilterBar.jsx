import { CATEGORIES, STATUSES } from '../../utils/constants'

export default function FilterBar({ filters, onChange }) {
  const allCategories = [{ value: 'all', label: 'All Categories', icon: '🗂️' }, ...CATEGORIES]
  const allStatuses = [{ value: 'all', label: 'All Status' }, ...STATUSES]

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {allCategories.map(cat => (
          <button
            key={cat.value}
            onClick={() => onChange({ ...filters, category: cat.value })}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: `1px solid ${filters.category === cat.value ? 'var(--acid)' : 'var(--border)'}`,
              background: filters.category === cat.value ? 'rgba(127,255,0,0.1)' : 'var(--surface)',
              color: filters.category === cat.value ? 'var(--acid)' : 'var(--muted)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'Sora, sans-serif',
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {allStatuses.map(st => (
          <button
            key={st.value}
            onClick={() => onChange({ ...filters, status: st.value })}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: `1px solid ${filters.status === st.value ? (st.color || 'var(--acid)') : 'var(--border)'}`,
              background: filters.status === st.value ? (st.bg || 'rgba(127,255,0,0.1)') : 'var(--surface)',
              color: filters.status === st.value ? (st.color || 'var(--acid)') : 'var(--muted)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'Sora, sans-serif',
            }}
          >
            {st.label}
          </button>
        ))}
      </div>
    </div>
  )
}
