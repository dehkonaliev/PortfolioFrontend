import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './icons'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  variant?: 'card' | 'bare'
  maxWidth?: string
}

function AnimatedOverlay({
  visible,
  onClose,
  children,
}: {
  visible: boolean
  onClose: () => void
  children: ReactNode
}) {
  const [rendered, setRendered] = useState(visible)
  const [active, setActive] = useState(visible)
  const timerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (visible) {
      setRendered(true)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setActive(true))
      })
    } else {
      setActive(false)
      timerRef.current = window.setTimeout(() => setRendered(false), 280)
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [visible])

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!rendered) return
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [rendered, handleKey])

  if (!rendered) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`modal-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm ${
          active ? 'modal-backdrop-open' : ''
        }`}
      />
      <div
        className={`modal-panel relative ${active ? 'modal-panel-open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export default function Modal({ open, onClose, title, children, variant = 'card', maxWidth = 'max-w-lg' }: ModalProps) {
  return (
    <AnimatedOverlay visible={open} onClose={onClose}>
      {variant === 'bare' ? (
        children
      ) : (
        <div
          className={`relative w-full ${maxWidth} overflow-hidden panel-card`}
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
            <button
              onClick={onClose}
              className="btn-tactile rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      )}
    </AnimatedOverlay>
  )
}