// All API calls go through the backend now
// The backend holds the Supabase service role key securely

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Get the current session token from Supabase auth
import { supabase } from './supabase'

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

async function apiFetch(path, options = {}) {
  const token = await getToken()

  const headers = {
    ...options.headers,
  }

  // Only set Content-Type to JSON if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    return { data: null, error: { message: data.error || 'Something went wrong' } }
  }

  return { data: data.data ?? data, error: null }
}

// ── Complaints ─────────────────────────────────────────────
export const complaintsService = {
  async getAll({ category, status } = {}) {
    const params = new URLSearchParams()
    if (category && category !== 'all') params.set('category', category)
    if (status && status !== 'all') params.set('status', status)
    const query = params.toString() ? `?${params}` : ''
    return apiFetch(`/complaints${query}`)
  },

  async getMy() {
    return apiFetch('/complaints/my')
  },

  async create({ title, description, category, imageFile, isAnonymous }) {
    // Use FormData so we can send the image file
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('isAnonymous', isAnonymous ? 'true' : 'false')
    if (imageFile) formData.append('image', imageFile)

    return apiFetch('/complaints', {
      method: 'POST',
      body: formData,
    })
  },

  async delete(id) {
    return apiFetch(`/complaints/${id}`, { method: 'DELETE' })
  },
}

// ── Votes ──────────────────────────────────────────────────
export const votesService = {
  async getMyVotes() {
    return apiFetch('/votes/my')
  },

  async toggleVote(complaintId) {
    return apiFetch(`/votes/${complaintId}/toggle`, { method: 'POST' })
  },
}

// ── Admin ──────────────────────────────────────────────────
export const adminService = {
  async getAllComplaints({ category, status } = {}) {
    const params = new URLSearchParams()
    if (category && category !== 'all') params.set('category', category)
    if (status && status !== 'all') params.set('status', status)
    const query = params.toString() ? `?${params}` : ''
    return apiFetch(`/admin/complaints${query}`)
  },

  async updateComplaint(id, { status, admin_remarks }) {
    return apiFetch(`/admin/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_remarks }),
    })
  },

  async deleteComplaint(id) {
    return apiFetch(`/admin/complaints/${id}`, { method: 'DELETE' })
  },

  async getStats() {
    return apiFetch('/admin/stats')
  },
}

// ── Auth ───────────────────────────────────────────────────
export const authApiService = {
  async signUp(email, password, fullName) {
    return apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    })
  },

  async getMe() {
    return apiFetch('/auth/me')
  },
}
