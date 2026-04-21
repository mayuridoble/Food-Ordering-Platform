import { ClipboardList, Heart, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/cart', label: 'Cart', icon: ShoppingBag },
  { to: '/restaurants', label: 'Explore', icon: Heart },
  { to: '/dashboard?tab=orders', label: 'Orders', icon: ClipboardList },
]

function Sidebar() {
  return (
    <aside className="h-fit rounded-2xl border border-[#d7e8f0] bg-white p-3 shadow-[0_8px_18px_rgba(112,176,199,0.16)]">
      <nav className="space-y-1">
        {links.map(({ to, label, icon }) => {
          const IconComponent = icon
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[26px] transition ${
                  isActive
                    ? 'bg-[#f9ebd2] text-[#704f2b]'
                    : 'text-slate-600 hover:bg-[#f2f8fc] hover:text-slate-800'
                }`
              }
            >
              <IconComponent className="h-4 w-4" />
              {label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
