const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// This uses the SERVICE ROLE key — full admin access, bypasses RLS
// NEVER expose this key in the frontend
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
)

// This uses the ANON key — for verifying user JWTs
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = { supabaseAdmin, supabaseClient }
