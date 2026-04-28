import { useState, useEffect, useCallback } from 'react'
import { complaintsService, votesService } from '../services/api'
import { useAuth } from './useAuth'

export function useComplaints(filters = {}) {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [userVotes, setUserVotes] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await complaintsService.getAll(filters)
    if (error) setError(error.message)
    else setComplaints(data || [])
    setLoading(false)
  }, [JSON.stringify(filters)])

  const fetchUserVotes = useCallback(async () => {
    if (!user) return
    const { data } = await votesService.getMyVotes()
    if (data) {
      setUserVotes(new Set(data.map(v => v.complaint_id)))
    }
  }, [user?.id])

  useEffect(() => {
    fetchComplaints()
    fetchUserVotes()
  }, [fetchComplaints, fetchUserVotes])

  const handleVote = async (complaintId) => {
    if (!user) return
    const { data, error } = await votesService.toggleVote(complaintId)
    if (!error && data) {
      const voted = data.voted
      setUserVotes(prev => {
        const next = new Set(prev)
        voted ? next.add(complaintId) : next.delete(complaintId)
        return next
      })
      setComplaints(prev =>
        prev.map(c =>
          c.id === complaintId
            ? { ...c, votes_count: data.votes_count }
            : c
        ).sort((a, b) => b.votes_count - a.votes_count)
      )
    }
  }

  return { complaints, userVotes, loading, error, refetch: fetchComplaints, handleVote }
}
