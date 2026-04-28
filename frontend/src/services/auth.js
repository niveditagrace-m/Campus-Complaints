import { supabase } from './supabase'

export const ADMIN_EMAILS = [
  'admin@campus.edu',
  'director@campus.edu',
  'principal@campus.edu',
  // Add more admin emails here
]

export const isAdmin = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase())
}

export const authService = {
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
