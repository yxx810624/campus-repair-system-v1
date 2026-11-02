import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Field } from '../components/Field'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

type RegisterField = 'username' | 'password' | 'confirmPassword'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<RegisterField, string>>
  >({})
  const [formError, setFormError] = useState('')

  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const updateField = (field: RegisterField, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setFormError('')
  }

  const focusField = (field: RegisterField) => {
    const element =
      field === 'username'
        ? usernameRef.current
        : field === 'password'
          ? passwordRef.current
          : confirmRef.current
    if (!element) return
    element.focus({ preventScroll: true })
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Partial<Record<RegisterField, string>> = {}
    const username = form.username.trim()

    if (!username) {
      nextErrors.username = '请输入用户名'
    } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/.test(username)) {
      nextErrors.username = '用户名为 2-20 位中文、字母、数字或下划线'
    }

    if (!form.password) {
      nextErrors.password = '请输入密码'
    } else if (form.password.length < 6 || form.password.length > 20) {
      nextErrors.password = '密码长度需为 6-20 位'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = '请再次输入密码'
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(nextErrors)
    const order: RegisterField[] = ['username', 'password', 'confirmPassword']
    const firstInvalid = order.find((field) => nextErrors[field])
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    const result = register(username, form.password)
    if (!result.ok) {
      setFormError(result.message)
      focusField('username')
      return
    }

    navigate('/student', { replace: true })
  }

  return (
    <AuthLayout
      eyebrow="Create account"
      title="注册学生账号"
      subtitle="创建账号后即可在线提交报修，并随时查看处理进度。"
      footer={
        <span className="text-slate-500">
          已有账号？
          <Link
            to="/login"
            className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
          >
            返回登录
          </Link>
        </span>
      }
    >
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3 text-xs leading-5 text-blue-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="mt-0.5 h-4 w-4 flex-none"
        >
          <circle cx="12" cy="12" r="9" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 11v5m0-8h.01"
          />
        </svg>
        新注册账号默认为学生身份，管理员账号由系统预置。
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field
          id="register-username"
          label="用户名"
          required
          hint="2-20 位中文、字母、数字或下划线"
          error={errors.username}
        >
          <input
            ref={usernameRef}
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="请设置用户名"
            value={form.username}
            onChange={(event) => updateField('username', event.target.value)}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={
              errors.username ? 'register-username-error' : undefined
            }
            className={cn(
              'form-input',
              errors.username && 'form-input-error',
            )}
          />
        </Field>

        <Field
          id="register-password"
          label="密码"
          required
          hint="6-20 位字符"
          error={errors.password}
        >
          <input
            ref={passwordRef}
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="请设置密码"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'register-password-error' : undefined
            }
            className={cn(
              'form-input',
              errors.password && 'form-input-error',
            )}
          />
        </Field>

        <Field
          id="register-confirm"
          label="确认密码"
          required
          error={errors.confirmPassword}
        >
          <input
            ref={confirmRef}
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="请再次输入密码"
            value={form.confirmPassword}
            onChange={(event) =>
              updateField('confirmPassword', event.target.value)
            }
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? 'register-confirm-error' : undefined
            }
            className={cn(
              'form-input',
              errors.confirmPassword && 'form-input-error',
            )}
          />
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
          注册并进入系统
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
    </AuthLayout>
  )
}
