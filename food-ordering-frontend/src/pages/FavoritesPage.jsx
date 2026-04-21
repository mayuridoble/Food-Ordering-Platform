import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import Skeleton from '../components/ui/Skeleton'
import { authApi } from '../services/api/authApi'

function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi
      .profile()
      .then(({ data }) => {
        const list = Array.isArray(data?.favorites) ? data.favorites : []
        const normalized = list.map((item) => ({
          id: item.id,
          name: item.title,
          description: item.description,
          images: item.images,
          open: true,
          openingHours: 'Open now',
          address: { city: 'Your favorite' },
          cuisineType: 'Saved',
        }))
        setFavorites(normalized)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 text-rose-500" />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Favorites</h1>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[350px]" />
          ))}
        </div>
      ) : favorites.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No favorite restaurants yet. Tap the heart on any restaurant to save it.
        </div>
      )}
    </section>
  )
}

export default FavoritesPage
