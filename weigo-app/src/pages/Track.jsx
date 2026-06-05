import { useState } from 'react'
import { useWeightLogs } from '../hooks/useWeightLogs'
import { useMeasurements } from '../hooks/useMeasurements'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Scale, Ruler, Loader2, CheckCircle2, TrendingDown, TrendingUp, Minus } from 'lucide-react'

const MEASUREMENT_FIELDS = [
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'hips', label: 'Hips', unit: 'cm' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'left_arm', label: 'Left Arm', unit: 'cm' },
  { key: 'right_arm', label: 'Right Arm', unit: 'cm' },
  { key: 'left_thigh', label: 'Left Thigh', unit: 'cm' },
  { key: 'right_thigh', label: 'Right Thigh', unit: 'cm' },
]

function DiffBadge({ current, previous }) {
  if (!previous || !current) return null
  const diff = (current - previous).toFixed(1)
  if (parseFloat(diff) < 0) return <span className="text-green-500 text-xs flex items-center gap-0.5"><TrendingDown size={11} />{diff}</span>
  if (parseFloat(diff) > 0) return <span className="text-red-400 text-xs flex items-center gap-0.5"><TrendingUp size={11} />+{diff}</span>
  return <span className="text-gray-400 text-xs flex items-center gap-0.5"><Minus size={11} />0</span>
}

function WeightSection() {
  const { logs, addLog } = useWeightLogs()
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!weight) return
    setSaving(true)
    const { error } = await addLog(parseFloat(weight), 'kg', notes)
    setSaving(false)
    if (!error) {
      setWeight('')
      setNotes('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Scale size={18} className="text-green-500" />
        <h2 className="font-semibold text-gray-900">Log Weight</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
          <input
            type="number" step="0.1" min="20" max="400"
            value={weight} onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 72.5" required
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
          <input
            type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="How are you feeling?"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
          />
        </div>
        <button
          type="submit" disabled={saving || !weight}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : null}
          {success ? 'Saved!' : 'Save Weight'}
        </button>
      </form>

      {logs.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Recent</p>
          {logs.slice(0, 5).map(log => (
            <div key={log.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="font-semibold text-gray-800">{log.weight} kg</span>
                {log.notes && <span className="text-xs text-gray-400 ml-2">· {log.notes}</span>}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MeasurementsSection() {
  const { user } = useAuth()
  const { measurements, refetch } = useMeasurements()
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const filled = Object.entries(values).filter(([, v]) => v !== '' && v !== undefined)
    if (!filled.length) return
    setSaving(true)
    const payload = Object.fromEntries(filled.map(([k, v]) => [k, parseFloat(v)]))
    const { error } = await supabase.from('measurements').insert({ user_id: user.id, ...payload })
    setSaving(false)
    if (!error) {
      setValues({})
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      refetch()
    }
  }

  const latest = measurements[0]
  const previous = measurements[1]

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Ruler size={18} className="text-blue-500" />
        <h2 className="font-semibold text-gray-900">Log Measurements</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {MEASUREMENT_FIELDS.map(({ key, label, unit }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label} ({unit})</label>
              <input
                type="number" step="0.1" min="10" max="200"
                value={values[key] || ''}
                onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder="—"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving || !Object.values(values).some(v => v !== '' && v !== undefined)}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : null}
          {success ? 'Saved!' : 'Save Measurements'}
        </button>
      </form>

      {/* Measurement history */}
      {measurements.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">History</p>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-3">Date</th>
                  {MEASUREMENT_FIELDS.map(f => (
                    <th key={f.key} className="text-right text-xs text-gray-400 font-medium pb-2 px-1 whitespace-nowrap">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measurements.slice(0, 5).map((m, idx) => {
                  const prev = measurements[idx + 1]
                  return (
                    <tr key={m.id} className="border-t border-gray-50">
                      <td className="py-2 pr-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      {MEASUREMENT_FIELDS.map(f => (
                        <td key={f.key} className="py-2 px-1 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-gray-800 font-medium text-xs">{m[f.key] ?? '—'}</span>
                            {idx === 0 && prev?.[f.key] && m[f.key] && (
                              <DiffBadge current={m[f.key]} previous={prev[f.key]} />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Track() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Track</h1>
        <p className="text-gray-500 text-sm mt-0.5">Log your weight and body measurements</p>
      </div>
      <WeightSection />
      <MeasurementsSection />
    </div>
  )
}
