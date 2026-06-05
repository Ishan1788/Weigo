import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useWorkoutHistory() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch()
  }, [user])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('workout_sessions')
      .select('*, workout_sets(*)')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20)
    setSessions(data || [])
    setLoading(false)
  }

  return { sessions, loading, refetch: fetch }
}

export function useExerciseProgress(exerciseName) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !exerciseName) return
    fetchProgress()
  }, [user, exerciseName])

  async function fetchProgress() {
    setLoading(true)
    const { data } = await supabase
      .from('workout_sets')
      .select('weight, reps, logged_at')
      .eq('user_id', user.id)
      .eq('exercise_name', exerciseName)
      .order('logged_at', { ascending: true })
      .limit(60)
    // Best set per day (max weight × reps = volume)
    const byDay = {}
    ;(data || []).forEach(s => {
      const day = s.logged_at.split('T')[0]
      const vol = (s.weight || 0) * (s.reps || 0)
      if (!byDay[day] || vol > byDay[day].volume) {
        byDay[day] = { date: day, weight: s.weight, reps: s.reps, volume: vol }
      }
    })
    setData(Object.values(byDay))
    setLoading(false)
  }

  return { data, loading }
}
