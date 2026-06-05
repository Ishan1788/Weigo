import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Scale, UtensilsCrossed, TrendingUp, User } from 'lucide-react'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/track', icon: Scale, label: 'Track' },
  { to: '/food', icon: UtensilsCrossed, label: 'Food' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-40 md:hidden">
      <div className="flex">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-green-500' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
