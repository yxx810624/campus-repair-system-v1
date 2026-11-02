import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

const FEATURES = [
  {
    title: '一键提交报修',
    description: '宿舍水电、门窗、网络问题在线登记',
  },
  {
    title: '进度实时可见',
    description: '从待处理到完成，每一步都清晰可查',
  },
  {
    title: '后勤快速响应',
    description: '管理员统一接单，处理结果及时反馈',
  },
]

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef5ff]">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 -right-32 h-[34rem] w-[34rem] rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-[1240px] items-stretch lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="relative m-4 hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-10 text-white shadow-float lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -right-8 top-24 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <BrandMark variant="light" />
              <div>
                <p className="text-base font-semibold tracking-wide">校园后勤</p>
                <p className="text-xs text-blue-100">Campus Facility Service</p>
              </div>
            </div>

            <div className="mt-20 max-w-md">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-blue-50 backdrop-blur">
                让校园生活更省心
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight">
                报修有回应，
                <br />
                服务有温度。
              </h1>
              <p className="mt-4 text-sm leading-7 text-blue-100/90">
                面向全校师生的一站式后勤报修平台，提交问题、跟踪进度、查看反馈，全部在线完成。
              </p>
            </div>
          </div>

          <div className="relative mt-14 space-y-3">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm"
              >
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/15 text-xs font-semibold ring-1 ring-inset ring-white/15">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-blue-100/80">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="relative mt-10 text-xs text-blue-100/70">
            数据仅保存在本机浏览器 · LocalStorage
          </p>
        </aside>

        <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <BrandMark />
              <div>
                <p className="text-base font-semibold text-slate-900">校园后勤报修系统</p>
                <p className="text-xs text-slate-500">报修有回应，服务有温度</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-card backdrop-blur sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                {eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </div>

            {footer && <div className="mt-5 text-center text-sm">{footer}</div>}
            <p className="mt-7 text-center text-xs text-slate-400 lg:hidden">
              数据仅保存在本机浏览器 · LocalStorage
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
