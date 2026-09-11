import { type NextRequest, NextResponse } from "next/server"

// Server-to-server calls to the Pi Platform API. The PI_API_KEY is secret and
// must never reach the browser, so approval and completion happen here.
const PI_API_BASE = "https://api.minepi.com/v2"

async function piFetch(path: string, body?: Record<string, unknown>) {
  const apiKey = process.env.PI_API_KEY
  if (!apiKey) {
    throw new Error("PI_API_KEY غير مضبوط في بيئة العمل")
  }

  const res = await fetch(`${PI_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) {
    throw new Error(data?.error_message || `فشل طلب Pi (${res.status})`)
  }
  return data
}

export async function POST(request: NextRequest) {
  try {
    const { action, paymentId, txid } = await request.json()

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json({ error: "paymentId مطلوب" }, { status: 400 })
    }

    if (action === "approve") {
      const data = await piFetch(`/payments/${paymentId}/approve`)
      return NextResponse.json({ ok: true, payment: data })
    }

    if (action === "complete") {
      if (!txid || typeof txid !== "string") {
        return NextResponse.json({ error: "txid مطلوب للإكمال" }, { status: 400 })
      }
      const data = await piFetch(`/payments/${paymentId}/complete`, { txid })
      return NextResponse.json({ ok: true, payment: data })
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطأ غير متوقع"
    console.log("[v0] خطأ في مسار Pi:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
