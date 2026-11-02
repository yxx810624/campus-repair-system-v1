import type { TicketStatus } from '../types'
import { STATUS_META } from '../lib/constants'
import { cn } from '../lib/utils'

export function StatusBadge({
  status,
  size = 'sm',
}: {
  status: TicketStatus
  size?: 'sm' | 'md'
}) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex flex-none items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        meta.badgeClass,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} />
      {meta.label}
    </span>
  )
}
