import { cn } from '../../utils/cn'

function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100',
        className,
      )}
    />
  )
}

export default Skeleton
