import { type NextRequest, NextResponse } from "next/server"

// Server-to-server calls to the Pi Platform API. The PI_API_KEY is secret and
// must never reach the browser, so approval and completion happen here.
const PI_API_BASE = "https://api.minepi.com/v2"

async function piFetch(path: string, body?: Record<string, unknown>) {
  const apiKey = process.env.PI_API_KEY
  if (!apiKey) {
    console.error("[Pi API Error]: PI_API_KEY غير موجود في Vercel Environment Variables")
    throw new Error("PI_API_KEY غير مضبوط في بيئة العمل")
  }

  console.log(`[Pi API Request]: إرسال طلب إلى ${PI_API_BASE}${path}`)

  const res = await fetch(`${PI_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data: any = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { rawText: text }
    }
  }

  if (!res.ok) {
    const errorDetails = data?.error_message || data?.message || text || `فشل طلب Pi (${res.status})`
    console.error(`[Pi API Error Status ${res.status}]:`, errorDetails)
    throw new Error(errorDetails)
  }

  console.log(`[Pi API Success]: تم الرد بنجاح من Pi Server`, data)
  return data
}

export async function POST(request: NextRequest) {
  try {
    const { action, paymentId, txid } = await request.json()

    console.log(`[Pi Route Incoming Action]: ${action} | PaymentID: ${paymentId}`)

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
    console.error("[v0] خطأ في مسار Pi:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
