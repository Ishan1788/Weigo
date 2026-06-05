import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="min-h-svh bg-gray-50">
      <Sidebar />
      <main className="md:ml-60 pb-20 md:pb-0 min-h-svh">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
