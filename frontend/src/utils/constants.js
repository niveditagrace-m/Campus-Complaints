export const CATEGORIES = [
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️', color: '#ffb347' },
  { value: 'academics', label: 'Academics', icon: '📚', color: '#47b8ff' },
  { value: 'hostel', label: 'Hostel', icon: '🏠', color: '#ff6b6b' },
  { value: 'food', label: 'Food & Canteen', icon: '🍽️', color: '#7fff00' },
  { value: 'transport', label: 'Transport', icon: '🚌', color: '#b847ff' },
  { value: 'hygiene', label: 'Hygiene', icon: '🧹', color: '#47ffb8' },
  { value: 'safety', label: 'Safety', icon: '🛡️', color: '#ff4757' },
  { value: 'other', label: 'Other', icon: '💬', color: '#9494b8' },
]

export const STATUSES = [
  { value: 'pending', label: 'Pending', color: '#ffb347', bg: 'rgba(255,179,71,0.15)' },
  { value: 'in_progress', label: 'In Progress', color: '#47b8ff', bg: 'rgba(71,184,255,0.15)' },
  { value: 'resolved', label: 'Resolved', color: '#7fff00', bg: 'rgba(127,255,0,0.15)' },
  { value: 'rejected', label: 'Rejected', color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' },
]

export const getCategoryInfo = (value) => CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1]
export const getStatusInfo = (value) => STATUSES.find(s => s.value === value) || STATUSES[0]

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
