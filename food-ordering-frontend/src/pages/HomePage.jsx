import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AboutSection from '../components/home/AboutSection'
import SmartSuggestionPanel from '../components/home/SmartSuggestionPanel'
import TopMealsSlider from '../components/home/TopMealsSlider'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { useAppSelector } from '../hooks/useAppSelector'
import { orderApi } from '../services/api/orderApi'
import { restaurantApi } from '../services/api/restaurantApi'

const normalizeRestaurants = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.restaurants)) return payload.restaurants
  return []
}

function HomePage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [restaurants, setRestaurants] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    orderApi
      .listByUser()
      .then((response) => {
        const payload = response.data
        if (Array.isArray(payload)) {
          setOrders(payload)
          return
        }
        if (Array.isArray(payload?.content)) {
          setOrders(payload.content)
          return
        }
        setOrders([])
      })
      .catch(() => {
        setOrders([])
      })
  }, [isAuthenticated])

  useEffect(() => {
    restaurantApi
      .list()
      .then((response) => {
        setRestaurants(normalizeRestaurants(response.data))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <section className="space-y-8">
      <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-[#f39a7f] bg-gradient-to-r from-[#ef7e2f] to-[#e73e84] px-9 py-14 md:min-h-[380px] md:py-20 lg:min-h-[420px] lg:px-12 lg:py-24">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
          alt=""
          className="absolute right-0 top-0 h-full w-[40%] object-cover"
        />
        <div className="absolute right-0 top-0 h-full w-[40%] bg-white/10" />
        <div className="relative z-10 max-w-[55%] space-y-5 text-white">
          <span className="rounded-full bg-[#f6ebd9] px-4 py-1 text-xs font-semibold text-[#8b6338]">
            Premium food ordering experience
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Discover top restaurants and order in minutes
          </h1>
          <p className="max-w-[640px] text-base leading-relaxed text-white/95 md:text-lg">
            Browse curated menus, add favorites, and track your orders with a
            world-class food delivery UI.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link to="/restaurants">
              <Button className="h-11 gap-2 rounded-xl px-5 text-sm">
                Explore Restaurants
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button
                variant="secondary"
                className="h-11 rounded-xl border-white/40 bg-white/20 px-6 text-sm text-white hover:bg-white/30"
              >
                Go to Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <TopMealsSlider />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Featured Restaurants
          </h2>
          <Link to="/restaurants" className="text-base font-medium text-[#d1945d]">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[320px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.slice(0, 6).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <SmartSuggestionPanel
          orders={isAuthenticated ? orders : []}
          isAuthenticated={isAuthenticated}
        />
        <AboutSection />
      </div>
    </section>
  )
}

export default HomePage
