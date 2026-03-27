'use client';
import { useEffect, useState, useCallback, Fragment } from 'react';

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
        <p style="color:#fff;font-size:22px;font-weight:900;margin:0">🐾 Maîtrepets</p>
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
        body: base(`<h2 style="color:#111;margin:0 0 12px">Your Pawtrait is on its way!</h2>
          <p style="color:#4b5563">Great news — your order has been shipped and is heading to you now.</p>
          ${ctx.trackingNumber ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
            <p style="color:#6b7280;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">Tracking Number</p>
            <p style="color:#111;font-weight:700;font-size:16px;font-family:monospace;margin:0">${ctx.trackingNumber}</p>
            ${ctx.trackingUrl ? `<a href="${ctx.trackingUrl}" style="color:#7c3aed;font-size:13px">Track your package →</a>` : ''}
          </div>` : ''}
          <p style="color:#4b5563">Expected delivery: 7–10 business days from ship date.</p>
          <p style="color:#4b5563;margin-top:24px">Thank you for choosing Maîtrepets! 🐾</p>`),
      };
    case 'order_confirmed':
      return {
        subject: `Your Maîtrepets order is confirmed ✅`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Order Confirmed!</h2>
          <p style="color:#4b5563">We've received your order and it's now in our production queue.</p>
          <p style="color:#4b5563">Your Pawtrait will be printed on premium enhanced matte paper and shipped within 3–5 business days.</p>
          <p style="color:#4b5563;margin-top:24px">Questions? Reply to this email or contact <a href="mailto:hello@maitrepets.com" style="color:#7c3aed">hello@maitrepets.com</a>.</p>`),
      };
    case 'refund_approved':
      return {
        subject: `Your Maîtrepets refund has been approved ✅`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Refund Approved</h2>
          <p style="color:#4b5563">We've reviewed your request and approved your refund for the damaged/defective item.</p>
          <p style="color:#4b5563">Your refund will be processed to your original payment method within <strong>5–10 business days</strong>.</p>
          <p style="color:#4b5563">We sincerely apologize for the inconvenience and hope to make it right.</p>
          <p style="color:#4b5563;margin-top:24px">Thank you for your patience — Team Maîtrepets 🐾</p>`),
      };
    case 'refund_denied':
      return {
        subject: `Update on your Maîtrepets refund request`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Refund Request Update</h2>
          <p style="color:#4b5563">Thank you for reaching out regarding your recent order.</p>
          <p style="color:#4b5563">After reviewing your request, we're unable to process a refund at this time as the item does not appear to meet our damaged/defective return criteria.</p>
          <p style="color:#4b5563">If you have additional information or photos you'd like us to review, please reply to this email and we'd be happy to take another look.</p>
          <p style="color:#4b5563;margin-top:24px">We appreciate your understanding — Team Maîtrepets 🐾</p>`),
      };
    case 'reprint_sent':
      return {
        subject: `Your replacement Pawtrait is on its way! 🖼️`,
        body: base(`<h2 style="color:#111;margin:0 0 12px">Replacement Order Shipped</h2>
          <p style="color:#4b5563">We've processed and shipped your replacement Pawtrait print.</p>
          ${ctx.trackingNumber ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
            <p style="color:#6b7280;font-size:12px;margin:0 0 4px">Tracking Number</p>
            <p style="color:#111;font-weight:700;font-family:monospace;margin:0">${ctx.trackingNumber}</p>
          </div>` : ''}
          <p style="color:#4b5563">We hope this one arrives in perfect condition. Thank you for your patience! 🐾</p>`),
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
function OrderEditModal({ order, onClose, onSaved }) {
  const [fields, setFields] = useState({
    status:        order.status,
    trackingNumber: order.trackingNumber || '',
    trackingUrl:   order.trackingUrl    || '',
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch('/api/admin/order', { method: 'PATCH', headers: HEADERS, body: JSON.stringify({ orderId: order.id, ...fields }) });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p className="text-white font-semibold flex items-center gap-2"><Icon.Edit /> Edit Order</p>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><Icon.X /></button>
        </div>
        <div className="p-5 space-y-4">
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

// ─── Customer slide-over ──────────────────────────────────────────────────────
function CustomerPanel({ customer, onClose, onEmail }) {
  return (
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
                <div key={o.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
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
              ))}
            </div>
          )}
        </div>
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
function OrdersTab({ orders, onRefresh }) {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded]       = useState(null);
  const [editing, setEditing]         = useState(null);
  const [emailing, setEmailing]       = useState(null);

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
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wide">
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
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12">No orders found</td></tr>
              ) : filtered.map(order => (
                <Fragment key={order.id}>
                  <tr className={`border-b border-white/5 transition-colors cursor-pointer
                    ${expanded === order.id ? 'bg-purple-950/30' : 'hover:bg-white/5'}`}
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
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
                      </div>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr className="bg-purple-950/20 border-b border-white/5">
                      <td colSpan={7} className="px-4 py-4">
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
    await fetch('/api/admin/order', { method: 'PATCH', headers: HEADERS, body: JSON.stringify({ orderId: order.id, status: 'returned' }) });
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
function MessagingTab({ userList }) {
  const [to, setTo]               = useState('');
  const [template, setTemplate]   = useState('custom');
  const [subject, setSubject]     = useState('');
  const [body, setBody]           = useState('');
  const [sending, setSending]     = useState(false);
  const [result, setResult]       = useState(null);
  const [sentLog, setSentLog]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = to.length > 0
    ? userList.filter(u => u.email.toLowerCase().includes(to.toLowerCase()) || u.name?.toLowerCase().includes(to.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    const t = buildTemplate(template);
    setSubject(t.subject);
    setBody(t.body.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  }, [template]);

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
      setSentLog(l => [{ to, subject, sentAt: new Date().toISOString(), ok: true }, ...l]);
      setResult('sent');
      setTo(''); setBody(''); setSubject(''); setTemplate('custom');
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

  return (
    <div className="grid md:grid-cols-5 gap-6">
      {/* Compose */}
      <div className="md:col-span-3 bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-bold">Compose Email</h3>

        {/* Template picker */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Template</label>
          <div className="grid grid-cols-3 gap-1.5">
            {TMPL_OPTIONS.map(t => (
              <button key={t.value} onClick={() => setTemplate(t.value)}
                className={`text-xs px-2 py-2 rounded-lg border transition-all text-left ${template === t.value ? 'bg-purple-600/30 border-purple-500/50 text-purple-200' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* To field with autocomplete */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">To</label>
          <input value={to} onChange={e => { setTo(e.target.value); setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Customer email or name…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500" />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl">
              {suggestions.map(u => (
                <button key={u.id} onMouseDown={() => { setTo(u.email); setShowSuggestions(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left transition-colors">
                  <div className="w-7 h-7 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-300 text-xs font-bold">
                    {(u.name || u.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm">{u.name || u.email}</p>
                    {u.name && <p className="text-gray-500 text-xs">{u.email}</p>}
                  </div>
                  <span className="ml-auto text-gray-600 text-xs">${u.ltv.toFixed(0)} LTV</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500" />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1.5">Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 resize-none" />
        </div>

        {result === 'sent' && <p className="text-emerald-400 text-sm flex items-center gap-2"><Icon.Check /> Email sent successfully!</p>}
        {result === 'error' && <p className="text-red-400 text-sm">Failed to send — check server logs.</p>}

        <button onClick={send} disabled={!to || !subject || !body || sending}
          className="w-full py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2">
          {sending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</> : <><Icon.Mail /> Send Email</>}
        </button>
      </div>

      {/* Sent log + customers */}
      <div className="md:col-span-2 space-y-4">
        {sentLog.length > 0 && (
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Sent This Session</h3>
            <div className="space-y-2">
              {sentLog.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-emerald-400 mt-0.5"><Icon.Check /></span>
                  <div>
                    <p className="text-gray-300">{l.to}</p>
                    <p className="text-gray-600 truncate">{l.subject}</p>
                    <p className="text-gray-700">{new Date(l.sentAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Quick Select Customer</h3>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {userList.slice(0, 20).map(u => (
              <button key={u.id} onClick={() => setTo(u.email)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors">
                <div className="w-7 h-7 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                  {(u.name || u.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs truncate">{u.name || u.email}</p>
                  {u.name && <p className="text-gray-600 text-xs truncate">{u.email}</p>}
                </div>
                <span className="text-gray-600 text-xs flex-shrink-0">{u.orderCount} orders</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('overview');

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const TABS = [
    { key: 'overview',   label: 'Overview',   Icon: Icon.Overview },
    { key: 'orders',     label: 'Orders',      Icon: Icon.Orders },
    { key: 'customers',  label: 'Customers',   Icon: Icon.Customers },
    { key: 'refunds',    label: 'Refunds',     Icon: Icon.Refunds, badge: data?.stats?.refundRequestedOrders },
    { key: 'messaging',  label: 'Messaging',   Icon: Icon.Messaging },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/10 flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">🐾</span>
            <span className="font-black text-sm">Maîtrepets</span>
          </div>
          <p className="text-gray-600 text-xs">Admin Dashboard</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
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
        <div className="px-5 py-4 border-t border-white/10">
          <button onClick={fetchData} className="w-full text-xs text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.07-3.5"/></svg>
            Refresh data
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 bg-[#0a0a14]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="font-bold text-base capitalize">{tab}</h1>
            {!loading && data && (
              <p className="text-gray-600 text-xs">
                {tab === 'orders' && `${data.orders?.length || 0} total orders`}
                {tab === 'customers' && `${data.userList?.length || 0} registered customers`}
                {tab === 'refunds' && `${data.refundRequests?.length || 0} pending requests`}
                {tab === 'overview' && `$${data.stats?.totalRevenue?.toFixed(2) || '0.00'} total revenue`}
                {tab === 'messaging' && 'Send emails to customers'}
              </p>
            )}
          </div>
          {loading && <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />}
        </header>

        <main className="p-6">
          {loading || !data ? (
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
