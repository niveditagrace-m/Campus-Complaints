require('dotenv').config()
const express = require('express')
const cors = require('cors')

const complaintsRouter = require('./routes/complaints')
const votesRouter = require('./routes/votes')
const adminRouter = require('./routes/admin')
const authRouter = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 4000

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api/complaints', complaintsRouter)
app.use('/api/votes', votesRouter)
app.use('/api/admin', adminRouter)

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CampusVoice API is running',
    timestamp: new Date().toISOString(),
  })
})

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │   🎓 CampusVoice API                    │
  │   Running on http://localhost:${PORT}       │
  │                                         │
  │   Routes:                               │
  │   POST   /api/auth/signup               │
  │   GET    /api/auth/me                   │
  │   GET    /api/complaints                │
  │   POST   /api/complaints                │
  │   DELETE /api/complaints/:id            │
  │   GET    /api/complaints/my             │
  │   POST   /api/votes/:id/toggle          │
  │   GET    /api/votes/my                  │
  │   GET    /api/admin/complaints          │
  │   PATCH  /api/admin/complaints/:id      │
  │   GET    /api/admin/stats               │
  └─────────────────────────────────────────┘
  `)
})
