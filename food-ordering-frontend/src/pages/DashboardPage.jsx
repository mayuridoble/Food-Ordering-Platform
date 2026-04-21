import { Grid2x2, Heart, NotebookPen, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { clearSession } from '../features/auth/authSlice'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { useAppSelector } from '../hooks/useAppSelector'
import { authApi } from '../services/api/authApi'
import { adminRestaurantApi } from '../services/api/adminRestaurantApi'
import { adminFoodApi } from '../services/api/adminFoodApi'
import { foodApi } from '../services/api/foodApi'
import { orderApi } from '../services/api/orderApi'
import Skeleton from '../components/ui/Skeleton'

const normalizeOrders = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.orders)) return payload.orders
  return []
}

const statusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border border-green-200' }
    case 'pending':
      return { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border border-amber-200' }
    case 'cancelled':
    case 'canceled':
      return { dot: 'bg-red-400', badge: 'bg-red-50 text-red-600 border border-red-200' }
    default:
      return { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-500 border border-slate-200' }
  }
}

const NAV = [
  { Icon: Grid2x2, label: 'Home', to: '/' },
  { Icon: ShoppingBag, label: 'Orders', to: '/dashboard#orders' },
  { Icon: Heart, label: 'Saved', to: '/favorites' },
  { Icon: NotebookPen, label: 'Notes', to: '/notes' },
]

function DashboardPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const [orders, setOrders]     = useState([])
  const [profile, setProfile]   = useState(user)
  const [loading, setLoading]   = useState(true)

  const [adminRestaurant, setAdminRestaurant] = useState(null)
  const [adminFoods, setAdminFoods] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [dishBusy, setDishBusy] = useState(false)
  const [dishError, setDishError] = useState('')
  const [dishForm, setDishForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryName: '',
    images: '',
    vegetarian: false,
    seasonal: false,
  })

  useEffect(() => {
    Promise.all([authApi.profile(), orderApi.listByUser()])
      .then(([profileRes, orderRes]) => {
        setProfile(profileRes.data)
        setOrders(normalizeOrders(orderRes.data))
      })
      .finally(() => setLoading(false))
  }, [])

  const normalizedRole = String(profile?.role || '').toUpperCase()
  const isAdminUser =
    normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ROLE_RESTAURANT_OWNER'

  const parseImages = (value) =>
    String(value || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const loadAdminRestaurantAndFood = async () => {
    setAdminLoading(true)
    try {
      const restaurantRes = await adminRestaurantApi.myRestaurant()
      setAdminRestaurant(restaurantRes.data)

      if (restaurantRes.data?.id) {
        const foodsRes = await foodApi.byRestaurant(restaurantRes.data.id)
        setAdminFoods(Array.isArray(foodsRes.data) ? foodsRes.data : [])
      } else {
        setAdminFoods([])
      }
    } catch {
      setAdminRestaurant(null)
      setAdminFoods([])
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdminUser) return
    loadAdminRestaurantAndFood()
  }, [isAdminUser])

  const handleCreateDish = async () => {
    setDishError('')
    if (!adminRestaurant?.id) {
      setDishError('Restaurant not found for this admin account.')
      return
    }

    if (!dishForm.name.trim() || !dishForm.price || !dishForm.categoryName.trim()) {
      setDishError('Please fill Dish name, Price, and Category.')
      return
    }

    const price = Number(dishForm.price)
    if (!Number.isFinite(price) || price <= 0) {
      setDishError('Please enter a valid price.')
      return
    }

    setDishBusy(true)
    try {
      await adminFoodApi.create({
        name: dishForm.name.trim(),
        description: dishForm.description.trim(),
        price: Math.round(price),
        restaurantId: adminRestaurant.id,
        category: { name: dishForm.categoryName.trim() },
        images: parseImages(dishForm.images),
        vegetarian: dishForm.vegetarian,
        isVegetarian: dishForm.vegetarian,
        seasonal: dishForm.seasonal,
        ingredients: [],
      })
      setDishForm({
        name: '',
        description: '',
        price: '',
        categoryName: '',
        images: '',
        vegetarian: false,
        seasonal: false,
      })
      await loadAdminRestaurantAndFood()
    } catch (error) {
      setDishError(
        error?.response?.data?.message || error?.message || 'Could not add dish. Please try again.',
      )
    } finally {
      setDishBusy(false)
    }
  }

  useEffect(() => {
    if (!location.hash) return
    const section = document.querySelector(location.hash)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  const totalSpend = useMemo(
    () => orders.reduce((sum, o) => sum + (o.totalAmount || o.totalPrice || 0), 0),
    [orders],
  )

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    dispatch(clearSession())
  }

  const initials = profile?.fullName
    ?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'U'

  return (
    <div
      className="min-h-screen bg-[#f5f5f5]"
      style={{ colorScheme: 'light', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      <div className="grid min-h-screen" style={{ gridTemplateColumns: '68px 1fr' }}>

        {/* ── Sidebar ── */}
        <aside className="flex flex-col items-center gap-1 pt-5 pb-4 bg-white border-r border-gray-100">
          {/* Logo mark */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 text-white text-sm font-bold select-none"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
          >
            Y
          </div>

          {NAV.map(({ Icon, label, to }) => {
            const isActive =
              to === '/dashboard#orders'
                ? location.pathname === '/dashboard' && location.hash === '#orders'
                  : location.pathname === to

            return (
            <Link
              key={label}
              to={to}
              title={label}
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'
              }`}
              style={isActive
                ? { background: 'linear-gradient(135deg, #f97316, #ef4444)' }
                : {}}
            >
              <Icon size={18} strokeWidth={1.8} />
            </Link>
          )})}
        </aside>

        {/* ── Main ── */}
        <main className="flex flex-col overflow-hidden">

          {/* Top bar */}
          <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100">
            <div>
              <p className="text-xs font-medium text-gray-400 leading-none">YumKart</p>
              <p className="text-base font-bold text-gray-800 leading-tight mt-0.5">Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
              >
                {initials}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-gray-800">{profile?.fullName}</span>
                <span className="text-xs text-gray-400">{profile?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 text-sm font-medium text-gray-500 hover:text-orange-600 border border-gray-200 hover:border-orange-300 rounded-lg px-4 py-1.5 bg-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {loading ? (
              <Skeleton className="h-80 w-full rounded-2xl" />
            ) : (
              <>
                {isAdminUser ? (
                  <Card className="rounded-2xl">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="text-base font-bold text-slate-900">Restaurant Admin</p>
                        <p className="text-sm text-slate-600">
                          Restaurant ID:{' '}
                          <span className="font-semibold text-slate-900">
                            {adminRestaurant?.id || (adminLoading ? 'Loading…' : '—')}
                          </span>
                        </p>
                        <p className="text-sm text-slate-600">
                          Restaurant: <span className="font-semibold text-slate-900">{adminRestaurant?.name || '—'}</span>
                        </p>
                      </div>
                      <Button
                        className="h-11"
                        onClick={loadAdminRestaurantAndFood}
                        disabled={adminLoading}
                      >
                        {adminLoading ? 'Refreshing…' : 'Refresh'}
                      </Button>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Dish name"
                        value={dishForm.name}
                        onChange={(e) => setDishForm((p) => ({ ...p, name: e.target.value }))}
                      />
                      <Input
                        placeholder="Price"
                        type="number"
                        value={dishForm.price}
                        onChange={(e) => setDishForm((p) => ({ ...p, price: e.target.value }))}
                      />
                      <Input
                        placeholder="Category (e.g., Pizza)"
                        value={dishForm.categoryName}
                        onChange={(e) => setDishForm((p) => ({ ...p, categoryName: e.target.value }))}
                      />
                      <Input
                        placeholder="Image URLs (comma separated)"
                        value={dishForm.images}
                        onChange={(e) => setDishForm((p) => ({ ...p, images: e.target.value }))}
                      />
                      <Input
                        placeholder="Description"
                        value={dishForm.description}
                        onChange={(e) => setDishForm((p) => ({ ...p, description: e.target.value }))}
                      />
                      <div className="flex items-center gap-4 px-1">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={dishForm.vegetarian}
                            onChange={(e) => setDishForm((p) => ({ ...p, vegetarian: e.target.checked }))}
                          />
                          Vegetarian
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={dishForm.seasonal}
                            onChange={(e) => setDishForm((p) => ({ ...p, seasonal: e.target.checked }))}
                          />
                          Seasonal
                        </label>
                      </div>
                    </div>

                    {dishError ? (
                      <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {dishError}
                      </p>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Button
                        className="h-11"
                        onClick={handleCreateDish}
                        disabled={dishBusy || adminLoading}
                      >
                        {dishBusy ? 'Adding…' : 'Add Dish'}
                      </Button>
                      <p className="text-sm text-slate-600">
                        Total dishes: <span className="font-semibold text-slate-900">{adminFoods.length}</span>
                      </p>
                    </div>

                    {adminFoods.length ? (
                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {adminFoods.slice(0, 6).map((food) => (
                          <div
                            key={food.id}
                            className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3"
                          >
                            <p className="text-sm font-semibold text-slate-900">{food.name}</p>
                            <p className="text-xs text-slate-600">
                              ₹{Number(food.price || 0).toLocaleString('en-IN')} • {food.foodCategory?.name || 'No category'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">No dishes yet.</p>
                    )}
                  </Card>
                ) : null}

                {/* ── Hero Banner ── */}
                <div
                  className="relative overflow-hidden rounded-2xl px-8 py-8"
                  style={{ background: 'linear-gradient(120deg, #f97316 0%, #ef4444 60%, #dc2626 100%)' }}
                >
                  {/* decorative circles */}
                  <div
                    className="absolute -right-8 -top-8 w-48 h-48 rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  />
                  <div
                    className="absolute right-20 -bottom-6 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="inline-block text-xs font-semibold text-orange-100 bg-white/20 rounded-full px-3 py-1 mb-3">
                        Premium food ordering experience
                      </span>
                      <h1 className="text-3xl font-bold text-white leading-tight">
                        Welcome back,{' '}
                        {profile?.fullName?.split(' ')[0]} 👋
                      </h1>
                      <p className="text-sm text-orange-100 mt-2">{profile?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 border border-white/25 rounded-xl px-4 py-2.5 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-green-300 flex-shrink-0" />
                      <span className="text-sm font-medium text-white">Active</span>
                    </div>
                  </div>
                </div>

                {/* ── Metric Cards ── */}
                <div id="stats" className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Total orders',
                      value: orders.length,
                      sub: 'all time',
                      Icon: ShoppingBag,
                      iconBg: 'bg-orange-100',
                      iconColor: 'text-orange-500',
                      valueColor: 'text-orange-600',
                      topBar: '#f97316',
                    },
                    {
                      label: 'Total spend',
                      value: `₹${totalSpend.toLocaleString('en-IN')}`,
                      sub: 'lifetime value',
                      Icon: NotebookPen,
                      iconBg: 'bg-red-100',
                      iconColor: 'text-red-500',
                      valueColor: 'text-red-600',
                      topBar: '#ef4444',
                    },
                    {
                      label: 'Favourites',
                      value: profile?.favorites?.length || 0,
                      sub: 'saved items',
                      Icon: Heart,
                      iconBg: 'bg-rose-100',
                      iconColor: 'text-rose-500',
                      valueColor: 'text-rose-600',
                      topBar: '#f43f5e',
                    },
                  ].map(({ label, value, sub, Icon, iconBg, iconColor, valueColor, topBar }) => (
                    <div
                      key={label}
                      className="relative bg-white rounded-2xl border border-gray-100 px-5 pt-6 pb-5 overflow-hidden"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                    >
                      <div
                        className="absolute top-0 inset-x-0 h-1 rounded-t-2xl"
                        style={{ background: topBar }}
                      />
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          {label}
                        </p>
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                          <Icon size={15} className={iconColor} strokeWidth={2} />
                        </span>
                      </div>
                      <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
                        {value}
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* ── Recent Orders ── */}
                <div
                  id="orders"
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Recent Orders</h2>
                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-3 py-1">
                      {Math.min(orders.length, 8)} shown
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <ShoppingBag size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No orders yet. Start ordering!</p>
                    </div>
                  ) : (
                    <div>
                      {/* Table header */}
                      <div
                        className="grid px-6 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100"
                        style={{ gridTemplateColumns: '1fr 120px 110px 100px' }}
                      >
                        <span>Order</span>
                        <span>Date</span>
                        <span className="text-right">Amount</span>
                        <span className="text-right">Status</span>
                      </div>

                      {orders.slice(0, 8).map((order, idx) => {
                        const { dot, badge } = statusStyle(order.orderStatus)
                        return (
                          <div
                            key={order.id}
                            className="grid items-center px-6 py-3.5 border-b border-gray-50 last:border-none hover:bg-orange-50/40 transition-colors cursor-pointer"
                            style={{ gridTemplateColumns: '1fr 120px 110px 100px' }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                              >
                                {idx + 1}
                              </div>
                              <span className="text-sm font-semibold text-gray-700 tabular-nums">
                                Order #{order.id}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                : '—'}
                            </span>
                            <span className="text-sm font-bold text-gray-800 text-right tabular-nums">
                              ₹{(order.totalAmount || order.totalPrice || 0).toLocaleString('en-IN')}
                            </span>
                            <div className="flex justify-end">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage