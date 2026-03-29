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
        <span className="text-4xl">🎨</span>
        <div className="flex-1">
          <h3 className="text-lg font-black mb-1">Get a surprise HD print style — just $6 🎁</h3>
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

  useEffect(() => {
    resetCreate?.();

    // Demo mode (DEMO prefix from demo checkout) — skip confirmation
    if (sessionId?.startsWith('DEMO')) {
      setStatus('confirmed');
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
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Your pet is now a star ⭐</h1>
            <p className="text-gray-600 text-lg mb-4">
              Your Portrait is being sent to print!
            </p>
            {(txId || sessionId) && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-6 text-xs text-green-700 font-mono break-all">
                Ref: {txId || sessionId}
              </div>
            )}

            {/* Order status */}
            <div className="card p-6 mb-6 text-left">
              {[
                { icon: '🖨️', title: 'Printing in Progress',  sub: 'Your portrait is being prepared' },
                { icon: '📦', title: 'Ships in 3–5 Days',     sub: 'Carefully packaged for safe delivery' },
                { icon: '🏠', title: 'Delivered in 7–10 Days', sub: 'Right to your front door' },
              ].map((t) => (
                <div key={t.title} className="flex items-center gap-3 mb-3 last:mb-0">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-gray-500">{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── HD Digital Copy download ── */}
            {hasDigitalCopy && orderId && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">💾</span>
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

            {/* ── Post-purchase upsell ── */}
            <PostPurchaseUpsell orderId={orderId} />

            <div className="flex gap-3 justify-center mt-6">
              <Link href="/create" className="btn-primary px-8 py-3">Create Another →</Link>
              <Link href="/dashboard" className="btn-secondary px-8 py-3">View Orders</Link>
            </div>

            {/* Social proof */}
            <p className="text-gray-400 text-sm mt-6">Loved by 10,000+ pet owners</p>
            <p className="text-gray-400 text-xs mt-1">Printed on Enhanced Matte Paper · Ships from USA</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-8xl mb-6">⚠️</div>
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
