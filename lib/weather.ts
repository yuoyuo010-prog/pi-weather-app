export type Weather = {
  city: string
  temp: string
  feelsLike: string
  condition: string
  windSpeed: string
  uvIndex: string
  humidity: string
}

// A few demo conditions so different cities feel distinct without a live API key.
const DEMO_CONDITIONS = [
  { condition: 'مشمس جزئياً', temp: 26, feelsLike: 28, wind: 14, humidity: 45, uv: '6 (متوسط)' },
  { condition: 'صافٍ', temp: 31, feelsLike: 34, wind: 9, humidity: 30, uv: '8 (مرتفع)' },
  { condition: 'غائم', temp: 21, feelsLike: 20, wind: 18, humidity: 62, uv: '3 (منخفض)' },
  { condition: 'ممطر خفيف', temp: 17, feelsLike: 15, wind: 22, humidity: 78, uv: '2 (منخفض)' },
]

// Stable pseudo-random pick based on the city name so results don't flicker.
function pickForCity(city: string) {
  let hash = 0
  for (let i = 0; i < city.length; i++) hash = (hash * 31 + city.charCodeAt(i)) >>> 0
  return DEMO_CONDITIONS[hash % DEMO_CONDITIONS.length]
}

// Mirrors the original app: uses OpenWeatherMap when a key is set, otherwise
// returns representative demo data so the UI is fully explorable.
export async function fetchWeatherData(city: string): Promise<Weather | null> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY

  if (!apiKey) {
    // Simulate a short network delay for a realistic loading state.
    await new Promise((r) => setTimeout(r, 500))
    const target = city?.trim() || 'الرياض'
    const d = pickForCity(target)
    return {
      city: target,
      temp: String(d.temp),
      feelsLike: String(d.feelsLike),
      condition: d.condition,
      windSpeed: String(d.wind),
      uvIndex: d.uv,
      humidity: `${d.humidity}%`,
    }
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city,
    )}&units=metric&lang=ar&appid=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (response.ok) {
      return {
        city: data.name,
        temp: Math.round(data.main.temp).toString(),
        feelsLike: Math.round(data.main.feels_like).toString(),
        condition: data.weather[0].description,
        windSpeed: data.wind.speed.toString(),
        uvIndex: 'العادي',
        humidity: `${data.main.humidity}%`,
      }
    }
  } catch (error) {
    console.error('[v0] خطأ في جلب بيانات الطقس:', error)
  }
  return null
}
