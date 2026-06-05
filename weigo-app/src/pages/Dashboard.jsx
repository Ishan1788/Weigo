import { useAuth } from '../context/AuthContext'
import { useWeightLogs } from '../hooks/useWeightLogs'
import { TrendingDown, TrendingUp, Minus, Scale, Flame, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, sub, color = 'green' }) {
  const colors = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function WeightTrend({ logs }) {
  if (logs.length < 2) return null
  const latest = logs[0].weight
  const prev = logs[1].weight
  const diff = latest - prev
  if (diff < 0) return <span className="text-green-500 flex items-center gap-1 text-sm"><TrendingDown size={14} />{Math.abs(diff).toFixed(1)} kg</span>
  if (diff > 0) return <span className="text-red-400 flex items-center gap-1 text-sm"><TrendingUp size={14} />+{diff.toFixed(1)} kg</span>
  return <span className="text-gray-400 flex items-center gap-1 text-sm"><Minus size={14} />No change</span>
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { logs, loading } = useWeightLogs()
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'there'
  const firstName = displayName.split(' ')[0]

  const latestWeight = logs[0]?.weight
  const startWeight = logs[logs.length - 1]?.weight
  const totalLost = startWeight && latestWeight ? (startWeight - latestWeight).toFixed(1) : null
  const goalWeight = profile?.goal_weight

  const chartData = [...logs]
    .reverse()
    .slice(-14)
    .map(l => ({
      date: new Date(l.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: l.weight,
    }))

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-400">{today}</p>
        <h1 className="text-2xl font-bold text-gray-900">Hey, {firstName} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Keep going — every log counts.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={Scale}
          label="Current weight"
          value={latestWeight ? `${latestWeight} kg` : '—'}
          sub={logs[0] ? <WeightTrend logs={logs} /> : 'No logs yet'}
          color="green"
        />
        <StatCard
          icon={TrendingDown}
          label="Total lost"
          value={totalLost !== null && totalLost > 0 ? `${totalLost} kg` : '—'}
          sub={logs.length > 1 ? `Over ${logs.length} entries` : 'Log more to see'}
          color="blue"
        />
        <StatCard
          icon={Target}
          label="Goal weight"
          value={goalWeight ? `${goalWeight} kg` : '—'}
          sub={goalWeight && latestWeight ? `${Math.abs(latestWeight - goalWeight).toFixed(1)} kg to go` : 'Set in profile'}
          color="orange"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${profile?.streak_days || 0} days`}
          sub="Keep logging daily"
          color="green"
        />
      </div>

      {/* Weight chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Weight (last 14 days)</h2>
        {chartData.length < 2 ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Log at least 2 weights to see your chart</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/track" className="bg-green-500 hover:bg-green-600 transition-colors text-white rounded-2xl p-4 text-center">
          <Scale size={22} className="mx-auto mb-1" />
          <p className="text-sm font-semibold">Log Weight</p>
        </Link>
        <Link to="/food" className="bg-white hover:bg-gray-50 transition-colors border border-gray-100 text-gray-700 rounded-2xl p-4 text-center shadow-sm">
          <Flame size={22} className="mx-auto mb-1 text-orange-400" />
          <p className="text-sm font-semibold">Log Food</p>
        </Link>
      </div>
    </div>
  )
}
