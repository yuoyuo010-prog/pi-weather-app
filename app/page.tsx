'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handlePayment = () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      setLoading(true);
      setStatus('جاري التواصل مع محفظة Pi...');

      (window as any).Pi.createPayment(
        {
          amount: 0.1,
          memo: 'اختبار دفع تطبيق الطقس',
          metadata: { app: 'pi-weather' },
        },
        {
          onReadyForServerApproval: (paymentId: string) => {
            setStatus(`بانتظار الموافقة: ${paymentId}`);
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            setStatus('تم الدفع بنجاح! 🎉 المعاملة مكتملة.');
            setLoading(false);
          },
          onCancel: (paymentId: string) => {
            setStatus('تم إلغاء عملية الدفع.');
            setLoading(false);
          },
          onError: (error: Error) => {
            setStatus(`حدث خطأ: ${error.message}`);
            setLoading(false);
          },
        }
      );
    } else {
      setStatus('يرجى فتح التطبيق من داخل Pi Browser لتفعيل الدفع.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white dir-rtl">
      <div className="w-full max-w-md p-6 bg-slate-800 rounded-2xl shadow-xl text-center border border-slate-700">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">🌤️ تطبيق Pi للطقس</h1>
        <p className="text-slate-400 text-sm mb-6">عرض حالة الطقس المباشرة والخدمات المتقدمة</p>

        <div className="bg-slate-950 p-6 rounded-xl mb-6 border border-slate-800">
          <h2 className="text-xl font-semibold text-slate-200">القدس</h2>
          <div className="text-5xl font-extrabold text-sky-400 my-3">24°C</div>
          <p className="text-emerald-400 text-sm">☀️ أجواء مشمسة ومستقرة</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-slate-950 font-bold rounded-xl transition duration-200 cursor-pointer text-base shadow-md"
        >
          {loading ? 'جاري المعالجة...' : '⚡ تجربة الدفع (0.1 Pi)'}
        </button>

        {status && (
          <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-amber-300">
            {status}
          </div>
        )}
      </div>
    </main>
  );
}
