import { useEffect, useRef } from 'react'
import { cn } from '../lib/utils'

type ToastTone = 'success' | 'error' | 'info'

interface ToastProps {
  message: string | null
  tone?: ToastTone
  onClose: () => void
}

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

export function Toast({ message, tone = 'success', onClose }: ToastProps) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => onCloseRef.current(), 3200)
    return () => window.clearTimeout(timer)
  }, [message])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 animate-fade-up items-center gap-2.5 rounded-full border px-5 py-3 text-sm font-medium shadow-lg',
        TONE_STYLES[tone],
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4 flex-none"
      >
        {tone === 'error' ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M10.3 3.9L2.7 17.2A2 2 0 004.4 20h15.2a2 2 0 001.7-2.8L13.7 3.9a2 2 0 00-3.4 0z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        )}
      </svg>
      <span>{message}</span>
    </div>
  )
}
