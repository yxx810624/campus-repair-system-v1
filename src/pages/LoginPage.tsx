import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Field } from '../components/Field'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../lib/constants'
import { cn } from '../lib/utils'

type LoginField = 'username' | 'password'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<LoginField, string>>>({})
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const updateField = (field: LoginField, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setFormError('')
  }

  const fillDemo = (username: string, password: string) => {
    setForm({ username, password })
    setErrors({})
    setFormError('')
  }

  const focusField = (field: LoginField) => {
    const element =
      field === 'username' ? usernameRef.current : passwordRef.current
    if (!element) return
    element.focus({ preventScroll: true })
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Partial<Record<LoginField, string>> = {}
    if (!form.username.trim()) nextErrors.username = '请输入用户名'
    if (!form.password) nextErrors.password = '请输入密码'
    setErrors(nextErrors)

    const firstInvalid = (['username', 'password'] as LoginField[]).find(
      (field) => nextErrors[field],
    )
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    const result = login(form.username, form.password)
    if (!result.ok) {
      setFormError(result.message)
      focusField('password')
      return
    }

    navigate(ROLE_HOME[result.role], { replace: true })
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="登录报修平台"
      subtitle="使用校园账号登录，快速提交并跟踪你的报修工单。"
      footer={
        <span className="text-slate-500">
          还没有账号？
          <Link
            to="/register"
            className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
          >
            立即注册
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field
          id="login-username"
          label="用户名"
          required
          error={errors.username}
        >
          <input
            ref={usernameRef}
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="请输入用户名"
            value={form.username}
            onChange={(event) => updateField('username', event.target.value)}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'login-username-error' : undefined}
            className={cn('form-input', errors.username && 'form-input-error')}
          />
        </Field>

        <Field id="login-password" label="密码" required error={errors.password}>
          <div className="relative">
            <input
              ref={passwordRef}
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="请输入密码"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
              className={cn(
                'form-input pr-12',
                errors.password && 'form-input-error',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 5.2A10.6 10.6 0 0112 5c5 0 9 4.5 9 7 0 .8-.6 2-1.7 3.2M6.2 6.5C4.2 8 3 10.1 3 12c0 2.5 4 7 9 7 1.2 0 2.4-.3 3.4-.7"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12c0-2.5 4-7 9-7s9 4.5 9 7-4 7-9 7-9-4.5-9-7z"
                  />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              )}
            </button>
          </div>
        </Field>

        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
          >
            {formError}
          </p>
        )}

        <button type="submit" className="btn-primary mt-2 w-full">
          登录
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
              d="M5 12h14M13 6l6 6-6 6"
            />
          </svg>
        </button>
      </form>

      <div className="mt-6 border-t border-dashed border-slate-200 pt-5">
        <p className="text-center text-xs text-slate-400">演示账号 · 点击自动填充</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => fillDemo('student', 'student123')}
            className="group rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50"
          >
            <span className="block text-xs font-semibold text-blue-700">学生账号</span>
            <span className="mt-0.5 block text-[11px] text-blue-500/80">
              student / student123
            </span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('admin', 'admin123')}
            className="group rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <span className="block text-xs font-semibold text-indigo-700">管理员账号</span>
            <span className="mt-0.5 block text-[11px] text-indigo-500/80">
              admin / admin123
            </span>
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
