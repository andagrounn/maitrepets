'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UpsellSuccessInner() {
  const params    = useSearchParams();
  const sessionId = params.get('session_id');
  const orderId   = params.get('order');
  const isDemo    = params.get('demo') === '1';

  const [status, setStatus]             = useState('generating'); // generating | revealed | error
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [styleLabel, setStyleLabel]     = useState('');
  const [styleEmoji, setStyleEmoji]     = useState('🎨');
  const [revealed, setRevealed]         = useState(false);
  const [imageId, setImageId]           = useState(null);
  const [newOrderId, setNewOrderId]     = useState(null);

  // Print / paper order state
  const [printLoading, setPrintLoading]   = useState(false);
  const [paperLoading, setPaperLoading]   = useState(false);

  useEffect(() => {
    // Cache key unique to this checkout session / demo order
    const cacheKey = `upsell-result:${sessionId || orderId}`;

    // Restore from cache on refresh / back-nav — no re-generation
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const d = JSON.parse(cached);
        setGeneratedUrl(d.generatedUrl);
        setStyleLabel(d.styleLabel || 'Surprise Style');
        setStyleEmoji(d.styleEmoji || '🎨');
        setImageId(d.imageId || null);
        setNewOrderId(d.newOrderId || null);
        setStatus('revealed');
        setRevealed(true);
        return;
      } catch {}
    }

    const body = isDemo
      ? { originalOrderId: orderId, demo: true }
      : { sessionId, originalOrderId: orderId };

    fetch('/api/upsell-confirm', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          // Persist so refresh / back never re-calls the API
          sessionStorage.setItem(cacheKey, JSON.stringify(d));
          setGeneratedUrl(d.generatedUrl);
          setStyleLabel(d.styleLabel || 'Surprise Style');
          setStyleEmoji(d.styleEmoji || '🎨');
          setImageId(d.imageId || null);
          setNewOrderId(d.newOrderId || null);
          setStatus('revealed');
          setTimeout(() => setRevealed(true), 200);
          // Replace URL in history so browser back goes to the order page, not here
          window.history.replaceState(null, '', window.location.href);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, []);

  async function handleOrderFramed() {
    if (!newOrderId) return;
    setPrintLoading(true);
    try {
      const res  = await fetch('/api/reprint', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId: newOrderId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setPrintLoading(false);
    }
  }

  async function handleOrderPaper() {
    if (!imageId) return;
    setPaperLoading(true);
    try {
      const res  = await fetch('/api/order-paper', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setPaperLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {status === 'generating' && (
          <div className="text-center">
            <div className="text-7xl mb-6 animate-bounce">🎁</div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Creating your surprise…</h1>
            <p className="text-gray-500 mb-6">We're generating a brand-new art style for your pet</p>
            <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-xs text-gray-400 mt-3">This takes about 30–60 seconds</p>
          </div>
        )}

        {status === 'revealed' && generatedUrl && (
          <>
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🎉</div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">Your surprise is here!</h1>
              <p className="text-gray-500">
                {styleEmoji} Your pet in <span className="font-bold text-purple-600">{styleLabel}</span> style
              </p>
            </div>

            {/* Image */}
            <div className={`transition-all duration-700 mb-5 ${revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <img
                src={generatedUrl}
                alt="Surprise Portrait"
                className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl ring-4 ring-purple-300"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-3 mb-6">

              {/* Free HD Download */}
              <a
                href={generatedUrl}
                download="surprise-portrait.png"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-md shadow-emerald-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download HD Image — Free
                <span className="ml-1 text-emerald-300 font-normal text-xs">included with purchase</span>
              </a>

              {/* Order Framed Print */}
              <button
                onClick={handleOrderFramed}
                disabled={!newOrderId || printLoading}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors shadow-md shadow-purple-200"
              >
                {printLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
                  </svg>
                )}
                Order Framed Print — $79.99
              </button>

              {/* Order Paper Print */}
              <button
                onClick={handleOrderPaper}
                disabled={!imageId || paperLoading}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-bold text-sm border border-gray-200 transition-colors"
              >
                {paperLoading ? (
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                Order Paper Print (Unframed) — $29.99
              </button>

            </div>

            {/* Nav links */}
            <div className="flex gap-3">
              <Link href="/create" className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-purple-600 hover:bg-purple-50 border border-purple-200 transition-colors">
                Create Another
              </Link>
              <Link href="/dashboard" className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
                View Orders
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-500 mb-6">
              Your payment went through. Our team will manually generate your surprise portrait within 24 hours.
            </p>
            <Link href="/dashboard" className="btn-primary px-6 py-3">View Orders</Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UpsellSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <UpsellSuccessInner />
    </Suspense>
  );
}
