import { useEffect, useRef, useCallback } from 'react'

/**
 * Attaches a single IntersectionObserver to the page that reveals
 * all `.reveal` elements by adding the `.visible` class when they
 * enter the viewport.  Observe once per mount — no jank, no scroll-jacking.
 * A MutationObserver keeps track of `.reveal` nodes added later (async
 * sections like recommendations, newly created items, etc).
 */
export function useReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  const observe = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect()
    if (mutationObserverRef.current) mutationObserverRef.current.disconnect()

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'))
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observerRef.current?.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )

    mutationObserverRef.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue
          if (node.classList?.contains('reveal')) observerRef.current?.observe(node)
          node.querySelectorAll?.('.reveal:not(.visible)').forEach((el) => {
            observerRef.current?.observe(el)
          })
        }
      }
    })
    mutationObserverRef.current.observe(document.body, { childList: true, subtree: true })

    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
      observerRef.current?.observe(el)
    })
  }, [])

  useEffect(() => {
    // Small delay so DOM is painted before we measure
    const raf = requestAnimationFrame(() => observe())
    return () => {
      cancelAnimationFrame(raf)
      observerRef.current?.disconnect()
      mutationObserverRef.current?.disconnect()
    }
  }, [observe])

  return { reobserve: observe }
}
