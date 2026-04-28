const express = require('express')
const router = express.Router()
const { supabaseAdmin } = require('../config/supabase')
const { requireAdmin } = require('../middleware/auth')

// All routes here require admin access

// ── GET /api/admin/complaints ──────────────────────────────
// Get all complaints with full details (admin view)
router.get('/complaints', requireAdmin, async (req, res) => {
  try {
    const { category, status } = req.query

    let query = supabaseAdmin
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })

    if (category && category !== 'all') query = query.eq('category', category)
    if (status && status !== 'all') query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    res.json({ data })
  } catch (err) {
    console.error('GET /admin/complaints error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── PATCH /api/admin/complaints/:id ───────────────────────
// Update complaint status and/or add admin remarks
router.patch('/complaints/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status, admin_remarks } = req.body

    const VALID_STATUSES = ['pending', 'in_progress', 'resolved', 'rejected']
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` })
    }

    const updates = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (admin_remarks !== undefined) updates.admin_remarks = admin_remarks

    const { data, error } = await supabaseAdmin
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Complaint not found' })

    res.json({ data })
  } catch (err) {
    console.error('PATCH /admin/complaints/:id error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/admin/complaints/:id ──────────────────────
// Admin can delete any complaint
router.delete('/complaints/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { data: complaint } = await supabaseAdmin
      .from('complaints')
      .select('image_url')
      .eq('id', id)
      .single()

    // Delete image from storage if exists
    if (complaint?.image_url) {
      const path = complaint.image_url.split('/complaint-images/')[1]
      if (path) await supabaseAdmin.storage.from('complaint-images').remove([path])
    }

    const { error } = await supabaseAdmin
      .from('complaints')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Complaint deleted successfully' })
  } catch (err) {
    console.error('DELETE /admin/complaints/:id error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/admin/stats ───────────────────────────────────
// Dashboard stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { data: complaints, error } = await supabaseAdmin
      .from('complaints')
      .select('status, votes_count')

    if (error) throw error

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      in_progress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      rejected: complaints.filter(c => c.status === 'rejected').length,
      total_votes: complaints.reduce((sum, c) => sum + (c.votes_count || 0), 0),
    }

    res.json({ data: stats })
  } catch (err) {
    console.error('GET /admin/stats error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
