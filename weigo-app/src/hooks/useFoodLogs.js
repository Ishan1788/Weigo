import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useFoodLogs(date) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !date) return
    fetchLogs()
  }, [user, date])

  async function fetchLogs() {
    setLoading(true)
    const { data } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at', { ascending: true })
    setLogs(data || [])
    setLoading(false)
  }

  async function addLog(entry) {
    const { data, error } = await supabase
      .from('food_logs')
      .insert({ user_id: user.id, date, ...entry })
      .select()
      .single()
    if (!error) setLogs(prev => [...prev, data])
    return { data, error }
  }

  async function deleteLog(id) {
    const { error } = await supabase.from('food_logs').delete().eq('id', id)
    if (!error) setLogs(prev => prev.filter(l => l.id !== id))
    return { error }
  }

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + (l.calories || 0),
      protein: acc.protein + (l.protein || 0),
      carbs: acc.carbs + (l.carbs || 0),
      fat: acc.fat + (l.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return { logs, loading, addLog, deleteLog, totals, refetch: fetchLogs }
}
