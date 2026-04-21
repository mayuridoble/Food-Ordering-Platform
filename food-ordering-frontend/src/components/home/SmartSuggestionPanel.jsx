import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'

const moodOptions = [
  { id: 'spicy', label: 'Spicy' },
  { id: 'healthy', label: 'Healthy' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'light', label: 'Light' },
]

const moodMeals = {
  spicy: 'Try masala biryani with raita.',
  healthy: 'Try a quinoa bowl or a light veg thali.',
  comfort: 'Try buttery paneer curry with soft roti.',
  light: 'Try soup + salad combo for easy digestion.',
}

function getMealTime() {
  const hour = new Date().getHours()
  if (hour < 11) return 'breakfast'
  if (hour < 17) return 'lunch'
  return 'dinner'
}

function SmartSuggestionPanel({ orders = [], isAuthenticated }) {
  const [mood, setMood] = useState('healthy')

  const recommendation = useMemo(() => {
    const mealTime = getMealTime()

    if (isAuthenticated && orders.length) {
      const latestOrder = orders[0]
      const lastDish = latestOrder?.items?.[0]?.food?.name
      if (mealTime === 'lunch') {
        return `Aaj lunch timing hai, ${lastDish ? `${lastDish} ke baad ` : ''}try ${moodMeals[mood].toLowerCase()}`
      }
      return `Based on your history, ${moodMeals[mood]}`
    }

    if (mealTime === 'breakfast') {
      return `Breakfast time: ${moodMeals.light}`
    }
    if (mealTime === 'lunch') {
      return `Aaj tumne lunch skip kiya hai, try light veg thali.`
    }
    return `Dinner suggestion: ${moodMeals[mood]}`
  }, [isAuthenticated, mood, orders])

  return (
    <Card className="flex flex-col space-y-5 border-[#e3eef4] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[1.35rem]">
          Smart Dish Suggestions
        </h3>
        <p className="text-sm leading-relaxed text-slate-500">
          Personalized by history, time of day, and mood.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {moodOptions.map((option) => (
          <Button
            key={option.id}
            variant={mood === option.id ? 'primary' : 'secondary'}
            className="h-9 rounded-full border-[#dfe8ef] px-4 text-sm font-semibold shadow-none"
            onClick={() => setMood(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <p className="mt-auto rounded-2xl border border-[#e2f0f8] bg-[#f1f8fc] px-4 py-3.5 text-sm font-medium leading-relaxed text-slate-700">
        {recommendation}
      </p>
    </Card>
  )
}

export default SmartSuggestionPanel
