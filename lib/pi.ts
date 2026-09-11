// Pi Network SDK helpers.
// The real SDK (https://sdk.minepi.com/pi-sdk.js) only authenticates inside the
// Pi Browser. In a regular browser authentication will fail, which the UI
// handles by offering a demo fallback.

type PiUser = { uid: string; username: string }
type PiAuth = { accessToken: string; user: PiUser }

type PiPaymentCallbacks = {
  onReadyForServerApproval: (paymentId: string) => void
  onReadyForServerCompletion: (paymentId: string, txid: string) => void
  onCancel: (paymentId: string) => void
  onError: (error: Error, payment?: unknown) => void
}

type PiSDK = {
  init: (opts: { version: string; sandbox: boolean }) => void
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: unknown) => void,
  ) => Promise<PiAuth>
  createPayment: (
    payment: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: PiPaymentCallbacks,
  ) => void
}

declare global {
  interface Window {
    Pi?: PiSDK
  }
}

// Load and initialise the Pi SDK.
export function initPiSDK(): Promise<PiSDK> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('البيئة الحالية لا تدعم Window Object'))
      return
    }

    if (window.Pi) {
      window.Pi.init({ version: '2.0', sandbox: true })
      resolve(window.Pi)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.minepi.com/pi-sdk.js'
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0', sandbox: true })
        resolve(window.Pi)
      } else {
        reject(new Error('تعذر تحميل Pi SDK'))
      }
    }
    script.onerror = () => reject(new Error('خطأ في تحميل سكريبت Pi'))
    document.body.appendChild(script)
  })
}

// Reject after `ms` so a call that stalls (e.g. authenticate outside Pi Browser
// never resolves) doesn't leave the UI hanging.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('انتهت مهلة الاتصال بـ Pi')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

// Authenticate the user through Pi Network.
export async function loginWithPi(): Promise<PiUser> {
  const Pi = await initPiSDK()
  const scopes = ['username', 'payments']

  const onIncompletePaymentFound = (payment: unknown) => {
    console.log('[v0] تنبيه: توجد دفعة غير مكتملة:', payment)
  }

  const auth = await withTimeout(Pi.authenticate(scopes, onIncompletePaymentFound), 6000)
  return auth.user
}

// Ask our own server to approve/complete a payment with the secret PI_API_KEY.
async function callPiServer(
  action: 'approve' | 'complete',
  payload: { paymentId: string; txid?: string },
) {
  const res = await fetch('/api/pi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error || 'فشل الاتصال بخادم Pi')
  }
  return data
}

// Create a Pi payment (used for the premium upgrade).
export function createPiPayment(
  amount: number,
  memo: string,
): Promise<{ paymentId: string; txid: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const Pi = await initPiSDK()
      Pi.createPayment(
        { amount, memo, metadata: { type: 'premium_subscription' } },
        {
          onReadyForServerApproval: async (paymentId) => {
            try {
              await callPiServer('approve', { paymentId })
              console.log('[v0] تمت الموافقة على الدفعة من السيرفر:', paymentId)
            } catch (error) {
              reject(error as Error)
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              await callPiServer('complete', { paymentId, txid })
              resolve({ paymentId, txid })
            } catch (error) {
              reject(error as Error)
            }
          },
          onCancel: () => reject(new Error('تم إلغاء العملية')),
          onError: (error) => reject(error),
        },
      )
    } catch (error) {
      reject(error as Error)
    }
  })
}
