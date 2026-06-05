import { useWeightLogs } from '../hooks/useWeightLogs'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingDown, Calendar } from 'lucide-react'

export default function Progress() {
  const { logs } = useWeightLogs()

  const chartData = [...logs].reverse().map(l => ({
    date: new Date(l.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: l.weight,
  }))

  const totalLost = logs.length > 1 ? (logs[logs.length - 1].weight - logs[0].weight).toFixed(1) : null

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your journey at a glance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <TrendingDown size={18} className="text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalLost !== null ? `${Math.abs(totalLost)} kg` : '—'}</p>
          <p className="text-xs text-gray-500">Total {totalLost > 0 ? 'lost' : 'gained'}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Calendar size={18} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
          <p className="text-xs text-gray-500">Total entries</p>
        </div>
      </div>

      {/* Full chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">All time weight</h2>
        {chartData.length < 2 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Log at least 2 weights to see your progress chart</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2.5} fill="url(#wGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Log history */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Weight History</h2>
        </div>
        {logs.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No logs yet. Start tracking!</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log, i) => {
              const prev = logs[i + 1]
              const diff = prev ? (log.weight - prev.weight).toFixed(1) : null
              return (
                <div key={log.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{log.weight} kg</p>
                    {log.notes && <p className="text-xs text-gray-400">{log.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {diff !== null && (
                      <p className={`text-xs font-medium ${parseFloat(diff) < 0 ? 'text-green-500' : parseFloat(diff) > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
