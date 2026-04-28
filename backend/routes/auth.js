const express = require('express')
const router = express.Router()
const { supabaseAdmin } = require('../config/supabase')
const { requireAuth } = require('../middleware/auth')

require('dotenv').config()

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : ['admin@vnrvjiet.in']

// ── POST /api/auth/signup ──────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName || '' },
      email_confirm: true, // Auto-confirm email (no verification needed)
    })

    if (error) throw error
    res.status(201).json({ message: 'Account created successfully. You can now log in.' })
  } catch (err) {
    console.error('POST /auth/signup error:', err)
    res.status(400).json({ error: err.message })
  }
})

// ── GET /api/auth/me ───────────────────────────────────────
// Get current user info + admin status
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user
    res.json({
      data: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || '',
        isAdmin: ADMIN_EMAILS.includes(user.email?.toLowerCase()),
        createdAt: user.created_at,
      }
    })
  } catch (err) {
    console.error('GET /auth/me error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
