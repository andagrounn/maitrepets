'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, setUser, clearUser } = useStore();
  const [scrolled, setScrolled]     = useState(false);
  const [cartCount, setCartCount]   = useState(0);
  const [toast, setToast]           = useState(null);
  const [menuOpen, setMenuOpen]     = useState(false);
  const toastShown = useRef(false);
  const router     = useRouter();
  const pathname   = usePathname();
  const isCreate    = pathname === '/create';
  const isDashboard = pathname === '/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    api.me().then((d) => setUser(d.user)).catch(() => clearUser());
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/cart-count', { credentials: 'include' })
      .then((r) => r.json())
      .then(({ count }) => {
        setCartCount(count);
        if (count > 0 && !toastShown.current) {
          toastShown.current = true;
          setToast({ count });
          setTimeout(() => setToast(null), 5000);
        }
      })
      .catch(() => {});
  }, [user]);

  async function logout() {
    await api.logout();
    clearUser();
    setMenuOpen(false);
    router.push('/');
  }

  return (
    <>
      {/* Cart toast */}
      {toast && (
        <div className="fixed bottom-6 right-4 z-50 animate-in slide-in-from-bottom-3 fade-in duration-300 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </span>
            <span className="flex-1 leading-snug">
              You have <strong className="text-purple-400">{toast.count}</strong> portrait{toast.count !== 1 ? 's' : ''} ready to order!
            </span>
            <button onClick={() => setToast(null)} className="opacity-40 hover:opacity-80 transition-opacity flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-100/60'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 C28 10 10 26 10 46 C10 62 20 74 36 78 C40 79 42 77 42 73 C42 71 42 69 42 67 C42 64 44 62 47 62 L60 62 C72 62 90 54 90 40 C90 23 72 10 50 10 Z" fill="#9333ea"/>
              <circle cx="28" cy="38" r="6" fill="white"/>
              <circle cx="42" cy="24" r="6" fill="white"/>
              <circle cx="58" cy="20" r="6" fill="white"/>
              <circle cx="72" cy="30" r="6" fill="white"/>
              <circle cx="78" cy="46" r="6" fill="white"/>
              <ellipse cx="32" cy="70" rx="7" ry="5" fill="#7e22ce"/>
            </svg>
            <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Maîtrepets
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/#how-it-works', label: 'How it works' },
              { href: '/#styles',       label: 'Art Styles' },
              { href: '/#pricing',      label: 'Pricing' },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-150">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/dashboard"
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 ${
                    isDashboard
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  Dashboard
                </Link>
                {!isCreate && !isDashboard && (
                  <Link href="/create" className="btn-primary text-sm px-5 py-2">
                    Create Portrait →
                  </Link>
                )}
                <button onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-150">
                  Sign out
                </button>
                <Link href="/dashboard" className="relative ml-1 w-9 h-9 flex items-center justify-center rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 transition-all" title="Your portraits">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/>
                    <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
                    <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/>
                    <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-bold min-w-[1rem] h-4 px-0.5 rounded-full flex items-center justify-center leading-none">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-150">
                  Sign in
                </Link>
                {!isCreate && (
                  <Link href="/create" className="btn-primary text-sm px-5 py-2">
                    Get Started →
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-3">
            {user && cartCount > 0 && (
              <Link href="/dashboard" className="relative w-9 h-9 flex items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                </svg>
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-bold min-w-[1rem] h-4 px-0.5 rounded-full flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu">
              <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/98 backdrop-blur px-4 py-3 flex flex-col gap-1">
            <Link href="/#how-it-works" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">How it works</Link>
            <Link href="/#styles"       className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Art Styles</Link>
            <Link href="/#pricing"      className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Pricing</Link>
            <div className="h-px bg-gray-100 my-1" />
            {user ? (
              <>
                <Link href="/dashboard" className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Dashboard</Link>
                <Link href="/create" className="mt-1 btn-primary text-center py-3 text-sm">Create Portrait →</Link>
                <button onClick={logout} className="px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-50 rounded-xl text-left transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login"  className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Sign in</Link>
                <Link href="/signup" className="mt-1 btn-primary text-center py-3 text-sm">Get Started Free →</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
