'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

const PORTRAITS = [
  {
    ai:    'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com/generated/1774673789483-zzvbnopfst.png',
    pet:   'Rio',
    style: 'Mosaic',
  },
  {
    ai:       'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com/generated/1774629784284-j1rt4wukw6.png',
    original: 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com/uploads/028f47db-0c96-42d8-a8d4-da132822e06d/1774629725494-Dogs_love.jpg',
    pet:   'Rocky',
    style: 'Renaissance',
    flip:  true,
  },
  {
    ai:    'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com/generated/1774660430180-8754kz2iw4t.png',
    pet:   'Luna',
    style: 'Rococo',
  },
];

function FlipCard({ ai, original, pet, style }) {
  const [showOriginal, setShowOriginal] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setShowOriginal(v => !v), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ perspective: '1000px', aspectRatio: '3/4' }} className="flex-1 mt-[-24px]">
      <div className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transformStyle: 'preserve-3d', transform: showOriginal ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
          <img src={ai} alt="AI portrait" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">AI</span>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight">{pet}</p>
            <p className="text-white/60 text-xs">{style}</p>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <img src={original} alt="Original photo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Original</span>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight">{pet}</p>
            <p className="text-white/60 text-xs">Original photo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const PERKS = [
  { icon: '🎨', text: 'Free AI portrait preview' },
  { icon: '🖼️', text: '16 unique art styles' },
  { icon: '🚚', text: 'Worldwide shipping' },
  { icon: '💳', text: 'No card until you order' },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.6c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.8 7.2v6h7.7c4.5-4.2 7.4-10.3 7.4-17.5z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.6v6.2C6.5 42.6 14.7 48 24 48z" fill="#34A853"/>
      <path d="M10.5 28.6c-.5-1.4-.7-2.9-.7-4.6s.2-3.2.7-4.6v-6.2H2.6C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z" fill="#FBBC05"/>
      <path d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.5 0 24 0 14.7 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.7 17.7 9.5 24 9.5z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignupPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { setUser } = useStore();
  const router      = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const d = await api.signup(form);
      setUser(d.user);
      router.push('/create');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-950 via-purple-900 to-pink-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_60%)]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span>🐶</span>
            <span>Maîtrepets</span>
          </Link>
        </div>

        {/* Portrait showcase */}
        <div className="relative z-10 space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              ✦ AI Fine Art Portraits
            </span>
            <h2 className="text-4xl font-black text-white leading-tight">
              Your pet deserves<br />to be immortalised.
            </h2>
            <p className="text-purple-300 mt-3">
              Join thousands of pet owners who turned their photos into stunning AI artwork.
            </p>
          </div>

          <div className="flex gap-4 items-start">
            {PORTRAITS.map((p, i) =>
              p.flip ? (
                <FlipCard key={i} ai={p.ai} original={p.original} pet={p.pet} style={p.style} />
              ) : (
                <div key={i} className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '3/4' }}>
                  <img src={p.ai} alt="Portrait" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{p.pet}</p>
                    <p className="text-white/60 text-xs">{p.style}</p>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PERKS.map(p => (
              <div key={p.text} className="flex items-center gap-2 text-sm text-purple-200">
                <span className="text-lg">{p.icon}</span>
                {p.text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-purple-400 text-xs">© 2025 Maîtrepets. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8F5F2]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
              <span>🐶</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Maîtrepets</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-black text-gray-900">Create your free account</h1>
              <p className="text-gray-400 text-sm mt-1">No credit card required — free portrait preview</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </div>
            )}

            {/* Google button */}
            <a href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-700 text-sm shadow-sm mb-5">
              <GoogleIcon />
              Continue with Google
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your name</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
                  type="text" placeholder="Jane Smith" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
                  type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="text-xs text-purple-500 hover:text-purple-700 transition-colors">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
                  type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} minLength={8} required />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-sm transition-all shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
                  : 'Create Free Account →'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-800 font-semibold transition-colors">
                Sign in
              </Link>
            </p>

            <p className="text-center text-xs text-gray-400 mt-3">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
              {' & '}
              <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
