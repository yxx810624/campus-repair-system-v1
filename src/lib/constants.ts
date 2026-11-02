import type { Role, TicketStatus } from '../types'

export const STORAGE_KEYS = {
  users: 'repair_users',
  tickets: 'repair_tickets',
  session: 'repair_session',
} as const

export const BUILDINGS = ['沁园1栋', '沁园2栋', '沁园3栋']

export const FAULT_TYPES = ['水电', '门窗', '网络', '家具', '空调', '其他']

export const STATUS_ORDER: TicketStatus[] = [
  'pending',
  'processing',
  'done',
  'rejected',
]

export const STATUS_META: Record<
  TicketStatus,
  {
    label: string
    description: string
    badgeClass: string
    dotClass: string
    iconClass: string
    progressClass: string
    color: string
  }
> = {
  pending: {
    label: '待处理',
    description: '等待后勤人员接单',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200',
    dotClass: 'bg-amber-500',
    iconClass: 'bg-amber-50 text-amber-600',
    progressClass: 'bg-amber-400',
    color: '#f59e0b',
  },
  processing: {
    label: '处理中',
    description: '后勤人员正在跟进',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-200',
    dotClass: 'bg-blue-500',
    iconClass: 'bg-blue-50 text-blue-600',
    progressClass: 'bg-blue-500',
    color: '#3b82f6',
  },
  done: {
    label: '已完成',
    description: '报修事项已经处理完毕',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dotClass: 'bg-emerald-500',
    iconClass: 'bg-emerald-50 text-emerald-600',
    progressClass: 'bg-emerald-500',
    color: '#10b981',
  },
  rejected: {
    label: '已驳回',
    description: '工单未通过或无需处理',
    badgeClass: 'bg-rose-50 text-rose-700 ring-rose-200',
    dotClass: 'bg-rose-500',
    iconClass: 'bg-rose-50 text-rose-600',
    progressClass: 'bg-rose-500',
    color: '#ef4444',
  },
}

export const ROLE_LABEL: Record<Role, string> = {
  student: '学生',
  admin: '管理员',
}

export const ROLE_HOME: Record<Role, string> = {
  student: '/student',
  admin: '/admin',
}
