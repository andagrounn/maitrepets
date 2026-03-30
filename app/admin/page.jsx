'use client';
import { useEffect, useState, useCallback, Fragment, useRef } from 'react';
import { PRODUCT_PRICES, URGENCY_FEES } from '@/lib/pricing';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'maitrepets-admin-2025';
const HEADERS   = { 'x-admin-key': ADMIN_KEY, 'Content-Type': 'application/json' };

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:                 { label: 'Pending',           color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  paid:                    { label: 'Paid',              color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  fulfilling:              { label: 'Printing',          color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  shipped:                 { label: 'Shipped',           color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  delivered:               { label: 'Delivered',         color: 'bg-teal-500/20 text-teal-300 border border-teal-500/30' },
  returned:                { label: 'Returned',          color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
  failed:                  { label: 'Cancelled',         color: 'bg-red-500/20 text-red-300 border border-red-500/30' },
  paid_fulfillment_failed: { label: 'Fulfil. Error',     color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
  paid_printful_failed:    { label: 'Printful Error',    color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
  refund_requested:        { label: 'Refund Requested',  color: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
  refund_denied:           { label: 'Refund Denied',     color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
  refund_approved:         { label: 'Refund Approved',   color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
};
const ALL_STATUSES = Object.keys(STATUS_META);

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.color}`}>{m.label}</span>;
}

// ─── Email templates ──────────────────────────────────────────────────────────
function buildTemplate(type, ctx = {}) {
  const base = (content) => `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:28px 32px">
        <p style="color:#fff;font-size:22px;font-weight:900;margin:0">Maîtrepets</p>
      </div>
      <div style="padding:32px">${content}</div>
      <div style="background:#f9fafb;padding:20px 32px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} Maîtrepets · <a href="https://maitrepets.com" style="color:#7c3aed">maitrepets.com</a></p>
      </div>
    </div>`;

  switch (type) {
    case 'shipping_update':
      return {
        subject: `Your Maîtrepets order has shipped! 📦`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Your Portrait is on its way!</h2>
          <p style="color:#4b5563">Great news — your order has been shipped and is heading to you now.</p>
          ${ctx.trackingNumber ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
            <p style="color:#6b7280;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">Tracking Number</p>
            <p style="color:#111;font-weight:700;font-size:16px;font-family:monospace;margin:0">${ctx.trackingNumber}</p>
            ${ctx.trackingUrl ? `<a href="${ctx.trackingUrl}" style="color:#7c3aed;font-size:13px">Track your package →</a>` : ''}
          </div>` : ''}
          <p style="color:#4b5563">Expected delivery: 7–10 business days from ship date.</p>
          <p style="color:#4b5563;margin-top:24px">Thank you for choosing Maîtrepets!</p>`),
      };
    case 'order_confirmed':
      return {
        subject: `Your Maîtrepets order is confirmed ✅`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Order Confirmed!</h2>
          <p style="color:#4b5563">We've received your order and it's now in our production queue.</p>
          <p style="color:#4b5563">Your Portrait will be printed on premium artist-grade stretched canvas, professionally framed, and shipped within 3–5 business days.</p>
          <p style="color:#4b5563;margin-top:24px">Questions? Reply to this email or contact <a href="mailto:hello@maitrepets.com" style="color:#7c3aed">hello@maitrepets.com</a>.</p>`),
      };
    case 'refund_approved':
      return {
        subject: `Your Maîtrepets refund has been approved ✅`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Refund Approved</h2>
          <p style="color:#4b5563">We've reviewed your request and approved your refund for the damaged/defective item.</p>
          <p style="color:#4b5563">Your refund will be processed to your original payment method within <strong>5–10 business days</strong>.</p>
          <p style="color:#4b5563">We sincerely apologize for the inconvenience and hope to make it right.</p>
          <p style="color:#4b5563;margin-top:24px">Thank you for your patience — Team Maîtrepets </p>`),
      };
    case 'refund_denied':
      return {
        subject: `Update on your Maîtrepets refund request`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Refund Request Update</h2>
          <p style="color:#4b5563">Thank you for reaching out regarding your recent order.</p>
          <p style="color:#4b5563">After reviewing your request, we're unable to process a refund at this time as the item does not appear to meet our damaged/defective return criteria.</p>
          <p style="color:#4b5563">If you have additional information or photos you'd like us to review, please reply to this email and we'd be happy to take another look.</p>
          <p style="color:#4b5563;margin-top:24px">We appreciate your understanding — Team Maîtrepets </p>`),
      };
    case 'reprint_sent':
      return {
        subject: `Your replacement Portrait is on its way! 🖼️`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Replacement Order Shipped</h2>
          <p style="color:#4b5563">We've processed and shipped your replacement Portrait print.</p>
          ${ctx.trackingNumber ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
            <p style="color:#6b7280;font-size:12px;margin:0 0 4px">Tracking Number</p>
            <p style="color:#111;font-weight:700;font-family:monospace;margin:0">${ctx.trackingNumber}</p>
          </div>` : ''}
          <p style="color:#4b5563">We hope this one arrives in perfect condition. Thank you for your patience! </p>`),
      };
    default:
      return { subject: '', body: '' };
  }
}

// ─── Shared icons ─────────────────────────────────────────────────────────────
const Icon = {
  Overview:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Orders:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  Customers: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Refunds:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>,
  Messaging: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  GenBank:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  Edit:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Mail:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Check:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:         () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Truck:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Eye:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  ChevronDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
};

// ─── Email modal ──────────────────────────────────────────────────────────────
function EmailModal({ defaultTo = '', defaultTemplate = 'custom', ctx = {}, onClose, onSent }) {
  const [to, setTo]           = useState(defaultTo);
  const [template, setTemplate] = useState(defaultTemplate);
  const [subject, setSubject] = useState('');
  const [body, setBody]       = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState(null); // 'sent' | 'error'

  useEffect(() => {
    const t = buildTemplate(template, ctx);
    setSubject(t.subject);
    setBody(t.body.replace(/<[^>]+>/g, '').replace(/\n\s*\n/g, '\n').trim());
  }, [template]);

  async function send() {
    if (!to || !subject || !body) return;
    setSending(true);
    try {
      const res  = await fetch('/api/admin/email', {
        method: 'POST', headers: HEADERS,
        body: JSON.stringify({ to, subject, body: body.includes('<') ? body : body.replace(/\n/g, '<br>') }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult('sent');
      onSent?.();
      setTimeout(onClose, 1500);
    } catch (e) {
      setResult('error');
      setSending(false);
    }
  }

  const TMPL_OPTIONS = [
    { value: 'shipping_update',  label: '📦 Shipping Update' },
    { value: 'order_confirmed',  label: '✅ Order Confirmed' },
    { value: 'refund_approved',  label: '💚 Refund Approved' },
    { value: 'refund_denied',    label: '❌ Refund Denied' },
    { value: 'reprint_sent',     label: '🖼️ Replacement Shipped' },
    { value: 'custom',           label: '✏️ Custom Message' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Icon.Mail /> <span>Send Email</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><Icon.X /></button>
        </div>

        {result === 'sent' ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400"><Icon.Check /></div>
            <p className="text-white font-semibold">Email sent successfully</p>
            <p className="text-gray-400 text-sm mt-1">to {to}</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Template */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Template</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TMPL_OPTIONS.map(t => (
                  <button key={t.value} onClick={() => setTemplate(t.value)}
                    className={`text-xs px-2 py-2 rounded-lg border transition-all text-left ${template === t.value ? 'bg-purple-600/30 border-purple-500/50 text-purple-200' : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* To */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">To</label>
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="customer@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500" />
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500" />
            </div>

            {/* Body */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none" />
            </div>

            {result === 'error' && (
              <p className="text-red-400 text-xs">Failed to send. Check console for details.</p>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={send} disabled={!to || !subject || !body || sending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                {sending ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</> : <><Icon.Mail /> Send Email</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Order edit modal ─────────────────────────────────────────────────────────
const EDITABLE_STATUSES = ['pending', 'paid', 'fulfilling'];
const FRAME_COLOR_OPTIONS = [
  { id: 'black',   label: 'Black',   hex: '#1a1a1a' },
  { id: 'white',   label: 'White',   hex: '#f5f5f5' },
  { id: 'natural', label: 'Natural', hex: '#c8a97e' },
];
const SIZE_OPTIONS = [
  { value: '8x10',  label: '8×10"'  },
  { value: '11x14', label: '11×14"' },
  { value: '16x20', label: '16×20"' },
  { value: '18x24', label: '18×24"' },
  { value: '24x36', label: '24×36"' },
];
const ADDON_PRICES = { digitalCopy: 12, extraCopy: 29 };

function OrderEditModal({ order, onClose, onSaved }) {
  const canEditItems = EDITABLE_STATUSES.includes(order.status);

  const [fields, setFields] = useState({
    status:         order.status,
    trackingNumber: order.trackingNumber || '',
    trackingUrl:    order.trackingUrl    || '',
    digitalCopy:    order.digitalCopy   ?? false,
    extraCopy:      order.extraCopy     ?? false,
    frameColor:     order.frameColor    || 'black',
    size:           order.size          || '16x20',
  });
  const [saving, setSaving] = useState(false);

  // Compute price delta from original
  const origAddonTotal = (order.digitalCopy ? ADDON_PRICES.digitalCopy : 0) + (order.extraCopy ? ADDON_PRICES.extraCopy : 0);
  const newAddonTotal  = (fields.digitalCopy ? ADDON_PRICES.digitalCopy : 0) + (fields.extraCopy ? ADDON_PRICES.extraCopy : 0);
  const addonDelta     = newAddonTotal - origAddonTotal;
  const newPrice       = Math.max(0, Number(order.price) + addonDelta).toFixed(2);

  function toggleAddon(key) {
    setFields(f => ({ ...f, [key]: !f[key] }));
  }

  async function save() {
    setSaving(true);
    const payload = { orderId: order.id, ...fields };
    if (canEditItems) payload.price = Number(newPrice);
    await fetch('/api/admin/order', { method: 'PATCH', headers: HEADERS, body: JSON.stringify(payload) });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
          <p className="text-white font-semibold flex items-center gap-2"><Icon.Edit /> Edit Order</p>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><Icon.X /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* ── Status & Tracking ── */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Fulfilment</p>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Status</label>
              <select value={fields.status} onChange={e => setFields(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500">
                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Tracking Number</label>
              <input value={fields.trackingNumber} onChange={e => setFields(f => ({ ...f, trackingNumber: e.target.value }))}
                placeholder="e.g. 1Z999AA10123456784"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Tracking URL</label>
              <input value={fields.trackingUrl} onChange={e => setFields(f => ({ ...f, trackingUrl: e.target.value }))}
                placeholder="https://tools.usps.com/…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          {/* ── Order Items — editable only while not yet shipped ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Order Items</p>
              {!canEditItems && (
                <span className="text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                  Locked — already {order.status}
                </span>
              )}
            </div>

            {/* Size */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Print Size</label>
              <select value={fields.size}
                onChange={e => setFields(f => ({ ...f, size: e.target.value }))}
                disabled={!canEditItems}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed">
                {SIZE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Frame Color */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Frame Color</label>
              <div className="flex gap-3">
                {FRAME_COLOR_OPTIONS.map(c => (
                  <button key={c.id}
                    onClick={() => canEditItems && setFields(f => ({ ...f, frameColor: c.id }))}
                    disabled={!canEditItems}
                    className={`flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed`}>
                    <span className={`w-8 h-8 rounded-full border-2 transition-all ${fields.frameColor === c.id ? 'border-purple-400 scale-110' : 'border-white/20'}`}
                      style={{ backgroundColor: c.hex, boxShadow: c.id === 'white' ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : undefined }} />
                    <span className={`text-[10px] ${fields.frameColor === c.id ? 'text-purple-300' : 'text-gray-500'}`}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Add-ons</label>
              <div className="space-y-2">
                {[
                  { key: 'digitalCopy', label: 'HD Digital Copy',  sub: 'Download + print anywhere', price: ADDON_PRICES.digitalCopy },
                  { key: 'extraCopy',   label: 'Thin Canvas Print', sub: 'Same portrait, no frame',   price: ADDON_PRICES.extraCopy  },
                ].map(addon => (
                  <button key={addon.key}
                    onClick={() => canEditItems && toggleAddon(addon.key)}
                    disabled={!canEditItems}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      fields[addon.key]
                        ? 'border-purple-500/60 bg-purple-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      fields[addon.key] ? 'bg-purple-500 border-purple-500' : 'border-gray-600'
                    }`}>
                      {fields[addon.key] && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-xs font-semibold ${fields[addon.key] ? 'text-white' : 'text-gray-400'}`}>{addon.label}</p>
                      <p className="text-gray-600 text-[10px]">{addon.sub}</p>
                    </div>
                    <span className={`text-xs font-bold ${fields[addon.key] ? 'text-purple-300' : 'text-gray-600'}`}>+${addon.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-xs text-gray-500">Order Total</span>
              <div className="flex items-center gap-2">
                {addonDelta !== 0 && (
                  <span className="text-gray-600 line-through text-xs">${Number(order.price).toFixed(2)}</span>
                )}
                <span className={`text-sm font-bold ${addonDelta > 0 ? 'text-emerald-400' : addonDelta < 0 ? 'text-red-400' : 'text-white'}`}>
                  ${newPrice}
                </span>
                {addonDelta !== 0 && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${addonDelta > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {addonDelta > 0 ? '+' : ''}${addonDelta}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5">Cancel</button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? 'Saving…' : <><Icon.Check /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin address edit modal ─────────────────────────────────────────────────
const ADDR_COUNTRIES = [
  { code: 'US', name: 'United States' }, { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'AU', name: 'Australia' },
  { code: 'JM', name: 'Jamaica' }, { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' }, { code: 'NL', name: 'Netherlands' },
  { code: 'IE', name: 'Ireland' }, { code: 'NZ', name: 'New Zealand' },
  { code: 'SE', name: 'Sweden' }, { code: 'NO', name: 'Norway' },
  { code: 'SG', name: 'Singapore' }, { code: 'JP', name: 'Japan' },
];

function AdminAddressModal({ order, onClose, onSaved }) {
  const [fields, setFields] = useState({
    name:     order.shippingName     || '',
    address1: order.shippingAddress  || '',
    address2: order.shippingAddress2 || '',
    city:     order.shippingCity     || '',
    state:    order.shippingState    || '',
    zip:      order.shippingZip      || '',
    country:  order.shippingCountry  || 'US',
    phone:    order.shippingPhone    || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const isFailed = ['paid_fulfillment_failed', 'paid_printful_failed'].includes(order.status);

  const set = k => e => setFields(f => ({ ...f, [k]: e.target.value }));

  async function save(retry) {
    setSaving(true); setError('');
    try {
      const res  = await fetch('/api/admin/update-address', {
        method:  'POST',
        headers: HEADERS,
        body:    JSON.stringify({ orderId: order.id, ...fields, retry }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSaved(data.fulfillError ? `Saved — but fulfillment error: ${data.fulfillError}` : 'Address saved!');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inp = 'w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
          <p className="text-white font-bold text-sm">Edit Shipping Address</p>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><Icon.X /></button>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Full Name',         key: 'name',     ph: 'Jane Smith' },
            { label: 'Address Line 1',    key: 'address1', ph: '123 Main St' },
            { label: 'Address Line 2',    key: 'address2', ph: 'Apt 4B (optional)' },
            { label: 'City',              key: 'city',     ph: 'New York' },
            { label: 'State / Province',  key: 'state',    ph: 'NY' },
            { label: 'ZIP / Postal Code', key: 'zip',      ph: '10001' },
            { label: 'Phone',             key: 'phone',    ph: '+1 555 000 0000' },
          ].map(({ label, key, ph }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
              <input value={fields[key]} onChange={set(key)} placeholder={ph} className={inp} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Country</label>
            <select value={fields.country} onChange={set('country')} className={inp}>
              {ADDR_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={() => save(false)} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Only'}
            </button>
            {isFailed && (
              <button onClick={() => save(true)} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save & Retry Print →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Customer slide-over ──────────────────────────────────────────────────────
function CustomerPanel({ customer, onClose, onEmail }) {
  const [editingOrder, setEditingOrder] = useState(null);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <>
      {editingOrder && (
        <AdminAddressModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={msg => { setEditingOrder(null); showToast(msg); }}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg border border-white/10">
          {toast}
        </div>
      )}
      <div className="fixed inset-0 z-40 flex" onClick={onClose}>
        <div className="flex-1 bg-black/60 backdrop-blur-sm" />
        <div className="w-full max-w-sm bg-gray-900 border-l border-white/10 h-full overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
            <p className="text-white font-semibold text-sm">Customer Profile</p>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><Icon.X /></button>
          </div>

          <div className="p-5 border-b border-white/10">
            <div className="w-12 h-12 bg-purple-600/30 rounded-2xl flex items-center justify-center text-purple-300 text-xl font-black mb-3">
              {(customer.name || customer.email || '?')[0].toUpperCase()}
            </div>
            <p className="text-white font-bold">{customer.name || '—'}</p>
            <p className="text-gray-400 text-sm">{customer.email}</p>
            <p className="text-gray-600 text-xs mt-1">Joined {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Orders</p>
                <p className="text-white font-bold text-xl">{customer.orderCount}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Lifetime Value</p>
                <p className="text-emerald-400 font-bold text-xl">${customer.ltv.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-5 border-b border-white/10">
            <button onClick={() => onEmail(customer.email)}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-all flex items-center justify-center gap-2">
              <Icon.Mail /> Email Customer
            </button>
          </div>

          <div className="p-5 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Order History</p>
            {customer.orders.length === 0 ? (
              <p className="text-gray-600 text-sm">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {customer.orders.map(o => (
                  <div key={o.id} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      {o.image?.generatedUrl
                        ? <img src={o.image.generatedUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 text-xs capitalize truncate">{o.productType?.replace(/-/g,' ')}</p>
                        <p className="text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-400 text-xs font-semibold">${o.price?.toFixed(2)}</p>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                    {/* Shipping address + edit */}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-start justify-between gap-2">
                      <div className="text-[10px] text-gray-600 leading-relaxed">
                        {o.shippingName && <span className="block text-gray-500">{o.shippingName}</span>}
                        {o.shippingAddress
                          ? <span className="block">{o.shippingAddress}{o.shippingAddress2 ? `, ${o.shippingAddress2}` : ''}, {o.shippingCity}, {o.shippingState} {o.shippingZip}, {o.shippingCountry}</span>
                          : <span className="text-orange-400">No address on file</span>
                        }
                      </div>
                      <button
                        onClick={() => setEditingOrder(o)}
                        className="flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-gray-300 transition-colors whitespace-nowrap"
                        title="Edit shipping address"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Profit breakdown cards (product toggle) ──────────────────────────────────
function ProfitBreakdownCards() {
  const [productKey, setProductKey] = useState('framed');
  const p    = PRODUCT_PRICES[productKey];
  // Use 16×20 (large) as the waterfall example
  const ex   = p.sizes.large;
  const ship = 5.99;
  const stripe = parseFloat((ex.sell * 0.029 + 0.30).toFixed(2));
  const profit = ex.sell - stripe - ex.printful - ship;
  const margin = (profit / ex.sell * 100).toFixed(1);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Order flow waterfall */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Flow — Per Sale</h3>
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {Object.entries(PRODUCT_PRICES).map(([key, val]) => (
              <button key={key} onClick={() => setProductKey(key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  productKey === key ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {val.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-[10px] mb-4">16×20" {p.label} · base sell price · standard shipping</p>
        {[
          { label: 'Customer Pays',    value: ex.sell,     color: 'bg-emerald-500',   text: 'text-emerald-400', sign: '+' },
          { label: 'Stripe Fee',       value: -stripe,     color: 'bg-red-500/70',    text: 'text-red-400',     sign: '−', note: '2.9% + $0.30' },
          { label: p.printLabel,       value: -ex.printful,color: 'bg-orange-500/70', text: 'text-orange-400',  sign: '−' },
          { label: 'Standard Shipping',value: -ship,       color: 'bg-yellow-500/70', text: 'text-yellow-400',  sign: '−', note: 'via Printful' },
          { label: 'Net Profit',       value: profit,      color: 'bg-purple-500',    text: 'text-purple-300',  sign: '=', bold: true },
        ].map((row, i) => (
          <div key={i} className={`flex items-center gap-3 py-2.5 ${i < 4 ? 'border-b border-white/5' : ''}`}>
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.color}`} />
            <div className="flex-1">
              <span className="text-xs text-gray-300">{row.label}</span>
              {row.note && <span className="text-gray-600 text-xs ml-1.5">({row.note})</span>}
            </div>
            <div className={`flex items-center gap-1 font-mono text-sm ${row.bold ? 'font-black' : 'font-medium'} ${row.text}`}>
              <span className="text-gray-600 text-xs">{row.sign}</span>
              ${Math.abs(row.value).toFixed(2)}
            </div>
          </div>
        ))}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-500">Profit margin</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{width:`${margin}%`}} />
            </div>
            <span className="text-purple-300 text-xs font-bold">{margin}%</span>
          </div>
        </div>
      </div>

      {/* Per-size margin table */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Margin by Print Size</h3>
          <span className="text-[10px] text-purple-400 font-semibold">{p.label}</span>
        </div>
        <p className="text-gray-600 text-[10px] mb-4">{p.label} · base sell price · standard ship $5.99</p>
        <div className="space-y-0">
          {Object.entries(p.sizes).map(([sizeKey, r], i) => {
            const s  = parseFloat((r.sell * 0.029 + 0.30).toFixed(2));
            const pr = r.sell - r.printful - s - 5.99;
            const mg = (pr / r.sell * 100).toFixed(0);
            return (
              <div key={sizeKey} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                <span className="text-gray-400 text-xs w-14 flex-shrink-0">{r.desc}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">${r.printful} + $5.99 ship</span>
                    <span className="text-emerald-400 font-semibold">${pr.toFixed(2)}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{width:`${mg}%`, background:'linear-gradient(90deg,#7c3aed,#a855f7)'}} />
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-300 w-9 text-right">{mg}%</span>
              </div>
            );
          })}
        </div>
        <p className="text-gray-700 text-[10px] mt-3">* Printful fulfillment costs (est.). Stripe: 2.9% + $0.30.</p>
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ data, setTab }) {
  const { stats, revenueByDay, themeCounts, productCounts, refundRequests, orders } = data;
  const revenueEntries = Object.entries(revenueByDay).sort((a,b) => a[0].localeCompare(b[0])).slice(-14);
  const maxRevenue     = Math.max(...revenueEntries.map(([,v]) => v), 1);
  const topThemes      = Object.entries(themeCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const errorOrders    = orders.filter(o => ['paid_fulfillment_failed','paid_printful_failed'].includes(o.status));

  const KPIs = [
    { label: 'Total Revenue',   value: `$${stats.totalRevenue.toFixed(2)}`,  color: 'text-emerald-400', sub: 'Paid orders only' },
    { label: 'Total Orders',    value: stats.totalOrders,                     color: 'text-white',       sub: 'All time' },
    { label: 'Paid',            value: stats.paidOrders,                      color: 'text-emerald-300', sub: 'Paid + fulfilled' },
    { label: 'Printing',        value: stats.fulfillingOrders,                color: 'text-blue-300',    sub: 'In production' },
    { label: 'Shipped',         value: stats.shippedOrders,                   color: 'text-purple-300',  sub: 'In transit' },
    { label: 'Delivered',       value: stats.deliveredOrders,                 color: 'text-teal-300',    sub: 'Completed' },
    { label: 'Refund Requests', value: stats.refundRequestedOrders,           color: 'text-rose-300',    sub: 'Needs action' },
    { label: 'Errors',          value: stats.failedOrders,                    color: 'text-orange-300',  sub: 'Fulfillment issues' },
    { label: 'Customers',       value: stats.users,                           color: 'text-yellow-300',  sub: 'Registered' },
    { label: 'Portraits Made',  value: stats.images,                          color: 'text-pink-300',    sub: 'AI generations' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {KPIs.map(k => (
          <div key={k.label} className="bg-gray-900 border border-white/10 rounded-2xl p-4">
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-white text-xs font-medium mt-1">{k.label}</p>
            <p className="text-gray-600 text-xs">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="md:col-span-2 bg-gray-900 border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Revenue — Last 14 Days</h3>
          {revenueEntries.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-10">No revenue data yet</p>
          ) : (
            <div className="flex items-end gap-1 h-36">
              {revenueEntries.map(([day, val]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                  <p className="text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{fontSize:'9px'}}>${val.toFixed(0)}</p>
                  <div className="w-full bg-purple-600 hover:bg-purple-400 rounded-sm transition-all cursor-default"
                    style={{ height: `${Math.max((val / maxRevenue) * 120, 3)}px` }} />
                  <p className="text-gray-600 text-xs" style={{fontSize:'8px'}}>{day.slice(5)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Styles + Products */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Art Styles</h3>
          <div className="space-y-2 mb-5">
            {topThemes.length === 0 ? <p className="text-gray-600 text-sm">No data</p> :
              topThemes.map(([t, c]) => (
                <div key={t} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-gray-300 capitalize">{t}</span>
                      <span className="text-gray-500">{c}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(c / topThemes[0][1]) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Products</h3>
          <div className="space-y-1">
            {Object.entries(productCounts).sort((a,b) => b[1]-a[1]).map(([p, c]) => (
              <div key={p} className="flex justify-between text-xs">
                <span className="text-gray-400 capitalize">{p?.replace(/-/g,' ')}</span>
                <span className="text-white font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Profit Breakdown ── */}
      <ProfitBreakdownCards />

      {/* Printful flow status */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Printful Fulfillment Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Order Placed',   icon: '💳', count: stats.paidOrders,         color: 'text-emerald-400', sub: 'Paid by customer' },
            { label: 'Sent to Print',  icon: '📤', count: stats.fulfillingOrders,    color: 'text-blue-400',    sub: 'At Printful' },
            { label: 'In Production',  icon: '🖨️', count: stats.fulfillingOrders,    color: 'text-yellow-400',  sub: 'Being printed' },
            { label: 'Shipped',        icon: '📦', count: stats.shippedOrders,       color: 'text-purple-400',  sub: 'With carrier' },
            { label: 'Delivered',      icon: '🏠', count: stats.deliveredOrders,     color: 'text-teal-400',    sub: 'At customer' },
          ].map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center p-3 rounded-xl bg-white/5 border border-white/5">
              {i < 4 && <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-gray-700 text-xs z-10">→</div>}
              <span className="text-2xl mb-1">{step.icon}</span>
              <p className={`text-xl font-black ${step.color}`}>{step.count}</p>
              <p className="text-white text-xs font-medium mt-0.5">{step.label}</p>
              <p className="text-gray-600 text-[10px] mt-0.5">{step.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(refundRequests.length > 0 || errorOrders.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {refundRequests.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-rose-300 font-semibold text-sm">🔴 Refund Requests ({refundRequests.length})</p>
                <button onClick={() => setTab('refunds')} className="text-xs text-rose-400 hover:text-rose-200 underline">View all →</button>
              </div>
              <div className="space-y-2">
                {refundRequests.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-white">{o.user?.email}</span>
                      <span className="text-gray-500 ml-2">{o.refundReason || 'No reason given'}</span>
                    </div>
                    <span className="text-gray-500">{new Date(o.refundRequestedAt || o.updatedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {errorOrders.length > 0 && (
            <div className="bg-orange-950/40 border border-orange-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-orange-300 font-semibold text-sm">⚠️ Fulfillment Errors ({errorOrders.length})</p>
                <button onClick={() => setTab('orders')} className="text-xs text-orange-400 hover:text-orange-200 underline">View all →</button>
              </div>
              <div className="space-y-2">
                {errorOrders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between text-xs">
                    <span className="text-white">{o.user?.email}</span>
                    <span className="text-gray-500">Printful: {o.printfulId || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Recent Orders</h3>
        <div className="space-y-2">
          {data.orders.slice(0, 8).map(o => (
            <div key={o.id} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
              {o.image?.generatedUrl
                ? <img src={o.image.generatedUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                : <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <span className="text-gray-300 text-xs">{o.user?.email}</span>
                <span className="text-gray-600 text-xs ml-2 capitalize">{o.productType?.replace(/-/g,' ')}</span>
              </div>
              <span className="text-emerald-400 text-xs font-semibold">${o.price?.toFixed(2)}</span>
              <StatusBadge status={o.status} />
              <span className="text-gray-600 text-xs">{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────
const ORDERS_PAGE_SIZE = 10;

function OrdersTab({ orders, onRefresh }) {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded]       = useState(null);
  const [editing, setEditing]         = useState(null);
  const [emailing, setEmailing]       = useState(null);
  const [retrying, setRetrying]       = useState(null);
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  async function retryFulfillment(orderId) {
    setRetrying(orderId);
    try {
      const res = await fetch('/api/admin/retry-fulfillment', {
        method: 'POST', headers: HEADERS, body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.ok) { alert(`Sent to Printful ✓ (ID: ${data.printfulId})`); onRefresh(); }
      else alert(`Failed: ${data.error}`);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setRetrying(null);
    }
  }

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.id.includes(q) ||
      o.printfulId?.includes(q) ||
      o.trackingNumber?.includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * ORDERS_PAGE_SIZE, page * ORDERS_PAGE_SIZE);
  const allPageSelected = paginated.length > 0 && paginated.every(o => selected.has(o.id));

  useEffect(() => { setPage(1); }, [search, statusFilter]);
  useEffect(() => { setSelected(new Set()); }, [search, statusFilter, page]);

  function toggleSelect(id) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleSelectAll() {
    if (allPageSelected) setSelected(prev => { const s = new Set(prev); paginated.forEach(o => s.delete(o.id)); return s; });
    else setSelected(prev => { const s = new Set(prev); paginated.forEach(o => s.add(o.id)); return s; });
  }
  async function deleteSelected() {
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'DELETE', headers: HEADERS, body: JSON.stringify({ ids: [...selected] }),
      });
      const data = await res.json();
      if (data.ok) { setSelected(new Set()); setConfirmDelete(false); onRefresh(); }
      else alert('Delete failed: ' + data.error);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setDeleting(false); }
  }

  return (
    <div>
      {editing && <OrderEditModal order={editing} onClose={() => setEditing(null)} onSaved={onRefresh} />}
      {emailing && (
        <EmailModal
          defaultTo={emailing.email} ctx={{ trackingNumber: emailing.order?.trackingNumber, trackingUrl: emailing.order?.trackingUrl }}
          defaultTemplate="shipping_update"
          onClose={() => setEmailing(null)} onSent={() => {}}
        />
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Delete {selected.size} order{selected.size !== 1 ? 's' : ''}?</h3>
            <p className="text-gray-400 text-sm mb-6">This is permanent and cannot be undone. Associated images and data will remain.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm transition-colors">Cancel</button>
              <button onClick={deleteSelected} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm disabled:opacity-50 transition-colors">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input type="text" placeholder="Search email, name, order ID, tracking…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 w-72" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500">
          <option value="all">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>
        <span className="text-gray-500 text-sm">{filtered.length} orders</span>
        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">{selected.size} selected</span>
            <button onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded accent-purple-500 cursor-pointer" />
                </th>
                <th className="text-left px-4 py-3 w-12"></th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-600 py-12">No orders found</td></tr>
              ) : paginated.map(order => (
                <Fragment key={order.id}>
                  <tr className={`border-b border-white/5 transition-colors cursor-pointer
                    ${expanded === order.id ? 'bg-purple-950/30' : selected.has(order.id) ? 'bg-purple-950/20' : 'hover:bg-white/5'}`}
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(order.id)} onChange={() => toggleSelect(order.id)}
                        className="w-3.5 h-3.5 rounded accent-purple-500 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      {order.image?.generatedUrl
                        ? <img src={order.image.generatedUrl} alt="" className="w-10 h-12 object-cover rounded-lg" />
                        : <div className="w-10 h-12 bg-white/5 rounded-lg" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-sm">{order.user?.name || '—'}</p>
                      <p className="text-gray-500 text-xs">{order.user?.email}</p>
                      {order.shippingCity && <p className="text-gray-600 text-xs">{order.shippingCity}, {order.shippingCountry}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 capitalize text-sm">{order.productType?.replace(/-/g,' ')}</p>
                      <p className="text-gray-600 text-xs">{order.size}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">${order.price?.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditing(order)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all" title="Edit order">
                          <Icon.Edit />
                        </button>
                        <button onClick={() => setEmailing({ email: order.user?.email, order })}
                          className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 hover:text-purple-200 transition-all" title="Email customer">
                          <Icon.Mail />
                        </button>
                        {['paid_fulfillment_failed','paid_printful_failed'].includes(order.status) && (
                          <button onClick={() => retryFulfillment(order.id)} disabled={retrying === order.id}
                            className="p-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 hover:text-orange-200 transition-all disabled:opacity-50" title="Retry Printful fulfillment">
                            {retrying === order.id
                              ? <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin block" />
                              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr className="bg-purple-950/20 border-b border-white/5">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500 uppercase tracking-wide mb-1">Shipping Address</p>
                            <p className="text-gray-300">{order.shippingName}</p>
                            <p className="text-gray-400">{order.shippingAddress}{order.shippingAddress2 ? `, ${order.shippingAddress2}` : ''}</p>
                            <p className="text-gray-400">{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                            <p className="text-gray-400">{order.shippingCountry}</p>
                            {order.shippingPhone && <p className="text-gray-500">{order.shippingPhone}</p>}
                          </div>
                          <div>
                            <p className="text-gray-500 uppercase tracking-wide mb-1">Order Details</p>
                            <p className="text-gray-400">Stripe: <span className="font-mono text-gray-300">{order.stripeId ? order.stripeId.slice(0,20)+'…' : '—'}</span></p>
                            <p className="text-gray-400">Printful: <span className="font-mono text-gray-300">{order.printfulId || '—'}</span></p>
                            <p className="text-gray-400 mt-1">Style: <span className="text-gray-300 capitalize">{order.image?.style || '—'}</span></p>
                            <p className="text-gray-400">Digital: {order.digitalCopy ? '✅' : '—'} &nbsp; Extra: {order.extraCopy ? '✅' : '—'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 uppercase tracking-wide mb-1">Tracking</p>
                            {order.trackingNumber ? (
                              <>
                                <p className="font-mono text-gray-300">{order.trackingNumber}</p>
                                {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 mt-1"><Icon.Truck /> Track package</a>}
                              </>
                            ) : <p className="text-gray-600">No tracking yet</p>}
                          </div>
                          {order.status === 'refund_requested' && (
                            <div>
                              <p className="text-gray-500 uppercase tracking-wide mb-1">Refund Request</p>
                              <p className="text-rose-300">{order.refundReason || 'No reason given'}</p>
                              {order.refundRequestedAt && <p className="text-gray-500 mt-1">{new Date(order.refundRequestedAt).toLocaleDateString()}</p>}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-500 text-xs">
            Page {page} of {totalPages} · {filtered.length} orders
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => p === '…'
                ? <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm">…</span>
                : <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {p}
                  </button>
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Customers tab ────────────────────────────────────────────────────────────
function CustomersTab({ userList }) {
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [emailing, setEmailing] = useState(null);
  const [sortBy, setSortBy]   = useState('ltv');

  const filtered = userList
    .filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sortBy === 'createdAt'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : b[sortBy] - a[sortBy]);

  return (
    <div>
      {selected && (
        <CustomerPanel customer={selected} onClose={() => setSelected(null)}
          onEmail={email => { setSelected(null); setEmailing(email); }} />
      )}
      {emailing && (
        <EmailModal defaultTo={emailing} defaultTemplate="custom" onClose={() => setEmailing(null)} onSent={() => {}} />
      )}

      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input type="text" placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 w-64" />
        <div className="flex gap-1">
          {[['ltv','By LTV'],['orderCount','By Orders'],['createdAt','By Date']].map(([k,l]) => (
            <button key={k} onClick={() => setSortBy(k)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${sortBy === k ? 'bg-purple-600/30 border-purple-500/50 text-purple-200' : 'border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {l}
            </button>
          ))}
        </div>
        <span className="text-gray-500 text-sm">{filtered.length} customers</span>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Orders</th>
              <th className="text-left px-4 py-3">Lifetime Value</th>
              <th className="text-left px-4 py-3">Last Order</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelected(u)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{u.name || '—'}</p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300">{u.orderCount}</td>
                <td className="px-4 py-3 font-semibold text-emerald-400">${u.ltv.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.lastOrderAt ? new Date(u.lastOrderAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setEmailing(u.email)}
                    className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 hover:text-purple-200 transition-all" title="Email customer">
                    <Icon.Mail />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Refunds tab ──────────────────────────────────────────────────────────────
function RefundsTab({ refundRequests, onRefresh }) {
  const [processing, setProcessing] = useState({});
  const [emailing, setEmailing]     = useState(null);

  async function approve(order) {
    setProcessing(p => ({ ...p, [order.id]: 'approving' }));
    await fetch('/api/admin/order', { method: 'PATCH', headers: HEADERS, body: JSON.stringify({ orderId: order.id, status: 'refund_approved' }) });
    setProcessing(p => ({ ...p, [order.id]: null }));
    setEmailing({ email: order.user?.email, template: 'refund_approved', order });
    onRefresh();
  }

  async function deny(order) {
    await fetch('/api/admin/order', { method: 'PATCH', headers: HEADERS, body: JSON.stringify({ orderId: order.id, status: 'refund_denied' }) });
    setEmailing({ email: order.user?.email, template: 'refund_denied', order });
    onRefresh();
  }

  const daysSince = (date) => date ? Math.floor((Date.now() - new Date(date)) / 86400000) : null;

  return (
    <div>
      {emailing && (
        <EmailModal defaultTo={emailing.email} defaultTemplate={emailing.template}
          ctx={{ trackingNumber: emailing.order?.trackingNumber }}
          onClose={() => setEmailing(null)} onSent={() => {}}
        />
      )}

      {refundRequests.length === 0 ? (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-white font-bold mb-1">No pending refund requests</p>
          <p className="text-gray-500 text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-500 text-sm">{refundRequests.length} pending — sorted oldest first</p>
          {[...refundRequests].sort((a,b) => new Date(a.refundRequestedAt||a.updatedAt) - new Date(b.refundRequestedAt||b.updatedAt)).map(order => {
            const days = daysSince(order.refundRequestedAt || order.updatedAt);
            const isUrgent = days >= 3;
            return (
              <div key={order.id} className={`bg-gray-900 border rounded-2xl p-5 ${isUrgent ? 'border-rose-500/40' : 'border-white/10'}`}>
                <div className="flex items-start gap-4">
                  {order.image?.generatedUrl
                    ? <img src={order.image.generatedUrl} alt="" className="w-16 h-20 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-16 h-20 rounded-xl bg-white/5 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-white font-semibold">{order.user?.name || order.user?.email}</p>
                        <p className="text-gray-400 text-xs">{order.user?.email}</p>
                      </div>
                      {isUrgent && (
                        <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                          {days}d waiting
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm capitalize mb-1">{order.productType?.replace(/-/g,' ')} · ${order.price?.toFixed(2)}</p>
                    <div className="bg-white/5 rounded-xl px-3 py-2 mb-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Reason</p>
                      <p className="text-gray-200 text-sm">{order.refundReason || 'No reason provided'}</p>
                    </div>
                    {order.refundEvidenceUrl && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Damage Evidence</p>
                        <a href={order.refundEvidenceUrl} target="_blank" rel="noopener noreferrer">
                          <img src={order.refundEvidenceUrl} alt="Damage evidence" className="w-full max-h-40 object-cover rounded-xl border border-white/10 hover:opacity-90 transition-opacity" />
                        </a>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                      <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>Requested: {order.refundRequestedAt ? new Date(order.refundRequestedAt).toLocaleDateString() : '—'}</span>
                      {order.shippingCity && <span>📍 {order.shippingCity}, {order.shippingCountry}</span>}
                      {order.trackingNumber && <span>🚚 {order.trackingNumber}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approve(order)} disabled={!!processing[order.id]}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-all disabled:opacity-50">
                        {processing[order.id] === 'approving'
                          ? <span className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                          : <Icon.Check />}
                        Approve & Email
                      </button>
                      <button onClick={() => deny(order)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 transition-all">
                        <Icon.X /> Deny & Email
                      </button>
                      <button onClick={() => setEmailing({ email: order.user?.email, template: 'custom', order })}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 transition-all">
                        <Icon.Mail /> Custom Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Messaging tab ────────────────────────────────────────────────────────────
const QS_PAGE_SIZE = 8;

function MessagingTab({ userList }) {
  const [view, setView] = useState('inbox'); // 'inbox' | 'sent' | 'compose'

  // Email lists
  const [inbox,      setInbox]      = useState([]);
  const [sent,       setSent]       = useState([]);
  const [unread,     setUnread]     = useState(0);
  const [loadingMail, setLoadingMail] = useState(false);
  const [openEmail,  setOpenEmail]  = useState(null);

  // Compose state
  const [to, setTo]               = useState('');
  const [template, setTemplate]   = useState('custom');
  const [subject, setSubject]     = useState('');
  const [body, setBody]           = useState('');
  const [sending, setSending]     = useState(false);
  const [result, setResult]       = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Quick Select state
  const [qsSearch, setQsSearch]   = useState('');
  const [qsPage, setQsPage]       = useState(0);

  const suggestions = to.length > 0
    ? userList.filter(u => u.email.toLowerCase().includes(to.toLowerCase()) || u.name?.toLowerCase().includes(to.toLowerCase())).slice(0, 5)
    : [];

  async function fetchEmails() {
    setLoadingMail(true);
    const [inRes, sentRes] = await Promise.all([
      fetch('/api/admin/emails?direction=received', { headers: HEADERS }),
      fetch('/api/admin/emails?direction=sent',     { headers: HEADERS }),
    ]);
    const inData   = await inRes.json();
    const sentData = await sentRes.json();
    setInbox(inData.emails  || []);
    setSent(sentData.emails || []);
    setUnread(inData.unreadCount || 0);
    setLoadingMail(false);
  }

  useEffect(() => { fetchEmails(); }, []);

  async function markRead(email) {
    if (email.direction === 'received' && !email.read) {
      await fetch('/api/admin/emails', { method: 'PATCH', headers: HEADERS, body: JSON.stringify({ id: email.id }) });
      setInbox(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
      setUnread(u => Math.max(0, u - 1));
    }
    setOpenEmail(email);
  }

  useEffect(() => {
    if (view === 'compose') {
      const t = buildTemplate(template);
      setSubject(t.subject);
      setBody(t.body.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    }
  }, [template, view]);

  async function send() {
    if (!to || !subject || !body) return;
    setSending(true); setResult(null);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST', headers: HEADERS,
        body: JSON.stringify({ to, subject, body: body.includes('<') ? body : body.replace(/\n/g, '<br>') }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult('sent');
      setTo(''); setBody(''); setSubject(''); setTemplate('custom');
      fetchEmails();
      setTimeout(() => setView('sent'), 1200);
    } catch {
      setResult('error');
    } finally {
      setSending(false);
    }
  }

  const TMPL_OPTIONS = [
    { value: 'shipping_update',  label: '📦 Shipping Update' },
    { value: 'order_confirmed',  label: '✅ Order Confirmed' },
    { value: 'refund_approved',  label: '💚 Refund Approved' },
    { value: 'refund_denied',    label: '❌ Refund Denied' },
    { value: 'reprint_sent',     label: '🖼️ Replacement Shipped' },
    { value: 'custom',           label: '✏️ Custom Message' },
  ];

  const emailList = view === 'inbox' ? inbox : sent;

  // ── Email viewer modal ──────────────────────────────────────────────────────
  if (openEmail) {
    return (
      <div>
        <button onClick={() => setOpenEmail(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to {openEmail.direction === 'received' ? 'Inbox' : 'Sent'}
        </button>
        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <p className="text-white font-bold text-base mb-1">{openEmail.subject}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span><span className="text-gray-600">From:</span> {openEmail.from}</span>
              <span><span className="text-gray-600">To:</span> {openEmail.to}</span>
              <span>{new Date(openEmail.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="p-6">
            {openEmail.body.includes('<') ? (
              <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: openEmail.body }} />
            ) : (
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{openEmail.body}</pre>
            )}
          </div>
          {openEmail.direction === 'received' && (
            <div className="px-6 pb-5">
              <button
                onClick={() => { setTo(openEmail.from.replace(/.*<(.+)>/, '$1').trim()); setView('compose'); setOpenEmail(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-all">
                <Icon.Mail /> Reply
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { key: 'inbox',   label: 'Inbox',   badge: unread },
          { key: 'sent',    label: 'Sent' },
          { key: 'compose', label: '+ Compose' },
        ].map(t => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border
              ${view === t.key ? 'bg-purple-600/30 border-purple-500/50 text-purple-200' : 'border-white/10 text-gray-400 hover:text-gray-200'}`}>
            {t.label}
            {t.badge > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{t.badge}</span>
            )}
          </button>
        ))}
        <button onClick={fetchEmails} className="ml-auto text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.07-3.5"/></svg>
          Refresh
        </button>
      </div>

      {/* Inbox / Sent list */}
      {(view === 'inbox' || view === 'sent') && (
        loadingMail ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : emailList.length === 0 ? (
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-16 text-center">
            <Icon.Mail />
            <p className="text-gray-500 text-sm mt-3">{view === 'inbox' ? 'No incoming emails yet' : 'No emails sent yet'}</p>
            {view === 'inbox' && <p className="text-gray-600 text-xs mt-1">Set up Resend inbound to receive emails here</p>}
          </div>
        ) : (
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
            {emailList.map(email => (
              <button key={email.id} onClick={() => markRead(email)}
                className={`w-full flex items-start gap-4 px-5 py-4 hover:bg-white/5 text-left transition-colors
                  ${email.direction === 'received' && !email.read ? 'bg-purple-500/5 border-l-2 border-purple-500' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0 mt-0.5">
                  {(email.direction === 'received' ? email.from : email.to)[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${email.direction === 'received' && !email.read ? 'text-white font-semibold' : 'text-gray-300'}`}>
                      {email.direction === 'received'
                        ? email.from.replace(/<.*>/, '').trim() || email.from
                        : `To: ${email.to}`}
                    </p>
                    <span className="text-xs text-gray-600 flex-shrink-0">{new Date(email.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-xs truncate ${email.direction === 'received' && !email.read ? 'text-gray-300' : 'text-gray-500'}`}>{email.subject}</p>
                  <p className="text-xs text-gray-700 truncate mt-0.5">{email.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)}</p>
                </div>
                {email.direction === 'received' && !email.read && (
                  <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-2" />
                )}
              </button>
            ))}
          </div>
        )
      )}

      {/* Compose */}
      {view === 'compose' && (() => {
        const qsFiltered = userList.filter(u =>
          !qsSearch ||
          u.email.toLowerCase().includes(qsSearch.toLowerCase()) ||
          u.name?.toLowerCase().includes(qsSearch.toLowerCase())
        );
        const qsTotalPages = Math.max(1, Math.ceil(qsFiltered.length / QS_PAGE_SIZE));
        const qsSlice = qsFiltered.slice(qsPage * QS_PAGE_SIZE, (qsPage + 1) * QS_PAGE_SIZE);

        return (
          <div className="grid md:grid-cols-5 gap-5">
            {/* ── Compose form ── */}
            <div className="md:col-span-3 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">New Email</h3>
                {to && <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-0.5 truncate max-w-[200px]">{to}</span>}
              </div>

              <div className="p-6 space-y-4">
                {/* Template chips */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Template</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TMPL_OPTIONS.map(t => (
                      <button key={t.value} onClick={() => setTemplate(t.value)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap
                          ${template === t.value
                            ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                            : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* To field */}
                <div className="relative">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1.5">To</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    <input value={to} onChange={e => { setTo(e.target.value); setShowSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Customer email or name…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors" />
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1728] border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl">
                      {suggestions.map(u => (
                        <button key={u.id} onMouseDown={() => { setTo(u.email); setShowSuggestions(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left transition-colors">
                          <div className="w-7 h-7 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                            {(u.name || u.email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm truncate">{u.name || u.email}</p>
                            {u.name && <p className="text-gray-500 text-xs truncate">{u.email}</p>}
                          </div>
                          <span className="text-gray-600 text-xs flex-shrink-0">${u.ltv.toFixed(0)} LTV</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1.5">Subject</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-colors" />
                </div>

                {/* Message */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1.5">Message</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} rows={9}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-colors resize-none" />
                </div>

                {result === 'sent'  && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    <Icon.Check /> Email sent successfully!
                  </div>
                )}
                {result === 'error' && (
                  <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    Failed to send — check server logs.
                  </div>
                )}

                <button onClick={send} disabled={!to || !subject || !body || sending}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {sending
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
                    : <><Icon.Mail /> Send Email</>}
                </button>
              </div>
            </div>

            {/* ── Quick Select ── */}
            <div className="md:col-span-2 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              {/* Panel header */}
              <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Customers</h3>
                <span className="text-[10px] text-gray-600">{qsFiltered.length} total</span>
              </div>

              {/* Search */}
              <div className="px-3 py-2.5 border-b border-white/5">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    value={qsSearch}
                    onChange={e => { setQsSearch(e.target.value); setQsPage(0); }}
                    placeholder="Search name or email…"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Customer list */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {qsSlice.length === 0 ? (
                  <p className="text-gray-600 text-xs text-center py-8">No customers found</p>
                ) : qsSlice.map(u => (
                  <button key={u.id} onClick={() => setTo(u.email)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 hover:bg-white/5 text-left transition-colors
                      ${to === u.email ? 'bg-purple-600/10 border-l-2 border-purple-500' : ''}`}>
                    <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-200 text-xs font-medium truncate">{u.name || u.email}</p>
                      {u.name && <p className="text-gray-600 text-[11px] truncate">{u.email}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-gray-500 text-[10px]">{u.orderCount} orders</p>
                      <p className="text-purple-400/70 text-[10px]">${u.ltv.toFixed(0)}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setQsPage(p => Math.max(0, p - 1))}
                  disabled={qsPage === 0}
                  className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  Prev
                </button>
                <span className="text-[10px] text-gray-600">
                  {qsPage + 1} / {qsTotalPages}
                </span>
                <button
                  onClick={() => setQsPage(p => Math.min(qsTotalPages - 1, p + 1))}
                  disabled={qsPage >= qsTotalPages - 1}
                  className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
                  Next
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Logs tab ─────────────────────────────────────────────────────────────────
const LOG_LEVELS = ['all', 'info', 'warn', 'error'];
const LOG_SOURCES = ['all', 'fulfillment', 'webhook', 'confirm', 'generate'];

const LEVEL_STYLE = {
  info:  { row: 'border-white/5',                  badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',    dot: 'bg-blue-400' },
  warn:  { row: 'border-yellow-500/10 bg-yellow-500/5', badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', dot: 'bg-yellow-400' },
  error: { row: 'border-red-500/10 bg-red-500/5',   badge: 'bg-red-500/20 text-red-300 border border-red-500/30',      dot: 'bg-red-500' },
};

const LOGS_PAGE_SIZE = 50;

function LogsTab({ highlightLogId = null, onHighlightClear = null }) {
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [level,      setLevel]      = useState('all');
  const [source,     setSource]     = useState('all');
  const [copied,     setCopied]     = useState(null);
  const [clearing,   setClearing]   = useState(false);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [glowId,     setGlowId]     = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / LOGS_PAGE_SIZE));

  async function fetchLogs(p = page, lvl = level, src = source) {
    setLoading(true);
    const params = new URLSearchParams();
    if (lvl !== 'all') params.set('level',  lvl);
    if (src !== 'all') params.set('source', src);
    params.set('limit', String(LOGS_PAGE_SIZE));
    params.set('page',  String(p));
    const res  = await fetch(`/api/admin/logs?${params}`, { headers: HEADERS });
    const data = await res.json();
    setLogs(data.logs || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { setPage(1); fetchLogs(1); }, [level, source]);
  useEffect(() => { fetchLogs(page); }, [page]);

  // When a notification deep-links to a specific log entry
  useEffect(() => {
    if (!highlightLogId) return;
    // Force error filter + page 1 so the entry is visible
    setLevel('error');
    setPage(1);
    fetchLogs(1, 'error', source);
  }, [highlightLogId]);

  // Once logs load and we have a highlight target — scroll + glow
  useEffect(() => {
    if (!highlightLogId || loading) return;
    const el = document.querySelector(`[data-log-id="${highlightLogId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setGlowId(highlightLogId);
      const t = setTimeout(() => { setGlowId(null); onHighlightClear?.(); }, 3000);
      return () => clearTimeout(t);
    }
  }, [logs, loading, highlightLogId]);

  function copyLog(log) {
    const meta = log.meta ? JSON.parse(log.meta) : null;
    const text = [
      `[${log.level.toUpperCase()}] ${log.source}`,
      `Time: ${new Date(log.createdAt).toLocaleString()}`,
      `Message: ${log.message}`,
      meta ? `Meta: ${JSON.stringify(meta, null, 2)}` : null,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(log.id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function clearLevel(lvl) {
    if (!confirm(`Clear all ${lvl} logs?`)) return;
    setClearing(true);
    await fetch(`/api/admin/logs?level=${lvl}`, { method: 'DELETE', headers: HEADERS });
    setClearing(false);
    fetchLogs();
  }

  const counts = logs.reduce((acc, l) => { acc[l.level] = (acc[l.level] || 0) + 1; return acc; }, {});

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {LOG_LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-all
                ${level === l ? 'bg-purple-600/30 border-purple-500/50 text-purple-200' : 'border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {l}{l !== 'all' && counts[l] ? ` (${counts[l]})` : ''}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {LOG_SOURCES.map(s => (
            <button key={s} onClick={() => setSource(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all
                ${source === s ? 'bg-blue-600/30 border-blue-500/50 text-blue-200' : 'border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => fetchLogs(page)} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 ml-auto">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.07-3.5"/></svg>
          Refresh
        </button>
        {(level === 'warn' || level === 'error') && (
          <button onClick={() => clearLevel(level)} disabled={clearing}
            className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40">
            Clear {level} logs
          </button>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 mb-4">
        {['info','warn','error'].map(l => {
          const s = LEVEL_STYLE[l];
          return (
            <div key={l} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${s.badge}`}>
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              {l.charAt(0).toUpperCase() + l.slice(1)}: {counts[l] || 0}
            </div>
          );
        })}
      </div>

      {/* Log list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-gray-600 text-sm">No logs found</div>
      ) : (
        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
          {logs.map((log) => {
            const s    = LEVEL_STYLE[log.level] || LEVEL_STYLE.info;
            const meta = log.meta ? (() => { try { return JSON.parse(log.meta); } catch { return null; } })() : null;
            const canCopy = log.level === 'warn' || log.level === 'error';
            return (
              <div
              key={log.id}
              data-log-id={log.id}
              className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 transition-all duration-300 ${s.row} ${glowId === log.id ? 'ring-2 ring-inset ring-red-500/70 bg-red-500/10' : ''}`}
              style={glowId === log.id ? { animation: 'logHighlight 3s ease-out forwards' } : {}}
            >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${s.badge}`}>{log.level}</span>
                    <span className="text-purple-400">{log.source}</span>
                    <span className="text-gray-600">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 break-all leading-relaxed">{log.message}</p>
                  {meta && (
                    <div className="mt-1 text-gray-600 text-[10px] break-all">
                      {Object.entries(meta).map(([k, v]) => (
                        <span key={k} className="mr-3"><span className="text-gray-500">{k}:</span> {String(v)}</span>
                      ))}
                    </div>
                  )}
                </div>
                {canCopy && (
                  <button
                    onClick={() => copyLog(log)}
                    title="Copy log"
                    className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all"
                  >
                    {copied === log.id
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > LOGS_PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages} · {total} logs
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) => p === '…'
                ? <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xs">…</span>
                : <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                    {p}
                  </button>
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Generation Bank ──────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

function GenerationBankTab() {
  const [images,    setImages]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [userFilter, setUserFilter] = useState('all');   // all | user | guest
  const [styleFilter, setStyleFilter] = useState('all'); // all | <style>
  const [search,    setSearch]    = useState('');
  const [view,      setView]      = useState('grid');    // grid | list
  const [page,      setPage]      = useState(1);
  const [lightbox,  setLightbox]  = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [confirmId, setConfirmId] = useState(null); // id of image pending delete modal

  useEffect(() => {
    fetch('/api/admin/generations', { headers: HEADERS })
      .then(r => r.json())
      .then(d => { setImages(d.images || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [userFilter, styleFilter, search]);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(l => { const n = (l.index + 1) % filtered.length; return { img: filtered[n], index: n }; });
      if (e.key === 'ArrowLeft')  setLightbox(l => { const n = (l.index - 1 + filtered.length) % filtered.length; return { img: filtered[n], index: n }; });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  // Derive unique styles from loaded images
  const styles = ['all', ...Array.from(new Set(images.map(i => i.style).filter(Boolean))).sort()];

  const filtered = images.filter(img => {
    if (userFilter === 'guest' && img.status !== 'guest') return false;
    if (userFilter === 'user'  && img.status === 'guest') return false;
    if (styleFilter !== 'all'  && img.style !== styleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hash = img.id.replace(/-/g, '').slice(0, 8).toUpperCase();
      return (img.user?.email || '').toLowerCase().includes(q) ||
             (img.style || '').toLowerCase().includes(q) ||
             hash.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function downloadHD(url, name) {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { window.open(url, '_blank'); }
  }

  async function deleteImage(id) {
    setDeleting(id);
    try {
      const res = await fetch('/api/admin/generations', { method: 'DELETE', headers: HEADERS, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Delete failed');
      setImages(prev => prev.filter(img => img.id !== id));
      if (lightbox?.img?.id === id) setLightbox(null);
    } catch (e) { alert('Delete failed: ' + e.message); }
    finally { setDeleting(null); setConfirmId(null); }
  }

  const ActionButtons = ({ img, index }) => (
    <div className="flex gap-1.5 flex-shrink-0">
      <button onClick={() => setLightbox({ img, index })} title="Expand"
        className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
      </button>
      <button onClick={() => downloadHD(img.generatedUrl, `maitrepets-${img.style}-${img.id}.png`)} title="Download HD"
        className="bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-lg transition-colors">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <button onClick={() => setConfirmId(img.id)} title="Delete"
        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-1.5 rounded-lg transition-colors">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* User type filter */}
        <div className="flex gap-1.5">
          {[['all', `All (${images.length})`], ['user', `Users (${images.filter(i=>i.status!=='guest').length})`], ['guest', `Guests (${images.filter(i=>i.status==='guest').length})`]].map(([val, label]) => (
            <button key={val} onClick={() => setUserFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${userFilter === val ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Style filter */}
        <select value={styleFilter} onChange={e => setStyleFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 capitalize">
          {styles.map(s => (
            <option key={s} value={s} className="bg-[#1a1a2e] capitalize">
              {s === 'all' ? `All Styles (${images.length})` : `${s} (${images.filter(i=>i.style===s).length})`}
            </option>
          ))}
        </select>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search email or style…"
          className="flex-1 min-w-[160px] bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500" />

        <span className="text-gray-600 text-xs">{filtered.length} results</span>

        {/* View toggle */}
        <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5 ml-auto">
          <button onClick={() => setView('grid')} title="Grid view"
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button onClick={() => setView('list')} title="List view"
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-3">
          <p className="text-gray-500">No generations match the current filters.</p>
          {(userFilter !== 'all' || styleFilter !== 'all' || search) && (
            <button
              onClick={() => { setUserFilter('all'); setStyleFilter('all'); setSearch(''); }}
              className="px-4 py-1.5 rounded-lg text-xs bg-white/10 text-gray-300 hover:bg-white/20 transition-all">
              Clear filters
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((img, i) => {
            const globalIndex = (page - 1) * PAGE_SIZE + i;
            return (
              <div key={img.id} className="group bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="grid grid-cols-2 gap-0.5 bg-white/5 cursor-zoom-in"
                     onClick={() => setLightbox({ img, index: globalIndex })}>
                  <div className="relative aspect-square overflow-hidden">
                    {img.originalUrl
                      ? <img src={img.originalUrl} alt="original" className="w-full h-full object-cover" loading="lazy" onError={e => { e.target.style.display='none'; }} />
                      : <div className="w-full h-full bg-white/10 flex items-center justify-center text-gray-600 text-xs">No source</div>}
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">ORIGINAL</span>
                  </div>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={img.generatedUrl} alt={img.style}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy" onError={e => { e.target.src='https://placedog.net/300/300?id='+i; }} />
                    {img.status === 'guest' && <span className="absolute top-1 right-1 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">GUEST</span>}
                  </div>
                </div>
                <div className="p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-gray-300 text-[10px] truncate">{img.user?.email || 'guest'}</p>
                    <p className="text-[10px] flex items-center gap-2">
                      <span className="text-purple-400/70 font-mono tracking-wider">#{img.id.replace(/-/g,'').slice(0,8).toUpperCase()}</span>
                      <span className="text-gray-600">{new Date(img.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <ActionButtons img={img} index={globalIndex} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List view ── */
        <div className="space-y-1.5">
          {paginated.map((img, i) => {
            const globalIndex = (page - 1) * PAGE_SIZE + i;
            return (
              <div key={img.id} className="group flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-purple-500/40 rounded-xl px-3 py-2.5 transition-all">
                {/* Thumbnails */}
                <div className="flex gap-1 flex-shrink-0 cursor-zoom-in" onClick={() => setLightbox({ img, index: globalIndex })}>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5">
                    {img.originalUrl
                      ? <img src={img.originalUrl} alt="orig" className="w-full h-full object-cover" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-700 text-[9px]">–</div>}
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[7px] font-semibold text-center py-0.5">ORIG</span>
                  </div>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-1 ring-purple-500/40">
                    <img src={img.generatedUrl} alt={img.style} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-semibold capitalize">{img.style}</span>
                    {img.status === 'guest' && <span className="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">GUEST</span>}
                    <span className="text-purple-400/70 text-[9px] font-mono tracking-wider">#{img.id.replace(/-/g,'').slice(0,8).toUpperCase()}</span>
                  </div>
                  <p className="text-gray-400 text-[11px] truncate">{img.user?.email || 'guest'}</p>
                </div>
                <p className="text-gray-600 text-[10px] flex-shrink-0 hidden sm:block">{new Date(img.createdAt).toLocaleDateString()}</p>
                <ActionButtons img={img} index={globalIndex} />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2).reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, []).map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="text-gray-600 px-1 text-xs">…</span>
            ) : (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === p ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                {p}
              </button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <div>
              <p className="text-white font-semibold text-sm capitalize">{lightbox.img.style} portrait <span className="text-purple-400/80 font-mono text-xs tracking-wider">#{lightbox.img.id.replace(/-/g,'').slice(0,8).toUpperCase()}</span></p>
              <p className="text-gray-500 text-xs">{lightbox.img.user?.email || 'guest'} · {new Date(lightbox.img.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => setLightbox(null)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-16 min-h-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(l => { const n = (l.index - 1 + filtered.length) % filtered.length; return { img: filtered[n], index: n }; })}
              className="flex-shrink-0 text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center max-h-full overflow-y-auto">
              {lightbox.img.originalUrl && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Original</span>
                    <button onClick={() => downloadHD(lightbox.img.originalUrl, `maitrepets-original-${lightbox.img.id}.png`)}
                      className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download
                    </button>
                  </div>
                  <img src={lightbox.img.originalUrl} alt="original" className="max-h-[35vh] sm:max-h-[72vh] max-w-[80vw] sm:max-w-[38vw] object-contain rounded-xl shadow-2xl" />
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider capitalize">{lightbox.img.style}</span>
                  <button onClick={() => downloadHD(lightbox.img.generatedUrl, `maitrepets-${lightbox.img.style}-${lightbox.img.id}.png`)}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download HD
                  </button>
                </div>
                <img src={lightbox.img.generatedUrl} alt={lightbox.img.style} className="max-h-[35vh] sm:max-h-[72vh] max-w-[80vw] sm:max-w-[38vw] object-contain rounded-xl shadow-2xl ring-2 ring-purple-500/40" />
              </div>
            </div>
            <button onClick={() => setLightbox(l => { const n = (l.index + 1) % filtered.length; return { img: filtered[n], index: n }; })}
              className="flex-shrink-0 text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => setConfirmId(lightbox.img.id)}
              className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
            <p className="text-gray-600 text-xs">{lightbox.index + 1} / {filtered.length}<span className="hidden sm:inline"> · ← → to navigate · Esc to close</span></p>
            <div className="w-20" />
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {confirmId && (() => {
        const target = images.find(img => img.id === confirmId);
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setConfirmId(null)}>
            <div className="bg-[#16162a] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Icon */}
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </div>
              <h3 className="text-white font-bold text-base text-center mb-1">Delete this portrait?</h3>
              <p className="text-gray-500 text-xs text-center mb-4">
                {target ? `${target.style} · ${target.user?.email || 'guest'}` : ''}<br/>
                <span className="text-red-400">This cannot be undone.</span>
              </p>
              {/* Preview thumbnail */}
              {target?.generatedUrl && (
                <img src={target.generatedUrl} alt="preview"
                  className="w-24 h-24 object-cover rounded-xl mx-auto mb-5 ring-2 ring-red-500/30" />
              )}
              <div className="flex gap-3">
                <button onClick={() => setConfirmId(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={() => deleteImage(confirmId)} disabled={deleting === confirmId}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting === confirmId
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting…</>
                    : 'Yes, delete'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────
function AdminLogin({ onAuth }) {
  const [key, setKey]       = useState('');
  const [error, setError]   = useState('');
  const [show, setShow]     = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (key === (process.env.NEXT_PUBLIC_ADMIN_KEY || '8133089')) {
      sessionStorage.setItem('admin_auth', key);
      onAuth(key);
    } else {
      setError('Invalid secret key.');
      setKey('');
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-black text-white mb-1">Maîtrepets</p>
          <p className="text-gray-500 text-sm">Admin access only</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Secret Key</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={e => { setKey(e.target.value); setError(''); }}
                placeholder="Enter admin secret key"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors pr-10"
                required
              />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-xs">
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <p className="text-rose-400 text-xs mt-2">{error}</p>}
          </div>
          <button type="submit"
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors">
            Enter Dashboard →
          </button>
        </form>
      </div>
    </div>
  );
}

function useAdminTheme() {
  const [theme, setTheme] = useState('system'); // 'system' | 'light' | 'dark'
  const [sysDark, setSysDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_theme');
    if (saved) setTheme(saved);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSysDark(mq.matches);
    const handler = (e) => setSysDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && sysDark);

  function cycleTheme() {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    localStorage.setItem('admin_theme', next);
  }

  return { theme, isDark, cycleTheme };
}

const AI_MODELS = [
  {
    key:         'gpt-image-1',
    label:       'GPT-Image-1',
    provider:    'OpenAI',
    description: 'Highest quality. Uses edit mode with reference image for best likeness. Recommended.',
    badge:       'Recommended',
    badgeColor:  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
  {
    key:         'flux',
    label:       'Flux 1.1 Pro',
    provider:    'Replicate',
    description: 'Fast generation via Replicate. Lower cost, slightly less accurate likeness.',
    badge:       'Faster',
    badgeColor:  'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
];

function SettingsTab() {
  const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'paypal';
  const isPayPal = provider === 'paypal';

  const [activeModel, setActiveModel] = useState(null); // null = loading
  const [savingModel, setSavingModel] = useState(false);
  const [modelSaved,  setModelSaved]  = useState(false);

  useEffect(() => {
    fetch('/api/admin/config', { headers: HEADERS })
      .then(r => r.json())
      .then(d => setActiveModel(d.config?.ai_model || 'gpt-image-1'))
      .catch(() => setActiveModel('gpt-image-1'));
  }, []);

  async function saveModel(key) {
    setSavingModel(true);
    await fetch('/api/admin/config', {
      method:  'POST',
      headers: HEADERS,
      body:    JSON.stringify({ ai_model: key }),
    });
    setActiveModel(key);
    setSavingModel(false);
    setModelSaved(true);
    setTimeout(() => setModelSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h2 className="text-xl font-black text-white mb-1">Settings</h2>
        <p className="text-gray-500 text-sm">Manage app configuration.</p>
      </div>

      {/* AI Model */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">AI Generation Model</p>
            <p className="text-xs text-gray-500 mt-0.5">Controls which model generates pet portraits in production</p>
          </div>
          {modelSaved && (
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AI_MODELS.map(model => {
            const isActive = activeModel === model.key;
            return (
              <button
                key={model.key}
                onClick={() => !isActive && saveModel(model.key)}
                disabled={savingModel || activeModel === null}
                className={`text-left rounded-xl border p-4 transition-all disabled:opacity-60
                  ${isActive
                    ? 'border-purple-500/60 bg-purple-500/10 ring-1 ring-purple-500/30'
                    : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{model.label}</p>
                    <p className="text-[10px] text-gray-500">{model.provider}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isActive && (
                      <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${model.badgeColor}`}>{model.badge}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{model.description}</p>
              </button>
            );
          })}
        </div>

        <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-500">
          Changes take effect immediately — no redeploy needed. The active model is stored in the database.
        </div>
      </div>

      {/* Payment Provider */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Payment Provider</p>
            <p className="text-xs text-gray-500 mt-0.5">Controls which processor handles checkout</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPayPal ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
            {isPayPal ? 'PayPal' : 'Stripe'} — Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* PayPal card */}
          <div className={`rounded-xl border p-4 ${isPayPal ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 bg-white/3 opacity-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 11C7 8 9 6 12.5 6H16c2 0 3.5 1 3.5 3s-1.5 3-3.5 3h-2L13 17H9.5L11 12H8.5A1.5 1.5 0 017 11z" fill="#009cde"/><path d="M4 14c0-3 2-5 5.5-5H13c2 0 3.5 1 3.5 3s-1.5 3-3.5 3h-2L10 20H6.5L8 15H5.5A1.5 1.5 0 014 14z" fill="#012169"/></svg>
              <span className="text-sm font-bold text-white">PayPal</span>
              {isPayPal && <span className="ml-auto text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span>}
            </div>
            <p className="text-xs text-gray-400">Hosted redirect checkout. No Stripe account needed.</p>
          </div>

          {/* Stripe card */}
          <div className={`rounded-xl border p-4 ${!isPayPal ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/3 opacity-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#635bff"/><path d="M10.5 9.5c0-.8.7-1.1 1.8-1.1 1.6 0 3.6.5 5 1.3V6.2c-1.7-.7-3.3-1-5-1-4.1 0-6.8 2.1-6.8 5.7 0 5.5 7.6 4.6 7.6 7 0 .9-.8 1.2-1.9 1.2-1.7 0-3.8-.7-5.5-1.7v3.5c1.9.8 3.7 1.1 5.5 1.1 4.2 0 7-2.1 7-5.7-.1-5.9-7.7-4.9-7.7-6.8z" fill="white"/></svg>
              <span className="text-sm font-bold text-white">Stripe</span>
              {!isPayPal && <span className="ml-auto text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span>}
            </div>
            <p className="text-xs text-gray-400">Native card checkout. Requires active Stripe account.</p>
          </div>
        </div>

        <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-400 space-y-1.5">
          <p className="font-semibold text-gray-300">To switch payment provider:</p>
          <p>1. Open <code className="bg-white/10 px-1 rounded">.env</code> and set <code className="bg-white/10 px-1 rounded">PAYMENT_PROVIDER="stripe"</code> or <code className="bg-white/10 px-1 rounded">"paypal"</code></p>
          <p>2. Add the corresponding env vars to Vercel → Settings → Environment Variables</p>
          <p>3. Redeploy for changes to take effect</p>
        </div>
      </div>

      {/* Current credentials status */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
        <p className="text-sm font-bold text-white">Credential Status</p>
        {[
          { label: 'PayPal Client ID', value: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, present: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID },
          { label: 'PayPal Environment', value: process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'live', present: true },
          { label: 'Stripe Key', value: process.env.STRIPE_SECRET_KEY ? '••••••••' : null, present: !!process.env.STRIPE_SECRET_KEY },
        ].map(({ label, value, present }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{label}</span>
            <span className={`font-mono px-2 py-0.5 rounded ${present ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
              {present ? (value || 'set') : 'not set'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('overview');
  const { theme, isDark, cycleTheme } = useAdminTheme();

  // ── Unread email toast ─────────────────────────────────────────────────────
  const [unreadEmails, setUnreadEmails]   = useState(0);
  const [emailToast, setEmailToast]       = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);
  const prevUnread = useRef(0);

  const pollUnread = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/emails', { headers: HEADERS });
      const json = await res.json();
      const count = json.unreadCount || 0;
      setUnreadEmails(count);
      if (count > prevUnread.current) {
        setEmailToast(true);
        setToastDismissed(false);
        const diff = count - prevUnread.current;
        setNotifItems(prev => [{
          id:    `email-${Date.now()}`,
          type:  'email',
          title: `${diff} new ${diff === 1 ? 'message' : 'messages'}`,
          body:  'New customer message in your inbox',
          time:  new Date().toISOString(),
        }, ...prev].slice(0, 30));
      }
      prevUnread.current = count;
    } catch {}
  }, []);

  useEffect(() => {
    if (!authed) return;
    pollUnread();
    const id = setInterval(pollUnread, 30000);
    return () => clearInterval(id);
  }, [authed, pollUnread]);

  useEffect(() => {
    if (!emailToast) return;
    const id = setTimeout(() => setEmailToast(false), 6000);
    return () => clearTimeout(id);
  }, [emailToast]);

  // ── Error log notifications ────────────────────────────────────────────────
  const [newErrorCount, setNewErrorCount] = useState(0);
  const [errorToast, setErrorToast]       = useState(null);
  const prevErrorTotal = useRef(null);

  const pollErrors = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/logs?level=error&limit=3', { headers: HEADERS });
      const json = await res.json();
      const total = json.total || 0;
      if (prevErrorTotal.current === null) {
        prevErrorTotal.current = total;
        setNewErrorCount(0);
        return;
      }
      const diff = total - prevErrorTotal.current;
      if (diff > 0) {
        setNewErrorCount(prev => prev + diff);
        const latest = json.logs?.[0];
        setErrorToast({ count: diff, message: latest?.message || 'An error occurred', source: latest?.source || '' });
        // Push into notification feed
        const newItems = (json.logs || []).slice(0, diff).map(l => ({
          id:       l.id,
          type:     'error',
          title:    `Error — ${l.source || 'system'}`,
          body:     l.message,
          time:     l.createdAt,
          customer: l.customer || null, // { name, email } if linked to an order
        }));
        setNotifItems(prev => [...newItems, ...prev].slice(0, 30));
        prevErrorTotal.current = total;
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!authed) return;
    pollErrors();
    const id = setInterval(pollErrors, 30000);
    return () => clearInterval(id);
  }, [authed, pollErrors]);

  useEffect(() => {
    if (!errorToast) return;
    const id = setTimeout(() => setErrorToast(null), 8000);
    return () => clearTimeout(id);
  }, [errorToast]);

  // ── Notification panel ─────────────────────────────────────────────────────
  const [highlightLogId, setHighlightLogId] = useState(null);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifItems, setNotifItems] = useState([]); // { id, type, title, body, time }
  const notifRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e) { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const totalNotif = notifItems.length + (unreadEmails > 0 ? 1 : 0);
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_auth');
    if (stored === (process.env.NEXT_PUBLIC_ADMIN_KEY || '8133089')) {
      setAuthed(true);
      return;
    }
    // Auto-auth if logged-in user is a superadmin
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.user?.isSuperAdmin) {
          sessionStorage.setItem('admin_auth', process.env.NEXT_PUBLIC_ADMIN_KEY || '8133089');
          setAuthed(true);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/stats', { headers: HEADERS });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [fetchData, authed]);

  if (!authed) return <AdminLogin onAuth={() => setAuthed(true)} />;

  const TABS = [
    { key: 'overview',   label: 'Overview',   Icon: Icon.Overview },
    { key: 'orders',     label: 'Orders',      Icon: Icon.Orders },
    { key: 'customers',  label: 'Customers',   Icon: Icon.Customers },
    { key: 'refunds',    label: 'Refunds',     Icon: Icon.Refunds, badge: data?.stats?.refundRequestedOrders },
    { key: 'messaging',  label: 'Messaging',   Icon: Icon.Messaging, badge: unreadEmails || undefined },
    { key: 'generations', label: 'Gen Bank',   Icon: Icon.GenBank },
    { key: 'logs',       label: 'Logs',        Icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, badge: newErrorCount || undefined },
    { key: 'settings',   label: 'Settings',    Icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ];

  return (
    <>
    <style>{`
      @keyframes logHighlight {
        0%   { background:rgba(239,68,68,0.22); box-shadow:0 0 0 2px rgba(239,68,68,0.5) inset; }
        60%  { background:rgba(239,68,68,0.10); box-shadow:0 0 0 2px rgba(239,68,68,0.25) inset; }
        100% { background:transparent; box-shadow:none; }
      }
    `}</style>
    {!isDark && (
      <style>{`
        /* ── Base ── */
        .admin-root { background:#f1f5f9 !important; color:#0f172a !important; }

        /* ── Sidebar ── */
        .admin-root aside {
          background:#ffffff !important;
          border-color:#e2e8f0 !important;
          box-shadow: 1px 0 0 #e2e8f0;
        }
        .admin-root aside .border-white\\/10 { border-color:#e2e8f0 !important; }
        .admin-root aside .text-gray-500,
        .admin-root aside .text-gray-600 { color:#94a3b8 !important; }
        .admin-root aside .text-white { color:#1e293b !important; }
        .admin-root aside .hover\\:text-gray-200:hover { color:#7c3aed !important; }
        .admin-root aside .hover\\:bg-white\\/5:hover { background:#f1f5f9 !important; }
        .admin-root aside .bg-purple-600\\/30 { background:#ede9fe !important; }
        .admin-root aside .text-purple-200 { color:#7c3aed !important; }
        .admin-root aside .border-purple-500\\/30 { border-color:#c4b5fd !important; }

        /* ── Header ── */
        .admin-root header {
          background:rgba(255,255,255,0.97) !important;
          border-color:#e2e8f0 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .admin-root header .text-gray-600 { color:#64748b !important; }
        .admin-root header .text-white { color:#0f172a !important; }

        /* ── Cards & panels ── */
        .admin-root .bg-white\\/5 { background:#ffffff !important; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
        .admin-root .hover\\:bg-white\\/5:hover { background:#f8fafc !important; }
        .admin-root .bg-white\\/10 { background:#f1f5f9 !important; border:1px solid #e2e8f0; }
        .admin-root .bg-white\\/20 { background:#e2e8f0 !important; }
        .admin-root .rounded-xl { box-shadow:0 1px 3px rgba(0,0,0,0.04); }

        /* ── Dark bg overrides ── */
        .admin-root .bg-\\[\\#0a0a14\\],
        .admin-root .bg-\\[\\#0f0f1a\\],
        .admin-root .bg-\\[\\#111827\\],
        .admin-root .bg-\\[\\#1a1a2e\\],
        .admin-root .bg-\\[\\#12121f\\],
        .admin-root .bg-gray-900 { background:#ffffff !important; }
        .admin-root .bg-\\[\\#0a0a14\\]\\/95 { background:rgba(255,255,255,0.97) !important; }

        /* ── Borders ── */
        .admin-root .border-white\\/10 { border-color:#e2e8f0 !important; }
        .admin-root .divide-white\\/5 > * + * { border-color:#f1f5f9 !important; }

        /* ── Text ── */
        .admin-root .text-white { color:#0f172a !important; }
        .admin-root .text-gray-200 { color:#334155 !important; }
        .admin-root .text-gray-300 { color:#475569 !important; }
        .admin-root .text-gray-400 { color:#64748b !important; }
        .admin-root .text-gray-500 { color:#94a3b8 !important; }
        .admin-root .text-gray-600 { color:#94a3b8 !important; }

        /* ── Inputs ── */
        .admin-root input,
        .admin-root select,
        .admin-root textarea {
          background:#ffffff !important;
          color:#0f172a !important;
          border-color:#cbd5e1 !important;
        }
        .admin-root input::placeholder { color:#94a3b8 !important; }
        .admin-root input:focus,
        .admin-root select:focus,
        .admin-root textarea:focus { border-color:#7c3aed !important; box-shadow:0 0 0 3px rgba(124,58,237,0.08) !important; }

        /* ── Table ── */
        .admin-root table { border-color:#e2e8f0 !important; }
        .admin-root table th { background:#f8fafc !important; color:#64748b !important; border-color:#e2e8f0 !important; font-weight:600; }
        .admin-root table td { border-color:#f1f5f9 !important; }
        .admin-root table tr:hover td { background:#f8fafc !important; }

        /* ── Status badges ── */
        .admin-root .bg-emerald-500\\/20 { background:#d1fae5 !important; }
        .admin-root .bg-yellow-500\\/20  { background:#fef9c3 !important; }
        .admin-root .bg-blue-500\\/20    { background:#dbeafe !important; }
        .admin-root .bg-purple-500\\/20  { background:#ede9fe !important; }
        .admin-root .bg-rose-500\\/20    { background:#ffe4e6 !important; }
        .admin-root .bg-orange-500\\/20  { background:#ffedd5 !important; }
        .admin-root .bg-red-500\\/20     { background:#fee2e2 !important; }
        .admin-root .bg-teal-500\\/20    { background:#ccfbf1 !important; }
        .admin-root .bg-gray-500\\/20    { background:#f1f5f9 !important; }
        .admin-root .text-emerald-300 { color:#059669 !important; }
        .admin-root .text-yellow-300  { color:#d97706 !important; }
        .admin-root .text-blue-300    { color:#2563eb !important; }
        .admin-root .text-purple-300,.admin-root .text-purple-400 { color:#7c3aed !important; }
        .admin-root .text-rose-300    { color:#e11d48 !important; }
        .admin-root .text-orange-300  { color:#ea580c !important; }
        .admin-root .text-red-300,.admin-root .text-red-400 { color:#dc2626 !important; }
        .admin-root .text-teal-300    { color:#0d9488 !important; }

        /* ── Buttons — all ghost/transparent variants match sidebar ── */
        .admin-root .bg-white\\/5  { background:#ffffff !important; border:1px solid #e2e8f0 !important; box-shadow:0 1px 2px rgba(0,0,0,0.04) !important; }
        .admin-root .hover\\:bg-white\\/5:hover  { background:#f8fafc !important; }
        .admin-root .hover\\:bg-white\\/10:hover { background:#f1f5f9 !important; }
        .admin-root .hover\\:bg-white\\/20:hover { background:#e2e8f0 !important; }
        .admin-root .hover\\:text-white:hover    { color:#0f172a !important; }
        .admin-root .hover\\:text-gray-200:hover { color:#334155 !important; }
        .admin-root .hover\\:text-gray-300:hover { color:#475569 !important; }

        /* ── Purple active / tinted — match sidebar active ── */
        .admin-root .bg-purple-600\\/20 { background:#ede9fe !important; border:1px solid #c4b5fd !important; }
        .admin-root .bg-purple-600\\/30 { background:#ede9fe !important; border:1px solid #c4b5fd !important; }
        .admin-root .hover\\:bg-purple-600\\/40:hover { background:#ddd6fe !important; }
        .admin-root .border-purple-500\\/50 { border-color:#c4b5fd !important; }
        .admin-root .border-purple-500\\/30 { border-color:#c4b5fd !important; }
        .admin-root .text-purple-200 { color:#7c3aed !important; }
        .admin-root .text-purple-400 { color:#7c3aed !important; }

        /* ── Red/rose action buttons — white bg, colored border ── */
        .admin-root .bg-red-500\\/20  { background:#ffffff !important; border:1px solid #fca5a5 !important; }
        .admin-root .hover\\:bg-red-500\\/40:hover { background:#fee2e2 !important; }
        .admin-root .bg-rose-500 { background:#f43f5e !important; }

        /* ── Sort / view toggle inactive ── */
        .admin-root .text-gray-500 { color:#64748b !important; }
        .admin-root .hover\\:text-white:hover { color:#0f172a !important; }
      `}</style>
    )}

    <div className={`admin-root min-h-screen flex transition-colors duration-200 ${isDark ? 'bg-[#0a0a14] text-white' : 'bg-[#f8fafc] text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`w-56 flex-shrink-0 border-r flex flex-col sticky top-0 h-screen ${isDark ? 'border-white/10' : 'border-slate-200 bg-white'}`}>
        <div className={`px-5 py-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-black text-sm">Maîtrepets</span>
          </div>
          <p className="text-gray-500 text-xs">Admin Dashboard</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); if (t.key === 'logs') setNewErrorCount(0); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.key ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
              <t.Icon />
              {t.label}
              {t.badge > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className={`px-5 py-4 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {/* Theme toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Theme</span>
            <button onClick={cycleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {theme === 'dark'   && <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>Dark</>}
              {theme === 'light'  && <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>Light</>}
              {theme === 'system' && <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>System</>}
            </button>
          </div>
          <button onClick={fetchData} className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.07-3.5"/></svg>
            Refresh data
          </button>
          <button onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false); }}
            className="w-full text-xs text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <header className={`sticky top-0 backdrop-blur border-b px-6 py-4 flex items-center justify-between z-10 ${isDark ? 'bg-[#0a0a14]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
          <div>
            <h1 className="font-bold text-base capitalize">{tab}</h1>
            {!loading && data && (
              <p className="text-gray-600 text-xs">
                {tab === 'orders' && `${data.orders?.length || 0} total orders`}
                {tab === 'customers' && `${data.userList?.length || 0} registered customers`}
                {tab === 'refunds' && `${data.refundRequests?.length || 0} pending requests`}
                {tab === 'overview' && `$${data.stats?.totalRevenue?.toFixed(2) || '0.00'} total revenue`}
                {tab === 'messaging'   && 'Send emails to customers'}
                {tab === 'generations' && 'All AI-generated portraits'}
                {tab === 'logs'        && 'System activity — fulfillment, generation, webhooks'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {loading && <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />}

            {/* ── Notification bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all
                  ${notifOpen ? 'bg-purple-600/30 border border-purple-500/40' : 'hover:bg-white/10 border border-transparent'}`}
                title="Notifications"
              >
                {/* Flat bell icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {totalNotif > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                    {totalNotif > 9 ? '9+' : totalNotif}
                  </span>
                )}
              </button>

              {/* Dropdown panel */}
              {notifOpen && (
                <div className={`absolute right-0 top-11 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden
                  ${isDark ? 'bg-[#13111f] border-white/10' : 'bg-white border-slate-200'}`}>

                  {/* Header */}
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <p className="text-sm font-bold">Notifications</p>
                    {(notifItems.length > 0 || unreadEmails > 0) && (
                      <button
                        onClick={() => { setNotifItems([]); setNewErrorCount(0); }}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Items */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {/* Unread emails always shown at top if any */}
                    {unreadEmails > 0 && (
                      <button
                        onClick={() => { setTab('messaging'); setNotifOpen(false); }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center mt-0.5">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-purple-300">{unreadEmails} unread {unreadEmails === 1 ? 'message' : 'messages'}</p>
                          <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Customer inbox</p>
                        </div>
                        <span className={`text-[10px] mt-1 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-slate-300'}`}>→</span>
                      </button>
                    )}

                    {/* Error / event items */}
                    {notifItems.map(n => (
                      <button
                        key={n.id}
                        onClick={() => {
                          if (n.type === 'error') {
                            setHighlightLogId(n.id);
                            setTab('logs');
                            setNewErrorCount(0);
                          } else {
                            setTab('messaging');
                          }
                          setNotifOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${n.type === 'error' ? 'bg-red-500/20' : 'bg-purple-500/20'}`}>
                          {n.type === 'error' ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                            </svg>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${n.type === 'error' ? 'text-red-400' : 'text-purple-300'}`}>{n.title}</p>
                          <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{n.body}</p>
                          {n.customer && (
                            <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md
                              ${isDark ? 'bg-white/10 text-gray-300' : 'bg-slate-100 text-slate-600'}`}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              {n.customer.name || n.customer.email}
                            </span>
                          )}
                          {n.time && (
                            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-slate-300'}`}>
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] mt-1 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-slate-300'}`}>→</span>
                      </button>
                    ))}

                    {notifItems.length === 0 && unreadEmails === 0 && (
                      <div className={`px-4 py-8 text-center ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
                        <svg className="mx-auto mb-2 opacity-40" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                        <p className="text-xs">All clear — no new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          {tab === 'generations' ? (
            <GenerationBankTab />
          ) : tab === 'logs' ? (
            <LogsTab highlightLogId={highlightLogId} onHighlightClear={() => setHighlightLogId(null)} />
          ) : loading || !data ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === 'overview'  && <OverviewTab  data={data} setTab={setTab} />}
              {tab === 'orders'    && <OrdersTab    orders={data.orders}   onRefresh={fetchData} />}
              {tab === 'customers' && <CustomersTab userList={data.userList} />}
              {tab === 'refunds'   && <RefundsTab   refundRequests={data.refundRequests} onRefresh={fetchData} />}
              {tab === 'messaging' && <MessagingTab userList={data.userList} />}
              {tab === 'logs'      && <LogsTab highlightLogId={highlightLogId} onHighlightClear={() => setHighlightLogId(null)} />}
              {tab === 'settings'  && <SettingsTab />}
            </>
          )}
        </main>
      </div>
    </div>

    {/* ── Error log toast ── */}
    {errorToast && (
      <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-[#1e0f0f] border border-red-500/40 shadow-2xl rounded-xl px-4 py-3 max-w-xs">
        <div className="flex-shrink-0 w-8 h-8 bg-red-600/30 rounded-full flex items-center justify-center mt-0.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">
            {errorToast.count === 1 ? 'New error detected' : `${errorToast.count} new errors detected`}
            {errorToast.source && <span className="ml-1.5 text-xs text-red-400 font-normal">({errorToast.source})</span>}
          </p>
          <p className="text-red-300 text-xs mt-0.5 truncate">{errorToast.message}</p>
          <button
            onClick={() => { setTab('logs'); setNewErrorCount(0); setErrorToast(null); }}
            className="mt-2 text-xs text-red-400 hover:text-red-200 font-medium underline underline-offset-2"
          >
            View logs →
          </button>
        </div>
        <button
          onClick={() => setErrorToast(null)}
          className="flex-shrink-0 text-gray-500 hover:text-gray-300 mt-0.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    )}

    {/* ── Unread email toast ── */}
    {emailToast && unreadEmails > 0 && (
      <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-[#1e1b2e] border border-purple-500/40 shadow-2xl rounded-xl px-4 py-3 max-w-xs">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center mt-0.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">
            {unreadEmails} new {unreadEmails === 1 ? 'message' : 'messages'}
          </p>
          <p className="text-purple-300 text-xs mt-0.5">From customers in your inbox</p>
          <button
            onClick={() => { setTab('messaging'); setEmailToast(false); }}
            className="mt-2 text-xs text-purple-400 hover:text-purple-200 font-medium underline underline-offset-2"
          >
            View inbox →
          </button>
        </div>
        <button
          onClick={() => setEmailToast(false)}
          className="flex-shrink-0 text-gray-500 hover:text-gray-300 mt-0.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    )}
    </>
  );
}
