import type { RepairSession, RepairTicket, RepairUser } from '../types'
import { STORAGE_KEYS } from './constants'

const SEED_USERS: RepairUser[] = [
  {
    id: 'demo-admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-student',
    username: 'student',
    password: 'student123',
    role: 'student',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function ensureSeedUsers() {
  const users = getUsers()
  if (users.length === 0) {
    writeJson(STORAGE_KEYS.users, SEED_USERS)
  }
}

export function getUsers(): RepairUser[] {
  const users = readJson<RepairUser[]>(STORAGE_KEYS.users, [])
  return Array.isArray(users) ? users : []
}

export function saveUsers(users: RepairUser[]) {
  writeJson(STORAGE_KEYS.users, users)
}

export function getTickets(): RepairTicket[] {
  const tickets = readJson<RepairTicket[]>(STORAGE_KEYS.tickets, [])
  return Array.isArray(tickets) ? tickets : []
}

export function saveTickets(tickets: RepairTicket[]) {
  writeJson(STORAGE_KEYS.tickets, tickets)
}

export function getSession(): RepairSession | null {
  const session = readJson<RepairSession | null>(STORAGE_KEYS.session, null)
  if (!session || !session.userId || !session.username || !session.role) return null
  return session
}

export function saveSession(session: RepairSession) {
  writeJson(STORAGE_KEYS.session, session)
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEYS.session)
}

export function createUserId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
