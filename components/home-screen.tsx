'use client'

import { useEffect, useState } from 'react'
import {
  User,
  Search,
  Wind,
  Droplets,
  ThermometerSun,
  Sparkles,
  Lock,
  Sun,
  Loader2,
} from 'lucide-react'
import { fetchWeatherData, type Weather } from '@/lib/weather'

type AppUser = { username: string; isPremium: boolean }

export function HomeScreen({
  user,
  upgrading,
  onLogout,
  onUpgrade,
}: {
  user: AppUser
  upgrading: boolean
  onLogout: () => void
  onUpgrade: () => void
}) {
  const [cityInput, setCityInput] = useState('الرياض')
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(false)

  const loadWeather = async (targetCity: string) => {
    setLoading(true)
    const data = await fetchWeatherData(targetCity)
    if (data) setWeather(data)
    setLoading(false)
  }

  useEffect(() => {
    loadWeather('الرياض')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 py-8">
      {/* شريط معلومات المستخدم */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-card-2">
            <User className="size-5 text-foreground" aria-hidden="true" />
          </div>
          <span className="font-bold text-foreground">{user.username}</span>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg bg-pink px-3 py-1.5 text-xs font-bold text-gold-foreground transition-transform active:scale-95"
        >
          خروج
        </button>
      </div>

      {/* البحث عن المدينة */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          loadWeather(cityInput)
        }}
        className="mt-6 flex gap-2.5"
      >
        <input
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="أدخل اسم المدينة..."
          className="min-w-0 flex-1 rounded-xl bg-input px-4 py-3 text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue"
          aria-label="اسم المدينة"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-xl bg-blue px-5 font-bold text-gold-foreground transition-transform active:scale-95"
        >
          <Search className="size-4" aria-hidden="true" />
          بحث
        </button>
      </form>

      {/* كارت الطقس الرئيسي */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-9 animate-spin text-blue" aria-hidden="true" />
        </div>
      ) : weather ? (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-end gap-2">
            <h2 className="text-2xl font-bold text-yellow">{weather.city}</h2>
            <Sun className="size-6 text-yellow" aria-hidden="true" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-6xl font-bold tabular-nums text-foreground">
              {weather.temp}°
            </span>
            <span className="text-lg text-muted-foreground">{weather.condition}</span>
          </div>

          <div className="mt-6 space-y-3 border-t border-border-soft pt-5">
            <Detail
              icon={<ThermometerSun className="size-4 text-muted-foreground" aria-hidden="true" />}
              label="درجة الحرارة الملموسة"
              value={`${weather.feelsLike}°C`}
            />
            <Detail
              icon={<Wind className="size-4 text-muted-foreground" aria-hidden="true" />}
              label="سرعة الرياح"
              value={`${weather.windSpeed} كم/س`}
            />
            <Detail
              icon={<Droplets className="size-4 text-muted-foreground" aria-hidden="true" />}
              label="الرطوبة"
              value={weather.humidity}
            />
          </div>

          {/* الميزات المدفوعة */}
          {user.isPremium ? (
            <div className="mt-5 rounded-2xl border border-yellow/60 bg-card-2 p-4">
              <div className="flex items-center justify-end gap-2">
                <h3 className="font-bold text-yellow">ميزات الحساب المدفوع فعّالة</h3>
                <Sparkles className="size-4 text-yellow" aria-hidden="true" />
              </div>
              <ul className="mt-2 space-y-1.5 text-right text-sm text-foreground">
                <li>مؤشر الأشعة فوق البنفسجية (UV): {weather.uvIndex}</li>
                <li>التحديث التلقائي للويدجت كل 15 دقيقة</li>
              </ul>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-2xl bg-card-inner p-4 text-center">
              <div className="flex items-center gap-2 text-pink">
                <Lock className="size-4" aria-hidden="true" />
                <p className="text-sm">ترقية الحساب لعرض تفاصيل التلوث والأشعة فوق البنفسجية</p>
              </div>
              <button
                onClick={onUpgrade}
                disabled={upgrading}
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-gold-foreground transition-transform active:scale-95 disabled:opacity-70"
              >
                {upgrading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {upgrading ? 'جارٍ الدفع...' : 'اشترك بـ 1 Pi فقط'}
              </button>
            </div>
          )}
        </section>
      ) : null}
    </main>
  )
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}
