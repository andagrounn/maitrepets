'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UploadZone from '@/components/UploadZone';
import StyleCard from '@/components/StyleCard';
import PriceSelector from '@/components/PriceSelector';
import ShippingForm from '@/components/ShippingForm';
import { Toast, useToast } from '@/components/Toast';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { calculatePrice, SIZE_MULTIPLIERS } from '@/lib/pricing';
import { STYLE_PROMPTS } from '@/lib/replicate';

const STEPS = ['Upload', 'Style', 'Generate', 'Order'];

const TRUST_BADGES = [
  { icon: '⭐', text: '10,000+ happy pet owners' },
  { icon: '🔒', text: 'Secure checkout' },
  { icon: '🐾', text: '1 free AI generation' },
  { icon: '🚚', text: 'Delivered to your door' },
];

const URGENCY_LABELS = {
  standard: '7–10 business days',
  fast: '3–5 business days',
  express: '1–2 business days',
};

export default function CreatePage() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const { toast, showToast, dismiss } = useToast();

  // Flow state
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [imageRevealed, setImageRevealed] = useState(false);

  // Customization state
  const [selectedStyle, setSelectedStyle] = useState('chibi');
  const [petType, setPetType] = useState('dog');
  const [emotion, setEmotion] = useState('normal');
  const [size, setSize] = useState('');
  const [urgency, setUrgency] = useState('standard');

  // Upsell state
  const [extras, setExtras] = useState({ digitalCopy: true, extraCopy: false, priorityProcessing: false });
  const EXTRAS = [
    { key: 'digitalCopy',        label: 'HD Digital Copy',      sub: 'Download instantly + print anywhere',    price: 12, emoji: '💾', default: true },
    { key: 'extraCopy',          label: 'Extra Print Copy',     sub: 'Same design shipped to a second address', price: 19, emoji: '🖼️' },
    { key: 'priorityProcessing', label: 'Priority Processing',  sub: 'Moved to front of queue — ships in 1–2 days', price: 9, emoji: '⚡' },
  ];
  const extrasTotal = EXTRAS.reduce((sum, e) => sum + (extras[e.key] ? e.price : 0), 0);

  // Generation limits
  const [freeLimitReached, setFreeLimitReached] = useState(false);

  // Loading
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [shipping, setShipping] = useState({ country: 'US' });
  const [genProgress, setGenProgress] = useState(0);

  // Popular styles
  const [popularStyles, setPopularStyles] = useState([]);

  useEffect(() => {
    fetch('/api/popular-styles').then((r) => r.json()).then((d) => setPopularStyles(d.popular || [])).catch(() => {});
  }, []);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Live price
  const price = calculatePrice({ product: 'poster', size, style: selectedStyle, petType, urgency, emotion });
  const pricingParams = { product: 'poster', size, style: selectedStyle, petType, urgency, emotion };

  useEffect(() => {
    api.me().then((d) => setUser(d.user)).catch(() => {});
  }, []);

  // Animate progress bar during generation
  useEffect(() => {
    if (!isGenerating) { setGenProgress(0); return; }
    setGenProgress(8);
    const intervals = [
      setTimeout(() => setGenProgress(25), 3000),   // rembg done
      setTimeout(() => setGenProgress(55), 12000),  // controlnet running
      setTimeout(() => setGenProgress(78), 30000),  // controlnet done
      setTimeout(() => setGenProgress(90), 50000),  // upscaling
    ];
    return () => intervals.forEach(clearTimeout);
  }, [isGenerating]);

  // Reveal generated image with fade-in
  useEffect(() => {
    if (generatedUrl) {
      setImageRevealed(false);
      setTimeout(() => setImageRevealed(true), 100);
    }
  }, [generatedUrl]);

  function handleFile(f) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleGenerate() {
    if (!file) { showToast('Please select a pet photo first', 'warning'); return; }
    if (!user) { setShowAuthModal(true); return; }

    setIsUploading(true);
    setStep(1);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('style', selectedStyle);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      setUploadedUrl(uploadData.url);
      setImageId(uploadData.imageId);
      setIsUploading(false);
      setStep(2);
      setIsGenerating(true);

      const genData = await api.generate({ imageUrl: uploadData.url, style: selectedStyle, imageId: uploadData.imageId });

      if (genData?.error === 'FREE_LIMIT_REACHED') {
        setFreeLimitReached(true);
        setStep(0);
        return;
      }

      setGenProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      setGeneratedUrl(genData.output);
      setStep(3);
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
      setStep(0);
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  }

  function handleCheckout() {
    if (!user) { setShowAuthModal(true); return; }
    setShowShipping(true);
  }

  const sizeConfig = SIZE_MULTIPLIERS[size] || SIZE_MULTIPLIERS.large;
  const productKey = sizeConfig.productKey || 'poster-16x20';
  const totalPrice = (
    parseFloat(price) +
    (shipping.shippingRate ? parseFloat(shipping.shippingRate) : 0) +
    extrasTotal
  ).toFixed(2);

  async function handlePlaceOrder() {
    setIsCheckingOut(true);
    try {
      const d = await api.checkout({ imageId, generatedUrl, productKey, price: totalPrice, shipping, extras });
      window.location.href = d.url;
    } catch (err) {
      showToast(err.message || 'Checkout failed. Please try again.', 'error');
      setIsCheckingOut(false);
    }
  }

  function startOver() {
    setGeneratedUrl(null);
    setUploadedUrl(null);
    setImageId(null);
    setStep(0);
    setGenProgress(0);
  }

  const isLoading = isUploading || isGenerating;

  return (
    <>
      <Navbar />
      <Toast message={toast?.message} type={toast?.type} onDismiss={dismiss} />

      <main className="min-h-screen bg-[#F8F5F2] pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
            {TRUST_BADGES.map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-1 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  i === step ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : i < step  ? 'bg-purple-100 text-purple-600'
                  :              'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <span className="text-xs">✓</span> : <span className="text-xs opacity-60">{i + 1}</span>}
                  {s}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-6 transition-colors duration-500 ${i < step ? 'bg-purple-300' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Free limit reached banner ── */}
          {freeLimitReached && (
            <div className="max-w-lg mx-auto mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-bold text-gray-900 mb-1">You've used your 3 free AI generations</h3>
              <p className="text-sm text-gray-500 mb-4">
                Complete a print order to unlock more generations. Each purchase gives you 1 additional generation in a new style.
              </p>
              <Link href="/dashboard" className="btn-primary px-6 py-2.5 text-sm">View My Orders →</Link>
            </div>
          )}

          {/* ── STEP 0 & 1: Upload + Customize ── */}
          {!isLoading && !generatedUrl && !freeLimitReached && (
            <div className="grid md:grid-cols-2 gap-8">

              {/* Left — Upload */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Upload Your Pet Photo</h2>
                <p className="text-gray-500 text-sm mb-5">Clear, front-facing, good lighting = best results</p>
                <UploadZone onFile={handleFile} preview={preview} />

                {file && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                    <span>✓</span>
                    <span>Photo ready — {(file.size / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                )}
              </div>

              {/* Right — Theme + Customize + Price */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Art Style</h2>

                  {/* Style Picker */}
                  <div className="mb-1">
                    <div className="grid grid-cols-4 gap-2">
                      {Object.keys(STYLE_PROMPTS).map((k) => (
                        <StyleCard key={k} styleKey={k} selected={selectedStyle === k} onClick={setSelectedStyle} popular={popularStyles.includes(k)} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamic Price Selector */}
                <PriceSelector
                  emotion={emotion}  setEmotion={setEmotion}
                  size={size}        setSize={setSize}
                  urgency={urgency}  setUrgency={setUrgency}
                  price={price}
                />

                {/* Memorial message */}
                {emotion === 'memorial' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in">
                    <span className="text-2xl">🕊️</span>
                    <div>
                      <p className="font-semibold text-rose-700">Honor their memory</p>
                      <p className="text-sm text-rose-500 mt-0.5">We'll create a portrait worthy of the love you shared. Forever on your wall.</p>
                    </div>
                  </div>
                )}

                {/* Gift message */}
                {emotion === 'gift' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="font-semibold text-amber-700">Perfect gift idea</p>
                      <p className="text-sm text-amber-500 mt-0.5">Over 10,000 pet owners have gifted a portrait. Rated the #1 unique pet gift.</p>
                    </div>
                  </div>
                )}

                <button onClick={handleGenerate} disabled={!file}
                  className="btn-primary w-full py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                  {file ? `🐾 Generate My ${STYLE_PROMPTS[selectedStyle]?.label} Portrait →` : '← Upload a photo first'}
                </button>
                <p className="text-xs text-gray-400 text-center">1 free AI generation • Paper print included • No charge until you order • ~60 seconds</p>
              </div>
            </div>
          )}

          {/* ── LOADING ── */}
          {isLoading && (
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-28 h-28 mx-auto mb-8 relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#e9d5ff" strokeWidth="8" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#9333ea" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - genProgress / 100)}`}
                    className="transition-all duration-700" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-4xl">
                  {isUploading ? '📸' : '🎬'}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isUploading ? 'Uploading your photo…' : genProgress < 40 ? 'Casting your pet…' : genProgress < 75 ? 'Designing your portrait…' : 'Adding finishing touches…'}
              </h2>
              <p className="text-gray-500 mb-2">
                {isUploading
                  ? 'Securely transferring your image'
                  : genProgress < 40 ? 'Removing background & analyzing your pet'
                  : genProgress < 75 ? `Applying ${STYLE_PROMPTS[selectedStyle]?.label} style`
                  : 'Upscaling to high resolution'}
              </p>
              <p className="text-purple-500 font-semibold text-sm mb-6">{genProgress}% complete</p>

              <div className="w-full bg-purple-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${genProgress}%` }} />
              </div>

              {!isUploading && (
                <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-gray-400">
                  {['Casting your pet', 'Designing poster', 'Adding cinematic effects'].map((s, i) => (
                    <div key={s} className={`flex flex-col items-center gap-1 transition-all ${genProgress > i * 30 ? 'text-purple-500' : ''}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${genProgress > i * 30 ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                        {genProgress > i * 30 ? '✓' : i + 1}
                      </div>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RESULT ── */}
          {generatedUrl && !isLoading && (
            <div className="grid md:grid-cols-5 gap-8">

              {/* Image reveal — 3 cols */}
              <div className="md:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Portrait is Ready! 🐾</h2>
                  <button onClick={startOver} className="text-sm text-gray-400 hover:text-gray-600 underline">Start over</button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Original</p>
                    <img src={preview} alt="Your pet" className="w-full object-contain rounded-2xl shadow-sm bg-gray-900" style={{ aspectRatio: '4/3' }} />
                  </div>
                  <div className={`transition-all duration-700 ${imageRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-2">
                      🐾 {STYLE_PROMPTS[selectedStyle]?.label} Portrait
                    </p>
                    <img
                      src={generatedUrl}
                      alt="Movie Poster"
                      className="w-full aspect-[2/3] object-cover rounded-2xl shadow-xl ring-2 ring-purple-200 cursor-zoom-in"
                      onClick={() => window.open(generatedUrl, '_blank')}
                    />
                  </div>
                </div>

                {/* Regenerate CTA — all styles */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Try another style</p>
                  <div className="grid grid-cols-8 gap-1">
                    {Object.keys(STYLE_PROMPTS).map(k => (
                      <StyleCard key={k} styleKey={k} selected={selectedStyle === k} onClick={k2 => { setSelectedStyle(k2); startOver(); }} popular={popularStyles.includes(k)} compact />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order panel — 2 cols */}
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Order Your Portrait Print</h2>

                {/* Live Price — prominent */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white text-center shadow-lg shadow-purple-200">
                  <p className="text-purple-200 text-sm mb-1">Your custom portrait</p>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="line-through text-purple-300 text-lg">$120</span>
                    <span className="text-5xl font-black">${price}</span>
                  </div>
                  {price < 120 && (
                    <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                      Save ${120 - price} today
                    </div>
                  )}
                  <p className="text-purple-200 text-xs mt-2">Limited-time offer · {URGENCY_LABELS[urgency]}</p>
                </div>

                {/* Reconfigure */}
                <details className="group">
                  <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 flex items-center gap-1 select-none">
                    <span className="group-open:rotate-90 inline-block transition-transform">▶</span>
                    Adjust options
                  </summary>
                  <div className="mt-3">
                    <PriceSelector
                      petType={petType} setPetType={setPetType}
                      emotion={emotion}  setEmotion={setEmotion}
                      size={size}        setSize={setSize}
                      urgency={urgency}  setUrgency={setUrgency}
                      price={price}      params={pricingParams}
                    />
                  </div>
                </details>

                {/* Trust signals */}
                <div className="space-y-2">
                  {[
                    { icon: '✅', title: 'Replacement for damaged prints', sub: 'Full reprint if your order arrives damaged' },
                    { icon: '🖼️', title: 'Premium canvas material', sub: 'Ready-to-hang, gallery-wrapped' },
                    { icon: '🚚', title: `Ships in ${urgency === 'express' ? '1–2' : urgency === 'fast' ? '3–5' : '7–10'} days`, sub: 'Tracked & insured delivery' },
                  ].map((t) => (
                    <div key={t.title} className="flex items-center gap-3 text-sm bg-white rounded-xl p-3 border border-gray-100">
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{t.title}</p>
                        <p className="text-gray-400 text-xs">{t.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Memorial / Gift upsell */}
                {emotion === 'memorial' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-600 flex gap-2">
                    <span>🕊️</span>
                    <span>Honor their memory with a timeless portrait ❤️</span>
                  </div>
                )}

                {/* ── Pre-checkout upsells ── */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add-ons</p>
                  {EXTRAS.map((e) => (
                    <label key={e.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${extras[e.key] ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-200'}`}>
                      <input
                        type="checkbox"
                        checked={extras[e.key]}
                        onChange={() => setExtras((prev) => ({ ...prev, [e.key]: !prev[e.key] }))}
                        className="accent-purple-600 w-4 h-4 shrink-0"
                      />
                      <span className="text-lg">{e.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{e.label} <span className="text-purple-600">+${e.price}</span></p>
                        <p className="text-xs text-gray-400 truncate">{e.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Total with extras */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-2xl font-black text-gray-900">${totalPrice}</span>
                </div>

                {!size && (
                  <p className="text-xs text-center text-amber-600 bg-amber-50 border border-amber-200 rounded-xl py-2 px-3">
                    Please select a print size above to continue
                  </p>
                )}
                <button onClick={handleCheckout} disabled={isCheckingOut || !size}
                  className="btn-primary w-full py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                  {isCheckingOut
                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting…</span>
                    : size ? `🛒 Order for $${totalPrice} →` : '🛒 Select a size to order'}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  🔒 Secure checkout by Stripe · No hidden fees
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Shipping Modal */}
      {showShipping && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card p-8 max-w-lg w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">2</div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Final step</p>
                  <p className="font-bold text-gray-900">Shipping & Payment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-purple-600">${totalPrice}</p>
                <p className="text-xs text-gray-400">{shipping.shippingRate ? 'incl. shipping' : 'excl. shipping'}</p>
              </div>
            </div>
            <ShippingForm
              data={shipping}
              onChange={setShipping}
              onSubmit={handlePlaceOrder}
              onBack={() => setShowShipping(false)}
              loading={isCheckingOut}
              productKey={productKey}
              price={price}
            />
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🐶</div>
              <h3 className="text-xl font-bold text-gray-900">Sign in to continue</h3>
              <p className="text-gray-500 text-sm mt-1">Free account · No credit card required</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/signup" className="btn-primary text-center py-3">Create Free Account →</Link>
              <Link href="/login" className="btn-secondary text-center py-3">Sign In</Link>
              <button onClick={() => setShowAuthModal(false)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
