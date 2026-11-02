import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME, ROLE_LABEL } from '../lib/constants'
import { cn } from '../lib/utils'
import { BrandMark } from './BrandMark'

export function AppShell({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  if (!session) return null

  const home = ROLE_HOME[session.role]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-bg min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to={home}
            className="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <BrandMark className="h-10 w-10 rounded-xl" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                校园后勤报修系统
              </p>
              <p className="hidden text-[11px] tracking-wide text-slate-400 sm:block">
                Campus Facility Service
              </p>
            </div>
            <span
              className={cn(
                'ml-1 hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex',
                session.role === 'admin'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-blue-50 text-blue-600',
              )}
            >
              {session.role === 'admin' ? '管理端' : '学生端'}
            </span>
          </Link>

          <div className="flex flex-none items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white py-1 pl-1 pr-2 shadow-sm sm:gap-2.5 sm:pr-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                  session.role === 'admin'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-blue-100 text-blue-700',
                )}
              >
                {session.username.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-700 sm:block">
                {session.username}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {ROLE_LABEL[session.role]}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:text-sm"
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
                  d="M15.7 16.2L20 12l-4.3-4.2M20 12H9M12 4H5.8A1.8 1.8 0 004 5.8v12.4A1.8 1.8 0 005.8 20H12"
                />
              </svg>
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-slate-200/60 bg-white/30 py-5 text-center text-xs text-slate-400">
        校园后勤服务中心 · 所有数据仅保存在当前浏览器
      </footer>
    </div>
  )
}
