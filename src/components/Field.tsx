import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface FieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}

export function Field({
  id,
  label,
  required,
  error,
  hint,
  right,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="flex items-center gap-1 text-sm font-medium text-slate-700"
        >
          {label}
          {required && (
            <span className="text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {right}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  )
}
