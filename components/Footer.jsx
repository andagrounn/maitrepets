'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐾</span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Maîtrepets
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Turn your pet into a one-of-a-kind work of art. Premium prints delivered to your door.
            </p>
            <p className="text-xs text-gray-300 mt-4">🇺🇸 Printed & shipped from the USA</p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3 md:mb-4">Product</p>
            <ul className="space-y-2 md:space-y-2.5">
              <li><Link href="/create" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Create Portrait</Link></li>
              <li><Link href="/#styles" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Art Styles</Link></li>
              <li><Link href="/#pricing" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Pricing</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3 md:mb-4">Account</p>
            <ul className="space-y-2 md:space-y-2.5">
              <li><Link href="/dashboard" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">My Orders</Link></li>
              <li><Link href="/login" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3 md:mb-4">Legal & Support</p>
            <ul className="space-y-2 md:space-y-2.5">
              <li>
                <a href="mailto:hello@maitrepets.com" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                  hello@maitrepets.com
                </a>
              </li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 md:pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            © {new Date().getFullYear()} Maîtrepets. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center">
            <span className="text-xs text-gray-300">Enhanced Matte Paper prints</span>
            <span className="text-xs text-gray-200 hidden sm:inline">·</span>
            <span className="text-xs text-gray-300">Ships in 3–5 business days</span>
            <span className="text-xs text-gray-200 hidden sm:inline">·</span>
            <span className="text-xs text-gray-300">🐾 Loved by 10,000+ pet owners</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
