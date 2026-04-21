import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-gradient-to-r from-[#f0792d] to-[#e23688] text-white shadow-md shadow-[#e23688]/25 hover:brightness-105 focus-visible:outline-orange-400',
  secondary:
    'bg-white text-slate-800 border border-[#d8e8ef] hover:bg-[#f6fbfe] focus-visible:outline-slate-400',
  ghost:
    'text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 focus-visible:outline-rose-400',
}

function Button({
  type = 'button',
  variant = 'primary',
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
