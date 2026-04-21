import { Heart, Leaf } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FoodCard from '../components/food/FoodCard'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { setCart } from '../features/cart/cartSlice'
import { setSession } from '../features/auth/authSlice'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { useAppSelector } from '../hooks/useAppSelector'
import { authApi } from '../services/api/authApi'
import { cartApi } from '../services/api/cartApi'
import { foodApi } from '../services/api/foodApi'
import { restaurantApi } from '../services/api/restaurantApi'
import { useToast } from '../components/ui/ToastProvider'

function RestaurantDetailsPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const reduxToken = useAppSelector((state) => state.auth.token)
  const authToken = reduxToken || localStorage.getItem('auth_token')

  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [vegOnly, setVegOnly] = useState(false)
  const [requiresLogin, setRequiresLogin] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      restaurantApi.byId(id),
      foodApi.byRestaurant(id, { vegetarian: vegOnly }),
    ])
      .then(([restaurantResponse, foodResponse]) => {
        const foods = foodResponse.data || []
        const uniqueIngredients = foods
          .flatMap((food) => food.ingredients || [])
          .reduce((accumulator, currentItem) => {
            if (!currentItem?.id) return accumulator
            if (accumulator.some((item) => item.id === currentItem.id)) {
              return accumulator
            }
            accumulator.push(currentItem)
            return accumulator
          }, [])

        setRestaurant(restaurantResponse.data)
        setMenuItems(foods)
        setIngredients(uniqueIngredients)
        setRequiresLogin(false)
      })
      .catch((error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          setRequiresLogin(true)
        } else {
          toast.error('Unable to load restaurant menu.')
        }
      })
      .finally(() => setLoading(false))
  }, [id, vegOnly, toast])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await Promise.resolve()
      if (cancelled) return
      if (!id || !authToken) {
        setIsFavorite(false)
        return
      }
      try {
        const { data: profile } = await authApi.profile()
        if (cancelled) return
        const list = profile?.favorites || []
        const numericId = Number(id)
        setIsFavorite(
          list.some((f) => Number(f?.id) === numericId || String(f?.id) === String(id)),
        )
      } catch {
        if (!cancelled) setIsFavorite(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, authToken])

  const addToCart = async (food) => {
    try {
      if (!authToken) {
        toast.error('Please login to add items to cart.')
        return
      }
      await cartApi.add({ foodId: food.id, quantity: 1, ingredients: [] })
      const cartResponse = await cartApi.get()
      dispatch(setCart({ items: cartResponse.data?.item, total: cartResponse.data?.total }))
      toast.success(`${food.name} added to cart`)
    } catch {
      toast.error('Could not add item to cart.')
    }
  }

  const toggleFavorite = async () => {
    if (!authToken) {
      toast.error('Please login to favorite restaurants.')
      return
    }
    setFavoriteBusy(true)
    try {
      await restaurantApi.toggleFavorite(id)
      setIsFavorite((previous) => !previous)
      toast.success('Favorites updated')
      try {
        const token = authToken
        const { data: profile } = await authApi.profile()
        dispatch(setSession({ token, user: profile }))
      } catch {
        /* profile refresh optional */
      }
    } catch (error) {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
        toast.error('Please login again to update favorites.')
      } else {
        toast.error('Could not update favorite.')
      }
    } finally {
      setFavoriteBusy(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-[420px] w-full" />
  }

  return (
    <section className="space-y-6">
      <div className="glass-surface rounded-3xl border border-white/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {restaurant?.name}
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">{restaurant?.description}</p>
          </div>
          <Button
            variant="secondary"
            type="button"
            disabled={favoriteBusy}
            onClick={toggleFavorite}
            className={`gap-2 ${isFavorite ? 'border-rose-200 bg-rose-50 text-rose-700' : ''}`}
            aria-pressed={isFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-600' : ''}`}
            />
            {isFavorite ? 'Saved' : 'Favorite'}
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant={vegOnly ? 'primary' : 'secondary'}
            className="h-9 gap-1"
            onClick={() => {
              setLoading(true)
              setVegOnly((previous) => !previous)
            }}
          >
            <Leaf className="h-4 w-4" />
            Veg only
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Menu</h2>
          {requiresLogin ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
              Please login to view menu and add items to cart.
              <div className="mt-4">
                <Link to="/login">
                  <Button className="h-9">Go to Login</Button>
                </Link>
              </div>
            </div>
          ) : menuItems.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {menuItems.map((food) => (
                <FoodCard key={food.id} food={food} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              No food items available right now.
            </div>
          )}
        </div>
        <div className="glass-surface rounded-2xl border border-white/70 p-5">
          <h3 className="text-base font-semibold text-slate-900">Ingredients</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {ingredients.length ? (
              ingredients.map((ingredient) => (
                <span
                  key={ingredient.id}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {ingredient.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No ingredients listed.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RestaurantDetailsPage
