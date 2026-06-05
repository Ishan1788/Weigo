import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useFriends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [{ data: friendRows }, { data: incomingRows }, { data: outgoingRows }] = await Promise.all([
      supabase.from('friends').select('friend_id, created_at').eq('user_id', user.id),
      supabase.from('friend_requests').select('id, sender_id, created_at').eq('receiver_id', user.id).eq('status', 'pending'),
      supabase.from('friend_requests').select('id, receiver_id, status').eq('sender_id', user.id).eq('status', 'pending'),
    ])

    const friendIds = (friendRows || []).map(r => r.friend_id)
    const senderIds = (incomingRows || []).map(r => r.sender_id)
    const receiverIds = (outgoingRows || []).map(r => r.receiver_id)
    const allIds = [...new Set([...friendIds, ...senderIds, ...receiverIds])]

    let profileMap = {}
    if (allIds.length) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', allIds)
      profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
    }

    setFriends((friendRows || []).map(r => ({ ...r, profile: profileMap[r.friend_id] })))
    setIncoming((incomingRows || []).map(r => ({ ...r, profile: profileMap[r.sender_id] })))
    setOutgoing((outgoingRows || []).map(r => ({ ...r, profile: profileMap[r.receiver_id] })))
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function sendRequest(email) {
    const trimmed = email.trim().toLowerCase()
    const { data: profile, error: findErr } = await supabase
      .from('profiles')
      .select('id, full_name')
      .ilike('email', trimmed)
      .single()

    if (findErr || !profile) return { error: 'No user found with that email' }
    if (profile.id === user.id) return { error: 'That\'s your own account' }

    const alreadyFriend = friends.some(f => f.friend_id === profile.id)
    if (alreadyFriend) return { error: 'Already friends' }

    const alreadySent = outgoing.some(r => r.receiver_id === profile.id)
    if (alreadySent) return { error: 'Request already sent' }

    const { error } = await supabase
      .from('friend_requests')
      .insert({ sender_id: user.id, receiver_id: profile.id })

    if (!error) fetchAll()
    return { error: error?.message || null, name: profile.full_name }
  }

  async function acceptRequest(requestId) {
    const { error } = await supabase.rpc('accept_friend_request', { p_request_id: requestId })
    if (!error) fetchAll()
    return { error: error?.message || null }
  }

  async function declineRequest(requestId) {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId)
      .eq('receiver_id', user.id)
    if (!error) fetchAll()
    return { error: error?.message || null }
  }

  return { friends, incoming, outgoing, loading, sendRequest, acceptRequest, declineRequest, refetch: fetchAll }
}

export function useLeaderboard(exerciseName) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!exerciseName || !user) return

    async function fetch() {
      setLoading(true)

      // RLS policy allows this query to return own rows + friends' rows
      const { data: sets } = await supabase
        .from('workout_sets')
        .select('user_id, weight, weight_unit')
        .eq('exercise_name', exerciseName)

      if (!sets?.length) {
        setData([])
        setLoading(false)
        return
      }

      // Best weight per user
      const bestByUser = {}
      sets.forEach(({ user_id, weight, weight_unit }) => {
        if (!bestByUser[user_id] || weight > bestByUser[user_id].best_weight) {
          bestByUser[user_id] = { user_id, best_weight: weight, weight_unit }
        }
      })

      const userIds = Object.keys(bestByUser)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      const pm = Object.fromEntries((profiles || []).map(p => [p.id, p]))

      const ranked = Object.values(bestByUser)
        .sort((a, b) => b.best_weight - a.best_weight)
        .map((e, i) => ({
          rank: i + 1,
          user_id: e.user_id,
          display_name: pm[e.user_id]?.full_name || 'User',
          best_weight: e.best_weight,
          weight_unit: e.weight_unit || 'kg',
        }))

      setData(ranked)
      setLoading(false)
    }

    fetch()
  }, [exerciseName, user?.id])

  return { data, loading }
}
