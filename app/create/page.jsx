'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { FRAME_COLORS } from '@/lib/printful';

const STEPS = ['Upload', 'Style', 'Generate', 'Order'];

const TRUST_BADGES = [
  { icon: '⭐', text: '10,000+ happy pet owners' },
  { icon: '🔒', text: 'Secure checkout' },
  { icon: '✨', text: '1 free AI generation' },
  { icon: '🚚', text: 'Delivered to your door' },
];

const URGENCY_LABELS = {
  standard: '7–10 business days',
  fast: '3–5 business days',
  express: '1–2 business days',
};

function CreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useStore();
  const { toast, showToast, dismiss } = useToast();

  // Flow state
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [genHash, setGenHash] = useState(null);
  const [imageRevealed, setImageRevealed] = useState(false);

  // Customization state
  const [selectedStyle, setSelectedStyle] = useState('chibi');
  const [petType, setPetType] = useState('dog');
  const [emotion, setEmotion] = useState('normal');
  const [size, setSize] = useState('');
  const [urgency, setUrgency] = useState('standard');
  const [frameColor, setFrameColor] = useState('black');

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
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const [humanDetected, setHumanDetected] = useState(false);

  // Loading
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [shipping, setShipping] = useState({ country: 'US' });
  const [genProgress, setGenProgress] = useState(0);

  // Popular styles
  const [popularStyles, setPopularStyles] = useState([]);
  const [stylePreviews, setStylePreviews] = useState({});

  useEffect(() => {
    fetch('/api/popular-styles').then((r) => r.json()).then((d) => setPopularStyles(d.popular || [])).catch(() => {});
    fetch('/api/style-previews').then((r) => r.json()).then((d) => setStylePreviews(d.previews || {})).catch(() => {});
  }, []);

  // Jump straight to order step when coming from dashboard "Order" button
  useEffect(() => {
    const qImageId  = searchParams.get('imageId');
    const qUrl      = searchParams.get('url');
    const qStyle    = searchParams.get('style');
    if (qImageId && qUrl) {
      setImageId(qImageId);
      setGeneratedUrl(decodeURIComponent(qUrl));
      if (qStyle && STYLE_PROMPTS[qStyle]) setSelectedStyle(qStyle);
      setStep(3);
    }
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

  // Animate progress bar during upload (ethics check adds ~3-5s)
  useEffect(() => {
    if (!isUploading) return;
    setGenProgress(5);
    const intervals = [
      setTimeout(() => setGenProgress(20), 800),
      setTimeout(() => setGenProgress(45), 2000),
      setTimeout(() => setGenProgress(70), 3500),
      setTimeout(() => setGenProgress(88), 5000),
    ];
    return () => intervals.forEach(clearTimeout);
  }, [isUploading]);

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
    setHumanDetected(false);
  }

  async function handleGenerate() {
    if (!file) { showToast('Please select a pet photo first', 'warning'); return; }

    setIsUploading(true);
    setStep(1);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('style', selectedStyle);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
      const uploadData = await uploadRes.json();
      if (uploadRes.status === 422 && uploadData.error === 'HUMAN_DETECTED') {
        setHumanDetected(true);
        setStep(0);
        return;
      }
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
      if (genData?.error === 'GUEST_LIMIT_REACHED') {
        setGuestLimitReached(true);
        setStep(0);
        return;
      }

      setGenProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      setGeneratedUrl(genData.output);
      setGenHash(genData.hash || null);
      setStep(3);
    } catch (err) {
      if (err.message === 'FREE_LIMIT_REACHED') { setFreeLimitReached(true); setStep(0); return; }
      if (err.message === 'GUEST_LIMIT_REACHED') { setGuestLimitReached(true); setStep(0); return; }
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
      const d = await api.checkout({ imageId, generatedUrl, productKey, price: totalPrice, shipping, extras, frameColor });
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

          {/* Trust badges placeholder */}
          <div className="hidden sm:block mb-6" />

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  i === step ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : i < step  ? 'bg-purple-100 text-purple-600'
                  :              'bg-gray-100 text-gray-400'
                }`}>
                  {i < step
                    ? <span className="text-xs">✓</span>
                    : <span className="text-xs opacity-60">{i + 1}</span>
                  }
                  {/* Show label always on sm+, show only active label on mobile */}
                  <span className="hidden sm:inline">{s}</span>
                  {i === step && <span className="sm:hidden">{s}</span>}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-3 sm:w-6 transition-colors duration-500 ${i < step ? 'bg-purple-300' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Ethics guard: human detected ── */}
          {humanDetected && (
            <div className="max-w-lg mx-auto mb-8 rounded-2xl overflow-hidden border border-red-300 shadow-lg">
              {/* Red header bar */}
              <div className="bg-red-600 px-5 py-3 flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span className="text-white font-bold text-sm tracking-wide uppercase">Ethics Guard — Human Image Detected</span>
              </div>
              {/* Body */}
              <div className="bg-red-50 px-5 py-5">
                <p className="text-red-900 font-semibold mb-2 text-sm">
                  🚫 This platform is for <strong>animal portraits only.</strong>
                </p>
                <p className="text-red-700 text-sm mb-4">
                  Our AI detected a human in your photo. To protect privacy and ensure ethical use, we only process images of animals — pets, wildlife, and other non-human subjects.
                </p>
                <ul className="text-red-600 text-xs space-y-1 mb-5 list-none">
                  <li>✅ Dogs, cats, birds, rabbits, reptiles — all welcome</li>
                  <li>❌ Human faces or bodies — not permitted</li>
                  <li>❌ Human + pet photos — crop to pet only</li>
                </ul>
                <button
                  onClick={() => setHumanDetected(false)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Try a Different Photo
                </button>
              </div>
            </div>
          )}

          {/* ── Free limit reached banner ── */}
          {/* Guest limit */}
          {guestLimitReached && (
            <div className="max-w-lg mx-auto mb-8 bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-bold text-gray-900 mb-1">You've used your free preview</h3>
              <p className="text-sm text-gray-500 mb-5">
                Create a free account to get <strong>3 full AI generations</strong> and unlock all art styles.
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Link href="/signup" className="btn-primary text-center py-3">Create Free Account →</Link>
                <Link href="/login" className="btn-secondary text-center py-3">Sign In</Link>
              </div>
            </div>
          )}

          {/* Logged-in free limit reached */}
          {freeLimitReached && (
            <div className="max-w-lg mx-auto mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-bold text-gray-900 mb-1">You've used all 3 free generations</h3>
              <p className="text-sm text-gray-500 mb-4">
                Purchase a portrait print to unlock 3 more generations. Every order restarts your generation count.
              </p>
              <Link href="/dashboard" className="btn-primary px-6 py-2.5 text-sm">Order a Portrait →</Link>
            </div>
          )}

          {/* ── STEP 0 & 1: Upload + Customize ── */}
          {!isLoading && !generatedUrl && !freeLimitReached && !guestLimitReached && !humanDetected && (
            <div className="grid md:grid-cols-2 gap-8">

              {/* Left — Upload */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Upload Your Pet Photo</h2>
                <p className="text-gray-500 text-sm mb-4">Clear, front-facing, good lighting = best results</p>
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Choose Your Art Style</h2>

                  {/* Style Picker */}
                  <div className="mb-1">
                    <div className="grid grid-cols-4 gap-2">
                      {Object.keys(STYLE_PROMPTS).map((k) => (
                        <StyleCard key={k} styleKey={k} selected={selectedStyle === k} onClick={setSelectedStyle} popular={popularStyles.includes(k)} previewUrl={stylePreviews[k]} />
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
                  className="btn-primary w-full py-4 text-sm sm:text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                  {file
                    ? <><span className="hidden sm:inline">🐾 Generate My {STYLE_PROMPTS[selectedStyle]?.label} Portrait →</span><span className="sm:hidden">🐾 Generate Portrait →</span></>
                    : '← Upload a photo first'}
                </button>
                <p className="text-xs text-gray-400 text-center">1 free AI generation • Print not included • No charge until you order • ~60 seconds</p>
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
                  {isUploading ? '📸' : '🎨'}
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
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Portrait is Ready! 🐾</h2>
                  <button onClick={startOver} className="text-sm text-gray-400 hover:text-gray-600 underline flex-shrink-0">Start over</button>
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
                    <div className="relative group">
                      <img
                        src={generatedUrl}
                        alt="Generated Portrait"
                        className={`w-full aspect-[2/3] object-cover rounded-2xl shadow-xl ring-2 ring-purple-200 ${freeLimitReached || guestLimitReached ? 'brightness-75' : ''}`}
                      />
                      {/* Brand tag — bottom right */}
                      <div className="absolute bottom-3 right-3 pointer-events-none select-none">
                        <span
                          className="font-bold uppercase whitespace-nowrap"
                          style={{ fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.48)', textShadow: '0 1px 3px rgba(0,0,0,0.5)', userSelect: 'none' }}>
                          maitrepets.com
                        </span>
                      </div>
                      {/* Watermark overlay — full L×W coverage (commented out) */}
                      {/* <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none select-none">
                        <div
                          className="absolute flex flex-col"
                          style={{ transform: 'rotate(-30deg)', top: '-60%', left: '-60%', width: '220%', height: '220%', gap: '18px' }}>
                          {Array.from({ length: 22 }).map((_, row) => (
                            <div key={row} className="flex items-center flex-shrink-0" style={{ gap: '20px', marginLeft: row % 2 === 0 ? '0px' : '52px' }}>
                              {Array.from({ length: 16 }).map((_, col) => {
                                const opacities = [0.48, 0.24, 0.40, 0.30, 0.52, 0.20];
                                const op = opacities[(row * 2 + col) % opacities.length];
                                return (
                                  <span key={col}
                                    className="font-bold uppercase whitespace-nowrap flex-shrink-0"
                                    style={{
                                      fontSize: '9px',
                                      letterSpacing: '0.3em',
                                      color: `rgba(255,255,255,${op})`,
                                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                      userSelect: 'none',
                                    }}>
                                    MAÎTREPETS
                                  </span>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div> */}
                      {(freeLimitReached || guestLimitReached) && (
                        <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
                          <span
                            className="absolute inset-0 flex items-center justify-center text-white/20 font-black text-2xl tracking-widest uppercase"
                            style={{ transform: 'rotate(-35deg)', letterSpacing: '0.3em', userSelect: 'none' }}
                          >
                            MAÎTREPETS
                          </span>
                          <div className="relative z-10 flex flex-col items-center gap-2">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <p className="text-white text-xs font-semibold text-center drop-shadow px-3">
                              {guestLimitReached ? 'Sign in to generate more' : 'Purchase to unlock more'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Regenerate CTA — all styles */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Try another style</p>
                  <div className="flex gap-1 overflow-x-auto pb-1 snap-x" style={{ scrollbarWidth: 'none' }}>
                    {Object.keys(STYLE_PROMPTS).map(k => (
                      <div key={k} className="flex-shrink-0 w-12 snap-start">
                        <StyleCard styleKey={k} selected={selectedStyle === k} onClick={k2 => { setSelectedStyle(k2); startOver(); }} popular={popularStyles.includes(k)} compact previewUrl={stylePreviews[k]} />
                      </div>
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

                {/* Frame Color */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Frame Color</p>
                  <div className="flex gap-3">
                    {FRAME_COLORS.map((c) => (
                      <button key={c.id} onClick={() => setFrameColor(c.id)}
                        className={`flex flex-col items-center gap-1.5 group`}>
                        <span className={`w-9 h-9 rounded-full border-2 transition-all ${frameColor === c.id ? 'scale-110 border-purple-500 shadow-md shadow-purple-200' : 'border-gray-200 hover:border-gray-400'}`}
                          style={{ backgroundColor: c.hex, boxShadow: c.id === 'white' ? 'inset 0 0 0 1px #e5e7eb' : undefined }} />
                        <span className={`text-[10px] font-medium ${frameColor === c.id ? 'text-purple-600' : 'text-gray-400'}`}>{c.label}</span>
                      </button>
                    ))}
                  </div>
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
              <p className="text-gray-500 text-sm mt-1">Free account · 3 generations · No credit card required</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/signup" className="btn-primary text-center py-3">Create Free Account →</Link>
              <Link href="/login" className="btn-secondary text-center py-3">Sign In</Link>
              <button onClick={() => setShowAuthModal(false)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">Continue as guest (1 preview)</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CreatePage() {
  return (
    <Suspense>
      <CreatePageInner />
    </Suspense>
  );
}
