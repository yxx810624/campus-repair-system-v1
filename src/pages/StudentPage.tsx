import { useRef, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import { Toast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { BUILDINGS, FAULT_TYPES, STATUS_META } from '../lib/constants'
import { getTickets, saveTickets } from '../lib/storage'
import { generateTicketNo } from '../lib/tickets'
import {
  cn,
  formatDateTime,
  sortByCreatedAtDesc,
} from '../lib/utils'
import type { RepairTicket } from '../types'

type RepairField = 'building' | 'room' | 'faultType' | 'description'

const EMPTY_FORM = {
  building: '',
  room: '',
  faultType: '',
  description: '',
}

const FIELD_ORDER: RepairField[] = [
  'building',
  'room',
  'faultType',
  'description',
]

export function StudentPage() {
  const { session } = useAuth()
  const [tickets, setTickets] = useState<RepairTicket[]>(() =>
    session
      ? sortByCreatedAtDesc(
          getTickets().filter((ticket) => ticket.studentId === session.userId),
        )
      : [],
  )
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<
    Partial<Record<RepairField, string>>
  >({})
  const [submitError, setSubmitError] = useState('')
  const [successTicketNo, setSuccessTicketNo] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(
    null,
  )
  const [toast, setToast] = useState<string | null>(null)

  const buildingRef = useRef<HTMLSelectElement>(null)
  const roomRef = useRef<HTMLInputElement>(null)
  const faultTypeRef = useRef<HTMLSelectElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  if (!session) return null

  const myTickets = tickets
  const activeCount = myTickets.filter(
    (ticket) =>
      ticket.status === 'pending' || ticket.status === 'processing',
  ).length

  const updateField = (field: RepairField, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setSubmitError('')
  }

  const focusField = (field: RepairField) => {
    const refs: Record<RepairField, React.RefObject<HTMLElement>> = {
      building: buildingRef,
      room: roomRef,
      faultType: faultTypeRef,
      description: descriptionRef,
    }
    const element = refs[field].current
    if (!element) return
    element.focus({ preventScroll: true })
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Partial<Record<RepairField, string>> = {}
    const room = form.room.trim()
    const description = form.description.trim()

    if (!form.building) nextErrors.building = '请选择宿舍楼'
    if (!room) {
      nextErrors.room = '请输入房间号'
    } else if (room.length > 20) {
      nextErrors.room = '房间号不能超过 20 个字符'
    }
    if (!form.faultType) nextErrors.faultType = '请选择故障类型'
    if (description.length < 10) {
      nextErrors.description = '故障描述至少需要 10 个字'
    } else if (description.length > 200) {
      nextErrors.description = '故障描述不能超过 200 个字'
    }

    setErrors(nextErrors)
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    try {
      const allTickets = getTickets()
      const createdAt = new Date().toISOString()
      const ticket: RepairTicket = {
        ticketNo: generateTicketNo(createdAt, allTickets),
        studentId: session.userId,
        studentName: session.username,
        building: form.building,
        room,
        faultType: form.faultType,
        description,
        status: 'pending',
        adminNote: '',
        handledBy: '',
        createdAt,
        updatedAt: createdAt,
      }

      const nextAllTickets = [ticket, ...allTickets]
      saveTickets(nextAllTickets)
      setTickets(
        sortByCreatedAtDesc(
          nextAllTickets.filter(
            (item) => item.studentId === session.userId,
          ),
        ),
      )
      setForm(EMPTY_FORM)
      setErrors({})
      setSuccessTicketNo(ticket.ticketNo)
      setToast('报修提交成功，工单已生成')
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '工单生成失败，请稍后重试',
      )
    }
  }

  return (
    <AppShell>
      <section className="mb-6 animate-fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-blue-700">
              学生服务
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              你好，{session.username}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              宿舍设施出现问题？填写下方报修单，后勤人员会尽快处理。
            </p>
          </div>

          <div className="flex gap-2">
            <div className="min-w-[7.5rem] rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs text-slate-400">我的工单</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {myTickets.length}
                <span className="ml-1 text-xs font-normal text-slate-400">单</span>
              </p>
            </div>
            <div className="min-w-[7.5rem] rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs text-slate-400">处理中（含待处理）</p>
              <p className="mt-1 text-xl font-bold text-blue-600">
                {activeCount}
                <span className="ml-1 text-xs font-normal text-slate-400">单</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="card animate-fade-up p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">提交报修</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                带 <span className="text-rose-500">*</span> 的项目为必填项
              </p>
            </div>
          </div>

          {successTicketNo && (
            <div
              role="status"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 flex-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="min-w-0">
                <p className="font-medium">报修提交成功</p>
                <p className="mt-0.5 text-xs text-emerald-600">
                  工单号：<span className="font-mono font-semibold">{successTicketNo}</span>
                  ，可在右侧查看进度。
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="repair-building"
                label="宿舍楼"
                required
                error={errors.building}
              >
                <select
                  ref={buildingRef}
                  id="repair-building"
                  value={form.building}
                  onChange={(event) =>
                    updateField('building', event.target.value)
                  }
                  aria-invalid={Boolean(errors.building)}
                  aria-describedby={
                    errors.building ? 'repair-building-error' : undefined
                  }
                  className={cn(
                    'form-input',
                    errors.building && 'form-input-error',
                  )}
                >
                  <option value="">请选择宿舍楼</option>
                  {BUILDINGS.map((building) => (
                    <option key={building} value={building}>
                      {building}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="repair-room"
                label="房间号"
                required
                error={errors.room}
              >
                <input
                  ref={roomRef}
                  id="repair-room"
                  type="text"
                  placeholder="如：302 / B512"
                  value={form.room}
                  maxLength={20}
                  onChange={(event) => updateField('room', event.target.value)}
                  aria-invalid={Boolean(errors.room)}
                  aria-describedby={
                    errors.room ? 'repair-room-error' : undefined
                  }
                  className={cn('form-input', errors.room && 'form-input-error')}
                />
              </Field>
            </div>

            <Field
              id="repair-type"
              label="故障类型"
              required
              error={errors.faultType}
            >
              <select
                ref={faultTypeRef}
                id="repair-type"
                value={form.faultType}
                onChange={(event) =>
                  updateField('faultType', event.target.value)
                }
                aria-invalid={Boolean(errors.faultType)}
                aria-describedby={
                  errors.faultType ? 'repair-type-error' : undefined
                }
                className={cn(
                  'form-input',
                  errors.faultType && 'form-input-error',
                )}
              >
                <option value="">请选择故障类型</option>
                {FAULT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="repair-description"
              label="故障描述"
              required
              error={errors.description}
              right={
                <span
                  className={cn(
                    'text-xs',
                    form.description.trim().length > 0 &&
                      form.description.trim().length < 10
                      ? 'text-rose-500'
                      : 'text-slate-400',
                  )}
                >
                  {form.description.trim().length}/200
                </span>
              }
            >
              <textarea
                ref={descriptionRef}
                id="repair-description"
                rows={4}
                maxLength={200}
                placeholder="请描述故障的具体位置和现象（至少 10 个字），便于维修人员准备工具。"
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? 'repair-description-error'
                    : undefined
                }
                className={cn(
                  'form-input resize-none leading-6',
                  errors.description && 'form-input-error',
                )}
              />
            </Field>

            {submitError && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
              >
                {submitError}
              </p>
            )}

            <button type="submit" className="btn-primary w-full">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5v14M5 12h14"
                />
              </svg>
              提交报修
            </button>
            <p className="text-center text-xs text-slate-400">
              工单号将按 BX + 日期 + 流水号自动生成
            </p>
          </form>
        </section>

        <section className="card animate-fade-up p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">我的工单</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                点击任意工单查看处理详情与管理员备注
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              共 {myTickets.length} 单
            </span>
          </div>

          {myTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-400">
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
                还没有报修记录
              </p>
              <p className="mt-1 text-xs text-slate-400">
                提交第一张报修单后，这里会显示处理进度
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {myTickets.map((ticket) => (
                <button
                  key={ticket.ticketNo}
                  type="button"
                  onClick={() => setSelectedTicket(ticket)}
                  className="group w-full rounded-2xl border border-slate-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[11px] font-medium tracking-wide text-slate-400">
                        {ticket.ticketNo}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-slate-800">
                        {ticket.faultType}报修
                      </h3>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-3.5 w-3.5 text-slate-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11z"
                      />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {ticket.building} · {ticket.room}
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {ticket.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(ticket.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                      查看详情
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <StudentTicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
      <Toast message={toast} onClose={() => setToast(null)} />
    </AppShell>
  )
}

function StudentTicketModal({
  ticket,
  onClose,
}: {
  ticket: RepairTicket | null
  onClose: () => void
}) {
  const note = ticket?.adminNote.trim()

  return (
    <Modal
      open={Boolean(ticket)}
      onClose={onClose}
      title="工单详情"
      subtitle={ticket?.ticketNo}
      footer={
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            关闭
          </button>
        </div>
      }
    >
      {ticket && (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5">
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
            <DetailItem
              label="处理人"
              value={ticket.handledBy || '暂未分配'}
            />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">故障描述</p>
            <p className="mt-2 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm leading-6 text-slate-700">
              {ticket.description}
            </p>
          </div>

          <div
            className={cn(
              'rounded-2xl border px-4 py-3.5',
              note
                ? ticket.status === 'rejected'
                  ? 'border-rose-100 bg-rose-50/70'
                  : 'border-blue-100 bg-blue-50/60'
                : 'border-slate-100 bg-slate-50/70',
            )}
          >
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={cn(
                  'h-4 w-4',
                  note
                    ? ticket.status === 'rejected'
                      ? 'text-rose-500'
                      : 'text-blue-500'
                    : 'text-slate-400',
                )}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h8M8 14h5M21 12a9 9 0 11-3.5-7.1L21 3v9z"
                />
              </svg>
              <p className="text-xs font-semibold text-slate-600">管理员备注</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {note || '管理员尚未留下处理备注，请耐心等待。'}
            </p>
          </div>
        </div>
      )}
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
