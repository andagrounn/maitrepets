import { prisma } from '@/lib/prisma';

// Switch to hello@maitrepets.com once domain is verified in Resend dashboard
const FROM = process.env.EMAIL_FROM || 'Maîtrepets <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html, orderId = null }) {
 const apiKey = process.env.RESEND_API_KEY;

 if (apiKey) {
 const res = await fetch('https://api.resend.com/emails', {
 method: 'POST',
 headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
 body: JSON.stringify({ from: FROM, to: [to], subject, html, reply_to: 'hello@maitrepets.com' }),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) throw new Error(data.message || 'Email delivery failed');

 await prisma.email.create({
 data: { direction: 'sent', from: FROM, to, subject, body: html, orderId, resendId: data.id || null },
 });
 return data.id;
 } else {
 // Dev fallback
 console.log('── [email dev] ───────────────────────────');
 console.log(`TO: ${to}\nSUBJECT: ${subject}`);
 console.log(html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
 console.log('──────────────────────────────────────────');

 await prisma.email.create({
 data: { direction: 'sent', from: FROM, to, subject, body: html, orderId, resendId: 'dev-' + Date.now() },
 });
 return null;
 }
}

// ─── Order confirmation template ──────────────────────────────────────────────
export function orderConfirmationEmail(order) {
 const product = (order.productType || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
 const orderId = '#' + order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
 const address = [
 order.shippingAddress,
 order.shippingAddress2,
 order.shippingCity && `${order.shippingCity}, ${order.shippingState || ''} ${order.shippingZip || ''}`.trim(),
 order.shippingCountry,
 ].filter(Boolean).join('<br>');

 const generatedUrl = order.image?.generatedUrl || order.generatedUrl || null;
 // Short 8-char hex hash derived from imageId (like a git short hash)
 const imageHash = order.imageId
 ? order.imageId.replace(/-/g, '').slice(0, 8).toUpperCase()
 : generatedUrl
 ? generatedUrl.split('/').pop().replace(/\.[^.]+$/, '').replace(/[^a-f0-9]/gi, '').slice(0, 8).toUpperCase()
 : null;

 const subject = `Your Maîtrepets order is confirmed! `;

 const html = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width,initial-scale=1">
 <meta name="color-scheme" content="dark">
 <meta name="supported-color-schemes" content="dark">
 <title>Order Confirmed</title>
 <style>
 :root { color-scheme: dark; }
 body { background:#0d0b14 !important; color:#ffffff !important; }
 @media (prefers-color-scheme: light) {
 body { background:#0d0b14 !important; }
 table { background:#0d0b14 !important; }
 }
 </style>
</head>
<body style="margin:0;padding:0;background:#0d0b14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b14;padding:40px 16px">
 <tr><td align="center">
 <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

 <!-- Header -->
 <tr><td style="background:linear-gradient(135deg,#4f1d96 0%,#7c3aed 45%,#db2777 100%);border-radius:16px 16px 0 0;padding:36px 36px 32px;text-align:center">
 <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0 0 4px;letter-spacing:-0.5px">Maîtrepets</h1>
 <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;letter-spacing:.03em">Your masterpiece is in production</p>
 </td></tr>

 <!-- Confirmed banner -->
 <tr><td style="background:#1a1028;padding:28px 36px 0;text-align:center;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <div style="display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.35);border-radius:100px;padding:6px 16px;margin-bottom:20px">
 <span style="color:#a78bfa;font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase"> Order Confirmed</span>
 </div>
 <h2 style="color:#f5f3ff;font-size:22px;font-weight:800;margin:0 0 10px">Thank you for your order!</h2>
 <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px">We're turning your pet into a timeless work of art. Your portrait will be printed on premium artist-grade stretched canvas, professionally framed, and shipped within <strong style="color:#c4b5fd">3–7 business days</strong>.</p>
 </td></tr>

 <!-- Generated portrait -->
 <tr><td style="background:#1a1028;padding:0 36px 24px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#120d22;border:1px solid rgba(124,58,237,0.2);border-radius:12px;overflow:hidden">
 <tr><td style="padding:14px 20px 12px;border-bottom:1px solid rgba(124,58,237,0.15)">
 <span style="color:#7c3aed;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase"> Your Portrait</span>
 </td></tr>
 <tr><td style="padding:20px 24px">
 <table width="100%" cellpadding="0" cellspacing="0">
 <tr>
 ${generatedUrl ? `
 <td width="88" valign="top">
 <div style="width:80px;height:80px;border-radius:10px;overflow:hidden;border:2px solid rgba(124,58,237,0.45);box-shadow:0 0 16px rgba(124,58,237,0.25)">
 <img src="${generatedUrl}" alt="Your portrait" width="80" height="80" style="width:80px;height:80px;object-fit:cover;display:block" />
 </div>
 </td>
 ` : ''}
 <td valign="middle" style="padding-left:${generatedUrl ? '16' : '0'}px">
 <p style="color:rgba(255,255,255,0.9);font-size:14px;font-weight:700;margin:0 0 4px">Your AI Portrait</p>
 <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 10px">Ready for print production</p>
 ${imageHash ? `
 <div style="display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);border-radius:6px;padding:4px 10px">
 <span style="color:#a78bfa;font-size:10px;font-family:monospace;letter-spacing:.08em;font-weight:600">#${imageHash}</span>
 </div>
 ` : ''}
 </td>
 </tr>
 </table>
 </td></tr>
 </table>
 </td></tr>

 <!-- Order summary -->
 <tr><td style="background:#1a1028;padding:0 36px 24px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#120d22;border:1px solid rgba(124,58,237,0.2);border-radius:12px;overflow:hidden">
 <tr><td style="padding:16px 20px 12px;border-bottom:1px solid rgba(124,58,237,0.15)">
 <span style="color:#7c3aed;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Order Summary</span>
 </td></tr>
 <tr><td style="padding:16px 20px">
 <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
 <tr>
 <td style="color:#6b7280;padding:5px 0">Order ID</td>
 <td style="color:#e5e7eb;text-align:right;font-family:monospace;font-size:12px;letter-spacing:.05em">${orderId}</td>
 </tr>
 <tr>
 <td style="color:#6b7280;padding:5px 0">Product</td>
 <td style="color:#e5e7eb;text-align:right">${product}</td>
 </tr>
 <tr>
 <td style="color:#6b7280;padding:5px 0">Size</td>
 <td style="color:#e5e7eb;text-align:right">${order.size || '16×20'}"</td>
 </tr>
 <tr>
 <td style="color:#6b7280;padding:5px 0">Frame</td>
 <td style="color:#e5e7eb;text-align:right;text-transform:capitalize">${order.frameColor || 'Black'}</td>
 </tr>
 ${order.digitalCopy ? `<tr>
 <td style="color:#6b7280;padding:5px 0">Digital Copy</td>
 <td style="color:#a78bfa;text-align:right"> Included</td>
 </tr>` : ''}
 <tr>
 <td colspan="2" style="padding:0"><div style="height:1px;background:rgba(124,58,237,0.2);margin:10px 0"></div></td>
 </tr>
 <tr>
 <td style="color:#f5f3ff;font-weight:700;padding:5px 0;font-size:15px">Total</td>
 <td style="text-align:right">
 <span style="background:linear-gradient(90deg,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;font-size:18px">$${order.price?.toFixed(2)}</span>
 </td>
 </tr>
 </table>
 </td></tr>
 </table>
 </td></tr>

 ${address ? `<!-- Shipping address -->
 <tr><td style="background:#1a1028;padding:0 36px 24px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#120d22;border:1px solid rgba(124,58,237,0.2);border-radius:12px;overflow:hidden">
 <tr><td style="padding:16px 20px 12px;border-bottom:1px solid rgba(124,58,237,0.15)">
 <span style="color:#7c3aed;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase"> Shipping To</span>
 </td></tr>
 <tr><td style="padding:16px 20px;color:#d1d5db;font-size:14px;line-height:1.8">
 ${order.shippingName ? `<strong style="color:#f5f3ff">${order.shippingName}</strong><br>` : ''}${address}
 </td></tr>
 </table>
 </td></tr>` : ''}

 <!-- What's next -->
 <tr><td style="background:#1a1028;padding:0 36px 28px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(219,39,119,0.08));border:1px solid rgba(124,58,237,0.25);border-radius:12px">
 <tr><td style="padding:20px 22px">
 <p style="color:#c4b5fd;font-size:13px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:.06em">What happens next?</p>
 <table width="100%" cellpadding="0" cellspacing="0">
 <tr>
 <td width="28" valign="top" style="padding:4px 10px 4px 0">
 <div style="width:22px;height:22px;background:rgba(124,58,237,0.3);border-radius:50%;text-align:center;line-height:22px;font-size:11px;color:#a78bfa;font-weight:700">1</div>
 </td>
 <td style="color:#9ca3af;font-size:13px;padding:4px 0">Our team reviews and finalises your AI portrait</td>
 </tr>
 <tr>
 <td width="28" valign="top" style="padding:4px 10px 4px 0">
 <div style="width:22px;height:22px;background:rgba(124,58,237,0.3);border-radius:50%;text-align:center;line-height:22px;font-size:11px;color:#a78bfa;font-weight:700">2</div>
 </td>
 <td style="color:#9ca3af;font-size:13px;padding:4px 0">Your portrait is printed on premium stretched canvas &amp; professionally framed</td>
 </tr>
 <tr>
 <td width="28" valign="top" style="padding:4px 10px 4px 0">
 <div style="width:22px;height:22px;background:rgba(124,58,237,0.3);border-radius:50%;text-align:center;line-height:22px;font-size:11px;color:#a78bfa;font-weight:700">3</div>
 </td>
 <td style="color:#9ca3af;font-size:13px;padding:4px 0">You receive a tracking email the moment it ships </td>
 </tr>
 </table>
 </td></tr>
 </table>
 </td></tr>

 <!-- Contact -->
 <tr><td style="background:#1a1028;padding:0 36px 32px;text-align:center;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <p style="color:#6b7280;font-size:13px;margin:0">Questions? Reply to this email or reach us at<br>
 <a href="mailto:hello@maitrepets.com" style="color:#a78bfa;text-decoration:none;font-weight:600">hello@maitrepets.com</a></p>
 </td></tr>

 <!-- Footer -->
 <tr><td style="background:#110d1e;border-radius:0 0 16px 16px;border:1px solid rgba(124,58,237,0.2);border-top:none;padding:22px 36px;text-align:center">
 <p style="color:#4b5563;font-size:12px;margin:0 0 6px">
 <a href="https://maitrepets.com" style="color:#7c3aed;text-decoration:none;font-weight:600">maitrepets.com</a>
 &nbsp;·&nbsp; Every pet is a work of art
 </p>
 <p style="color:#374151;font-size:11px;margin:0">© ${new Date().getFullYear()} Maîtrepets. All rights reserved.</p>
 </td></tr>

 </table>
 </td></tr>
 </table>
</body>
</html>`;

 return { subject, html };
}

// ─── Shipped / tracking template ──────────────────────────────────────────────
export function shippedEmail(order, trackingNumber, trackingUrl, carrier) {
 const orderId = '#' + order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
 const product = (order.productType || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
 const generatedUrl = order.image?.generatedUrl || null;

 const address = [
 order.shippingAddress,
 order.shippingAddress2,
 order.shippingCity && `${order.shippingCity}, ${order.shippingState || ''} ${order.shippingZip || ''}`.trim(),
 order.shippingCountry,
 ].filter(Boolean).join('<br>');

 const carrierLabel = carrier ? `${carrier} · ` : '';
 const subject = `Your Maîtrepets portrait is on its way! `;

 const html = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width,initial-scale=1">
 <meta name="color-scheme" content="dark">
 <meta name="supported-color-schemes" content="dark">
 <title>Your Order Has Shipped</title>
 <style>
 :root { color-scheme: dark; }
 body { background:#0d0b14 !important; color:#ffffff !important; }
 @media (prefers-color-scheme: light) {
 body { background:#0d0b14 !important; }
 table { background:#0d0b14 !important; }
 }
 </style>
</head>
<body style="margin:0;padding:0;background:#0d0b14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b14;padding:40px 16px">
 <tr><td align="center">
 <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

 <!-- Header -->
 <tr><td style="background:linear-gradient(135deg,#064e3b 0%,#065f46 45%,#0f766e 100%);border-radius:16px 16px 0 0;padding:36px 36px 32px;text-align:center">
 <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:50%;line-height:56px;margin-bottom:16px;text-align:center;font-size:28px"></div>
 <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0 0 4px;letter-spacing:-0.5px">Maîtrepets</h1>
 <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;letter-spacing:.03em">Your masterpiece is on its way</p>
 </td></tr>

 <!-- Shipped banner -->
 <tr><td style="background:#0d1a14;padding:28px 36px 0;text-align:center;border-left:1px solid rgba(16,185,129,0.2);border-right:1px solid rgba(16,185,129,0.2)">
 <div style="display:inline-block;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.35);border-radius:100px;padding:6px 16px;margin-bottom:20px">
 <span style="color:#34d399;font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase"> Order Shipped</span>
 </div>
 <h2 style="color:#f5f3ff;font-size:22px;font-weight:800;margin:0 0 10px">Your portrait is heading your way!</h2>
 <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px">Your handcrafted AI portrait has been printed and shipped. Track your package below.</p>
 </td></tr>

 <!-- Portrait thumbnail -->
 ${generatedUrl ? `
 <tr><td style="background:#0d1a14;padding:0 36px 24px;border-left:1px solid rgba(16,185,129,0.2);border-right:1px solid rgba(16,185,129,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1510;border:1px solid rgba(16,185,129,0.2);border-radius:12px;overflow:hidden">
 <tr><td style="padding:14px 20px 12px;border-bottom:1px solid rgba(16,185,129,0.15)">
 <span style="color:#10b981;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase"> Your Portrait</span>
 </td></tr>
 <tr><td style="padding:20px 24px">
 <table width="100%" cellpadding="0" cellspacing="0">
 <tr>
 <td width="88" valign="top">
 <div style="width:80px;height:80px;border-radius:10px;overflow:hidden;border:2px solid rgba(16,185,129,0.45);box-shadow:0 0 16px rgba(16,185,129,0.2)">
 <img src="${generatedUrl}" alt="Your portrait" width="80" height="80" style="width:80px;height:80px;object-fit:cover;display:block" />
 </div>
 </td>
 <td valign="middle" style="padding-left:16px">
 <p style="color:rgba(255,255,255,0.9);font-size:14px;font-weight:700;margin:0 0 4px">${product}</p>
 <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 8px">Order ${orderId}</p>
 <p style="color:#6b7280;font-size:12px;margin:0;text-transform:capitalize">${order.frameColor || 'Black'} frame · ${order.size || '16×20'}"</p>
 </td>
 </tr>
 </table>
 </td></tr>
 </table>
 </td></tr>` : ''}

 <!-- Tracking -->
 <tr><td style="background:#0d1a14;padding:0 36px 24px;border-left:1px solid rgba(16,185,129,0.2);border-right:1px solid rgba(16,185,129,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1510;border:1px solid rgba(16,185,129,0.2);border-radius:12px;overflow:hidden">
 <tr><td style="padding:16px 20px 12px;border-bottom:1px solid rgba(16,185,129,0.15)">
 <span style="color:#10b981;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase"> Tracking Info</span>
 </td></tr>
 <tr><td style="padding:16px 20px">
 <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
 <tr>
 <td style="color:#6b7280;padding:5px 0;width:40%">Tracking #</td>
 <td style="color:#e5e7eb;text-align:right;font-family:monospace;font-size:12px;letter-spacing:.05em">${trackingNumber}</td>
 </tr>
 ${carrier ? `<tr>
 <td style="color:#6b7280;padding:5px 0">Carrier</td>
 <td style="color:#e5e7eb;text-align:right">${carrier}</td>
 </tr>` : ''}
 </table>
 ${trackingUrl ? `
 <div style="margin-top:16px;text-align:center">
 <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#065f46,#0f766e);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;letter-spacing:.01em">
 Track My Package →
 </a>
 </div>` : ''}
 </td></tr>
 </table>
 </td></tr>

 ${address ? `<!-- Shipping address -->
 <tr><td style="background:#0d1a14;padding:0 36px 24px;border-left:1px solid rgba(16,185,129,0.2);border-right:1px solid rgba(16,185,129,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1510;border:1px solid rgba(16,185,129,0.2);border-radius:12px;overflow:hidden">
 <tr><td style="padding:16px 20px 12px;border-bottom:1px solid rgba(16,185,129,0.15)">
 <span style="color:#10b981;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase"> Delivering To</span>
 </td></tr>
 <tr><td style="padding:16px 20px;color:#d1d5db;font-size:14px;line-height:1.8">
 ${order.shippingName ? `<strong style="color:#f5f3ff">${order.shippingName}</strong><br>` : ''}${address}
 </td></tr>
 </table>
 </td></tr>` : ''}

 <!-- Contact -->
 <tr><td style="background:#0d1a14;padding:0 36px 32px;text-align:center;border-left:1px solid rgba(16,185,129,0.2);border-right:1px solid rgba(16,185,129,0.2)">
 <p style="color:#6b7280;font-size:13px;margin:0">Questions? Reply to this email or reach us at<br>
 <a href="mailto:hello@maitrepets.com" style="color:#34d399;text-decoration:none;font-weight:600">hello@maitrepets.com</a></p>
 </td></tr>

 <!-- Footer -->
 <tr><td style="background:#080f0b;border-radius:0 0 16px 16px;border:1px solid rgba(16,185,129,0.2);border-top:none;padding:22px 36px;text-align:center">
 <p style="color:#4b5563;font-size:12px;margin:0 0 6px">
 <a href="https://maitrepets.com" style="color:#10b981;text-decoration:none;font-weight:600">maitrepets.com</a>
 &nbsp;·&nbsp; Every pet is a work of art
 </p>
 <p style="color:#374151;font-size:11px;margin:0">© ${new Date().getFullYear()} Maîtrepets. All rights reserved.</p>
 </td></tr>

 </table>
 </td></tr>
 </table>
</body>
</html>`;

 return { subject, html };
}

// ─── Delivered template ───────────────────────────────────────────────────────
export function deliveredEmail(order) {
 const orderId = '#' + order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
 const product = (order.productType || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
 const generatedUrl = order.image?.generatedUrl || null;

 const subject = `Your Maîtrepets portrait has arrived! `;

 const html = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width,initial-scale=1">
 <meta name="color-scheme" content="dark">
 <meta name="supported-color-schemes" content="dark">
 <title>Your Order Has Arrived</title>
 <style>
 :root { color-scheme: dark; }
 body { background:#0d0b14 !important; color:#ffffff !important; }
 @media (prefers-color-scheme: light) {
 body { background:#0d0b14 !important; }
 table { background:#0d0b14 !important; }
 }
 </style>
</head>
<body style="margin:0;padding:0;background:#0d0b14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b14;padding:40px 16px">
 <tr><td align="center">
 <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

 <!-- Header -->
 <tr><td style="background:linear-gradient(135deg,#4f1d96 0%,#7c3aed 45%,#db2777 100%);border-radius:16px 16px 0 0;padding:36px 36px 32px;text-align:center">
 <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:50%;line-height:56px;margin-bottom:16px;text-align:center;font-size:28px"></div>
 <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0 0 4px;letter-spacing:-0.5px">Maîtrepets</h1>
 <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0;letter-spacing:.03em">Your masterpiece has arrived</p>
 </td></tr>

 <!-- Delivered banner -->
 <tr><td style="background:#1a1028;padding:28px 36px 0;text-align:center;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <div style="display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.35);border-radius:100px;padding:6px 16px;margin-bottom:20px">
 <span style="color:#a78bfa;font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase"> Delivered</span>
 </div>
 <h2 style="color:#f5f3ff;font-size:22px;font-weight:800;margin:0 0 10px">Your portrait has arrived!</h2>
 <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px">Your one-of-a-kind AI pet portrait has been delivered. We hope you love it as much as we loved making it.</p>
 </td></tr>

 <!-- Portrait -->
 ${generatedUrl ? `
 <tr><td style="background:#1a1028;padding:0 36px 24px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#120d22;border:1px solid rgba(124,58,237,0.2);border-radius:12px;overflow:hidden">
 <tr><td style="padding:14px 20px 12px;border-bottom:1px solid rgba(124,58,237,0.15)">
 <span style="color:#7c3aed;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase"> Your Portrait</span>
 </td></tr>
 <tr><td style="padding:20px 24px">
 <table width="100%" cellpadding="0" cellspacing="0">
 <tr>
 <td width="88" valign="top">
 <div style="width:80px;height:80px;border-radius:10px;overflow:hidden;border:2px solid rgba(124,58,237,0.45);box-shadow:0 0 16px rgba(124,58,237,0.25)">
 <img src="${generatedUrl}" alt="Your portrait" width="80" height="80" style="width:80px;height:80px;object-fit:cover;display:block" />
 </div>
 </td>
 <td valign="middle" style="padding-left:16px">
 <p style="color:rgba(255,255,255,0.9);font-size:14px;font-weight:700;margin:0 0 4px">${product}</p>
 <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 6px">Order ${orderId}</p>
 <p style="color:#6b7280;font-size:12px;margin:0;text-transform:capitalize">${order.frameColor || 'Black'} frame · ${order.size || '16x20'}"</p>
 </td>
 </tr>
 </table>
 </td></tr>
 </table>
 </td></tr>` : ''}

 <!-- Share nudge -->
 <tr><td style="background:#1a1028;padding:0 36px 24px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(219,39,119,0.08));border:1px solid rgba(124,58,237,0.25);border-radius:12px">
 <tr><td style="padding:22px 24px;text-align:center">
 <p style="color:#c4b5fd;font-size:15px;font-weight:700;margin:0 0 8px">Love your portrait? Share it!</p>
 <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0 0 18px">Tag us on social media and let the world see your pet's masterpiece.</p>
 <span style="display:inline-block;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.35);border-radius:6px;padding:6px 14px">
 <span style="color:#a78bfa;font-size:13px;font-weight:600">@maitrepets</span>
 </span>
 </td></tr>
 </table>
 </td></tr>

 <!-- Contact -->
 <tr><td style="background:#1a1028;padding:0 36px 32px;text-align:center;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
 <p style="color:#6b7280;font-size:13px;margin:0">Something not right? We will make it right.<br>
 <a href="mailto:hello@maitrepets.com" style="color:#a78bfa;text-decoration:none;font-weight:600">hello@maitrepets.com</a></p>
 </td></tr>

 <!-- Footer -->
 <tr><td style="background:#110d1e;border-radius:0 0 16px 16px;border:1px solid rgba(124,58,237,0.2);border-top:none;padding:22px 36px;text-align:center">
 <p style="color:#4b5563;font-size:12px;margin:0 0 6px">
 <a href="https://maitrepets.com" style="color:#7c3aed;text-decoration:none;font-weight:600">maitrepets.com</a>
 &nbsp;·&nbsp; Every pet is a work of art
 </p>
 <p style="color:#374151;font-size:11px;margin:0">© 2026 Maîtrepets. All rights reserved.</p>
 </td></tr>

 </table>
 </td></tr>
 </table>
</body>
</html>`;

 return { subject, html };
}
