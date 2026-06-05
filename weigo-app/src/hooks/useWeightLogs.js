import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useWeightLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchLogs()
  }, [user])

  async function fetchLogs() {
    setLoading(true)
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(60)
    setLogs(data || [])
    setLoading(false)
  }

  async function addLog(weight, unit = 'kg', notes = '') {
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ user_id: user.id, weight, unit, notes })
      .select()
      .single()
    if (!error) setLogs(prev => [data, ...prev])
    return { data, error }
  }

  return { logs, loading, addLog, refetch: fetchLogs }
}
