import { useCallback, useEffect, useMemo, useRef } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  type: 'star' | 'pulsar'
}

interface Planet {
  id: number
  startX: number
  startY: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotSpeed: number
  name: string
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const REPEL_RADIUS = 60
const REPEL_STRENGTH = 10
const BASE_SPEED = 0.01

function SaturnSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="14" fill="rgba(210,170,100,0.65)" />
      <circle cx="32" cy="32" r="14" stroke="rgba(232,163,61,0.5)" strokeWidth="0.5" />
      <ellipse cx="32" cy="32" rx="24" ry="6" stroke="rgba(232,163,61,0.55)" strokeWidth="1.5" fill="none" />
      <ellipse cx="32" cy="32" rx="20" ry="4.5" stroke="rgba(194,146,61,0.35)" strokeWidth="1" fill="none" />
    </svg>
  )
}

function MoonSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="12" fill="rgba(200,195,180,0.55)" />
      <circle cx="32" cy="32" r="12" stroke="rgba(232,163,61,0.35)" strokeWidth="0.5" />
      <circle cx="26" cy="28" r="3" fill="rgba(180,175,160,0.4)" />
      <circle cx="36" cy="35" r="2" fill="rgba(180,175,160,0.35)" />
      <circle cx="30" cy="38" r="1.5" fill="rgba(180,175,160,0.3)" />
      <circle cx="38" cy="27" r="1.8" fill="rgba(180,175,160,0.32)" />
    </svg>
  )
}

function EarthSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="13" fill="rgba(80,140,180,0.5)" />
      <circle cx="32" cy="32" r="13" stroke="rgba(232,163,61,0.35)" strokeWidth="0.5" />
      <path d="M22 26c3-2 7-1 9 1s5 4 3 6-6 1-8-1-5-4-4-6z" fill="rgba(100,170,100,0.45)" />
      <path d="M34 38c2 1 5 0 6-2s0-5-2-5-4 2-5 4z" fill="rgba(100,170,100,0.4)" />
      <path d="M28 42c1.5 1 4 1 5-0.5s0.5-3.5-1-3.5-3.5 1.5-4 3z" fill="rgba(100,170,100,0.3)" />
    </svg>
  )
}

function MarsSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="11" fill="rgba(190,90,60,0.5)" />
      <circle cx="32" cy="32" r="11" stroke="rgba(232,163,61,0.35)" strokeWidth="0.5" />
      <circle cx="28" cy="30" r="3" fill="rgba(160,70,50,0.35)" />
      <circle cx="35" cy="34" r="2" fill="rgba(160,70,50,0.3)" />
      <circle cx="30" cy="36" r="1.5" fill="rgba(160,70,50,0.25)" />
    </svg>
  )
}

function JupiterSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="16" fill="rgba(180,140,90,0.5)" />
      <circle cx="32" cy="32" r="16" stroke="rgba(232,163,61,0.35)" strokeWidth="0.5" />
      <path d="M16 28h32" stroke="rgba(194,146,61,0.3)" strokeWidth="1" />
      <path d="M18 32h28" stroke="rgba(194,146,61,0.25)" strokeWidth="1.2" />
      <path d="M16 36h32" stroke="rgba(194,146,61,0.2)" strokeWidth="1" />
      <circle cx="36" cy="38" r="2.5" fill="rgba(190,80,60,0.35)" />
    </svg>
  )
}

function VenusSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="12" fill="rgba(220,190,130,0.5)" />
      <circle cx="32" cy="32" r="12" stroke="rgba(232,163,61,0.35)" strokeWidth="0.5" />
      <path d="M24 28c4-3 12-3 16 0" stroke="rgba(200,170,100,0.3)" strokeWidth="0.8" fill="none" />
      <path d="M22 34c5-2 15-2 20 0" stroke="rgba(200,170,100,0.25)" strokeWidth="0.8" fill="none" />
    </svg>
  )
}

const PLANET_SVGS = [SaturnSVG, MoonSVG, EarthSVG, MarsSVG, JupiterSVG, VenusSVG]

const EXTRA_CSS = `
@keyframes star-drift {
  0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.6); }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-12px) translateX(6px) scale(1); }
}
@keyframes pulsar {
  0% { opacity: 0.1; transform: scale(0.5); }
  50% { opacity: 0.9; transform: scale(1.3); }
  100% { opacity: 0.1; transform: scale(0.5); }
}
`

