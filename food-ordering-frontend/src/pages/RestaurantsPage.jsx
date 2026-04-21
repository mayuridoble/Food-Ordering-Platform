import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import Input from '../components/ui/Input'
import Skeleton from '../components/ui/Skeleton'
import { foodApi } from '../services/api/foodApi'
import { restaurantApi } from '../services/api/restaurantApi'

const normalizeRestaurants = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.restaurants)) return payload.restaurants
  return []
}

function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [restaurantInsights, setRestaurantInsights] = useState({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState('')
  const [filters, setFilters] = useState({
    veg: false,
    nonVeg: false,
    maxPrice: 1000,
    minRating: 0,
    cuisine: 'all',
  })

  useEffect(() => {
    const request = query.trim()
      ? restaurantApi.search(query.trim())
      : restaurantApi.list()
    request
      .then((response) => {
        setRestaurants(normalizeRestaurants(response.data))
      })
      .catch((requestError) =>
        setError(requestError?.response?.data?.message || 'Failed to load restaurants'),
      )
      .finally(() => setLoading(false))
  }, [query])

  useEffect(() => {
    if (!restaurants.length) {
      Promise.resolve().then(() => setRestaurantInsights({}))
      return
    }

    Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          const response = await foodApi.byRestaurant(restaurant.id)
          const foods = Array.isArray(response.data) ? response.data : []
          const avgPrice = foods.length
            ? Math.round(
                foods.reduce((sum, item) => sum + Number(item.price || 0), 0) / foods.length,
              )
            : 0

          return [
            restaurant.id,
            {
              avgPrice,
              hasVeg: foods.some((item) => item.vegetarian),
              hasNonVeg: foods.some((item) => !item.vegetarian),
              rating: Number(
                (
                  3.8 +
                  Math.min(1.1, (foods.length + (restaurant.id % 5)) / 10)
                ).toFixed(1),
              ),
            },
          ]
        } catch {
          return [
            restaurant.id,
            { avgPrice: 0, hasVeg: false, hasNonVeg: false, rating: 0 },
          ]
        }
      }),
    ).then((entries) => {
      setRestaurantInsights(Object.fromEntries(entries))
    })
  }, [restaurants])

  const handleQueryChange = (event) => {
    setLoading(true)
    setError('')
    setQuery(event.target.value)
  }

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const normalized = query.toLowerCase()
    return restaurants
      .filter((restaurant) => restaurant.name?.toLowerCase().includes(normalized))
      .slice(0, 5)
  }, [query, restaurants])

  const cuisines = useMemo(() => {
    const uniqueCuisines = [...new Set(restaurants.map((restaurant) => restaurant.cuisineType))]
    return uniqueCuisines.filter(Boolean)
  }, [restaurants])

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const insight = restaurantInsights[restaurant.id] || {}

      if (selectedSuggestion && restaurant.id !== selectedSuggestion) {
        return false
      }
      if (filters.cuisine !== 'all' && restaurant.cuisineType !== filters.cuisine) {
        return false
      }
      if (filters.veg && !insight.hasVeg) {
        return false
      }
      if (filters.nonVeg && !insight.hasNonVeg) {
        return false
      }
      if (insight.avgPrice && insight.avgPrice > filters.maxPrice) {
        return false
      }
      if (insight.rating && insight.rating < filters.minRating) {
        return false
      }

      return true
    })
  }, [filters, restaurantInsights, restaurants, selectedSuggestion])

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Restaurants
        </h1>
        <div className="relative w-full max-w-[500px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => {
              setSelectedSuggestion('')
              handleQueryChange(event)
            }}
            className="h-11 rounded-xl border-[#d9eaf1] bg-[#e9f6fb] pl-9 text-sm"
            placeholder="Search restaurant"
          />
          {suggestions.length ? (
            <div className="absolute top-12 z-10 w-full rounded-xl border border-[#d9eaf1] bg-white p-1 shadow-lg">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setQuery(item.name)
                    setSelectedSuggestion(item.id)
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-[#f2f8fb]"
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-[#d9eaf1] bg-white p-3 md:grid-cols-5">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.veg}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, veg: event.target.checked }))
            }
          />
          Veg
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.nonVeg}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, nonVeg: event.target.checked }))
            }
          />
          Non-Veg
        </label>
        <select
          className="rounded-lg border border-[#d9eaf1] px-2 py-1 text-sm"
          value={filters.cuisine}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, cuisine: event.target.value }))
          }
        >
          <option value="all">All Cuisine</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-[#d9eaf1] px-2 py-1 text-sm"
          value={filters.maxPrice}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, maxPrice: Number(event.target.value) }))
          }
        >
          <option value={300}>Under Rs 300</option>
          <option value={500}>Under Rs 500</option>
          <option value={800}>Under Rs 800</option>
          <option value={1000}>All Prices</option>
        </select>
        <select
          className="rounded-lg border border-[#d9eaf1] px-2 py-1 text-sm"
          value={filters.minRating}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, minRating: Number(event.target.value) }))
          }
        >
          <option value={0}>All Ratings</option>
          <option value={4}>4.0+</option>
          <option value={4.3}>4.3+</option>
          <option value={4.5}>4.5+</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[320px]" />
          ))}
        </div>
      ) : filteredRestaurants.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No restaurants found for selected filters.
        </div>
      )}
    </section>
  )
}

export default RestaurantsPage
