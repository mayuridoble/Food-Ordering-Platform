import { useRef, useState } from 'react'
import Card from '../ui/Card'

const ABOUT_IMAGE_PRIMARY =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
const ABOUT_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'

function AboutSection() {
  const [imgSrc, setImgSrc] = useState(ABOUT_IMAGE_PRIMARY)
  const triedFallback = useRef(false)

  return (
    <Card className="overflow-hidden border-[#e3eef4] p-0 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      {/* Fixed height so the banner never collapses if aspect-ratio utilities fail in the build */}
      <div className="relative h-[220px] w-full overflow-hidden bg-slate-200 sm:h-[260px]">
        <img
          src={imgSrc}
          alt="Colorful fresh bowl and ingredients on a table"
          width={1600}
          height={900}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => {
            if (triedFallback.current) return
            triedFallback.current = true
            setImgSrc(ABOUT_IMAGE_FALLBACK)
          }}
        />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-t from-black/45 via-black/10 to-transparent"
          aria-hidden
        />
        <p className="absolute bottom-4 left-5 right-5 z-[2] text-sm font-medium text-white drop-shadow-sm sm:left-7 sm:bottom-5">
          Fresh picks, smart recommendations — every time.
        </p>
      </div>
      <div className="relative space-y-6 bg-gradient-to-b from-slate-50/90 via-white to-white p-6 sm:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0792d]/40 to-transparent"
          aria-hidden
        />
        <header className="space-y-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
            Our story
          </p>
          <h3 className="max-w-xl font-serif text-3xl font-bold leading-[1.15] tracking-tight text-slate-950 sm:text-4xl">
            <span className="bg-gradient-to-r from-[#c2410c] via-[#e11d48] to-[#be185d] bg-clip-text text-transparent">
              About Us
            </span>
          </h3>
          <div
            className="h-1 w-20 rounded-full bg-gradient-to-r from-[#f0792d] to-[#e23688] shadow-sm shadow-[#e23688]/25"
            aria-hidden
          />
        </header>
        <div className="space-y-5">
          <p className="text-base font-medium leading-[1.75] text-slate-800 sm:text-[1.05rem]">
            YumKart is a smart food ordering platform focused on speed,
            personalization, and premium discovery. We combine dynamic restaurant and
            menu data with intelligent suggestions so every meal recommendation feels
            relevant.
          </p>
          <p className="relative pl-5 text-sm leading-[1.75] text-slate-600 sm:text-base">
            <span
              className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-[#f0792d] to-[#e23688] shadow-[0_0_12px_rgba(226,54,136,0.35)]"
              aria-hidden
            />
            Our goal is to give users a Zomato-level browsing experience with
            cleaner UX, meaningful filters, and data-driven recommendations.
          </p>
        </div>
      </div>
    </Card>
  )
}

export default AboutSection
