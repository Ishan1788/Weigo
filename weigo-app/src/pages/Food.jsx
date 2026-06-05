import { useState } from 'react'
import { useFoodLogs } from '../hooks/useFoodLogs'
import { Loader2, Plus, Trash2, Flame, ChevronDown, ChevronUp } from 'lucide-react'

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const NEPALI_FOODS = [
  { name: 'Dal Bhat (1 plate)', calories: 450, protein: 18, carbs: 75, fat: 8 },
  { name: 'Momo (8 pcs, veg)', calories: 280, protein: 12, carbs: 38, fat: 9 },
  { name: 'Momo (8 pcs, chicken)', calories: 320, protein: 22, carbs: 35, fat: 10 },
  { name: 'Sel Roti (1 pc)', calories: 180, protein: 3, carbs: 32, fat: 5 },
  { name: 'Gundruk soup (1 bowl)', calories: 80, protein: 4, carbs: 12, fat: 2 },
  { name: 'Chiura (1 cup)', calories: 370, protein: 7, carbs: 80, fat: 2 },
  { name: 'Aloo Tarkari (1 serving)', calories: 150, protein: 3, carbs: 28, fat: 4 },
  { name: 'Roti (1 pc)', calories: 120, protein: 4, carbs: 23, fat: 2 },
  { name: 'Kheer (1 bowl)', calories: 230, protein: 6, carbs: 38, fat: 7 },
  { name: 'Dhindo (1 serving)', calories: 320, protein: 8, carbs: 65, fat: 3 },
  { name: 'Thukpa (1 bowl)', calories: 380, protein: 20, carbs: 55, fat: 9 },
  { name: 'Samosa (2 pcs)', calories: 260, protein: 5, carbs: 35, fat: 12 },
]

function MacroBadge({ label, value, color }) {
  return (
    <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl ${color}`}>
      <span className="text-xs font-bold">{value}g</span>
      <span className="text-[10px] opacity-70">{label}</span>
    </div>
  )
}

function AddFoodModal({ onClose, onAdd, meal }) {
  const [search, setSearch] = useState('')
  const [custom, setCustom] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [tab, setTab] = useState('quick') // 'quick' | 'custom'
  const [saving, setSaving] = useState(false)

  const filtered = NEPALI_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  async function handleQuickAdd(food) {
    setSaving(true)
    await onAdd({ meal, ...food })
    setSaving(false)
    onClose()
  }

  async function handleCustomAdd(e) {
    e.preventDefault()
    if (!custom.name || !custom.calories) return
    setSaving(true)
    await onAdd({
      meal,
      name: custom.name,
      calories: parseFloat(custom.calories) || 0,
      protein: parseFloat(custom.protein) || 0,
      carbs: parseFloat(custom.carbs) || 0,
      fat: parseFloat(custom.fat) || 0,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Add Food · {meal}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('quick')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'quick' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500'}`}
          >
            Nepali Foods
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'custom' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500'}`}
          >
            Custom Entry
          </button>
        </div>

        {tab === 'quick' ? (
          <>
            <div className="px-4 py-2">
              <input
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              />
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
              {filtered.map(food => (
                <button
                  key={food.name}
                  onClick={() => handleQuickAdd(food)}
                  disabled={saving}
                  className="w-full text-left flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{food.name}</p>
                    <p className="text-xs text-gray-400">{food.protein}g P · {food.carbs}g C · {food.fat}g F</p>
                  </div>
                  <span className="text-sm font-bold text-orange-500">{food.calories}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No results. Try Custom Entry.</p>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleCustomAdd} className="px-4 py-4 space-y-3 overflow-y-auto">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Food name *</label>
              <input
                type="text"
                value={custom.name}
                onChange={e => setCustom(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Chicken breast"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'calories', label: 'Calories (kcal) *', required: true },
                { key: 'protein', label: 'Protein (g)' },
                { key: 'carbs', label: 'Carbs (g)' },
                { key: 'fat', label: 'Fat (g)' },
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={custom[key]}
                    onChange={e => setCustom(p => ({ ...p, [key]: e.target.value }))}
                    required={required}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Add Food
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function MealGroup({ meal, logs, onAdd, onDelete }) {
  const [expanded, setExpanded] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const mealLogs = logs.filter(l => l.meal === meal)
  const mealCalories = mealLogs.reduce((a, l) => a + (l.calories || 0), 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">{meal}</span>
          {mealCalories > 0 && (
            <span className="text-xs text-orange-500 font-medium">{mealCalories} kcal</span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50">
          {mealLogs.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">Nothing logged yet</p>
          ) : (
            <div className="space-y-2 py-2">
              {mealLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-800">{log.name}</p>
                    <p className="text-xs text-gray-400">{log.protein || 0}g P · {log.carbs || 0}g C · {log.fat || 0}g F</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-orange-500">{log.calories}</span>
                    <button onClick={() => onDelete(log.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-green-600 text-xs font-semibold hover:text-green-700 mt-1"
          >
            <Plus size={14} /> Add food
          </button>
        </div>
      )}

      {showModal && (
        <AddFoodModal
          meal={meal}
          onClose={() => setShowModal(false)}
          onAdd={onAdd}
        />
      )}
    </div>
  )
}

export default function Food() {
  const today = new Date().toISOString().split('T')[0]
  const { logs, loading, addLog, deleteLog, totals } = useFoodLogs(today)

  const calorieGoal = 2000

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Food Log</h1>
        <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Calorie summary */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-4 mb-5 text-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-orange-100 text-xs font-medium">Calories Today</p>
            <p className="text-3xl font-black">{totals.calories}</p>
            <p className="text-orange-100 text-xs">of {calorieGoal} goal</p>
          </div>
          <Flame size={32} className="text-orange-200" />
        </div>
        <div className="w-full bg-orange-300/50 rounded-full h-2 mb-3">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${Math.min((totals.calories / calorieGoal) * 100, 100)}%` }}
          />
        </div>
        <div className="flex gap-3">
          <MacroBadge label="Protein" value={totals.protein} color="bg-white/20" />
          <MacroBadge label="Carbs" value={totals.carbs} color="bg-white/20" />
          <MacroBadge label="Fat" value={totals.fat} color="bg-white/20" />
        </div>
      </div>

      {/* Meal groups */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-300" /></div>
      ) : (
        MEALS.map(meal => (
          <MealGroup
            key={meal}
            meal={meal}
            logs={logs}
            onAdd={addLog}
            onDelete={deleteLog}
          />
        ))
      )}
    </div>
  )
}
