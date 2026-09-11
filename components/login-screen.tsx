'use client'

import { Zap, CloudSun, Loader2 } from 'lucide-react'

export function LoginScreen({
  loading,
  showDemo,
  onPiLogin,
  onDemoLogin,
}: {
  loading: boolean
  showDemo: boolean
  onPiLogin: () => void
  onDemoLogin: () => void
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-card-2 ring-1 ring-border">
          <CloudSun className="size-10 text-yellow" aria-hidden="true" />
        </div>

        <h1 className="text-3xl font-bold text-balance text-foreground">تطبيق Pi للطقس</h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          عرض حالة الطقس والميزات المتقدمة عبر Pi Network
        </p>

        <div className="mt-10 w-full">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-8 animate-spin text-blue" aria-hidden="true" />
            </div>
          ) : (
            <button
              onClick={onPiLogin}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-4 font-bold text-gold-foreground transition-transform active:scale-[0.98]"
            >
              <Zap className="size-5" aria-hidden="true" />
              تسجيل الدخول عبر Pi Network
            </button>
          )}

          {showDemo && !loading && (
            <button
              onClick={onDemoLogin}
              className="mt-4 w-full rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card-2"
            >
              الدخول بالوضع التجريبي
            </button>
          )}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          لتسجيل الدخول الحقيقي، افتح التطبيق داخل متصفح Pi Browser.
        </p>
      </div>
    </main>
  )
}
