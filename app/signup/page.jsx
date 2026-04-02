'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { PORTRAITS, FlipCard, GoogleIcon } from '@/components/PortraitShowcase';

const PERKS = [
  { icon: '🎨', text: 'Free AI portrait preview' },
  { icon: '🖼️', text: '16 unique art styles' },
  { icon: '🚚', text: 'Worldwide shipping' },
  { icon: '💳', text: 'No card until you order' },
];

export default function SignupPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { setUser, imageId, setImageId } = useStore();
  const router = useRouter();

  const googleUrl = imageId
    ? `/api/auth/google?guestImageId=${imageId}`
    : '/api/auth/google';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const d = await api.signup({ ...form, guestImageId: imageId || undefined });
      setUser(d.user);
      if (imageId) setImageId(null); // clear after claim
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
            <span>🎨</span>
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
              <span>🎨</span>
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
            <a href={googleUrl}
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
