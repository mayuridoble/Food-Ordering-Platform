import { ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Skeleton from '../components/ui/Skeleton'
import { adminOrderApi } from '../services/api/adminOrderApi'
import { adminRestaurantApi } from '../services/api/adminRestaurantApi'
import { authApi } from '../services/api/authApi'
import { useToast } from '../components/ui/ToastProvider'

const STATUS_OPTIONS = ['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED']

function AdminOrdersPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [restaurantId, setRestaurantId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [orders, setOrders] = useState([])
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    authApi
      .profile()
      .then(({ data }) => {
        setProfile(data)
      })
      .catch(() => {
        toast.error('Could not load profile')
      })
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    adminRestaurantApi
      .myRestaurant()
      .then(({ data }) => {
        if (data?.id) {
          setRestaurantId(String(data.id))
        }
      })
      .catch(() => {
        // ok: non-admin users or admins without restaurant
      })
  }, [])

  const loadOrders = async () => {
    if (!restaurantId.trim()) {
      toast.error('Please enter restaurant ID')
      return
    }

    setLoading(true)
    try {
      const { data } = await adminOrderApi.listByRestaurant(restaurantId.trim(), statusFilter)
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Could not load orders. Check role and restaurant ID.')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, nextStatus) => {
    setBusyId(orderId)
    try {
      await adminOrderApi.updateStatus(orderId, nextStatus)
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, orderStatus: nextStatus } : order,
        ),
      )
      toast.success(`Order #${orderId} updated to ${nextStatus}`)
    } catch {
      toast.error('Could not update order status')
    } finally {
      setBusyId(null)
    }
  }

  if (loading && !profile) {
    return <Skeleton className="h-72 w-full" />
  }

  const role = profile?.role || ''
  const normalizedRole = String(role).toUpperCase()
  const isAdminUser =
    normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ROLE_RESTAURANT_OWNER'

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-indigo-600" />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Orders</h1>
      </div>

      {!isAdminUser ? (
        <div className="rounded-2xl border border-dashed border-rose-300 bg-rose-50 p-8 text-rose-700">
          This page requires ADMIN or RESTAURANT_OWNER role. Your role: {role || 'Unknown'}
        </div>
      ) : (
        <>
          <Card className="space-y-3 rounded-2xl">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                value={restaurantId}
                onChange={(event) => setRestaurantId(event.target.value)}
                placeholder="Restaurant ID"
                className="h-11 text-sm"
              />
              <select
                className="h-11 rounded-xl border border-[#d7e8ee] bg-white px-3 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Button className="h-11" onClick={loadOrders}>
                Load Orders
              </Button>
            </div>
          </Card>

          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : orders.length ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="rounded-2xl">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-base font-bold text-slate-900">Order #{order.id}</p>
                      <p className="text-sm text-slate-600">
                        Amount: Rs {Number(order.totalAmount || order.totalPrice || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Current status:{' '}
                        <span className="font-semibold text-slate-900">{order.orderStatus}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="h-10 rounded-xl border border-[#d7e8ee] bg-white px-3 text-sm"
                        value={order.orderStatus || 'PENDING'}
                        onChange={(event) => updateStatus(order.id, event.target.value)}
                        disabled={busyId === order.id}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No orders found for selected filter.
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default AdminOrdersPage
