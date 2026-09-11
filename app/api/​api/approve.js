export default async function handler(req, res) {
  // استقبال paymentId من الواجهة الأمامية
  const { paymentId } = req.body;
  const PI_API_KEY = "ضغ_مفتاح_API_KEY_الخاص_بك_هنا";

  try {
    // إرسال طلب لـ Pi Network للموافقة على المعاملة
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
