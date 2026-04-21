import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setCart } from '../../features/cart/cartSlice'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { cartApi } from '../../services/api/cartApi'
import { foodApi } from '../../services/api/foodApi'
import { useToast } from '../ui/ToastProvider'

const meals = [
  {
    id: 'fried-rice',
    label: 'Fried Rice',
    query: 'Fried Rice',
    image:
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cake',
    label: 'Cake',
    query: 'Cake',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'biryani',
    label: 'Biryani',
    query: 'Biryani',
    image:
      'https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'thali',
    label: 'Thali',
    query: 'Thali',
    image:
      'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'north-indian',
    label: 'North Indian Food',
    query: 'Paneer',
    image:
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pizza',
    label: 'Wood-Fired Pizza',
    query: 'Pizza',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pasta',
    label: 'Creamy Pasta',
    query: 'Pasta',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'burger',
    label: 'Gourmet Burger',
    query: 'Burger',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sushi',
    label: 'Sushi Platter',
    query: 'Sushi',
    image:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tacos',
    label: 'Street Tacos',
    query: 'Tacos',
    image:
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dosa',
    label: 'Crispy Dosa',
    query: 'Dosa',
    image:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ramen',
    label: 'Ramen Bowl',
    query: 'Ramen',
    image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'salad',
    label: 'Fresh Salad Bowl',
    query: 'Salad',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ice-cream',
    label: 'Ice Cream',
    query: 'Ice Cream',
    image:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'bbq',
    label: 'BBQ & Grills',
    query: 'BBQ',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dim-sum',
    label: 'Dim Sum',
    query: 'Dim Sum',
    image:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'steak',
    label: 'Steak Dinner',
    query: 'Steak',
    image:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  },
]

/** Shown if Unsplash returns 404 or the request fails */
const MEAL_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

function MealCircleImage({ meal }) {
  const [src, setSrc] = useState(meal.image)
  const triedFallback = useRef(false)

  return (
    <img
      src={src}
      alt={meal.label}
      draggable={false}
      className="mx-auto h-[118px] w-[118px] rounded-full border-[3px] border-white/12 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.45)] ring-1 ring-white/10 sm:h-[132px] sm:w-[132px]"
      onError={() => {
        if (triedFallback.current) return
        triedFallback.current = true
        setSrc(MEAL_IMAGE_FALLBACK)
      }}
    />
  )
}

function chunkItems(items, size) {
  const chunks = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function TopMealsSlider() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [addingMealId, setAddingMealId] = useState('')

  const slides = useMemo(
    () => chunkItems(meals, 3),
    [],
  )
  const slideCount = slides.length

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const dragRef = useRef({ startX: null, active: false })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const maxSlide = Math.max(0, slideCount - 1)
  const displayIndex = Math.min(index, maxSlide)

  useEffect(() => {
    if (slideCount <= 1 || paused || reducedMotion) return undefined
    const id = window.setInterval(() => {
      setIndex((i) => {
        const cur = Math.min(i, Math.max(0, slideCount - 1))
        return (cur + 1) % slideCount
      })
    }, 4500)
    return () => window.clearInterval(id)
  }, [slideCount, paused, reducedMotion])

  const go = useCallback(
    (dir) => {
      setIndex((i) => {
        const cur = Math.min(i, Math.max(0, slideCount - 1))
        if (dir === 'prev') return (cur - 1 + slideCount) % slideCount
        return (cur + 1) % slideCount
      })
    },
    [slideCount],
  )

  const onPointerDown = (e) => {
    if (e.target.closest('[data-meal-button="true"]')) return
    dragRef.current = { startX: e.clientX, active: true }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerUp = (e) => {
    if (e.target.closest('[data-meal-button="true"]')) return
    const { startX, active } = dragRef.current
    dragRef.current = { startX: null, active: false }
    if (!active || startX == null) return
    const dx = e.clientX - startX
    if (dx > 56) go('prev')
    else if (dx < -56) go('next')
  }

  const handleMealClick = async (meal) => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      toast.error('Please login to add meals to cart.')
      navigate('/login')
      return
    }

    setAddingMealId(meal.id)
    try {
      const response = await foodApi.search(meal.query || meal.label)
      const list = Array.isArray(response?.data) ? response.data : []
      const selectedFood = list[0]

      if (!selectedFood?.id) {
        toast.error(`No matching item found for ${meal.label}.`)
        return
      }

      await cartApi.add({ foodId: selectedFood.id, quantity: 1, ingredients: [] })
      const cartResponse = await cartApi.get()
      dispatch(setCart({ items: cartResponse.data?.item, total: cartResponse.data?.total }))
      toast.success(`${selectedFood.name || meal.label} added to cart`)
    } catch {
      toast.error('Could not add meal to cart.')
    } finally {
      setAddingMealId('')
    }
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/12 shadow-[0_24px_60px_rgba(8,6,20,0.45),0_0_0_1px_rgba(255,255,255,0.04)_inset]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Layered background: deep base + warm/cool glows + vignette + fine grid */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b0a10] via-[#12101c] to-[#07060b]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_85%_0%,rgba(240,121,45,0.22),transparent_55%),radial-gradient(ellipse_70%_50%_at_5%_100%,rgba(226,54,136,0.14),transparent_50%),radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(99,102,241,0.08),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_35%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#f0792d]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#e23688]/12 blur-3xl"
        aria-hidden
      />

      <div className="relative z-[1] px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Top Meals
          </h3>
          {slideCount > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go('prev')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go('next')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0b0a10] via-[#0b0a10]/85 to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0b0a10] via-[#0b0a10]/85 to-transparent sm:w-16" />

        <div
          className="relative mt-4 cursor-grab touch-pan-x select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="region"
          aria-roledescription="carousel"
          aria-label="Top meals carousel"
        >
          <div
            className="flex transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(-${displayIndex * 100}%)` }}
          >
            {slides.map((group, slideIdx) => (
              <div
                key={slideIdx}
                className="w-full shrink-0 px-1"
                aria-hidden={slideIdx !== displayIndex}
              >
                <div
                  className="flex justify-center gap-5 sm:gap-8 md:gap-10"
                  style={{
                    minHeight: '168px',
                  }}
                >
                  {group.map((meal) => (
                    <article
                      key={meal.id}
                      className="flex max-w-[200px] flex-1 flex-col items-center text-center"
                    >
                      <button
                        type="button"
                        data-meal-button="true"
                        onClick={() => handleMealClick(meal)}
                        disabled={addingMealId === meal.id}
                        className="group flex flex-col items-center"
                      >
                        <div className="relative transition duration-300 group-hover:scale-105">
                          <MealCircleImage meal={meal} />
                        </div>
                        <p className="mt-2 max-w-[11rem] text-sm font-semibold leading-snug text-white/90 sm:text-[15px]">
                          {addingMealId === meal.id ? 'Adding...' : meal.label}
                        </p>
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {slideCount > 1 && (
          <div
            className="mt-4 flex justify-center gap-2"
            role="tablist"
            aria-label="Carousel pagination"
          >
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                role="tab"
                aria-selected={dotIdx === displayIndex}
                aria-label={`Go to slide ${dotIdx + 1}`}
                onClick={() => setIndex(dotIdx)}
                className={
                  dotIdx === displayIndex
                    ? 'h-2 w-7 rounded-full bg-gradient-to-r from-[#f0792d] to-[#e23688] shadow-sm shadow-[#e23688]/40'
                    : 'h-2 w-2 rounded-full bg-white/25 transition hover:bg-white/45'
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TopMealsSlider
