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
          {order.image?.generatedUrl && (
            <img src={order.image.generatedUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
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

// ─── Refund / damage status section in order actions ──────────────────────────
const DAMAGE_REPORTABLE = ['paid', 'fulfilling', 'shipped', 'delivered'];

function RefundStatusSection({ order, onReported, addToast }) {
  const [showModal, setShowModal] = useState(false);

  if (order.status === 'refund_approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700">
        <IconCheckCircle size={12} /> Refund Approved
      </span>
    );
  }

  if (!DAMAGE_REPORTABLE.includes(order.status)) return null;

  return (
    <>
      <IconBtn onClick={() => setShowModal(true)} title="Report damaged / defective item">
        <IconCamera size={13} />
      </IconBtn>
      {showModal && (
        <DamageReportModal
          order={order}
          onClose={() => setShowModal(false)}
          onSuccess={id => { setShowModal(false); onReported(id); }}
          addToast={addToast}
        />
      )}
    </>
  );
}

// ─── Icon button ───────────────────────────────────────────────────────────────
function IconBtn({ onClick, disabled, title, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 text-gray-400 hover:text-purple-600 border border-gray-200 hover:border-purple-300 transition-all disabled:opacity-40 shadow-sm">
      {disabled
        ? <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
        : children}
    </button>
  );
}

// ─── Order progress stepper ────────────────────────────────────────────────────
function ProgressStepper({ status }) {
  const sc = STATUS_CONFIG[status];
  const currentStep = sc?.step ?? 0;
  if (currentStep < 0) return null;

  return (
    <div className="flex items-center gap-0 mt-3 mb-1">
      {STEPS.map((label, i) => {
        const StepIcon = STEP_ICONS[i];
        const done   = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                ${done   ? 'bg-purple-600 text-white' :
                  active ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-400 ring-offset-1' :
                           'bg-gray-100 text-gray-300'}`}>
                <StepIcon size={11} />
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

// ─── Tracking section ──────────────────────────────────────────────────────────
function TrackingSection({ order, addToast }) {
  if (!order.trackingNumber) return null;

  function copyTracking() {
    navigator.clipboard.writeText(order.trackingNumber).then(() => addToast('Tracking number copied!', 'success'));
  }

  return (
    <div className="mt-3 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5 flex items-center gap-3">
      <div className="text-purple-400 flex-shrink-0"><IconTruck size={16} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-purple-400 font-medium uppercase tracking-wide mb-0.5">Tracking Number</p>
        <p className="text-xs font-mono font-semibold text-purple-800 truncate">{order.trackingNumber}</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={copyTracking} title="Copy tracking number"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-purple-400 hover:text-purple-600 border border-purple-200 hover:border-purple-400 transition-all shadow-sm">
          <IconCopy size={13} />
        </button>
        {order.trackingUrl && (
          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" title="Track package"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm">
            <IconExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Paper print button ────────────────────────────────────────────────────────
function PaperPrintIcon({ imageId }) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    try {
      const res  = await fetch('/api/order-paper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageId }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { setLoading(false); }
  }
  return <IconBtn onClick={handle} disabled={loading} title="Order paper print ($29.99)"><IconPrinter size={13} /></IconBtn>;
}

// ─── Reprint button ────────────────────────────────────────────────────────────
function ReprintIcon({ order }) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    try {
      const res  = await fetch('/api/reprint', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { setLoading(false); }
  }
  return <IconBtn onClick={handle} disabled={loading} title="Reprint this order"><IconPrinter size={13} /></IconBtn>;
}

// ─── Download button + modal ───────────────────────────────────────────────────
function DownloadBtn({ imageId }) {
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const res  = await fetch('/api/download-purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageId }) });
      const data = await res.json();
      if (data.url) {
        if (data.free) { window.open(data.url, '_blank'); setShow(false); }
        else window.location.href = data.url;
      }
    } catch { setLoading(false); }
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
const PAGE_SIZE = 5;

export default function DashboardPage() {
  const { user } = useStore();
  const router   = useRouter();
  const [orders, setOrders] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('portraits');
  const [preview, setPreview]   = useState(null);
  const [page, setPage]         = useState(1);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const { toasts, addToast }    = useToast();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    Promise.all([api.getOrders(), api.getImages()])
      .then(([o, i]) => { setOrders(o.orders); setImages(i.images); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  function handleRefundRequested(orderId) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'refund_requested' } : o));
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const recentUploads = [...new Map(images.filter(i => i.originalUrl).map(i => [i.originalUrl, i])).values()].slice(0, 8);
  const printCounts   = orders.reduce((acc, o) => { if (o.imageId) acc[o.imageId] = (acc[o.imageId] || 0) + 1; return acc; }, {});

  const totalPages  = Math.ceil(orders.length / PAGE_SIZE);
  const pagedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Navbar />
      {preview && <PreviewModal src={preview} onClose={() => setPreview(null)} />}
      <ToastContainer toasts={toasts} />

      <main className="min-h-screen bg-[#F8F5F2] pt-20">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Maîtrepets</h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>
            <Link href="/create" className="btn-primary">+ New Portrait</Link>
          </div>

          {/* Pending orders banner */}
          {!loading && pendingOrders.length > 0 && !dismissedBanner && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                  <IconAlertTriangle size={16} />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 text-sm">
                    {pendingOrders.length === 1
                      ? 'You have an incomplete order'
                      : `You have ${pendingOrders.length} incomplete orders`}
                  </p>
                  <p className="text-xs text-amber-700">Complete your payment to confirm your portrait print.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href="/create"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors">
                  Complete Order →
                </Link>
                <button onClick={() => setDismissedBanner(true)}
                  className="w-7 h-7 flex items-center justify-center text-amber-500 hover:text-amber-700 transition-colors">
                  <IconX size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Portraits',   value: images.length,  icon: '🎨' },
              { label: 'Orders',      value: orders.filter(o => o.status !== 'pending').length, icon: '📦' },
              { label: 'Total Spent', value: `$${orders.filter(o => o.status !== 'pending').reduce((s, o) => s + o.price, 0).toFixed(2)}`, icon: '💳' },
            ].map(s => (
              <div key={s.label} className="card p-5 flex items-center gap-4">
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: 'portraits', label: `Portraits${images.length ? ` (${images.length})` : ''}` },
              { key: 'orders',    label: `Orders${orders.length ? ` (${orders.length})` : ''}` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
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
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">No portraits yet</h3>
                <p className="text-gray-500 mb-6">Create your first AI pet portrait — free preview</p>
                <Link href="/create" className="btn-primary px-8 py-3">Create Portrait →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {images.map(img => (
                  <div key={img.id} className="card overflow-hidden group">
                    <div className="relative">
                      {img.generatedUrl ? (
                        <img src={img.generatedUrl} alt="Portrait" className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Generating…</span>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-md capitalize backdrop-blur-sm">
                        {img.style}
                      </span>
                      {img.generatedUrl && (
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PaperPrintIcon imageId={img.id} />
                          <DownloadBtn imageId={img.id} />
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {new Date(img.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {img.generatedUrl && (
                        <Link href={`/create?imageId=${img.id}`} className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                          Order Print →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )

          ) : (
            orders.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Order a framed print of your portrait</p>
                <Link href="/create" className="btn-primary px-8 py-3">Create & Order →</Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {pagedOrders.map(order => {
                    const sc       = STATUS_CONFIG[order.status] || { color: 'bg-gray-100 text-gray-500 border border-gray-200', label: order.status, Icon: IconClock, step: 0 };
                    const isFire   = (printCounts[order.imageId] || 0) > 3;
                    const StatusIcon = sc.Icon;
                    const isPending  = order.status === 'pending';

                    return (
                      <div key={order.id} className={`card p-4 ${isPending ? 'opacity-80 border-dashed' : ''}`}>
                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          <div className="relative flex-shrink-0">
                            {order.image?.generatedUrl ? (
                              <img src={order.image.generatedUrl} alt="Portrait" className="w-16 h-16 rounded-xl object-cover" />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gray-100" />
                            )}
                            {isFire && <span className="absolute -top-2 -right-2 text-base leading-none" title="Popular print!">🔥</span>}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {order.productType?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </p>
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${sc.color}`}>
                                <StatusIcon size={11} />
                                {sc.label}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' · '}<span className="font-medium text-gray-600">${order.price.toFixed(2)}</span>
                            </p>

                            {/* Progress stepper — only for paid+ orders */}
                            {!isPending && <ProgressStepper status={order.status} />}

                            {/* Tracking */}
                            {!isPending && <TrackingSection order={order} addToast={addToast} />}

                            {/* Pending: prompt to complete */}
                            {isPending && (
                              <p className="text-xs text-amber-600 mt-2">
                                Payment not completed — <Link href="/create" className="underline font-semibold">resume your order →</Link>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions row */}
                        {!isPending && (
                          <div className="flex justify-end items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                            {order.imageId && <DownloadBtn imageId={order.imageId} />}
                            {['shipped', 'delivered'].includes(order.status) && <ReprintIcon order={order} />}
                            <RefundStatusSection order={order} onReported={handleRefundRequested} addToast={addToast} />
                          </div>
                        )}

                        {isPending && (
                          <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                            <Link href="/create"
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors">
                              Complete Payment →
                            </Link>
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
    </>
  );
}
