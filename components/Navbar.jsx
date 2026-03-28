'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, setUser, clearUser } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const toastShown = useRef(false);
  const router   = useRouter();
  const pathname = usePathname();
  const isCreate    = pathname === '/create';
  const isDashboard = pathname === '/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.me().then((d) => setUser(d.user)).catch(() => {});
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
    router.push('/');
  }

  return (
    <>
    {/* Cart toast */}
    {toast && (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 fade-in duration-300">
        <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium max-w-xs">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </span>
          <span className="flex-1 leading-snug">
            You have <strong className="text-purple-400">{toast.count}</strong> portrait{toast.count !== 1 ? 's' : ''} ready to order!
          </span>
          <button onClick={() => setToast(null)} className="opacity-40 hover:opacity-80 transition-opacity">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
            </svg>
          </button>
        </div>
      </div>
    )}
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Maîtrepets</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How it works</Link>
          <Link href="/#styles" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Art Styles</Link>
          <Link href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className={isCreate ? 'btn-primary text-sm px-5 py-2' : 'text-sm text-gray-600 hover:text-gray-900'}>Dashboard</Link>
              {!isCreate && !isDashboard && <Link href="/create" className="btn-primary text-sm px-5 py-2">Create Portrait</Link>}
              <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
              {/* Palette icon — far right */}
              <Link href="/dashboard" className="relative text-gray-500 hover:text-gray-900 transition-colors" title="Your portraits">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/>
                  <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
                  <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/>
                  <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold min-w-[1.1rem] h-[1.1rem] px-0.5 rounded-full flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
              {!isCreate && <Link href="/create" className="btn-primary text-sm px-5 py-2">Get Started →</Link>}
            </>
          )}
        </div>
      </div>
    </nav>
    </>
  );
}
