'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

function PostPurchaseUpsell({ orderId }) {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  async function claimUpsell() {
    setLoading(true);
    try {
      const res = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  if (claimed) return null;

  return (
    <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-left shadow-xl shadow-purple-200 mb-2">
      <div className="absolute -top-3 left-4 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">
        ONE-TIME DEAL
      </div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="white"/><circle cx="17.5" cy="10.5" r=".5" fill="white"/><circle cx="8.5" cy="7.5" r=".5" fill="white"/><circle cx="6.5" cy="12.5" r=".5" fill="white"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black mb-1">Get a surprise HD print style — just $6</h3>
          <p className="text-purple-100 text-sm mb-4">
            We'll secretly pick a different art style, regenerate your pet, and send you the HD file instantly. Normally $29+. Only available right now — gone when you leave.
          </p>
          <div className="flex gap-3">
            <button
              onClick={claimUpsell}
              disabled={loading}
              className="bg-white text-purple-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-purple-50 transition-all disabled:opacity-60"
            >
              {loading ? 'Redirecting…' : 'Grab it for $6 →'}
            </button>
            <button
              onClick={() => setClaimed(true)}
              className="text-purple-200 text-sm hover:text-white underline"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessInner() {
  const { resetCreate } = useStore();
  const params    = useSearchParams();
  const orderId   = params.get('order');
  const sessionId = params.get('session_id');
  const txId      = params.get('tx');

  const [status, setStatus]           = useState('confirming'); // confirming | confirmed | error
  const [hasDigitalCopy, setHasDigitalCopy] = useState(false);
  const [showUpsell, setShowUpsell]   = useState(false);

  function resolveUpsellVisibility(isNewConfirm) {
    const STORAGE_KEY = 'mp_purchase_count';
    let count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (isNewConfirm) {
      count += 1;
      localStorage.setItem(STORAGE_KEY, String(count));
    }
    // Show on every 3rd purchase (count 3, 6, 9…)
    setShowUpsell(count > 0 && count % 3 === 0);
  }

  useEffect(() => {
    resetCreate?.();

    // Demo mode (DEMO prefix from demo checkout) — skip confirmation
    if (sessionId?.startsWith('DEMO')) {
      setStatus('confirmed');
      resolveUpsellVisibility(true);
      return;
    }
    // No session_id = direct navigation without payment — show error
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const cacheKey = `confirm-result:${sessionId}`;

    // Restore from cache on refresh / back-nav
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const d = JSON.parse(cached);
        setStatus('confirmed');
        setHasDigitalCopy(!!d.digitalCopy);
        resolveUpsellVisibility(false); // don't re-count on refresh
        return;
      } catch {}
    }

    fetch('/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, orderId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          sessionStorage.setItem(cacheKey, JSON.stringify(d));
          setStatus('confirmed');
          setHasDigitalCopy(!!d.digitalCopy);
          resolveUpsellVisibility(true); // new confirmed purchase
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {status === 'confirming' && (
          <>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirming your order…</h1>
            <p className="text-gray-500">Just a moment while we verify your payment.</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Your masterpiece<br />is on its way</h1>
            <p className="text-gray-600 text-lg mb-4">
              Your Portrait is being sent to print!
            </p>
            {(txId || sessionId) && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-6 text-xs text-green-700 font-mono break-all">
                Ref: {txId || sessionId}
              </div>
            )}

            {/* Order status */}
            <div className="flex gap-2 mb-6 justify-center">
              {[
                { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>, title: 'Printing', color: 'bg-purple-100 text-purple-700' },
                { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, title: 'Ships 3–5 days', color: 'bg-blue-100 text-blue-700' },
                { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'Arrives 7–10 days', color: 'bg-green-100 text-green-700' },
              ].map((t) => (
                <div key={t.title} className={`flex items-center gap-1.5 ${t.color} rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap`}>
                  {t.icon}
                  {t.title}
                </div>
              ))}
            </div>

            {/* ── HD Digital Copy download ── */}
            {hasDigitalCopy && orderId && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Your HD Digital Copy is ready</p>
                    <p className="text-sm text-gray-500">Full-resolution PNG — download and keep forever</p>
                  </div>
                </div>
                <a
                  href={`/api/download?orderId=${orderId}`}
                  className="inline-block bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-all"
                >
                  Download HD Image →
                </a>
              </div>
            )}

            {/* ── Post-purchase upsell — every 3rd purchase ── */}
            {showUpsell && <PostPurchaseUpsell orderId={orderId} />}

            <div className="flex gap-3 justify-center mt-6">
              <Link href="/create" className="btn-primary px-8 py-3">Create Another →</Link>
              <Link href="/dashboard" className="btn-secondary px-8 py-3">View Orders</Link>
            </div>

            {/* Social proof */}
            <p className="text-gray-400 text-sm mt-6">Loved by 10,000+ pet owners</p>
            <p className="text-gray-400 text-xs mt-1">Framed & Ready to Hang · Ships from USA</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Payment received</h1>
            <p className="text-gray-600 mb-6">
              Your payment was successful but we had trouble confirming your order automatically.
              Our team will process it manually within 24 hours.
            </p>
            <Link href="/dashboard" className="btn-primary px-8 py-3">View Orders</Link>
          </>
        )}

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessInner />
    </Suspense>
  );
}
