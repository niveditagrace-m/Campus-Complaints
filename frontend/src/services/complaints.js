import { supabase } from './supabase'

export const complaintsService = {
  async getAll({ category, status, sortBy = 'votes_count' } = {}) {
    let query = supabase
      .from('complaints')
      .select('*')
      .order(sortBy, { ascending: false })
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create({ title, description, category, imageFile, isAnonymous, userId, userEmail, userName }) {
    let imageUrl = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint-images')
        .upload(fileName, imageFile)

      if (uploadError) {
        return { data: null, error: uploadError }
      }

      const { data: urlData } = supabase.storage
        .from('complaint-images')
        .getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        title,
        description,
        category,
        image_url: imageUrl,
        is_anonymous: isAnonymous,
        user_id: userId,
        author_name: isAnonymous ? 'Anonymous' : (userName || userEmail),
        status: 'pending',
        votes_count: 0,
      }])
      .select()
      .single()

    return { data, error }
  },

  async updateStatus(id, status, adminRemarks) {
    const { data, error } = await supabase
      .from('complaints')
      .update({ status, admin_remarks: adminRemarks, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id)
    return { error }
  }
}

export const votesService = {
  async getUserVote(complaintId, userId) {
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('complaint_id', complaintId)
      .eq('user_id', userId)
      .maybeSingle()
    return { data, error }
  },

  async getUserVotes(userId) {
    const { data, error } = await supabase
      .from('votes')
      .select('complaint_id')
      .eq('user_id', userId)
    return { data, error }
  },

  async toggleVote(complaintId, userId) {
    const { data: existing } = await votesService.getUserVote(complaintId, userId)

    if (existing) {
      // Remove vote
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('complaint_id', complaintId)
        .eq('user_id', userId)

      if (!error) {
        await supabase.rpc('decrement_votes', { complaint_id: complaintId })
      }
      return { voted: false, error }
    } else {
      // Add vote
      const { error } = await supabase
        .from('votes')
        .insert([{ complaint_id: complaintId, user_id: userId }])

      if (!error) {
        await supabase.rpc('increment_votes', { complaint_id: complaintId })
      }
      return { voted: true, error }
    }
  }
}
