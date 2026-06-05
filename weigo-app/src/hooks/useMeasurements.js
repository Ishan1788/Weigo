import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useMeasurements() {
  const { user } = useAuth()
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch()
  }, [user])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false })
      .limit(20)
    setMeasurements(data || [])
    setLoading(false)
  }

  return { measurements, loading, refetch: fetch, latest: measurements[0] || null, earliest: measurements[measurements.length - 1] || null }
}
