import { Leaf, Plus } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

function FoodCard({ food, onAdd, disabled }) {
  const cover = food?.images?.[0]

  return (
    <Card className="group overflow-hidden p-0">
      <div className="h-40 w-full bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt={food.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">{food.name}</h3>
          {food.isVegetarian ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
              <Leaf className="h-3 w-3" />
              Veg
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm text-slate-500">{food.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Rs {food.price}</p>
          <Button
            className="h-9 gap-1 px-3"
            onClick={() => onAdd(food)}
            disabled={disabled || !food.available}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default FoodCard
