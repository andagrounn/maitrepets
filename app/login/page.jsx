'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import FlipCard from '@/components/FlipCard';

const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';

const PORTRAITS = [
  { ai: `${S3}/generated/1774673789483-zzvbnopfst.png`, pet: 'Rio',   style: 'Mosaic',      emoji: '🎨' },
  { ai: `${S3}/generated/1774629784284-j1rt4wukw6.png`, original: `${S3}/uploads/028f47db-0c96-42d8-a8d4-da132822e06d/1774629725494-Dogs_love.jpg`, pet: 'Rocky', style: 'Renaissance', emoji: '🖼️' },
  { ai: `${S3}/generated/1774660430180-8754kz2iw4t.png`, pet: 'Luna',  style: 'Rococo',      emoji: '🎀' },
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

function OAuthError({ setError }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'oauth_failed')    setError('Google sign-in failed. Please try again.');
    if (err === 'oauth_cancelled') setError('Google sign-in was cancelled.');
  }, [searchParams]);
  return null;
}

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { setUser }  = useStore();
  const router       = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const d = await api.login(form);
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
      <Suspense><OAuthError setError={setError} /></Suspense>
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(139,98,18,0.12), transparent 60%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gold">
            <span>🐶</span>
            <span>Maîtrepets</span>
          </Link>
        </div>

        {/* Portrait showcase */}
        <div className="relative z-10 space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-ivory/10 border border-ivory/20 text-ivory/80 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              ✦ AI Fine Art Portraits
            </span>
            <h2 className="text-4xl font-black text-ivory leading-tight">
              Turn your pet into a masterpiece.
            </h2>
            <p className="text-sage mt-3" style={{ paddingBottom: '5%' }}>
              Professionally printed and delivered to your door.
            </p>
          </div>

          <div className="flex gap-4 items-start">
            {PORTRAITS.map((p, i) => (
              <div key={i} className="flex-1 mt-[-24px]">
                <FlipCard ai={p.ai} original={p.original} pet={p.pet} style={p.style} emoji={p.emoji} delay={i * 1100} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 text-sm text-sage">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Free preview</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />16 art styles</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Ships worldwide</span>
          </div>
        </div>

        <p className="relative z-10 text-sage/60 text-xs">© 2025 Maîtrepets. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-ivory">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
              <span>🐶</span>
              <span className="text-gold">Maîtrepets</span>
            </Link>
          </div>

          <div className="bg-ivory rounded-3xl shadow-xl shadow-sage/30 border border-sage/30 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-black text-ink">Welcome back</h1>
              <p className="text-sage text-sm mt-1">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </div>
            )}

            {/* Google button */}
            <a href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl border-2 border-sage bg-ivory hover:bg-[#E8E7E2] transition-all font-semibold text-ink text-sm shadow-sm mb-5">
              <GoogleIcon />
              Continue with Google
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-sage/40" />
              <span className="text-xs text-sage font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-sage/40" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  className="w-full border-2 border-sage rounded-2xl px-4 py-3 text-sm text-ink placeholder-sage focus:outline-none focus:border-gold transition-colors bg-[#ECEBE6] focus:bg-ivory"
                  type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wide">Password</label>
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="text-xs text-gold hover:text-[#7a560f] transition-colors">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  className="w-full border-2 border-sage rounded-2xl px-4 py-3 text-sm text-ink placeholder-sage focus:outline-none focus:border-gold transition-colors bg-[#ECEBE6] focus:bg-ivory"
                  type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gold hover:bg-[#7a560f] text-ivory font-bold text-sm transition-all shadow-lg shadow-[#8B6212]/20 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" /> Signing in…</>
                  : 'Sign In →'}
              </button>
            </form>

            <p className="text-center text-sm text-sage mt-5">
              No account?{' '}
              <Link href="/signup" className="text-gold hover:text-[#7a560f] font-semibold transition-colors">
                Sign up free
              </Link>
            </p>

            <div className="mt-5 pt-5 border-t border-sage/30 text-xs text-sage text-center">
              Free preview — no credit card required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
