import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { RepairSession, Role } from '../types'
import {
  clearSession,
  createUserId,
  getSession,
  getUsers,
  saveSession,
  saveUsers,
} from '../lib/storage'

type AuthResult =
  | { ok: true; role: Role }
  | { ok: false; message: string }

interface AuthContextValue {
  session: RepairSession | null
  login: (username: string, password: string) => AuthResult
  register: (username: string, password: string) => AuthResult
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadInitialSession(): RepairSession | null {
  const stored = getSession()
  if (!stored) return null
  const user = getUsers().find((item) => item.id === stored.userId)
  if (!user) {
    clearSession()
    return null
  }
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<RepairSession | null>(() =>
    loadInitialSession(),
  )

  const value = useMemo<AuthContextValue>(() => {
    const login = (username: string, password: string): AuthResult => {
      const normalizedName = username.trim()
      if (!normalizedName || !password) {
        return { ok: false, message: '请输入用户名和密码' }
      }

      const user = getUsers().find(
        (item) =>
          item.username.toLowerCase() === normalizedName.toLowerCase(),
      )
      if (!user || user.password !== password) {
        return { ok: false, message: '用户名或密码不正确' }
      }

      const nextSession: RepairSession = {
        userId: user.id,
        username: user.username,
        role: user.role,
      }
      saveSession(nextSession)
      setSession(nextSession)
      return { ok: true, role: user.role }
    }

    const register = (username: string, password: string): AuthResult => {
      const normalizedName = username.trim()
      const users = getUsers()
      if (
        users.some(
          (item) =>
            item.username.toLowerCase() === normalizedName.toLowerCase(),
        )
      ) {
        return { ok: false, message: '该用户名已被注册，请更换一个' }
      }

      const newUser = {
        id: createUserId(),
        username: normalizedName,
        password,
        role: 'student' as const,
        createdAt: new Date().toISOString(),
      }
      saveUsers([...users, newUser])

      const nextSession: RepairSession = {
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role,
      }
      saveSession(nextSession)
      setSession(nextSession)
      return { ok: true, role: newUser.role }
    }

    const logout = () => {
      clearSession()
      setSession(null)
    }

    return { session, login, register, logout }
  }, [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return context
}
