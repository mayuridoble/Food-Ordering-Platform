import { cn } from '../../utils/cn'

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-200',
        className,
      )}
      {...props}
    />
  )
}

export default Input
