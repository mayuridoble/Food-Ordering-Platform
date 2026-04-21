import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Skeleton from '../components/ui/Skeleton'
import { setCart } from '../features/cart/cartSlice'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { cartApi } from '../services/api/cartApi'
import { orderApi } from '../services/api/orderApi'
import { useToast } from '../components/ui/ToastProvider'

function CartPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [cart, setCartData] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkout, setCheckout] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    restaurantId: '',
  })

  const loadCart = useCallback(
    (showLoader = false) => {
      if (showLoader) {
        setLoading(true)
      }
      cartApi
        .get()
        .then((response) => {
          setCartData(response.data)
          dispatch(setCart({ items: response.data?.item, total: response.data?.total }))
        })
        .catch(() => toast.error('Failed to load cart'))
        .finally(() => setLoading(false))
    },
    [dispatch, toast],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCart()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadCart])

  const cartItems = cart?.item || []

  const total = useMemo(() => cart?.total || 0, [cart])

  const updateItem = async (id, quantity) => {
    if (quantity < 1) return
    await cartApi.update({ cartItem: id, quantity })
    loadCart(true)
  }

  const removeItem = async (id) => {
    try {
      const response = await cartApi.remove(id)
      if (response?.data) {
        setCartData(response.data)
        dispatch(setCart({ items: response.data?.item, total: response.data?.total }))
      } else {
        setCartData((previous) => ({
          ...(previous || {}),
          item: (previous?.item || []).filter((cartItem) => cartItem.id !== id),
        }))
      }
      toast.success('Item removed from cart')
      loadCart()
    } catch {
      toast.error('Could not remove item from cart')
    }
  }

  const placeOrder = async () => {
    const resolvedRestaurantId =
      Number(checkout.restaurantId) || Number(cartItems?.[0]?.food?.restaurant?.id)

    if (!resolvedRestaurantId) {
      toast.error('Restaurant ID not found. Please enter it in checkout form.')
      return
    }

    if (!checkout.fullName.trim() || !checkout.phone.trim() || !checkout.line1.trim()) {
      toast.error('Please fill name, phone and address.')
      return
    }

    if (
      checkout.paymentMethod === 'card' &&
      (!checkout.cardNumber.trim() ||
        !checkout.cardName.trim() ||
        !checkout.expiry.trim() ||
        !checkout.cvv.trim())
    ) {
      toast.error('Please complete card details.')
      return
    }

    setCheckoutBusy(true)
    try {
      await orderApi.create({
        restaurantId: resolvedRestaurantId,
        deliveryAddress: {},
      })
      await cartApi.clear()
      toast.success(
        checkout.paymentMethod === 'cod'
          ? 'Order placed successfully (Cash on Delivery).'
          : 'Order placed successfully (Payment successful).',
      )
      setCheckoutOpen(false)
      loadCart(true)
    } catch {
      toast.error('Could not place order')
    } finally {
      setCheckoutBusy(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-72 w-full" />
  }

  const subtotal = Number(total || 0)
  const deliveryFee = cartItems.length ? 4 : 0
  const tax = Math.round(subtotal * 0.1)
  const grandTotal = subtotal + deliveryFee + tax

  return (
    <section className="space-y-5">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Your Cart</h1>
      {cartItems.length ? (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden rounded-2xl border-[#d8eaf1] p-0"
              >
                <div className="relative h-[210px] w-full bg-slate-100">
                  {item.food?.images?.[0] ? (
                    <img
                      src={item.food.images[0]}
                      alt={item.food?.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-1"
                  >
                    <Trash2 className="h-4 w-4 text-slate-700" />
                  </button>
                </div>
                <div className="flex items-end justify-between p-4">
                  <div>
                    <p className="text-2xl font-bold leading-tight text-slate-900">
                      {item.food?.name}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#d7e8ee] bg-[#eef8fc] p-1.5"
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 rounded-lg bg-white px-2 py-1 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="rounded-lg border border-[#d7e8ee] bg-[#eef8fc] p-1.5"
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-2xl font-bold leading-none text-slate-900">
                    Rs {Number(item.totalPrice || 0).toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <Card className="h-fit space-y-4 rounded-2xl">
            <h2 className="text-3xl font-bold leading-none text-slate-900">Order Summary</h2>
            <div className="space-y-2 border-b border-[#e2edf2] pb-4 text-base text-slate-800">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>Rs {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span>Rs {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax (estimated)</span>
                <span>Rs {tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-2xl font-bold">
              <span>Total</span>
              <span>Rs {grandTotal.toFixed(2)}</span>
            </div>
            <Button
              className="h-11 w-full rounded-full bg-gradient-to-r from-[#6e9098] to-[#456f76] text-sm"
              onClick={() => setCheckoutOpen(true)}
            >
              Place Order
            </Button>
          </Card>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Your cart is empty.
        </div>
      )}

      {checkoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">Checkout</h3>
              <button
                type="button"
                className="rounded-md px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setCheckoutOpen(false)}
                disabled={checkoutBusy}
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={checkout.fullName}
                onChange={(event) =>
                  setCheckout((prev) => ({ ...prev, fullName: event.target.value }))
                }
                className="h-11 text-sm"
                placeholder="Full name"
              />
              <Input
                value={checkout.phone}
                onChange={(event) =>
                  setCheckout((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="h-11 text-sm"
                placeholder="Phone number"
              />
              <Input
                value={checkout.line1}
                onChange={(event) =>
                  setCheckout((prev) => ({ ...prev, line1: event.target.value }))
                }
                className="h-11 text-sm md:col-span-2"
                placeholder="Address line"
              />
              <Input
                value={checkout.city}
                onChange={(event) =>
                  setCheckout((prev) => ({ ...prev, city: event.target.value }))
                }
                className="h-11 text-sm"
                placeholder="City"
              />
              <Input
                value={checkout.state}
                onChange={(event) =>
                  setCheckout((prev) => ({ ...prev, state: event.target.value }))
                }
                className="h-11 text-sm"
                placeholder="State"
              />
              <Input
                value={checkout.pincode}
                onChange={(event) =>
                  setCheckout((prev) => ({ ...prev, pincode: event.target.value }))
                }
                className="h-11 text-sm"
                placeholder="Pincode"
              />
              <Input
                value={checkout.restaurantId}
                onChange={(event) =>
                  setCheckout((prev) => ({ ...prev, restaurantId: event.target.value }))
                }
                className="h-11 text-sm"
                placeholder="Restaurant ID (optional if auto-detected)"
              />
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">Payment method</p>
              <div className="flex items-center gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={checkout.paymentMethod === 'cod'}
                    onChange={() =>
                      setCheckout((prev) => ({ ...prev, paymentMethod: 'cod' }))
                    }
                  />
                  Cash on Delivery
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={checkout.paymentMethod === 'card'}
                    onChange={() =>
                      setCheckout((prev) => ({ ...prev, paymentMethod: 'card' }))
                    }
                  />
                  Card Payment
                </label>
              </div>

              {checkout.paymentMethod === 'card' ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={checkout.cardNumber}
                    onChange={(event) =>
                      setCheckout((prev) => ({ ...prev, cardNumber: event.target.value }))
                    }
                    className="h-11 text-sm md:col-span-2"
                    placeholder="Card number"
                  />
                  <Input
                    value={checkout.cardName}
                    onChange={(event) =>
                      setCheckout((prev) => ({ ...prev, cardName: event.target.value }))
                    }
                    className="h-11 text-sm"
                    placeholder="Name on card"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={checkout.expiry}
                      onChange={(event) =>
                        setCheckout((prev) => ({ ...prev, expiry: event.target.value }))
                      }
                      className="h-11 text-sm"
                      placeholder="MM/YY"
                    />
                    <Input
                      value={checkout.cvv}
                      onChange={(event) =>
                        setCheckout((prev) => ({ ...prev, cvv: event.target.value }))
                      }
                      className="h-11 text-sm"
                      placeholder="CVV"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                className="h-10"
                onClick={() => setCheckoutOpen(false)}
                disabled={checkoutBusy}
              >
                Cancel
              </Button>
              <Button className="h-10 px-5" onClick={placeOrder} disabled={checkoutBusy}>
                {checkoutBusy ? 'Placing...' : 'Confirm & Pay'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default CartPage
