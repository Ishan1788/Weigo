import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Scale, UtensilsCrossed, TrendingUp, User, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/track', icon: Scale, label: 'Track' },
  { to: '/food', icon: UtensilsCrossed, label: 'Food Log' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { signOut, profile, user } = useAuth()
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User'

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-svh bg-white border-r border-gray-100 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-black text-base">W</span>
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">WEIGO</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-700 text-sm font-bold">{displayName[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
