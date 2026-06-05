import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useWorkoutHistory, useExerciseProgress } from '../hooks/useWorkout'
import { EXERCISE_LIBRARY, ALL_EXERCISES } from '../lib/exercises'
import { Plus, Trash2, CheckCircle2, Dumbbell, ChevronRight, X, TrendingUp, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// ─── Exercise picker modal ────────────────────────────────────────────────────
function ExercisePicker({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = search
    ? ALL_EXERCISES.filter(e => e.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Add Exercise</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search exercise..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
          />
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-4">
          {filtered ? (
            <div className="space-y-1">
              {filtered.map(ex => (
                <button key={ex} onClick={() => { onSelect(ex); onClose() }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-green-50 text-sm text-gray-800 transition-colors">
                  {ex}
                </button>
              ))}
              {filtered.length === 0 && (
                <button onClick={() => { onSelect(search); onClose() }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-green-50 text-sm text-green-700 font-medium">
                  + Add "{search}" as custom exercise
                </button>
              )}
            </div>
          ) : (
            Object.entries(EXERCISE_LIBRARY).map(([group, exercises]) => (
              <div key={group} className="mb-2">
                <button
                  onClick={() => setActiveGroup(activeGroup === group ? null : group)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  {group}
                  <ChevronRight size={14} className={`transition-transform ${activeGroup === group ? 'rotate-90' : ''}`} />
                </button>
                {activeGroup === group && (
                  <div className="space-y-1 mb-2">
                    {exercises.map(ex => (
                      <button key={ex} onClick={() => { onSelect(ex); onClose() }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-green-50 text-sm text-gray-800 transition-colors">
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Progress chart modal ─────────────────────────────────────────────────────
function ProgressModal({ exerciseName, onClose }) {
  const { data, loading } = useExerciseProgress(exerciseName)

  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: d.weight,
  }))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{exerciseName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-300" /></div>
        ) : chartData.length < 2 ? (
          <p className="text-center text-gray-400 text-sm py-8">Log this exercise at least twice to see progression</p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">Best weight per session</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="liftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2.5} fill="url(#liftGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-between mt-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Starting</p>
                <p className="font-bold text-gray-900">{data[0]?.weight} kg</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Best</p>
                <p className="font-bold text-green-600">{Math.max(...data.map(d => d.weight))} kg</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Active workout ───────────────────────────────────────────────────────────
function ActiveWorkout({ session, onFinish, onDiscard }) {
  const { user } = useAuth()
  // exercises: [{name, sets:[{id?,reps,weight}]}]
  const [exercises, setExercises] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [progressExercise, setProgressExercise] = useState(null)
  const [finishing, setFinishing] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  function formatTime(s) {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function addExercise(name) {
    setExercises(prev => {
      if (prev.find(e => e.name === name)) return prev
      return [...prev, { name, sets: [{ reps: '', weight: '' }] }]
    })
  }

  function addSet(exIdx) {
    setExercises(prev => prev.map((e, i) => i === exIdx
      ? { ...e, sets: [...e.sets, { reps: '', weight: '' }] }
      : e
    ))
  }

  function removeSet(exIdx, setIdx) {
    setExercises(prev => prev.map((e, i) => {
      if (i !== exIdx) return e
      const sets = e.sets.filter((_, j) => j !== setIdx)
      return sets.length ? { ...e, sets } : null
    }).filter(Boolean))
  }

  function updateSet(exIdx, setIdx, field, value) {
    setExercises(prev => prev.map((e, i) => i !== exIdx ? e : {
      ...e,
      sets: e.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: value })
    }))
  }

  async function handleFinish() {
    const validSets = exercises.flatMap(e =>
      e.sets
        .filter(s => s.reps || s.weight)
        .map((s, idx) => ({
          session_id: session.id,
          user_id: user.id,
          exercise_name: e.name,
          set_number: idx + 1,
          reps: s.reps ? parseInt(s.reps) : null,
          weight: s.weight ? parseFloat(s.weight) : null,
        }))
    )
    if (!validSets.length) { onDiscard(); return }

    setFinishing(true)
    if (validSets.length) await supabase.from('workout_sets').insert(validSets)
    await supabase.from('workout_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', session.id)
    setFinishing(false)
    onFinish()
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
          <p className="text-sm text-green-500 font-medium">{formatTime(elapsed)}</p>
        </div>
        <button onClick={onDiscard} className="text-gray-400 hover:text-red-400 transition-colors text-sm">
          Discard
        </button>
      </div>

      {/* Exercises */}
      {exercises.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No exercises yet. Add one below.</p>
        </div>
      )}

      {exercises.map((exercise, exIdx) => (
        <div key={exercise.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <span className="font-semibold text-gray-900 text-sm">{exercise.name}</span>
            <button
              onClick={() => setProgressExercise(exercise.name)}
              className="text-gray-300 hover:text-green-500 transition-colors"
            >
              <TrendingUp size={16} />
            </button>
          </div>

          <div className="px-4 py-2">
            {/* Set headers */}
            <div className="grid grid-cols-12 gap-2 mb-1 px-1">
              <span className="col-span-2 text-xs text-gray-400">Set</span>
              <span className="col-span-4 text-xs text-gray-400">kg</span>
              <span className="col-span-4 text-xs text-gray-400">Reps</span>
              <span className="col-span-2" />
            </div>

            {exercise.sets.map((set, setIdx) => (
              <div key={setIdx} className="grid grid-cols-12 gap-2 mb-2 items-center">
                <span className="col-span-2 text-sm text-gray-400 font-medium pl-1">{setIdx + 1}</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight}
                  onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                  placeholder="0"
                  className="col-span-4 px-2 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm text-center"
                />
                <input
                  type="number"
                  min="0"
                  value={set.reps}
                  onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                  placeholder="0"
                  className="col-span-4 px-2 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm text-center"
                />
                <button
                  onClick={() => removeSet(exIdx, setIdx)}
                  className="col-span-2 flex justify-center text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button
              onClick={() => addSet(exIdx)}
              className="flex items-center gap-1 text-green-600 text-xs font-semibold hover:text-green-700 mt-1 mb-2"
            >
              <Plus size={14} /> Add set
            </button>
          </div>
        </div>
      ))}

      {/* Add exercise */}
      <button
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors text-sm font-medium mb-4"
      >
        <Plus size={16} /> Add Exercise
      </button>

      {/* Finish */}
      <button
        onClick={handleFinish}
        disabled={finishing || exercises.length === 0}
        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
      >
        {finishing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
        Finish Workout
      </button>

      {showPicker && <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />}
      {progressExercise && <ProgressModal exerciseName={progressExercise} onClose={() => setProgressExercise(null)} />}
    </div>
  )
}

// ─── Workout history ──────────────────────────────────────────────────────────
function WorkoutHistory() {
  const { sessions, loading } = useWorkoutHistory()
  const [progressExercise, setProgressExercise] = useState(null)

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-300" /></div>
  if (!sessions.length) return (
    <p className="text-center text-gray-400 text-sm py-8">No completed workouts yet.</p>
  )

  return (
    <div className="space-y-3">
      {sessions.map(session => {
        const exercises = [...new Set(session.workout_sets?.map(s => s.exercise_name) || [])]
        const totalSets = session.workout_sets?.length || 0
        const date = new Date(session.completed_at)
        return (
          <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{session.name}</p>
                <p className="text-xs text-gray-400">
                  {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}{totalSets} sets
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {exercises.map(ex => (
                <button
                  key={ex}
                  onClick={() => setProgressExercise(ex)}
                  className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-2.5 py-1 rounded-full transition-colors"
                >
                  {ex} <TrendingUp size={10} />
                </button>
              ))}
            </div>
          </div>
        )
      })}
      {progressExercise && <ProgressModal exerciseName={progressExercise} onClose={() => setProgressExercise(null)} />}
    </div>
  )
}

// ─── Main Workout page ────────────────────────────────────────────────────────
export default function Workout() {
  const { user } = useAuth()
  const { refetch } = useWorkoutHistory()
  const [activeSession, setActiveSession] = useState(null)
  const [starting, setStarting] = useState(false)

  async function startWorkout() {
    setStarting(true)
    const { data } = await supabase
      .from('workout_sessions')
      .insert({ user_id: user.id, name: 'Workout' })
      .select()
      .single()
    setActiveSession(data)
    setStarting(false)
  }

  async function handleFinish() {
    setActiveSession(null)
    refetch()
  }

  async function handleDiscard() {
    if (activeSession) {
      await supabase.from('workout_sessions').delete().eq('id', activeSession.id)
    }
    setActiveSession(null)
  }

  if (activeSession) {
    return <ActiveWorkout session={activeSession} onFinish={handleFinish} onDiscard={handleDiscard} />
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Workout</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your lifts and see progression</p>
      </div>

      <button
        onClick={startWorkout}
        disabled={starting}
        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 mb-6 shadow-lg shadow-green-200"
      >
        {starting ? <Loader2 size={20} className="animate-spin" /> : <Dumbbell size={20} />}
        Start Workout
      </button>

      <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Workouts</h2>
      <WorkoutHistory />
    </div>
  )
}
