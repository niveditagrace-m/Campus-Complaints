const express = require('express')
const router = express.Router()
const multer = require('multer')
const { supabaseAdmin } = require('../config/supabase')
const { requireAuth } = require('../middleware/auth')

// Multer — store file in memory, then upload to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'), false)
  }
})

// ── GET /api/complaints ────────────────────────────────────
// Public — anyone can view complaints
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query

    let query = supabaseAdmin
      .from('complaints')
      .select('*')
      .order('votes_count', { ascending: false })
      .order('created_at', { ascending: false })

    if (category && category !== 'all') query = query.eq('category', category)
    if (status && status !== 'all') query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    res.json({ data })
  } catch (err) {
    console.error('GET /complaints error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/complaints/my ─────────────────────────────────
// Protected — get current user's complaints
router.get('/my', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('complaints')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ data })
  } catch (err) {
    console.error('GET /complaints/my error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/complaints ───────────────────────────────────
// Protected — submit a new complaint
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, isAnonymous } = req.body

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description and category are required' })
    }

    const user = req.user
    const anonymous = isAnonymous === 'true' || isAnonymous === true
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

    // Handle image upload if provided
    let imageUrl = null
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('complaint-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabaseAdmin.storage
        .from('complaint-images')
        .getPublicUrl(fileName)

      imageUrl = urlData.publicUrl
    }

    const { data, error } = await supabaseAdmin
      .from('complaints')
      .insert([{
        title: title.trim(),
        description: description.trim(),
        category,
        image_url: imageUrl,
        is_anonymous: anonymous,
        user_id: user.id,
        author_name: anonymous ? 'Anonymous' : displayName,
        status: 'pending',
        votes_count: 0,
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ data })
  } catch (err) {
    console.error('POST /complaints error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/complaints/:id ─────────────────────────────
// Protected — user can only delete their own complaint
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    // First check ownership
    const { data: complaint, error: fetchError } = await supabaseAdmin
      .from('complaints')
      .select('user_id, image_url')
      .eq('id', id)
      .single()

    if (fetchError || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    if (complaint.user_id !== req.user.id && !req.isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own complaints' })
    }

    // Delete image from storage if exists
    if (complaint.image_url) {
      const path = complaint.image_url.split('/complaint-images/')[1]
      if (path) {
        await supabaseAdmin.storage.from('complaint-images').remove([path])
      }
    }

    const { error } = await supabaseAdmin
      .from('complaints')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Complaint deleted successfully' })
  } catch (err) {
    console.error('DELETE /complaints/:id error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
