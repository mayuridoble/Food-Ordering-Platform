import { Heart, Home, ShoppingCart, Store, UserCircle2 } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import Button from '../ui/Button'

function Navbar() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const role = useAppSelector((state) => state.auth.user?.role)

  const normalizedRole = String(role || '').toUpperCase()
  const isAdminUser =
    normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ROLE_RESTAURANT_OWNER'

  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-[#f8e8cc] text-[#745229]' : 'text-slate-700 hover:bg-[#f4f8fb]'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7f1f7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1460px] items-center justify-between px-5">
        <Link
          to="/"
          className="group flex items-center gap-3"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg group-hover:scale-110 transition-all duration-300">
            <span className="text-white text-xl">🍽️</span>
          </div>

          {/* Brand Text */}
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-black tracking-wide bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              YumKart
            </span>
            <span className="text-[10px] tracking-widest text-gray-400 uppercase">
              Food Delivery
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/restaurants" className={navClass}>
            Restaurants
          </NavLink>
          <NavLink to="/cart" className={navClass}>
            Cart
          </NavLink>
          <NavLink to="/favorites" className={navClass}>
            Favorites
          </NavLink>
          {isAuthenticated && isAdminUser ? (
            <NavLink to="/admin/orders" className={navClass}>
              Admin Orders
            </NavLink>
          ) : null}
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
        </nav>
        <div className="flex items-center gap-1.5">
          <Link to="/" className="rounded-md p-2 text-slate-600 hover:bg-[#f4f8fb]">
            <Home className="h-[17px] w-[17px]" />
          </Link>
          <Link to="/restaurants" className="rounded-md p-2 text-slate-600 hover:bg-[#f4f8fb]">
            <Store className="h-[17px] w-[17px]" />
          </Link>
          <Link to="/cart" className="rounded-md p-2 text-slate-600 hover:bg-[#f4f8fb]">
            <ShoppingCart className="h-[17px] w-[17px]" />
          </Link>
          <Link
            to={isAuthenticated ? '/favorites' : '/login'}
            className="rounded-md p-2 text-slate-600 hover:bg-[#f4f8fb]"
            aria-label="Saved restaurants"
            title="Saved restaurants"
          >
            <Heart className="h-[17px] w-[17px]" />
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="rounded-md p-2 text-slate-600 hover:bg-[#f4f8fb]">
              <UserCircle2 className="h-[17px] w-[17px]" />
            </Link>
          ) : (
            <Link to="/login">
              <Button className="h-9 rounded-md bg-[#1f2937] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#111827]">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
