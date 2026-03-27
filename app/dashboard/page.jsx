'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

// ─── SVG icons ────────────────────────────────────────────────────────────────
function PrinterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

// ─── Flat icon button ──────────────────────────────────────────────────────────
function IconBtn({ onClick, disabled, title, children }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md bg-white/80 hover:bg-white text-gray-400 hover:text-purple-600 border border-gray-200 hover:border-purple-300 transition-all disabled:opacity-40 shadow-sm">
      {disabled
        ? <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
        : children}
    </button>
  );
}

// ─── Paper print icon (portrait card) ─────────────────────────────────────────
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
  return <IconBtn onClick={handle} disabled={loading} title="Order paper print ($29.99)"><PrinterIcon /></IconBtn>;
}

// ─── Reprint icon (orders tab) ────────────────────────────────────────────────
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
  return <IconBtn onClick={handle} disabled={loading} title="Reprint this order"><PrinterIcon /></IconBtn>;
}

// ─── Download icon + modal ─────────────────────────────────────────────────────
function DownloadBtn({ imageId }) {
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const res  = await fetch('/api/download-purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageId }) });
      const data = await res.json();
      if (data.url) {
        // free = already purchased → direct download link
        if (data.free) { window.open(data.url, '_blank'); setShow(false); }
        else window.location.href = data.url;
      }
    } catch { setLoading(false); }
  }

  return (
    <>
      <IconBtn onClick={() => setShow(true)} title="Download HD image"><DownloadIcon /></IconBtn>

      {show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShow(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <span className="text-4xl">💾</span>
              <h3 className="text-lg font-bold text-gray-900 mt-2">HD Digital Copy</h3>
              <p className="text-gray-500 text-sm mt-1">Download your full-resolution pawtrait image — print it anywhere, keep it forever.</p>
            </div>
            <div className="bg-purple-50 rounded-xl px-4 py-3 text-center mb-4">
              <span className="text-2xl font-black text-purple-600">$12</span>
              <p className="text-xs text-gray-400 mt-0.5">One-time purchase · Instant download</p>
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
      <div className="relative max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-9 right-0 text-white/60 hover:text-white text-sm">✕ Close</button>
        <img src={src} alt="Original upload" className="w-full rounded-2xl shadow-2xl" />
        <p className="text-center text-white/40 text-xs mt-2">Original upload</p>
      </div>
    </div>
  );
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:                 { color: 'bg-yellow-100 text-yellow-700', label: 'Pending',           icon: '⏳' },
  paid:                    { color: 'bg-green-100 text-green-700',   label: 'Paid',              icon: '✅' },
  fulfilling:              { color: 'bg-blue-100 text-blue-700',     label: 'Printing',          icon: '🖨️' },
  shipped:                 { color: 'bg-purple-100 text-purple-700', label: 'Shipped',           icon: '🚚' },
  returned:                { color: 'bg-gray-100 text-gray-600',     label: 'Returned',          icon: '↩️' },
  failed:                  { color: 'bg-red-100 text-red-700',       label: 'Failed',            icon: '❌' },
  paid_fulfillment_failed: { color: 'bg-orange-100 text-orange-700', label: 'Fulfillment Error', icon: '⚠️' },
};

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

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    Promise.all([api.getOrders(), api.getImages()])
      .then(([o, i]) => { setOrders(o.orders); setImages(i.images); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Recent uploads — unique original URLs, max 8
  const recentUploads = [...new Map(images.filter(i => i.originalUrl).map(i => [i.originalUrl, i])).values()].slice(0, 8);

  // Count prints per imageId — used for fire badge
  const printCounts = orders.reduce((acc, o) => {
    if (o.imageId) acc[o.imageId] = (acc[o.imageId] || 0) + 1;
    return acc;
  }, {});

  // Pagination
  const totalPages  = Math.ceil(orders.length / PAGE_SIZE);
  const pagedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Navbar />
      {preview && <PreviewModal src={preview} onClose={() => setPreview(null)} />}

      <main className="min-h-screen bg-[#F8F5F2] pt-20">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Maîtrepets</h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>
            <Link href="/create" className="btn-primary">+ New Pawtrait</Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Portraits',   value: images.length,  icon: '🎨' },
              { label: 'Orders',      value: orders.length,  icon: '📦' },
              { label: 'Total Spent', value: `$${orders.reduce((s, o) => s + o.price, 0).toFixed(2)}`, icon: '💳' },
            ].map((s) => (
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
            ].map((t) => (
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
                {images.map((img) => (
                  <div key={img.id} className="card overflow-hidden group">

                    {/* Generated pawtrait — no preview/zoom */}
                    <div className="relative">
                      {img.generatedUrl ? (
                        <img
                          src={img.generatedUrl}
                          alt="Pawtrait"
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Generating…</span>
                        </div>
                      )}

                      {/* Style badge */}
                      <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-md capitalize backdrop-blur-sm">
                        {img.style}
                      </span>

                      {/* Action icons — top right, visible on hover */}
                      {img.generatedUrl && (
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PaperPrintIcon imageId={img.id} />
                          <DownloadBtn imageId={img.id} />
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {new Date(img.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {img.generatedUrl && (
                        <Link
                          href={`/create?imageId=${img.id}`}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                        >
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
                {pagedOrders.map((order) => {
                  const sc       = STATUS_CONFIG[order.status] || { color: 'bg-gray-100 text-gray-600', label: order.status, icon: '•' };
                  const isFire   = (printCounts[order.imageId] || 0) > 3;
                  return (
                    <div key={order.id} className="card p-4 flex items-center gap-4">

                      {/* Generated art thumbnail — no preview */}
                      <div className="relative flex-shrink-0">
                        {order.image?.generatedUrl ? (
                          <img src={order.image.generatedUrl} alt="Pawtrait" className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100" />
                        )}
                        {isFire && (
                          <span className="absolute -top-2 -right-2 text-lg leading-none" title="Popular print!">🔥</span>
                        )}
                      </div>

                      {/* Order info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {order.productType?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}<span className="font-medium text-gray-600">${order.price.toFixed(2)}</span>
                        </p>
                        {order.trackingNumber && (
                          <a href={order.trackingUrl || '#'} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                            🚚 {order.trackingNumber}
                          </a>
                        )}
                      </div>

                      {/* Status + actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                        <div className="flex gap-1.5">
                          {order.imageId && <DownloadBtn imageId={order.imageId} />}
                          <ReprintIcon order={order} />
                        </div>
                      </div>
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
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg border transition-all ${p === page ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600'}`}>
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
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
