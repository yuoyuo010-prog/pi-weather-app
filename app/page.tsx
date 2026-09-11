'use client'

import { useState } from 'react'
import { LoginScreen } from '@/components/login-screen'
import { HomeScreen } from '@/components/home-screen'
import { Toast, type ToastData } from '@/components/toast'
import { loginWithPi, createPiPayment } from '@/lib/pi'

type AppUser = { username: string; isPremium: boolean; demo: boolean }

export default function Page() {
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [user, setUser] = useState<AppUser | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)

  const handlePiLogin = async () => {
    setLoading(true)
    try {
      const piUser = await loginWithPi()
      setUser({ username: piUser.username, isPremium: false, demo: false })
      setToast({ title: 'تم بنجاح', message: `مرحباً بك ${piUser.username}!` })
    } catch {
      setShowDemo(true)
      setToast({
        variant: 'warning',
        title: 'تنبيه',
        message: 'تأكد من فتح التطبيق داخل متصفح Pi Browser لتسجيل الدخول.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setUser({ username: 'ضيف', isPremium: false, demo: true })
    setToast({ title: 'الوضع التجريبي', message: 'مرحباً بك في الوضع التجريبي!' })
  }

  const handleUpgradePayment = async () => {
    if (!user) return
    setUpgrading(true)
    try {
      if (user.demo) {
        // في الوضع التجريبي نحاكي عملية دفع ناجحة.
        await new Promise((r) => setTimeout(r, 1200))
      } else {
        await createPiPayment(1.0, 'اشتراك مميز في تطبيق Pi للطقس')
      }
      setUser((prev) => (prev ? { ...prev, isPremium: true } : prev))
      setToast({
        title: 'تهانينا!',
        message: 'تمت عملية الدفع بـ 1 Pi وتم تفعيل الميزات المدفوعة بنجاح.',
      })
    } catch {
      setToast({ variant: 'warning', title: 'خطأ', message: 'لم تكتمل عملية الدفع.' })
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <>
      {toast && <Toast data={toast} onClose={() => setToast(null)} />}
      {user ? (
        <HomeScreen
          user={user}
          upgrading={upgrading}
          onLogout={() => {
            setUser(null)
            setShowDemo(false)
          }}
          onUpgrade={handleUpgradePayment}
        />
      ) : (
        <LoginScreen
          loading={loading}
          showDemo={showDemo}
          onPiLogin={handlePiLogin}
          onDemoLogin={handleDemoLogin}
        />
      )}
    </>
  )
}
