'use client'

import { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'

export type ToastData = {
  title: string
  message: string
  variant?: 'success' | 'warning'
}

export function Toast({
  data,
  onClose,
}: {
  data: ToastData
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500)
    return () => clearTimeout(timer)
  }, [data, onClose])

  const isSuccess = data.variant !== 'warning'

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="animate-in slide-in-from-top-4 fade-in flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-card-2 p-4 shadow-2xl"
      >
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue" aria-hidden="true" />
        ) : (
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-pink" aria-hidden="true" />
        )}
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{data.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{data.message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="إغلاق"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
