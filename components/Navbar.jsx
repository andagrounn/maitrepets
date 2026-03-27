'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, setUser, clearUser } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.me().then((d) => setUser(d.user)).catch(() => {});
  }, []);

  async function logout() {
    await api.logout();
    clearUser();
    router.push('/');
  }

  return (
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
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/create" className="btn-primary text-sm px-5 py-2">Create Portrait</Link>
              <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link href="/create" className="btn-primary text-sm px-5 py-2">Get Started →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
