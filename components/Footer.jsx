'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <footer className="bg-gray-950 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                Maîtrepets
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Turn your pet into a one-of-a-kind work of art. Premium prints delivered to your door.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mb-5">
              {[
                { href: 'https://instagram.com/maitrepets', label: 'Instagram', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
                { href: 'https://tiktok.com/@maitrepets', label: 'TikTok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
                { href: 'https://youtube.com/@maitrepets', label: 'YouTube', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="black"/></svg> },
                { href: 'https://pinterest.com/maitrepets', label: 'Pinterest', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.03-2.83.19-.77 1.27-5.38 1.27-5.38s-.32-.65-.32-1.61c0-1.51.88-2.64 1.97-2.64.93 0 1.38.7 1.38 1.54 0 .94-.6 2.34-.91 3.64-.26 1.09.54 1.97 1.6 1.97 1.92 0 3.2-2.47 3.2-5.39 0-2.22-1.49-3.88-4.19-3.88-3.05 0-4.94 2.28-4.94 4.82 0 .88.26 1.49.66 1.97.18.22.21.3.14.55-.05.18-.16.61-.2.78-.07.25-.27.34-.5.25-1.4-.58-2.05-2.13-2.05-3.87 0-2.88 2.43-6.34 7.23-6.34 3.87 0 6.42 2.81 6.42 5.82 0 3.98-2.2 6.95-5.44 6.95-1.09 0-2.11-.59-2.46-1.25l-.67 2.58c-.24.93-.89 2.09-1.33 2.8.94.28 1.93.43 2.95.43 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg> },
                { href: 'https://x.com/maitrepets', label: 'X', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { href: 'https://facebook.com/maitrepets', label: 'Facebook', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
              ].map(({ href, label, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all">
                  {icon}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🇺🇸</span>
              <span>Printed & shipped from the USA</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-3">
              {[
                { href: '/create',        label: 'Create Portrait' },
                { href: '/#styles',       label: 'Art Styles' },
                { href: '/#pricing',      label: 'Pricing' },
                { href: '/#how-it-works', label: 'How It Works' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Account</p>
            <ul className="space-y-3">
              {[
                { href: '/dashboard', label: 'My Orders' },
                { href: '/login',     label: 'Sign In' },
                { href: '/signup',    label: 'Create Account' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Legal & Support</p>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@maitrepets.com" className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                  hello@maitrepets.com
                </a>
              </li>
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms',   label: 'Terms of Service' },
                { href: '/refund',  label: 'Refund Policy' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-600 text-center sm:text-left">
            © {new Date().getFullYear()} Maîtrepets. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600">
            <span>Custom AI Pet Portraits</span>
            <span className="text-gray-700">·</span>
            <span>Framed Posters</span>
            <span className="text-gray-700">·</span>
            <span>Canvas Prints</span>
            <span className="text-gray-700">·</span>
            <span>HD Digital Downloads</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
