const { supabaseAdmin } = require('../config/supabase')
require('dotenv').config()

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : ['admin@vnrvjiet.in']

// ── Verify any logged-in user ──────────────────────────────
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.split(' ')[1]

    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Attach user to request
    req.user = user
    req.isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase())
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

// ── Verify admin only ──────────────────────────────────────
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  })
}

module.exports = { requireAuth, requireAdmin }
