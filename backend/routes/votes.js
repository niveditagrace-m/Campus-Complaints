const express = require('express')
const router = express.Router()
const { supabaseAdmin } = require('../config/supabase')
const { requireAuth } = require('../middleware/auth')

// ── GET /api/votes/my ──────────────────────────────────────
// Get all complaint IDs the current user has voted on
router.get('/my', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('votes')
      .select('complaint_id')
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json({ data })
  } catch (err) {
    console.error('GET /votes/my error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/votes/:complaintId/toggle ───────────────────
// Toggle vote on a complaint (add if not voted, remove if already voted)
router.post('/:complaintId/toggle', requireAuth, async (req, res) => {
  try {
    const { complaintId } = req.params
    const userId = req.user.id

    // Check if complaint exists
    const { data: complaint, error: complaintError } = await supabaseAdmin
      .from('complaints')
      .select('id, votes_count')
      .eq('id', complaintId)
      .single()

    if (complaintError || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    // Check if user already voted
    const { data: existingVote } = await supabaseAdmin
      .from('votes')
      .select('id')
      .eq('complaint_id', complaintId)
      .eq('user_id', userId)
      .maybeSingle()

    let voted
    let newCount

    if (existingVote) {
      // Remove vote
      const { error } = await supabaseAdmin
        .from('votes')
        .delete()
        .eq('complaint_id', complaintId)
        .eq('user_id', userId)

      if (error) throw error

      newCount = Math.max((complaint.votes_count || 0) - 1, 0)
      voted = false
    } else {
      // Add vote
      const { error } = await supabaseAdmin
        .from('votes')
        .insert([{ complaint_id: complaintId, user_id: userId }])

      if (error) throw error

      newCount = (complaint.votes_count || 0) + 1
      voted = true
    }

    // Update votes_count on complaint
    await supabaseAdmin
      .from('complaints')
      .update({ votes_count: newCount })
      .eq('id', complaintId)

    res.json({ voted, votes_count: newCount })
  } catch (err) {
    console.error('POST /votes/toggle error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
