import {
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { AppShell } from '../components/AppShell'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { StatusPieChart } from '../components/StatusPieChart'
import { Toast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { STATUS_META, STATUS_ORDER } from '../lib/constants'
import { getTickets, saveTickets } from '../lib/storage'
import { buildDemoTickets } from '../lib/tickets'
import { cn, formatDateTime, sortByCreatedAtDesc } from '../lib/utils'
import type { RepairTicket, TicketStatus } from '../types'

type FilterStatus = 'all' | TicketStatus

const FILTER_OPTIONS: Array<{ value: FilterStatus; label: string }> = [
  { value: 'all', label: '全部' },
  ...STATUS_ORDER.map((status) => ({
    value: status,
    label: STATUS_META[status].label,
  })),
]

const STATUS_ICON_PATHS: Record<TicketStatus, string> = {
  pending:
    'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
  processing:
    'M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.3 5.7L4 8m16 8l-2.3-2.3A8 8 0 013.9 15',
  done: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  rejected:
    'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
}

export function AdminPage() {
  const { session } = useAuth()
  const [tickets, setTickets] = useState<RepairTicket[]>(() =>
    sortByCreatedAtDesc(getTickets()),
  )
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(
    null,
  )
  const [toast, setToast] = useState<string | null>(null)

  if (!session) return null

  const counts: Record<TicketStatus, number> = {
    pending: tickets.filter((ticket) => ticket.status === 'pending').length,
    processing: tickets.filter((ticket) => ticket.status === 'processing')
      .length,
    done: tickets.filter((ticket) => ticket.status === 'done').length,
    rejected: tickets.filter((ticket) => ticket.status === 'rejected').length,
  }
  const total = tickets.length
  const filteredTickets =
    filter === 'all'
      ? tickets
      : tickets.filter((ticket) => ticket.status === filter)
  const completionRate = total ? Math.round((counts.done / total) * 100) : 0

  const handleGenerateDemo = () => {
    const generated = buildDemoTickets(tickets, session.username)
    const nextTickets = sortByCreatedAtDesc([...generated, ...tickets])
    saveTickets(nextTickets)
    setTickets(nextTickets)
    setFilter('all')
    setToast('已生成 20 条示例工单，可查看统计变化')
  }

  const handleSaveTicket = (
    ticketNo: string,
    status: TicketStatus,
    adminNote: string,
  ) => {
    const updatedAt = new Date().toISOString()
    const nextTickets = tickets.map((ticket) =>
      ticket.ticketNo === ticketNo
        ? {
            ...ticket,
            status,
            adminNote,
            handledBy: session.username,
            updatedAt,
          }
        : ticket,
    )
    saveTickets(nextTickets)
    setTickets(nextTickets)
    setSelectedTicket(null)
    setToast(`工单 ${ticketNo} 已更新为「${STATUS_META[status].label}」`)
  }

  return (
    <AppShell>
      <section className="mb-6 animate-fade-up">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-indigo-100/80 px-3 py-1 text-xs font-semibold text-indigo-700">
              管理后台
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              工单管理看板
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              查看全校报修工单，及时更新处理进度并留下处理备注。
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateDemo}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-white/80 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-5.5l-2 2m-7 7l-2 2m0-11l2 2m7 7l2 2"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            一键生成示例数据
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          aria-pressed={filter === 'all'}
          className={cn(
            'col-span-2 flex min-h-[7.2rem] flex-col justify-between rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-4 text-left text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:col-span-1',
            filter === 'all' && 'ring-2 ring-blue-300 ring-offset-2',
          )}
        >
          <div className="flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-blue-50">
              全部
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{total}</p>
            <p className="mt-0.5 text-xs text-blue-100/80">工单总数</p>
          </div>
        </button>

        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status]
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
              className={cn(
                'flex min-h-[7.2rem] flex-col justify-between rounded-2xl border border-white bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-card focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100',
                filter === status &&
                  'ring-2 ring-blue-300 ring-offset-2',
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl',
                    meta.iconClass,
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={STATUS_ICON_PATHS[status]}
                    />
                  </svg>
                </span>
                <span className={cn('h-2 w-2 rounded-full', meta.dotClass)} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {counts[status]}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{meta.label}</p>
              </div>
            </button>
          )
        })}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <div className="card animate-fade-up p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                工单状态分布
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                实时统计全部工单的处理状态
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500">
              ECharts
            </span>
          </div>
          <StatusPieChart
            pending={counts.pending}
            processing={counts.processing}
            done={counts.done}
            rejected={counts.rejected}
          />
        </div>

        <div className="card animate-fade-up p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">处理概览</h2>
              <p className="mt-0.5 text-xs text-slate-400">整体工单完成情况</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 17l5-5 4 3 6-8 3 4"
                />
              </svg>
            </span>
          </div>

          <div className="mt-6 flex items-end gap-2">
            <p className="text-4xl font-bold tracking-tight text-slate-900">
              {completionRate}
              <span className="ml-0.5 text-lg font-semibold text-slate-400">%</span>
            </p>
            <p className="mb-1.5 text-xs text-slate-400">已完成率</p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            已完成 {counts.done} 单 / 总计 {total} 单
          </p>

          <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5">
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status]
              const percentage = total
                ? Math.round((counts[status] / total) * 100)
                : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span
                        className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)}
                      />
                      {meta.label}
                    </span>
                    <span className="text-slate-400">
                      {counts[status]} 单 · {percentage}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        meta.progressClass,
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="mt-0.5 h-3.5 w-3.5 flex-none"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11v5m0-8h.01"
              />
            </svg>
            点击上方数据卡片或状态标签可快速筛选工单。
          </div>
        </div>
      </section>

      <section className="card mt-5 animate-fade-up overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">工单列表</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              当前显示 {filteredTickets.length} 条，共 {total} 条工单
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            按提交时间倒序
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
          {FILTER_OPTIONS.map((option) => {
            const active = filter === option.value
            const count =
              option.value === 'all' ? total : counts[option.value]
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100',
                  active
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600',
                )}
              >
                {option.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px]',
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              {total === 0 ? '暂无工单数据' : '该状态下暂无工单'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {total === 0
                ? '可以点击“一键生成示例数据”快速体验统计看板'
                : '切换其他状态标签查看工单'}
            </p>
            {total === 0 ? (
              <button
                type="button"
                onClick={handleGenerateDemo}
                className="btn-primary mt-5"
              >
                一键生成示例数据
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="btn-secondary mt-5"
              >
                查看全部工单
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-white text-[11px] font-medium text-slate-400">
                    <th className="px-6 py-3">工单号</th>
                    <th className="px-4 py-3">报修信息</th>
                    <th className="px-4 py-3">故障类型</th>
                    <th className="px-4 py-3">状态</th>
                    <th className="px-4 py-3">提交时间</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.ticketNo}
                      className="transition hover:bg-blue-50/20"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-500">
                          {ticket.ticketNo}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {ticket.studentName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {ticket.building} · {ticket.room}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {ticket.faultType}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDateTime(ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                        >
                          查看处理
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-3 w-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.ticketNo}
                  type="button"
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left transition hover:border-blue-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[11px] text-slate-400">
                        {ticket.ticketNo}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {ticket.studentName} · {ticket.building} {ticket.room}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {ticket.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(ticket.createdAt)}
                    </span>
                    <span className="text-xs font-medium text-blue-600">
                      查看处理
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {selectedTicket && (
        <AdminTicketModal
          key={selectedTicket.ticketNo}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSave={(status, adminNote) =>
            handleSaveTicket(selectedTicket.ticketNo, status, adminNote)
          }
        />
      )}
      <Toast message={toast} onClose={() => setToast(null)} />
    </AppShell>
  )
}

function AdminTicketModal({
  ticket,
  onClose,
  onSave,
}: {
  ticket: RepairTicket
  onClose: () => void
  onSave: (status: TicketStatus, adminNote: string) => void
}) {
  const formId = useId()
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const [adminNote, setAdminNote] = useState(ticket.adminNote)
  const [noteError, setNoteError] = useState('')

  const finalStatus = status === 'done' || status === 'rejected'
  const statusLabel = STATUS_META[status].label

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (finalStatus && !adminNote.trim()) {
      setNoteError(`标记为「${statusLabel}」时，处理备注不能为空`)
      const element = noteRef.current
      if (element) {
        element.focus({ preventScroll: true })
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    onSave(status, adminNote.trim())
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="工单详情与处理"
      subtitle={ticket.ticketNo}
      widthClass="sm:max-w-2xl"
      footer={
        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button type="submit" form={formId} className="btn-primary">
            保存处理结果
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3.5">
          <div>
            <p className="text-xs text-slate-400">当前状态</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {STATUS_META[ticket.status].description}
            </p>
          </div>
          <StatusBadge status={ticket.status} size="md" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DetailItem label="报修人" value={ticket.studentName} />
          <DetailItem label="故障类型" value={ticket.faultType} />
          <DetailItem
            label="报修位置"
            value={`${ticket.building} · ${ticket.room}`}
          />
          <DetailItem label="提交时间" value={formatDateTime(ticket.createdAt)} />
          <DetailItem label="最近更新" value={formatDateTime(ticket.updatedAt)} />
          <DetailItem label="当前处理人" value={ticket.handledBy || '暂未分配'} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">故障描述</p>
          <p className="mt-2 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm leading-6 text-slate-700">
            {ticket.description}
          </p>
        </div>

        <form
          id={formId}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 border-t border-dashed border-slate-200 pt-5"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900">处理工单</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              标记为已完成或已驳回时，必须填写处理备注。
            </p>
          </div>

          <Field id="admin-ticket-status" label="工单状态" required>
            <select
              id="admin-ticket-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as TicketStatus)
                setNoteError('')
              }}
              className="form-input"
            >
              {STATUS_ORDER.map((item) => (
                <option key={item} value={item}>
                  {STATUS_META[item].label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="admin-note"
            label="处理备注"
            required={finalStatus}
            error={noteError}
            hint={
              finalStatus
                ? '当前状态为最终状态，请填写处理结果或驳回原因。'
                : '可选填写，便于学生了解处理进度。'
            }
            right={
              <span className="text-xs text-slate-400">
                {adminNote.trim().length}/200
              </span>
            }
          >
            <textarea
              ref={noteRef}
              id="admin-note"
              rows={4}
              maxLength={200}
              value={adminNote}
              onChange={(event) => {
                setAdminNote(event.target.value)
                setNoteError('')
              }}
              aria-invalid={Boolean(noteError)}
              aria-describedby={noteError ? 'admin-note-error' : undefined}
              placeholder="请填写处理过程、结果或驳回原因..."
              className={cn(
                'form-input resize-none leading-6',
                noteError && 'form-input-error',
              )}
            />
          </Field>
        </form>
      </div>
    </Modal>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  )
}
