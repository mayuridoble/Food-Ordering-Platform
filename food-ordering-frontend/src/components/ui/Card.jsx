import { cn } from '../../utils/cn'

function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#d9eff6] bg-white p-6 shadow-[0_8px_20px_rgba(112,176,199,0.14)] transition duration-200 hover:shadow-[0_12px_26px_rgba(112,176,199,0.2)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default Card