export default function Starfield() {
  const stars = useMemo(() => {
    const rand = seededRandom(42)
    const result: Star[] = []
    for (let i = 0; i < 100; i++) {
      result.push({
        id: i,
        x: rand() * 100,
        y: rand() * 100,
        size: (rand() * 2 + 0.5) * 2,
        delay: rand() * 8,
        duration: rand() * 4 + 3,
        type: rand() > 0.85 ? 'pulsar' : 'star',
      })
    }
    return result
  }, [])

  const planets = useMemo(() => {
    const rand = seededRandom(99)
    const names = ['saturn', 'moon', 'earth', 'mars', 'jupiter', 'venus', 'saturn', 'moon']
    return Array.from({ length: 8 }, (_, i): Planet => {
      const angle = rand() * Math.PI * 2
      const speed = (0.3 + rand() * 0.7) * BASE_SPEED
      return {
        id: i,
        startX: rand() * 90 + 5,
        startY: rand() * 90 + 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand() * 30 + 55,
        rotation: rand() * 360,
        rotSpeed: (rand() - 0.5) * 0.3,
        name: names[i],
      }
    })
  }, [])

  const planetRefs = useRef<(HTMLDivElement | null)[]>([])
  const planetPosRef = useRef<{ x: number; y: number }[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    planetPosRef.current = planets.map((p) => ({
      x: (p.startX / 100) * vw,
      y: (p.startY / 100) * vh,
    }))
  }, [planets])

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time
    const dt = Math.min(time - lastTimeRef.current, 50)
    lastTimeRef.current = time

    const vw = window.innerWidth
    const vh = window.innerHeight
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    planets.forEach((p, i) => {
      const el = planetRefs.current[i]
      if (!el) return

      const pos = planetPosRef.current[i]

      pos.x += p.vx * dt
      pos.y += p.vy * dt

      if (pos.x > vw + p.size) pos.x = -p.size
      if (pos.x < -p.size) pos.x = vw + p.size
      if (pos.y > vh + p.size) pos.y = -p.size
      if (pos.y < -p.size) pos.y = vh + p.size

      const cx = pos.x + p.size / 2
      const cy = pos.y + p.size / 2
      const dx = cx - mx
      const dy = cy - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      let repelX = 0
      let repelY = 0
      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH
        repelX = (dx / dist) * force
        repelY = (dy / dist) * force
      }

      p.rotation += p.rotSpeed * dt * 0.05

      el.style.transform = `translate(${pos.x - (p.startX / 100) * vw}px, ${pos.y - (p.startY / 100) * vh}px) translate(${repelX}px, ${repelY}px)`

      const inner = el.firstElementChild as HTMLElement | null
      if (inner) {
        inner.style.transform = `rotate(${p.rotation}deg)`
      }
    })

    rafRef.current = requestAnimationFrame(animate)
  }, [planets])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: s.type === 'pulsar' ? `${s.duration + 2}s` : `${s.duration}s`,
            animationName: s.type === 'pulsar' ? 'pulsar' : 'star-drift',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            opacity: 0,
          }}
        >
          {s.type === 'pulsar' ? (
            <div
              className="h-full w-full rounded-full"
              style={{
                boxShadow: `0 0 ${s.size * 3}px ${s.size}px rgba(232, 163, 61, 0.25)`,
                backgroundColor: 'rgba(232, 163, 61, 0.6)',
              }}
            />
          ) : (
            <div
              className="h-full w-full rounded-full"
              style={{
                backgroundColor: `rgba(232, 163, 61, ${0.2 + s.size * 0.15})`,
              }}
            />
          )}
        </div>
      ))}

      {planets.map((p, i) => {
        const PlanetSVG = PLANET_SVGS[p.id % PLANET_SVGS.length]
        return (
          <div
            key={`planet-${p.id}`}
            ref={(el) => { planetRefs.current[i] = el }}
            className="absolute will-change-transform"
            style={{
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          >
            <div className="h-full w-full will-change-[transform]">
              <PlanetSVG className="h-full w-full" />
            </div>
          </div>
        )
      })}

      <style>{EXTRA_CSS}</style>
    </div>
  )
}
