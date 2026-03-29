'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <footer className="bg-ink text-ivory mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-black text-gold tracking-tight">
                Maîtrepets
              </span>
            </Link>
            <p className="text-sm text-sage leading-relaxed mb-5">
              Turn your pet into a one-of-a-kind work of art. Premium prints delivered to your door.
            </p>
            <div className="flex items-center gap-2 text-xs text-sage/70">
              <span>🇺🇸</span>
              <span>Printed & shipped from the USA</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-[11px] font-semibold text-sage/70 uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-3">
              {[
                { href: '/create',        label: 'Create Portrait' },
                { href: '/#styles',       label: 'Art Styles' },
                { href: '/#pricing',      label: 'Pricing' },
                { href: '/#how-it-works', label: 'How It Works' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-sage hover:text-ivory transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-[11px] font-semibold text-sage/70 uppercase tracking-widest mb-4">Account</p>
            <ul className="space-y-3">
              {[
                { href: '/dashboard', label: 'My Orders' },
                { href: '/login',     label: 'Sign In' },
                { href: '/signup',    label: 'Create Account' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-sage hover:text-ivory transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[11px] font-semibold text-sage/70 uppercase tracking-widest mb-4">Legal & Support</p>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@maitrepets.com" className="text-sm text-sage hover:text-ivory transition-colors duration-150">
                  hello@maitrepets.com
                </a>
              </li>
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms',   label: 'Terms of Service' },
                { href: '/refund',  label: 'Refund Policy' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-sage hover:text-ivory transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-ivory/10">
          <p className="text-xs text-sage/60 text-center sm:text-left">
            © {new Date().getFullYear()} Maîtrepets. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-sage/60">
            <span>Custom AI Pet Portraits</span>
            <span className="text-sage/40">·</span>
            <span>Framed Posters</span>
            <span className="text-sage/40">·</span>
            <span>Canvas Prints</span>
            <span className="text-sage/40">·</span>
            <span>HD Digital Downloads</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
