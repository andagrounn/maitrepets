'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

// ─── Flat SVG icons ────────────────────────────────────────────────────────────
function IconPrinter({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
}
function IconDownload({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function IconTruck({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
function IconClock({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconCheck({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconCheckCircle({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function IconLayers({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function IconHome({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function IconAlertTriangle({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function IconX({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconCornerUpLeft({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>;
}
function IconCamera({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}
function IconCopy({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function IconExternalLink({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
}
function IconRefundPending({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconRefund({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>;
}
function IconTrash({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function IconChevronDown({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function IconReorder({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:                 { color: 'bg-amber-50 text-amber-600 border border-amber-200',   label: 'Awaiting Payment',  Icon: IconClock,         step: 0 },
  paid:                    { color: 'bg-blue-50 text-blue-600 border border-blue-200',       label: 'Paid',              Icon: IconCheckCircle,   step: 1 },
  fulfilling:              { color: 'bg-violet-50 text-violet-600 border border-violet-200', label: 'Printing',          Icon: IconLayers,        step: 2 },
  shipped:                 { color: 'bg-purple-50 text-purple-700 border border-purple-200', label: 'Shipped',           Icon: IconTruck,         step: 3 },
  delivered:               { color: 'bg-green-50 text-green-700 border border-green-200',    label: 'Delivered',         Icon: IconHome,          step: 4 },
  refund_requested:        { color: 'bg-amber-50 text-amber-700 border border-amber-200',    label: 'Report Under Review', Icon: IconRefundPending, step: -1 },
  refund_approved:         { color: 'bg-green-50 text-green-700 border border-green-200',    label: 'Refund Approved',   Icon: IconCheckCircle,   step: -1 },
  refund_denied:           { color: 'bg-gray-100 text-gray-500 border border-gray-200',      label: 'Refund Denied',     Icon: IconX,             step: -1 },
  returned:                { color: 'bg-gray-100 text-gray-500 border border-gray-200',      label: 'Returned',          Icon: IconCornerUpLeft,  step: -1 },
  failed:                  { color: 'bg-red-50 text-red-600 border border-red-200',          label: 'Cancelled',         Icon: IconX,             step: -1 },
  paid_fulfillment_failed: { color: 'bg-orange-50 text-orange-600 border border-orange-200', label: 'Needs Attention',   Icon: IconAlertTriangle, step: -1 },
  paid_printful_failed:    { color: 'bg-orange-50 text-orange-600 border border-orange-200', label: 'Needs Attention',   Icon: IconAlertTriangle, step: -1 },
};

const STEPS = ['Ordered', 'Printing', 'Shipped', 'Delivered'];
const STEP_ICONS = [IconCheckCircle, IconLayers, IconTruck, IconHome];

// ─── Toast system ──────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  return { toasts, addToast };
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium animate-fade-in-up
            ${t.type === 'error'  ? 'bg-red-600 text-white' :
              t.type === 'refund' ? 'bg-rose-600 text-white' :
                                    'bg-gray-900 text-white'}`}>
          {t.type === 'success' && <span className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0"><IconCheck size={11} /></span>}
          {t.type === 'error'   && <span className="w-5 h-5 bg-red-300 rounded-full flex items-center justify-center flex-shrink-0"><IconX size={11} /></span>}
          {t.type === 'info'    && <span className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0"><IconTruck size={11} /></span>}
          {t.type === 'refund'  && <span className="w-5 h-5 flex items-center justify-center flex-shrink-0"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Damage report modal ───────────────────────────────────────────────────────
function DamageReportModal({ order, onClose, onSuccess, addToast }) {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading]         = useState(false);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!description.trim()) return;
    setLoading(true);
    addToast('Submitting damage report…', 'refund');
    try {
      let evidenceUrl = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const upRes  = await fetch('/api/upload-damage', { method: 'POST', body: fd, credentials: 'include' });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || 'Image upload failed');
        evidenceUrl = upData.url;
      }
      const res  = await fetch('/api/refund-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, reason: description, evidenceUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      onSuccess(order.id);
      addToast('Damage report submitted — our team will review it within 2 business days.', 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <IconCamera size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Report Damage</h3>
            <p className="text-xs text-gray-400">For damaged or defective items only</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 flex items-center gap-3">
          {order.image?.id && (
            <img src={`/api/img?id=${order.image.id}`} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">
              {order.productType?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
            <p className="text-xs text-gray-400">Order · ${order.price?.toFixed(2)}</p>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Describe the damage</p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe what happened — e.g. print arrived creased, ink smeared, wrong item received…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-300 resize-none mb-4"
        />

        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Photo of damage <span className="text-gray-400 normal-case font-normal">(optional but recommended)</span></p>
        {imagePreview ? (
          <div className="relative mb-4">
            <img src={imagePreview} alt="Damage" className="w-full h-32 object-cover rounded-xl" />
            <button onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 shadow-sm">
              <IconX size={11} />
            </button>
          </div>
        ) : (
          <label className="block mb-4 cursor-pointer">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-amber-300 transition-colors">
              <div className="flex justify-center mb-1 text-gray-300"><IconCamera size={22} /></div>
              <p className="text-xs text-gray-400">Click to upload damage photo</p>
              <p className="text-xs text-gray-300 mt-0.5">JPEG, PNG or WebP · max 10MB</p>
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          </label>
        )}

        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-5">
          <p className="text-xs text-amber-700">
            <strong>Note:</strong> Refunds are only for damaged or defective items — not for AI generation style or preference. Our team will review and respond within 2 business days.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!description.trim() || loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
              : <><IconCamera size={13} /> Submit Report</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Refund modals ─────────────────────────────────────────────────────────────
function ClaimRefundModal({ order, onClose, onClaimed, addToast }) {
  const [loading, setLoading] = useState(false);

  async function claim() {
    setLoading(true);
    try {
      const res  = await fetch('/api/refund-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      onClaimed(order.id);
      addToast('Refund initiated — expect it within 5–10 business days.', 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Something went wrong.', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <IconCheckCircle size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Refund Approved</h3>
            <p className="text-xs text-gray-400">Your refund has been approved by our team</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 flex items-center gap-3">
          {order.image?.id && (
            <img src={`/api/img?id=${order.image.id}`} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">
              {order.productType?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
            <p className="text-xs text-gray-400">Refund · ${order.price?.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm font-semibold text-green-800">✓ ${order.price?.toFixed(2)} refund is ready to process</p>
          <p className="text-xs text-green-600 mt-1">Returned to your original payment method within 5–10 business days after you confirm below.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
            Not now
          </button>
          <button onClick={claim} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
              : 'Claim Refund →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RefundUnderReviewModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <IconClock size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Report Under Review</h3>
            <p className="text-xs text-gray-400">Our team is reviewing your submission</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-amber-800">Your damage report has been received. We'll review it and respond within <strong>2 business days</strong>.</p>
          {order.refundReason && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">Your report:</p>
              <p className="text-xs text-amber-700">{order.refundReason}</p>
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

function RefundDeniedModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
            <IconX size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Refund Not Approved</h3>
            <p className="text-xs text-gray-400">We were unable to approve this request</p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-gray-700">Your request did not meet our damaged/defective return criteria. If you have additional evidence, please email us at{' '}
            <a href="mailto:hello@maitrepets.com" className="text-purple-600 underline">hello@maitrepets.com</a>.
          </p>
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Refund icon — always visible for eligible statuses ────────────────────────
const REFUND_ICON_STATUSES = ['paid', 'fulfilling', 'shipped', 'delivered', 'refund_requested', 'refund_approved', 'refund_denied'];

function RefundStatusSection({ order, onReported, onClaimed, addToast }) {
  const [showModal, setShowModal] = useState(false);

  if (!REFUND_ICON_STATUSES.includes(order.status)) return null;

  const isApproved = order.status === 'refund_approved';
  const isDenied   = order.status === 'refund_denied';
  const isReview   = order.status === 'refund_requested';

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title={
          isApproved ? 'Refund approved — click to claim' :
          isReview   ? 'View damage report status' :
          isDenied   ? 'View refund decision' :
                       'Report damage / request refund'
        }
        className={`w-7 h-7 flex items-center justify-center rounded-lg border shadow-sm transition-all
          ${isApproved
            ? 'bg-green-50 border-green-300 text-green-600 hover:bg-green-100 ring-2 ring-green-300 ring-offset-1'
            : isReview
            ? 'bg-amber-50 border-amber-300 text-amber-500 hover:bg-amber-100'
            : isDenied
            ? 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-purple-600 hover:border-purple-300'
          }`}>
        <IconRefund size={13} />
      </button>

      {showModal && (
        isApproved ? (
          <ClaimRefundModal order={order} onClose={() => setShowModal(false)} onClaimed={onClaimed} addToast={addToast} />
        ) : isReview ? (
          <RefundUnderReviewModal order={order} onClose={() => setShowModal(false)} />
        ) : isDenied ? (
          <RefundDeniedModal onClose={() => setShowModal(false)} />
        ) : (
          <DamageReportModal
            order={order}
            onClose={() => setShowModal(false)}
            onSuccess={id => { setShowModal(false); onReported(id); }}
            addToast={addToast}
          />
        )
      )}
    </>
  );
}

// ─── Image placeholder ─────────────────────────────────────────────────────────
function ImgPlaceholder({ className = '' }) {
  return (
    <div className={`bg-gray-100 flex items-center justify-center overflow-hidden ${className}`}>
      <span className="text-gray-300 font-semibold tracking-widest uppercase select-none"
        style={{ fontSize: '0.5rem', letterSpacing: '0.15em' }}>
        Maitrepets
      </span>
    </div>
  );
}

// ─── Icon button ───────────────────────────────────────────────────────────────
function IconBtn({ onClick, disabled, title, children }) {
  return (
    <div className="relative group/tip">
      <button onClick={onClick} disabled={disabled}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 text-gray-400 hover:text-purple-600 border border-gray-200 hover:border-purple-300 transition-all disabled:opacity-40 shadow-sm">
        {disabled
          ? <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          : children}
      </button>
      {title && (
        <div className="pointer-events-none absolute top-full right-0 mt-1.5 px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-medium leading-tight w-max max-w-[110px] text-center opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg z-50">
          {title}
        </div>
      )}
    </div>
  );
}

// ─── Order error alert ─────────────────────────────────────────────────────────
function OrderErrorAlert() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-500 border border-orange-200 rounded-xl transition-colors"
        title="View issue"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Print Issue Detected</h3>
                <p className="text-xs text-gray-400">We're on it</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-orange-800">
                There was an issue sending your order to print. Our team has been notified and will resolve it within <strong>1 business day</strong>. No action needed on your end.
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Order progress stepper ────────────────────────────────────────────────────
function ProgressStepper({ status, trackingNumber, trackingUrl }) {
  const sc = STATUS_CONFIG[status];
  const currentStep = sc?.step ?? 0;
  if (currentStep < 0) return null;

  const [showPopup, setShowPopup] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const shippedIdx  = 2;
  const hasTracking = !!trackingNumber;

  function copyTracking() {
    navigator.clipboard.writeText(trackingNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const carrier = hasTracking ? detectCarrier(trackingNumber) : null;

  return (
    <div className="flex items-center gap-0 mt-3 mb-1">
      {STEPS.map((label, i) => {
        const StepIcon  = STEP_ICONS[i];
        const done      = i < currentStep;
        const active    = i === currentStep;
        const isPulsing = hasTracking && i === shippedIdx;
        const isShipped = i === shippedIdx;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                {/* Pulse rings */}
                {isPulsing && (
                  <>
                    <span className="absolute -inset-1 rounded-full bg-purple-400 opacity-30 animate-ping" />
                    <span className="absolute -inset-1 rounded-full bg-purple-300 opacity-20 animate-ping [animation-delay:0.4s]" />
                  </>
                )}

                {/* Icon button */}
                <button
                  onClick={() => isShipped && hasTracking && setShowPopup(v => !v)}
                  className={`relative w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                    ${done   ? 'bg-purple-600 text-white' :
                      active ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-400 ring-offset-1' :
                               'bg-gray-100 text-gray-300'}
                    ${isPulsing ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}>
                  <StepIcon size={11} />
                </button>

                {/* Tracking popup */}
                {isShipped && showPopup && hasTracking && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-3 text-left"
                    onClick={e => e.stopPropagation()}>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />

                    <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-1">{carrier?.name} Tracking</p>
                    <p className="font-mono text-xs text-white font-semibold truncate mb-2">{trackingNumber}</p>

                    <div className="flex gap-1.5">
                      <button onClick={copyTracking}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] font-medium transition-all">
                        {copied
                          ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                          : <><IconCopy size={10} /> Copy</>}
                      </button>
                      {trackingUrl && (
                        <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gradient-to-r ${carrier?.color} text-white text-[10px] font-bold transition-all hover:opacity-90`}>
                          Track <IconExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className={`text-[9px] font-medium whitespace-nowrap
                ${done ? 'text-purple-600' : active ? 'text-purple-500' : 'text-gray-300'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all
                ${i < currentStep ? 'bg-purple-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Carrier detection ────────────────────────────────────────────────────────
function detectCarrier(trackingNumber) {
  if (!trackingNumber) return null;
  const t = trackingNumber.trim().toUpperCase();
  if (t.startsWith('1Z'))                        return { name: 'UPS',   color: 'from-amber-500 to-yellow-400',   text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' };
  if (/^(94|93|92|9400|9205|9407)/.test(t) || /^\d{20,22}$/.test(t)) return { name: 'USPS',  color: 'from-blue-600 to-blue-400',    text: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'  };
  if (/^\d{12}$/.test(t) || /^\d{15}$/.test(t)) return { name: 'FedEx', color: 'from-violet-600 to-orange-400', text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' };
  return { name: 'Carrier', color: 'from-purple-600 to-purple-400', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' };
}

// ─── Tracking section ──────────────────────────────────────────────────────────
function TrackingSection({ order, addToast }) {
  const [copied, setCopied] = useState(false);
  if (!order.trackingNumber) return null;

  const carrier = detectCarrier(order.trackingNumber);

  function copyTracking() {
    navigator.clipboard.writeText(order.trackingNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Tracking number copied!', 'success');
    });
  }

  return (
    <div className={`mt-3 ${carrier.bg} ${carrier.border} border rounded-xl overflow-hidden`}>
      {/* Carrier header bar */}
      <div className={`bg-gradient-to-r ${carrier.color} px-3 py-1.5 flex items-center gap-2`}>
        <IconTruck size={12} className="text-white opacity-90" />
        <span className="text-white text-[10px] font-bold uppercase tracking-widest">{carrier.name} Tracking</span>
      </div>

      {/* Tracking number + actions */}
      <div className="px-3 py-2.5 flex items-center gap-3">
        <p className={`flex-1 font-mono text-xs font-semibold ${carrier.text} truncate`}>{order.trackingNumber}</p>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={copyTracking} title="Copy tracking number"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-all shadow-sm">
            {copied
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              : <IconCopy size={12} />
            }
          </button>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
              title={`Track on ${carrier.name}`}
              className={`h-7 px-2.5 flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${carrier.color} text-white text-[10px] font-bold transition-all shadow-sm hover:opacity-90`}>
              Track
              <IconExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const PAPER_SIZE_OPTIONS = [
  { key: 'paper-8x10',  label: '8×10"',  price: '$44.99',  tag: null },
  { key: 'paper-11x14', label: '11×14"', price: '$49.99',  tag: null },
  { key: 'paper-16x20', label: '16×20"', price: '$64.99',  tag: 'Most Popular' },
  { key: 'paper-18x24', label: '18×24"', price: '$74.99',  tag: null },
  { key: 'paper-24x36', label: '24×36"', price: '$109.99', tag: 'Best Value' },
];

// ─── Paper print button ────────────────────────────────────────────────────────
function PaperPrintIcon({ imageId }) {
  const [loading, setLoading]       = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickedSize, setPickedSize] = useState('paper-16x20');

  async function handle(productKey) {
    setLoading(true);
    setShowPicker(false);
    try {
      const res  = await fetch('/api/order-paper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageId, productKey }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { setLoading(false); }
  }

  return (
    <>
      <IconBtn onClick={() => setShowPicker(true)} disabled={loading} title="Order thin canvas print">
        <IconPrinter size={13} />
      </IconBtn>

      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
          onClick={() => setShowPicker(false)}>
          <div
            className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">Choose Your Size</h2>
                <p className="text-gray-500 text-xs mt-0.5">Thin canvas print — unframed</p>
              </div>
              <button onClick={() => setShowPicker(false)} className="text-gray-600 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>
            <div className="flex flex-col gap-2 mb-5">
              {PAPER_SIZE_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setPickedSize(opt.key)}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                    pickedSize === opt.key ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/25'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${pickedSize === opt.key ? 'border-amber-500 bg-amber-500' : 'border-gray-600'}`} />
                    <span className={`font-semibold text-sm ${pickedSize === opt.key ? 'text-white' : 'text-gray-300'}`}>{opt.label}</span>
                    {opt.tag && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">{opt.tag}</span>}
                  </div>
                  <span className={`text-sm font-bold ${pickedSize === opt.key ? 'text-amber-400' : 'text-gray-400'}`}>{opt.price}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => handle(pickedSize)}
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</> : 'Continue to Payment →'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const QUICK_SIZE_OPTIONS = [
  { key: 'poster-8x10',  label: '8×10"',  price: '$69.99',  tag: null },
  { key: 'poster-11x14', label: '11×14"', price: '$84.99',  tag: null },
  { key: 'poster-16x20', label: '16×20"', price: '$119.99', tag: 'Most Popular' },
  { key: 'poster-18x24', label: '18×24"', price: '$139.99', tag: null },
  { key: 'poster-24x36', label: '24×36"', price: '$189.99', tag: 'Best Value' },
];

// ─── Quick order button — goes straight to checkout with this generated image ──
function QuickOrderBtn({ img }) {
  const [loading, setLoading]   = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickedSize, setPickedSize] = useState('poster-16x20');

  async function checkout(productKey) {
    setLoading(true);
    setShowPicker(false);
    try {
      const res  = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageId:    img.id,
          productKey,
          price:      1,   // server computes authoritative price from productKey
          extras:     {},
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setShowPicker(true)} disabled={loading}
        className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1 disabled:opacity-50">
        {loading ? '…' : 'Order →'}
      </button>

      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
          onClick={() => setShowPicker(false)}>
          <div
            className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">Choose Your Size</h2>
                <p className="text-gray-500 text-xs mt-0.5">Select the frame size for your portrait</p>
              </div>
              <button onClick={() => setShowPicker(false)} className="text-gray-600 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>
            <div className="flex flex-col gap-2 mb-5">
              {QUICK_SIZE_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setPickedSize(opt.key)}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                    pickedSize === opt.key ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/25'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${pickedSize === opt.key ? 'border-amber-500 bg-amber-500' : 'border-gray-600'}`} />
                    <span className={`font-semibold text-sm ${pickedSize === opt.key ? 'text-white' : 'text-gray-300'}`}>{opt.label}</span>
                    {opt.tag && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">{opt.tag}</span>}
                  </div>
                  <span className={`text-sm font-bold ${pickedSize === opt.key ? 'text-amber-400' : 'text-gray-400'}`}>{opt.price}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => checkout(pickedSize)}
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</> : 'Continue to Payment →'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Reorder button ───────────────────────────────────────────────────────────
function ReorderBtn({ order }) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    try {
      const res  = await fetch('/api/reprint', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { setLoading(false); }
  }
  return <IconBtn onClick={handle} disabled={loading} title="Reorder — place another print of this portrait"><IconReorder size={13} /></IconBtn>;
}

// ─── Download button + modal ───────────────────────────────────────────────────
function DownloadBtn({ imageId, isSuperAdmin = false }) {
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const res  = await fetch('/api/download-purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ imageId }) });
      const data = await res.json();
      if (data.url) {
        if (data.free) { window.open(data.url, '_blank'); setShow(false); }
        else window.location.href = data.url;
      }
    } catch { setLoading(false); }
  }

  // Superadmin: instant free download, no modal
  if (isSuperAdmin) {
    return (
      <IconBtn onClick={handlePurchase} disabled={loading} title="Download HD image (free)">
        {loading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <IconDownload size={13} />}
      </IconBtn>
    );
  }

  return (
    <>
      <IconBtn onClick={() => setShow(true)} title="Download HD image"><IconDownload size={13} /></IconBtn>
      {show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShow(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-500"><IconDownload size={22} /></div>
              <h3 className="text-lg font-bold text-gray-900">HD Digital Copy</h3>
              <p className="text-gray-500 text-sm mt-1">Full-resolution portrait — print anywhere, keep forever.</p>
            </div>
            <div className="bg-purple-50 rounded-xl px-4 py-3 text-center mb-4">
              <span className="text-2xl font-black text-purple-600">$12</span>
              <p className="text-xs text-gray-400 mt-0.5">One-time · Instant download</p>
            </div>
            <button onClick={handlePurchase} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting…</> : 'Purchase & Download →'}
            </button>
            <button onClick={() => setShow(false)} className="w-full text-xs text-gray-400 hover:text-gray-600 mt-2 py-1">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Address edit modal ────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'JP', name: 'Japan' },
];

// Normalize common mistakes → ISO 2-letter code
function normalizeCountry(val) {
  const v = (val || '').trim().toUpperCase();
  const map = { USA: 'US', 'UNITED STATES': 'US', 'UNITED STATES OF AMERICA': 'US', UK: 'GB', 'UNITED KINGDOM': 'GB', CAN: 'CA', AUS: 'AU' };
  return map[v] || v;
}

function AddressEditModal({ order, onClose, onSaved }) {
  const [fields, setFields] = useState({
    name:     order.shippingName     || '',
    address1: order.shippingAddress  || '',
    address2: order.shippingAddress2 || '',
    city:     order.shippingCity     || '',
    state:    order.shippingState    || '',
    zip:      order.shippingZip      || '',
    country:  normalizeCountry(order.shippingCountry) || 'US',
    phone:    order.shippingPhone    || '',
  });
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState('');

  const set = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!fields.address1 || !fields.city || !fields.state || !fields.zip) {
      setError('Address, city, state and ZIP are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const res  = await fetch('/api/orders/update-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, ...fields }),
      });
      const data = await res.json();
      if (data.ok) { onSaved(); onClose(); }
      else setError(data.error || 'Failed to update address.');
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <p className="font-bold text-gray-900">Update Shipping Address</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IconX size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            Your order failed because of a missing or invalid address. Update it below and we'll resubmit to print automatically.
          </p>

          {[
            { label: 'Full Name',        key: 'name',     placeholder: 'Jane Smith' },
            { label: 'Address Line 1',   key: 'address1', placeholder: '123 Main St' },
            { label: 'Address Line 2',   key: 'address2', placeholder: 'Apt 4B (optional)' },
            { label: 'City',             key: 'city',     placeholder: 'New York' },
            { label: 'State / Province', key: 'state',    placeholder: 'NY' },
            { label: 'ZIP / Postal Code',key: 'zip',      placeholder: '10001' },
            { label: 'Phone (optional)', key: 'phone',    placeholder: '+1 555 000 0000' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
              <input value={fields[key]} onChange={set(key)} placeholder={placeholder} className={inputCls} />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
            <select value={fields.country} onChange={set('country')} className={inputCls}>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 mt-1"
          >
            {saving ? 'Saving & Resubmitting…' : 'Save & Resubmit to Print →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({ src, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-xs w-full" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-9 right-0 text-white/60 hover:text-white text-sm">✕ Close</button>
        <img src={src} alt="Original upload" className="w-full rounded-2xl shadow-2xl" />
        <p className="text-center text-white/40 text-xs mt-2">Original upload</p>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE         = 5;
const PORTRAIT_PAGE_SIZE = 15;

export default function DashboardPage() {
  const { user, _hasHydrated, setUser } = useStore();
  const router   = useRouter();
  const [orders, setOrders] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('portraits');
  const [preview, setPreview]   = useState(null);
  const [page, setPage]         = useState(1);
  const [portraitPage, setPortraitPage] = useState(1);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [showPendingList, setShowPendingList] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [reprinting, setReprinting]       = useState(null);
  const [sizePickerOrderId, setSizePicker] = useState(null);
  const [pickedSize, setPickedSize]        = useState('poster-16x20');

  const SIZE_OPTIONS = QUICK_SIZE_OPTIONS;

  function openSizePicker(orderId, currentProductType) {
    setPickedSize(currentProductType || 'poster-16x20');
    setSizePicker(orderId);
  }

  async function initiateReorder(orderId, productKey) {
    setReprinting(orderId);
    setSizePicker(null);
    try {
      const res  = await fetch('/api/reprint', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ orderId, productKey }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'Could not start checkout');
    } catch (err) {
      addToast(err.message || 'Failed to start order. Please try again.', 'error');
    } finally {
      setReprinting(null);
    }
  }
  const { toasts, addToast }    = useToast();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/login'); return; }
    // Reset dismissed state so the banner always shows on fresh login
    setDismissedBanner(false);
    setShowPendingList(true);
    // Refresh user from API to pick up isSuperAdmin flag
    api.me().then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    Promise.all([api.getOrders(), api.getImages()])
      .then(([o, i]) => { setOrders(o.orders); setImages(i.images); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [_hasHydrated, user?.id]);

  function handleRefundRequested(orderId) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'refund_requested' } : o));
  }

  function handleRefundClaimed(orderId) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'returned' } : o));
  }

  async function handleCancelOrder(orderId) {
    try {
      const res  = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not remove order');
      setOrders(prev => prev.filter(o => o.status !== 'pending'));
      addToast('Incomplete order removed.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const recentUploads = images.slice(0, 8);
  const printCounts   = orders.reduce((acc, o) => { if (o.imageId) acc[o.imageId] = (acc[o.imageId] || 0) + 1; return acc; }, {});

  const totalPages  = Math.ceil(orders.length / PAGE_SIZE);
  const pagedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const portraitTotalPages = Math.ceil(images.length / PORTRAIT_PAGE_SIZE);
  const pagedImages        = images.slice((portraitPage - 1) * PORTRAIT_PAGE_SIZE, portraitPage * PORTRAIT_PAGE_SIZE);

  return (
    <>
      <Navbar />
      {preview && <PreviewModal src={preview} onClose={() => setPreview(null)} />}
      <ToastContainer toasts={toasts} />

      <main className="min-h-screen bg-[#F8F5F2] pt-20" onContextMenu={e => e.preventDefault()}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user?.isSuperAdmin ? "Xia Brown's" : 'My'} Maîtrepets</h1>
              <p className="text-gray-500 mt-0.5 text-sm truncate">
                {user?.isSuperAdmin ? 'CEO of Maîtrepets' : user?.email}
              </p>
            </div>
          </div>

          {/* Pending orders — collapsible dropdown */}
          {!loading && !user?.isSuperAdmin && pendingOrders.length > 0 && !dismissedBanner && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
              {/* Header — click to toggle */}
              <button
                onClick={() => setShowPendingList(v => !v)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-amber-100/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                    <IconAlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">
                      {pendingOrders.length === 1 ? '1 incomplete order' : `${pendingOrders.length} incomplete orders`}
                    </p>
                    <p className="text-xs text-amber-700">
                      {showPendingList ? 'Click to collapse' : 'Click to view and complete or remove'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-amber-500 transition-transform duration-200 ${showPendingList ? 'rotate-180' : ''}`}>
                    <IconChevronDown size={16} />
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); setDismissedBanner(true); }}
                    className="w-7 h-7 flex items-center justify-center text-amber-400 hover:text-amber-700 transition-colors rounded-lg hover:bg-amber-200">
                    <IconX size={13} />
                  </button>
                </div>
              </button>

              {/* Expandable list */}
              {showPendingList && (
                <div className="border-t border-amber-200 divide-y divide-amber-100">
                  {pendingOrders.map(order => (
                    <div key={order.id} className="px-5 py-3 flex items-center gap-3">
                      {order.image?.id ? (
                        <img src={`/api/img?id=${order.image.id}`} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <ImgPlaceholder className="w-10 h-10 rounded-xl flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-900 truncate">
                          {order.productType?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        <p className="text-xs text-amber-600">
                          ${order.price?.toFixed(2)} · Started {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          title="Remove this incomplete order"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-amber-400 hover:text-red-500 hover:bg-red-50 border border-amber-200 hover:border-red-200 transition-all">
                          <IconTrash size={13} />
                        </button>
                        <button
                          onClick={() => openSizePicker(order.id, order.productType)}
                          disabled={reprinting === order.id}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap disabled:opacity-60 flex items-center gap-1.5">
                          {reprinting === order.id ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading…</> : 'Complete Order →'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: user?.isSuperAdmin ? 'My Portraits' : 'Portraits', value: images.length, icon: '🎨' },
            ].map((s) => (
              <div key={s.label} className="card p-3 sm:p-5 flex items-center gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs truncate">{s.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{s.value}</p>
                </div>
              </div>
            ))}

            {/* Orders stat (regular users) / Daily overview (superadmin) */}
            {user?.isSuperAdmin ? (() => {
              const today = new Date(); today.setHours(0,0,0,0);
              const todayOrders = orders.filter(o => o.status !== 'pending' && new Date(o.createdAt) >= today);
              const dailyProfit = todayOrders.reduce((sum, o) => sum + (o.price || 0), 0);
              const soldToday   = todayOrders.length;
              return (
                <div className="card p-3 sm:p-5 col-span-1">
                  <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest mb-2">Today</p>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-gray-400">Revenue</p>
                      <p className="text-lg font-black text-purple-600">${dailyProfit.toFixed(2)}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div>
                      <p className="text-[10px] text-gray-400">Sold</p>
                      <p className="text-lg font-black text-gray-900">{soldToday}</p>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="card p-3 sm:p-5 flex items-center gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl">📦</span>
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs truncate">Orders</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{orders.filter(o => o.status !== 'pending').length}</p>
                </div>
              </div>
            )}

            {/* New Portrait CTA */}
            <Link href="/create" className="card p-3 sm:p-5 flex items-center gap-2 sm:gap-4 bg-purple-600 hover:bg-purple-700 transition-colors group col-span-2 sm:col-span-1">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-purple-200 text-xs">Ready?</p>
                <p className="text-white font-bold text-base sm:text-lg leading-tight">New Portrait</p>
              </div>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
            {[
              { key: 'portraits', label: `Portraits${images.length ? ` (${images.length})` : ''}` },
              { key: 'orders',    label: `Orders${orders.length ? ` (${orders.length})` : ''}` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all text-center ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading…
            </div>

          ) : tab === 'portraits' ? (
            images.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">Maîtrepets</div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">No portraits yet</h3>
                <p className="text-gray-500 mb-6">Create your first pet portrait — free preview</p>
                <Link href="/create" className="btn-primary px-8 py-3">Create Portrait →</Link>
              </div>
            ) : (
              <>
                {/* Lightbox */}
                {lightboxImg && (
                  <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
                    <button className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl leading-none">✕</button>
                    <img
                      src={lightboxImg}
                      alt="Portrait"
                      className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
                      onClick={e => e.stopPropagation()}
                      onContextMenu={e => e.preventDefault()}
                      draggable={false}
                    />
                  </div>
                )}

                <div className={user?.isSuperAdmin ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' : 'grid grid-cols-3 md:grid-cols-5 gap-3'}>
                  {pagedImages.map(img => (
                    <div key={img.id} className="card overflow-hidden group">
                      <div className="relative">
                        {img.id ? (
                          <>
                            <img
                              src={`/api/img?id=${img.id}`}
                              alt="Portrait"
                              className={`w-full object-cover ${user?.isSuperAdmin ? 'aspect-[3/4] cursor-zoom-in' : 'aspect-square'}`}
                              onClick={user?.isSuperAdmin ? () => setLightboxImg(`/api/img?id=${img.id}`) : undefined}
                              onContextMenu={e => e.preventDefault()}
                              draggable={false}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                              <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.4)', userSelect: 'none' }}>
                                maitrepets.com
                              </span>
                            </div>
                          </>
                        ) : (
                          <ImgPlaceholder className={`w-full ${user?.isSuperAdmin ? 'aspect-[3/4]' : 'aspect-square'}`} />
                        )}
                        {img.id && (
                          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!user?.isSuperAdmin && <PaperPrintIcon imageId={img.id} />}
                            <DownloadBtn imageId={img.id} isSuperAdmin={user?.isSuperAdmin} />
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-2.5 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {new Date(img.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          {img.id && !user?.isSuperAdmin && <QuickOrderBtn img={img} />}
                        </div>
                        {img.id && (
                          <p className="text-[10px] font-mono text-purple-400/70 tracking-wider">
                            #{img.id.replace(/-/g, '').slice(0, 8).toUpperCase()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {portraitTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-gray-400">
                      {(portraitPage - 1) * PORTRAIT_PAGE_SIZE + 1}–{Math.min(portraitPage * PORTRAIT_PAGE_SIZE, images.length)} of {images.length} portraits
                    </p>
                    <div className="flex gap-1">
                      <button onClick={() => setPortraitPage(p => Math.max(1, p - 1))} disabled={portraitPage === 1}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        ← Prev
                      </button>
                      {Array.from({ length: portraitTotalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPortraitPage(p)}
                          className={`w-8 h-8 text-xs font-medium rounded-lg border transition-all ${p === portraitPage ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600'}`}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setPortraitPage(p => Math.min(portraitTotalPages, p + 1))} disabled={portraitPage === portraitTotalPages}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )

          ) : (
            orders.length === 0 ? (
              <div className="card p-16 text-center">
                {user?.isSuperAdmin ? (
                  <>
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">No customer orders yet</h3>
                    <p className="text-gray-500">Orders will appear here once customers start purchasing.</p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Order a framed print of your portrait</p>
                    <Link href="/create" className="btn-primary px-8 py-3">Create & Order →</Link>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {pagedOrders.map(order => {
                    const sc       = STATUS_CONFIG[order.status] || { color: 'bg-gray-100 text-gray-500 border border-gray-200', label: order.status, Icon: IconClock, step: 0 };
                    const isFire   = (printCounts[order.imageId] || 0) > 3;
                    const StatusIcon = sc.Icon;
                    const isPending   = order.status === 'pending';
                    const isAddrFail  = ['paid_fulfillment_failed','paid_printful_failed'].includes(order.status);

                    return (
                      <div key={order.id} className={`card p-4 ${isPending ? 'opacity-80 border-dashed' : ''}`}>
                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          <div className="relative flex-shrink-0">
                            {order.image?.id ? (
                              <img src={`/api/img?id=${order.image.id}`} alt="Portrait" className="w-16 h-16 rounded-xl object-cover" />
                            ) : (
                              <ImgPlaceholder className="w-16 h-16 rounded-xl" />
                            )}
                            {isFire && <span className="absolute -top-2 -right-2 text-base leading-none" title="Popular print!">🔥</span>}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-1.5">
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[55%]">
                                {order.productType?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </p>
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${sc.color}`}>
                                <StatusIcon size={10} />
                                {sc.label}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' · '}<span className="font-medium text-gray-600">${order.price.toFixed(2)}</span>
                            </p>
                            {user?.isSuperAdmin && order.user && (
                              <p className="text-xs text-purple-500 mt-0.5 truncate">{order.user.name || order.user.email}</p>
                            )}

                            {/* Progress stepper — only for paid+ orders, hidden for superadmin */}
                            {!isPending && !user?.isSuperAdmin && <ProgressStepper status={order.status} trackingNumber={order.trackingNumber} trackingUrl={order.trackingUrl} />}

                            {/* Pending: prompt to reorder */}
                            {isPending && (
                              <p className="text-xs text-amber-600 mt-2">
                                Payment not completed — use the button below to reorder
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions row — hidden for superadmin */}
                        {!user?.isSuperAdmin && !isPending && (
                          <div className="flex justify-end items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                            {isAddrFail && <OrderErrorAlert />}
                            {order.imageId && <DownloadBtn imageId={order.imageId} />}
                            <ReorderBtn order={order} />
                            <RefundStatusSection order={order} onReported={handleRefundRequested} onClaimed={handleRefundClaimed} addToast={addToast} />
                          </div>
                        )}

                        {!user?.isSuperAdmin && isPending && (
                          <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => openSizePicker(order.id, order.productType)}
                              disabled={reprinting === order.id}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center gap-1.5">
                              {reprinting === order.id ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading…</> : 'Complete Order →'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-gray-400">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, orders.length)} of {orders.length} orders
                    </p>
                    <div className="flex gap-1">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        ← Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-8 h-8 text-xs font-medium rounded-lg border transition-all ${p === page ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600'}`}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </main>

      {/* ── Size Picker Modal ─────────────────────────────────────────────── */}
      {sizePickerOrderId && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
          onClick={() => setSizePicker(null)}>
          <div
            className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">Choose Your Size</h2>
                <p className="text-gray-500 text-xs mt-0.5">Select the frame size for your portrait</p>
              </div>
              <button onClick={() => setSizePicker(null)} className="text-gray-600 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            {/* Size grid */}
            <div className="flex flex-col gap-2 mb-5">
              {SIZE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setPickedSize(opt.key)}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                    pickedSize === opt.key
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/25'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${pickedSize === opt.key ? 'border-amber-500 bg-amber-500' : 'border-gray-600'}`} />
                    <span className={`font-semibold text-sm ${pickedSize === opt.key ? 'text-white' : 'text-gray-300'}`}>{opt.label}</span>
                    {opt.tag && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">{opt.tag}</span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${pickedSize === opt.key ? 'text-amber-400' : 'text-gray-400'}`}>{opt.price}</span>
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => initiateReorder(sizePickerOrderId, pickedSize)}
              disabled={reprinting === sizePickerOrderId}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {reprinting === sizePickerOrderId
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                : 'Continue to Payment →'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
