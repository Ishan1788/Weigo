import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFriends, useLeaderboard } from '../hooks/useFriends'
import { Users, Trophy, UserPlus, Check, X, Loader2, ChevronRight } from 'lucide-react'

const COMPETITION_EXERCISES = [
  { name: 'Bench Press',        label: 'Bench Press',    category: 'Push' },
  { name: 'Deadlift',           label: 'Deadlift',       category: 'Pull' },
  { name: 'Squat',              label: 'Squat',          category: 'Legs' },
  { name: 'Overhead Press',     label: 'OHP',            category: 'Push' },
  { name: 'Bent Over Row',      label: 'Bent Row',       category: 'Pull' },
  { name: 'Pull Up',            label: 'Pull Up',        category: 'Pull' },
  { name: 'Romanian Deadlift',  label: 'RDL',            category: 'Legs' },
  { name: 'Incline Bench Press',label: 'Incline BP',     category: 'Push' },
  { name: 'Tricep Dip',         label: 'Dip',            category: 'Push' },
  { name: 'Running',            label: 'Running',        category: 'Cardio' },
]

const MEDALS = ['🥇', '🥈', '🥉']

function Avatar({ name, size = 'md' }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${cls} rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Add Friend Form ──────────────────────────────────────────────────────────
function AddFriendForm({ onSend }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setStatus(null)
    const { error, name } = await onSend(email)
    setLoading(false)
    if (error) {
      setStatus({ type: 'error', msg: error })
    } else {
      setStatus({ type: 'success', msg: `Request sent to ${name || email}!` })
      setEmail('')
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus size={17} className="text-green-500" />
        <h2 className="font-semibold text-gray-900">Add Friend</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Friend's email address"
          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm text-gray-900"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Send'}
        </button>
      </form>
      {status && (
        <p className={`mt-2 text-xs ${status.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {status.msg}
        </p>
      )}
    </div>
  )
}

// ─── Friends Tab ──────────────────────────────────────────────────────────────
function FriendsTab() {
  const { friends, incoming, loading, sendRequest, acceptRequest, declineRequest } = useFriends()
  const [accepting, setAccepting] = useState(null)

  async function handleAccept(id) {
    setAccepting(id)
    await acceptRequest(id)
    setAccepting(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AddFriendForm onSend={sendRequest} />

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">
              Requests <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">{incoming.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {incoming.map(req => (
              <div key={req.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={req.profile?.full_name} size="sm" />
                  <p className="text-sm font-medium text-gray-800">{req.profile?.full_name || 'Unknown'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    disabled={accepting === req.id}
                    className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors disabled:opacity-60"
                  >
                    {accepting === req.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={15} />}
                  </button>
                  <button
                    onClick={() => declineRequest(req.id)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Friends · {friends.length}</h2>
        </div>
        {friends.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2">
            <Users size={32} className="text-gray-200" />
            <p className="text-gray-400 text-sm">Add friends to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {friends.map(f => (
              <div key={f.friend_id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={f.profile?.full_name} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.profile?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400">
                    Friends since {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Compete Tab ──────────────────────────────────────────────────────────────
function CompeteTab() {
  const { user } = useAuth()
  const { friends } = useFriends()
  const [selected, setSelected] = useState('Bench Press')
  const { data: board, loading } = useLeaderboard(selected)

  const isRunning = selected === 'Running'
  const unitLabel = isRunning ? 'km' : 'kg'

  return (
    <div className="space-y-4">
      {/* Exercise selector */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Choose exercise</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {COMPETITION_EXERCISES.map(ex => (
            <button
              key={ex.name}
              onClick={() => setSelected(ex.name)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selected === ex.name
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
        {isRunning && (
          <p className="text-xs text-gray-400 mt-2">Running: log distance as weight (kg field) in Workout. Best km wins.</p>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-500" />
          <h2 className="text-sm font-semibold text-gray-900">{selected} · Leaderboard</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-gray-300" />
          </div>
        ) : board.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2">
            <Trophy size={32} className="text-gray-200" />
            {friends.length === 0 ? (
              <p className="text-gray-400 text-sm text-center px-4">Add friends to start competing!</p>
            ) : (
              <p className="text-gray-400 text-sm text-center px-4">
                No one has logged {selected} yet. Be the first!
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Podium for top 3 */}
            {board.length >= 2 && (
              <div className="flex items-end justify-center gap-3 px-4 pt-6 pb-4 bg-gradient-to-b from-gray-50 to-white">
                {/* 2nd place (left) */}
                {board[1] && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">{MEDALS[1]}</span>
                    <div className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600 ${board[1].user_id === user?.id ? 'ring-2 ring-green-400' : ''}`}>
                      {(board[1].display_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <p className="text-xs font-semibold text-gray-700 text-center max-w-[64px] truncate">{board[1].display_name}</p>
                    <p className="text-xs text-gray-500 font-bold">{board[1].best_weight} {unitLabel}</p>
                  </div>
                )}
                {/* 1st place (center, taller) */}
                <div className="flex flex-col items-center gap-1 -mt-4">
                  <span className="text-2xl">{MEDALS[0]}</span>
                  <div className={`w-20 h-20 rounded-full bg-yellow-50 border-2 border-yellow-300 flex items-center justify-center text-xl font-bold text-yellow-700 ${board[0].user_id === user?.id ? 'ring-2 ring-green-400' : ''}`}>
                    {(board[0].display_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 text-center max-w-[80px] truncate">{board[0].display_name}</p>
                  <p className="text-xs text-yellow-600 font-bold">{board[0].best_weight} {unitLabel}</p>
                </div>
                {/* 3rd place (right) */}
                {board[2] && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">{MEDALS[2]}</span>
                    <div className={`w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-lg font-bold text-orange-400 ${board[2].user_id === user?.id ? 'ring-2 ring-green-400' : ''}`}>
                      {(board[2].display_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <p className="text-xs font-semibold text-gray-700 text-center max-w-[64px] truncate">{board[2].display_name}</p>
                    <p className="text-xs text-orange-500 font-bold">{board[2].best_weight} {unitLabel}</p>
                  </div>
                )}
              </div>
            )}

            {/* Full ranking list */}
            <div className="divide-y divide-gray-50">
              {board.map((entry) => {
                const isMe = entry.user_id === user?.id
                const initials = (entry.display_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-green-50' : ''}`}
                  >
                    <span className="w-6 text-center text-sm font-bold text-gray-400">
                      {entry.rank <= 3 ? MEDALS[entry.rank - 1] : entry.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                      {initials}
                    </div>
                    <p className={`flex-1 text-sm font-semibold ${isMe ? 'text-green-700' : 'text-gray-800'}`}>
                      {entry.display_name}{isMe && ' (you)'}
                    </p>
                    <p className={`text-sm font-bold ${isMe ? 'text-green-600' : 'text-gray-700'}`}>
                      {entry.best_weight} {unitLabel}
                    </p>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Friends() {
  const [tab, setTab] = useState('friends')

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        <p className="text-gray-500 text-sm mt-0.5">Connect, challenge, compete</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {[
          { id: 'friends', icon: Users, label: 'Friends' },
          { id: 'compete', icon: Trophy, label: 'Compete' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'friends' ? <FriendsTab /> : <CompeteTab />}
    </div>
  )
}
