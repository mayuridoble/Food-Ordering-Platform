import { ChevronRight, Clock3, MapPin, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'

function RestaurantCard({ restaurant }) {
  const cover = restaurant?.images?.[0]
  const isOpen = Boolean(restaurant.open)
  const fallbackImage = `https://picsum.photos/seed/restaurant-${restaurant?.id || 0}/900/600`
  const [imageSrc, setImageSrc] = useState(cover || fallbackImage)

  useEffect(() => {
    setImageSrc(cover || fallbackImage)
  }, [cover, fallbackImage])

  return (
    <Link to={`/restaurants/${restaurant.id}`} className="group block">
      <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-[190px] w-full bg-slate-100">
          <img
            src={imageSrc}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
            onError={() => {
              setImageSrc(fallbackImage)
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-700 backdrop-blur">
            {restaurant.cuisineType || 'Restaurant'}
          </div>
          <div
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold ${
              isOpen
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
            }`}
          >
            {isOpen ? 'Open now' : 'Closed'}
          </div>
        </div>
        <div className="space-y-3 p-4">
          <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-slate-900">
            {restaurant.name}
          </h3>
          <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-600">
            {restaurant.description || 'Great food and quick delivery from this spot.'}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              <MapPin className="h-3.5 w-3.5" />
              {restaurant?.address?.city || 'City unavailable'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
              <Clock3 className="h-3.5 w-3.5" />
              {restaurant.openingHours || 'All day'}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-sm font-semibold text-[#d1945d]">View menu</span>
            <ChevronRight className="h-4 w-4 text-[#d1945d] transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default RestaurantCard
