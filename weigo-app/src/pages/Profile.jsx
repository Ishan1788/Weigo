import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Loader2, LogOut, CheckCircle2 } from 'lucide-react'

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    goal_weight: '',
    start_weight: '',
    height_cm: '',
    date_of_birth: '',
    gender: '',
    activity_level: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        goal_weight: profile.goal_weight || '',
        start_weight: profile.start_weight || '',
        height_cm: profile.height_cm || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        activity_level: profile.activity_level || '',
      })
    }
  }, [profile])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      id: user.id,
      full_name: form.full_name,
      goal_weight: form.goal_weight ? parseFloat(form.goal_weight) : null,
      start_weight: form.start_weight ? parseFloat(form.start_weight) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      activity_level: form.activity_level || null,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('profiles').upsert(payload)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const displayName = form.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-700 text-2xl font-bold">{displayName[0]?.toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Personal Details</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
            <input
              type="number"
              value={form.height_cm}
              onChange={e => setForm(p => ({ ...p, height_cm: e.target.value }))}
              placeholder="175"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Gender</label>
          <select
            value={form.gender}
            onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900 bg-white"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Activity Level</label>
          <select
            value={form.activity_level}
            onChange={e => setForm(p => ({ ...p, activity_level: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900 bg-white"
          >
            <option value="">Select level</option>
            <option value="sedentary">Sedentary (desk job, little exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very Active (athlete / physical job)</option>
          </select>
        </div>

        <h2 className="text-sm font-semibold text-gray-900 pt-2 border-t border-gray-100">Goals</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Starting Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={form.start_weight}
              onChange={e => setForm(p => ({ ...p, start_weight: e.target.value }))}
              placeholder="80"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Goal Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={form.goal_weight}
              onChange={e => setForm(p => ({ ...p, goal_weight: e.target.value }))}
              placeholder="65"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : null}
          {success ? 'Saved!' : 'Save Profile'}
        </button>
      </form>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  )
}
