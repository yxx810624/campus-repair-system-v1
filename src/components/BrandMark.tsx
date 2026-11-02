import { cn } from '../lib/utils'

export function BrandMark({
  variant = 'default',
  className,
}: {
  variant?: 'default' | 'light'
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex h-11 w-11 flex-none items-center justify-center rounded-2xl',
        variant === 'default'
          ? 'bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/25'
          : 'bg-white/15 text-white ring-1 ring-inset ring-white/30 backdrop-blur',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.7 6.3a4.2 4.2 0 00-5.4 5.4L3.4 17.6a1.5 1.5 0 002.1 2.1l5.9-5.9a4.2 4.2 0 005.4-5.4l-2.5 2.5-2.8-.8-.8-2.8 2.5-2.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.8 3.5l1.2 1.2M19.3 6l1.2 1.2"
        />
      </svg>
    </span>
  )
}
