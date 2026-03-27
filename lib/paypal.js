const BASE = process.env.PAYPAL_ENVIRONMENT === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/** Get a short-lived OAuth access token */
async function getAccessToken() {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'PayPal auth failed');
  return data.access_token;
}

/** Create a PayPal order — returns { id, approveUrl } */
export async function createPayPalOrder({ orderId, amount, description }) {
  const token = await getAccessToken();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          description,
          amount: {
            currency_code: 'USD',
            value: Number(amount).toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Maîtrepets',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${baseUrl}/api/paypal/capture`,
        cancel_url: `${baseUrl}/cancel?reason=paypal_cancelled`,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create PayPal order');

  const approveUrl = data.links.find((l) => l.rel === 'approve')?.href;
  return { id: data.id, approveUrl };
}

/** Capture an approved PayPal order */
export async function capturePayPalOrder(paypalOrderId) {
  const token = await getAccessToken();

  const res = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Capture failed');
  return data;
}
