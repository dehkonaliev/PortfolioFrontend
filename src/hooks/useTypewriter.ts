import { useEffect, useState } from 'react'

export interface TypewriterOptions {
  /** ms per character while typing the text in */
  charSpeed?: number
  /** ms to hold the full text on screen (subtitle visible) */
  holdDuration?: number
  /** ms per character while clearing the text out */
  clearSpeed?: number
  /** ms of blank pause before typing again */
  resetDelay?: number
}

export type TypewriterPhase = 'typing' | 'hold' | 'clearing' | 'gap'

function prefersReduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Infinite looping typewriter. Types the name in, holds it, clears it out,
 * pauses, and repeats forever. The phase lets the caller fade the subtitle
 * in and out in sync.
 */
export function useTypewriter(
  fullText: string,
  { charSpeed = 35, holdDuration = 2400, clearSpeed = 18, resetDelay = 700 }: TypewriterOptions = {},
) {
  const [count, setCount] = useState(prefersReduced() ? fullText.length : 0)
  const [phase, setPhase] = useState<TypewriterPhase>(() =>
    prefersReduced() ? 'hold' : 'typing',
  )

  useEffect(() => {
    if (prefersReduced()) return

    const delay =
      phase === 'typing'
        ? charSpeed
        : phase === 'hold'
          ? holdDuration
          : phase === 'clearing'
            ? clearSpeed
            : resetDelay

    const timer = setTimeout(() => {
      if (phase === 'typing') {
        if (count >= fullText.length) setPhase('hold')
        else setCount((c) => c + 1)
      } else if (phase === 'hold') {
        setPhase('clearing')
      } else if (phase === 'clearing') {
        if (count <= 0) setPhase('gap')
        else setCount((c) => c - 1)
      } else {
        setPhase('typing')
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [phase, count, fullText.length, charSpeed, holdDuration, clearSpeed, resetDelay])

  const text = fullText.slice(0, count)
  return { text, phase }
}