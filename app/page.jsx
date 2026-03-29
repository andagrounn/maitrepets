import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FaqAccordion from '@/components/FaqAccordion';
import MeetOurStars from '@/components/MeetOurStars';
import { PRODUCT_PRICES } from '@/lib/pricing';

const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';


const RD = 'https://replicate.delivery/xezq';

const MARQUEE = [
  { url: `${S3}/generated/1774673789483-zzvbnopfst.png`,                                    style: 'Mosaic' },
  { url: `${RD}/Aycym3aFMIYAPFJjYLvHtdkZehuUKrn030BC0NJ8CS0mDXKLA/tmp8loxrm6p.png`,       style: 'Titanic' },
  { url: `${S3}/generated/1774629784284-j1rt4wukw6.png`,                                    style: 'Renaissance' },
  { url: `${RD}/HjDQ4mIqF9JRANgmwsAIdgSbujNejFC3fyutG3eFVajwojpsA/tmp2owxmba1.webp`,      style: 'Joker' },
  { url: `${S3}/generated/1774660430180-8754kz2iw4t.png`,                                   style: 'Rococo' },
  { url: `${RD}/wWQOJ3ELKQoTKBgBW44fmjf5ddaeAyHUHJgqRY6SfZAUm6SZB/tmporzt5vx8.webp`,     style: 'Barbie' },
  { url: `${S3}/generated/1774622686162-jetc92ep4u.png`,                                    style: 'Lofi Art' },
  { url: `${RD}/Copg2e3wiWwoYiHBUjXjX3DvO39XAEzPm6pfCmvXilvt7kUWA/tmpc2i7i7j3.webp`,     style: 'Cartoon' },
  { url: `${S3}/generated/1774643764809-ln2zqseugf8.png`,                                   style: 'Kawaii' },
  { url: `${RD}/MezlJ8KrKT2YJCnWJoTGUltnM5KofE6pPCxyPai99En7r7UWA/tmpk69qwu60.jpg`,       style: 'Gangster' },
  { url: `${S3}/generated/1774629095050-xzkiul0l8fn.png`,                                   style: 'Folk Art' },
  { url: `${RD}/NxlZaUBW6Z61GBSbV8s183ce6tfOYEcLpeDiG8LYafqlaWSZB/out-0.webp`,            style: 'Lion King' },
  { url: `${S3}/generated/1774629942609-lcqa8ur6cwh.png`,                                   style: 'Lofi Art' },
  { url: `${RD}/8wDbroj8qBZefkvBenBN2wTYOCy1HYao1qrMdcNcqxaH02psA/tmphwtjdml5.jpg`,      style: 'Harry Potter' },
  { url: `${RD}/0e2sqFDnujTmSyeUODntfAFS7cf07KmnPf2twlbdKk7HFimyC/tmp3s01uudu.webp`,     style: 'Pirates' },
  { url: `${RD}/rUsyzZ0FQDaUHVweUQxGR4s47k5Lat7DYe11GQ2QIpUjDlUWA/out-0.webp`,           style: 'Vintage' },
  { url: `${RD}/n9Wkfk5PL3QEUSTm7wPxmHF4HRyesK8PXRkBzpbNV4WZJlUWA/out-0.webp`,          style: 'Egypt' },
  { url: `${RD}/FPe1wHE73xSSIKm2kbKbTtTeFxify14yQJsJfz49AX4UJMUZB/tmpum6q1mkm.jpg`,      style: 'Naive Art' },
  { url: `${RD}/VzYQixW3ed1oJCb0jMIeDZSV1saHWCTll3b6Tat2kdAXn8UWA/tmpmv_w4lzz.jpg`,      style: 'Chibi' },
  { url: `${RD}/cHfQpXb5JvwfR0lLA0s22ZR5JnZLEAgcngG1fFdTq5EcN5psA/tmpkaabssf3.jpg`,      style: 'Steampunk' },
  { url: `${RD}/UTDjSYzc9SbpGNroNE3DkLtBfGLg8n4Zs2B1KAXXkZ8YxSKLA/out-0.webp`,          style: 'Gangster' },
  { url: `${RD}/hPzgzf9QhR1rJyVWmxmWZmWRXWXUiFO73Kr2Of78ioUOH7UWA/tmp4y0am2hs.webp`,    style: 'Jurassic Park' },
];

const STYLES_GRID = [
  { url: `${S3}/generated/1774673789483-zzvbnopfst.png`, pet: 'Rio',   style: 'Mosaic',      emoji: '🎨' },
  { url: `${S3}/generated/1774629784284-j1rt4wukw6.png`, pet: 'Rocky', style: 'Renaissance', emoji: '🖼️' },
  { url: `${S3}/generated/1774660430180-8754kz2iw4t.png`, pet: 'Luna', style: 'Rococo',      emoji: '🎀' },
  { url: `${S3}/generated/1774629095050-xzkiul0l8fn.png`, pet: 'Buddy', style: 'Folk Art',   emoji: '🎨' },
  { url: `${S3}/generated/1774643764809-ln2zqseugf8.png`, pet: 'Max',   style: 'Kawaii',     emoji: '🍡' },
  { url: `${S3}/generated/1774622686162-jetc92ep4u.png`,  pet: 'Mochi', style: 'Lofi Art',   emoji: '🎧' },
];

const testimonials = [
  { name: 'Sarah M.', pet: 'Golden Retriever', quote: 'The Renaissance painting of my dog is insane — it looks like a real 16th century oil painting. Everyone who visits thinks I bought fine art.', stars: 5 },
  { name: 'Jake T.',  pet: 'Tabby Cat',        quote: "Got the Rococo style for my cat and it's absolutely unreal. Best $79 I've ever spent — it's hanging in my living room.",                      stars: 5 },
  { name: 'Maria L.', pet: 'Pug',              quote: "Ordered the Mosaic style as a memorial for my bird. I'll treasure this forever. The quality of the print is incredible.",                    stars: 5 },
];


const BRAND = 'Maîtrepets';

export default function Home() {
  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes letterIn {
          0%   { opacity: 0; transform: translateY(110%); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes float1 {
          0%, 100% { transform: rotate(-5deg) translateY(0px); }
          50%       { transform: rotate(-5deg) translateY(-14px); }
        }
        @keyframes float2 {
          0%, 100% { transform: rotate(4deg) translateY(0px); }
          50%       { transform: rotate(4deg) translateY(-18px); }
        }
        @keyframes float3 {
          0%, 100% { transform: rotate(-2deg) translateY(0px); }
          50%       { transform: rotate(-2deg) translateY(-11px); }
        }
        .letter-clip {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
        }
        .letter-inner {
          display: inline-block;
          opacity: 0;
          animation: letterIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .fade-up {
          opacity: 0;
          animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 28s linear infinite;
        }
        .float-1 { animation: float1 5s   ease-in-out infinite; }
        .float-2 { animation: float2 6s   ease-in-out infinite 0.8s; }
        .float-3 { animation: float3 5.5s ease-in-out infinite 1.6s; }
        .polaroid {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .polaroid:hover {
          transform: rotate(0deg) scale(1.1) translateY(-30px) !important;
          z-index: 50 !important;
          box-shadow: 0 50px 100px rgba(0,0,0,0.3), 0 0 60px rgba(139,98,18,0.25) !important;
        }

      `}</style>

      <Navbar />

      <main className="bg-ivory" style={{ backgroundColor: '#F0EFEB' }}>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden" style={{ backgroundColor: '#F0EFEB' }}>

          {/* ambient glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px]" style={{ backgroundColor: 'rgba(139,98,18,0.08)' }} />
            <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(139,98,18,0.08)' }} />
          </div>

          {/* dot grid */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #C4C5BA 1px, transparent 1px)', backgroundSize: '52px 52px' }} />

          {/* center */}
          <div className="relative z-10 text-center max-w-3xl">

            {/* badge */}
            <div className="fade-up inline-flex items-center gap-2 border text-xs font-semibold px-4 py-2 rounded-full mb-10 backdrop-blur-sm tracking-widest uppercase" style={{ backgroundColor: 'rgba(139,98,18,0.10)', borderColor: 'rgba(139,98,18,0.25)', color: '#8B6212', animationDelay: '0.1s' }}>
              ✦ AI Fine Art Pet Portraits
            </div>

            {/* brand */}
            <h1 className="mb-6 leading-[0.9]" aria-label={BRAND}>
              <span
                style={{ fontSize: 'clamp(2.2rem, 9vw, 8rem)', display: 'block', whiteSpace: 'nowrap', fontWeight: 900, color: '#1B1B1B', letterSpacing: '-0.02em' }}
              >
                {BRAND.split('').map((char, i) => (
                  <span key={i} className="letter-clip">
                    <span
                      className="letter-inner"
                      style={{ animationDelay: `${0.2 + i * 0.055}s` }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  </span>
                ))}
              </span>
            </h1>

            <p className="fade-up text-base md:text-2xl mb-8 max-w-lg mx-auto px-2" style={{ color: '#C4C5BA', animationDelay: '1.05s' }}>
              Turn your pet into a{' '}
              <span style={{ color: '#8B6212', fontWeight: 600 }}>masterpiece</span>
              . Printed &amp; delivered to your door.
            </p>

            <div className="fade-up flex flex-col sm:flex-row gap-3 justify-center px-4" style={{ animationDelay: '1.25s' }}>
              <Link href="/create"
                className="font-bold text-base md:text-lg px-8 py-4 rounded-2xl transition-all shadow-2xl"
                style={{ backgroundColor: '#8B6212', color: '#F0EFEB' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7a560f'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8B6212'}>
                Create Your Portrait →
              </Link>
              <a href="#gallery"
                className="font-semibold text-base md:text-lg px-8 py-4 rounded-2xl transition-all backdrop-blur-sm"
                style={{ border: '1px solid rgba(196,197,186,0.50)', color: '#1B1B1B' }}>
                See Examples ↓
              </a>
            </div>

            <p className="fade-up text-sm mt-6" style={{ color: 'rgba(27,27,27,0.4)', animationDelay: '1.45s' }}>
              Free preview · No credit card required · 16 art styles
            </p>
          </div>

          {/* scroll pill */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5" style={{ border: '1px solid rgba(196,197,186,0.50)' }}>
              <div className="w-1 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#1B1B1B' }} />
            </div>
          </div>
        </section>

        {/* ── POLAROID WALL ── */}
        <section id="gallery" className="relative py-24 overflow-hidden">

          {/* Studio wall background — light warm */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #EAE9E4 0%, #E5E3DC 50%, #EAE9E4 100%)' }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(27,27,27,0.15) 3px,rgba(27,27,27,0.15) 4px),repeating-linear-gradient(90deg,transparent,transparent 3px,rgba(27,27,27,0.15) 3px,rgba(27,27,27,0.15) 4px)',
          }} />
          {/* Warm glow center */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,98,18,0.06) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6">

            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#8B6212' }}>✦ The Studio</span>
              <h2 className="text-3xl md:text-5xl font-black mb-3" style={{ color: '#1B1B1B' }}>Every pet is a work of art.</h2>
              <p className="text-base" style={{ color: '#C4C5BA' }}>Hover to lift a canvas</p>
            </div>

            {/* Canvas row — 4 pieces */}
            <div className="flex justify-start md:justify-center gap-8 md:gap-10 items-end overflow-x-auto pb-4 md:pb-0 px-4 md:px-0 snap-x snap-mandatory md:overflow-x-visible md:flex-nowrap">
              {[
                { url: `${S3}/generated/1774673789483-zzvbnopfst.png`,  style: 'Mosaic',     pet: 'Rio',  rot: -6, w: 170, h: 230 },
                { url: `${S3}/generated/1774666190093-ikgwrj850nf.png`, style: 'Steampunk',  pet: '',     rot:  4, w: 155, h: 205 },
                { url: `${S3}/generated/1774637301839-ij88yovb95n.png`, style: 'Renaissance', pet: '',     rot: -3, w: 180, h: 245 },
                { url: `${S3}/generated/1774660430180-8754kz2iw4t.png`, style: 'Rococo',     pet: 'Luna', rot:  5, w: 160, h: 215 },
              ].map((p, i) => (
                <div key={i} className="polaroid flex-shrink-0 flex flex-col items-center snap-center" style={{ transform: `rotate(${p.rot}deg)`, zIndex: 3 + i }}>
                  {/* Hanging nail */}
                  <div style={{ width: '6px', height: '10px', background: 'linear-gradient(180deg, #a0a0a0, #606060)', borderRadius: '1px 1px 2px 2px', marginBottom: '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.8)' }} />
                  {/* Wire */}
                  <div style={{ width: '1px', height: '8px', background: 'rgba(180,180,180,0.4)', marginBottom: '0px' }} />

                  {/* Wooden stretcher frame */}
                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(145deg, #5c3d1e 0%, #7a5230 20%, #4a3018 40%, #6b4826 60%, #3d2810 80%, #6b4826 100%)',
                    boxShadow: `
                      inset 0 2px 4px rgba(255,255,255,0.08),
                      inset 0 -2px 4px rgba(0,0,0,0.5),
                      inset 2px 0 4px rgba(255,255,255,0.04),
                      inset -2px 0 4px rgba(0,0,0,0.4),
                      0 12px 40px rgba(0,0,0,0.25),
                      0 4px 12px rgba(0,0,0,0.15)
                    `,
                  }}>
                    {/* Inner frame lip */}
                    <div style={{ padding: '3px', background: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 0 6px rgba(0,0,0,0.6)' }}>
                      {/* Canvas face */}
                      <div style={{ position: 'relative' }}>
                        <img src={p.url} alt={p.style}
                          style={{ width: `${p.w}px`, height: `${p.h}px`, objectFit: 'cover', display: 'block', filter: 'saturate(1.1) contrast(1.05)' }} />
                        {/* Canvas texture overlay */}
                        <div style={{
                          position: 'absolute', inset: 0, pointerEvents: 'none',
                          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 3px),repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 3px)',
                          mixBlendMode: 'multiply',
                        }} />
                        {/* Edge vignette */}
                        <div style={{
                          position: 'absolute', inset: 0, pointerEvents: 'none',
                          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35)',
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Style label tag — ivory bg, gold border, ink text */}
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '1px', height: '10px', background: 'rgba(139,98,18,0.35)' }} />
                    <div style={{
                      background: '#F0EFEB',
                      border: '1px solid rgba(139,98,18,0.4)',
                      padding: '3px 10px',
                      borderRadius: '2px',
                    }}>
                      <p style={{ fontSize: '9px', fontWeight: '700', color: '#1B1B1B', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {p.pet ? `${p.pet} · ${p.style}` : p.style}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-20">
              <Link href="/create" className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg"
                style={{ backgroundColor: '#8B6212', color: '#F0EFEB' }}>
                Create Your Portrait →
              </Link>
            </div>

          </div>
        </section>

        {/* ── STYLES GRID ── */}
        <section id="styles" className="py-24 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#8B6212' }}>✦ Art Styles</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: '#1B1B1B' }}>16 Unique Styles</h2>
            <p className="text-lg" style={{ color: '#C4C5BA' }}>Your pet, reimagined in any artistic universe</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STYLES_GRID.map((s) => (
              <div key={s.style} className="group relative rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" style={{ border: '1px solid rgba(196,197,186,0.30)' }}>
                <img src={s.url} alt={s.style} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-black text-xl">{s.style}</p>
                  <p className="text-xs mt-1" style={{ color: '#C4C5BA' }}>{s.pet}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/create" className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg"
              style={{ backgroundColor: '#8B6212', color: '#F0EFEB' }}>
              Try All 16 Styles Free →
            </Link>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="relative py-28 px-4 md:px-6 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #F0EFEB 0%, #EAE9E4 50%, #F0EFEB 100%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(139,98,18,0.06) 0%, transparent 70%)' }} />
          <div className="absolute left-1/4 top-1/3 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: 'rgba(139,98,18,0.08)' }} />
          <div className="absolute right-1/4 bottom-1/3 w-48 h-48 rounded-full blur-[60px] pointer-events-none" style={{ backgroundColor: 'rgba(139,98,18,0.08)' }} />

          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ color: '#8B6212', backgroundColor: 'rgba(139,98,18,0.10)', border: '1px solid rgba(139,98,18,0.25)' }}>✦ How It Works</span>
              <h2 className="text-3xl md:text-5xl font-black leading-tight mt-4" style={{ color: '#1B1B1B' }}>From photo to wall art<br className="hidden sm:block" /> in minutes.</h2>
            </div>

            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2" style={{ top: 'calc(50% + 20px)', width: '66%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,98,18,0.3) 20%, rgba(139,98,18,0.3) 80%, transparent)', zIndex: 0 }} />

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Upload Your Photo',
                  desc: 'A clear, front-facing shot works best. The better the photo, the more stunning the result.',
                  accent: 'from-[#8B6212] to-[#7a560f]',
                  glow: 'rgba(139,98,18,0.25)',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Pick an Art Style',
                  desc: '16 unique styles — Renaissance, Mosaic, Rococo, Leonardo da Vinci, and more.',
                  accent: 'from-pink-600 to-rose-500',
                  glow: 'rgba(236,72,153,0.25)',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Print & Receive',
                  desc: 'Order a premium framed print. Professionally crafted and shipped worldwide to your door.',
                  accent: 'from-amber-500 to-orange-500',
                  glow: 'rgba(245,158,11,0.2)',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="relative group" style={{ zIndex: 1 }}>
                  {/* Card glow on hover */}
                  <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${item.glow}, transparent 70%)`, filter: 'blur(1px)' }} />

                  <div className="relative p-8 rounded-3xl transition-all duration-300 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(27,27,27,0.03) 0%, rgba(27,27,27,0.015) 100%)', border: '1px solid rgba(196,197,186,0.30)' }}>

                    {/* Step number watermark */}
                    <div className="absolute top-4 right-5 text-8xl font-black select-none leading-none"
                      style={{ background: `linear-gradient(135deg, ${item.glow.replace('0.2', '0.15').replace('0.25', '0.15')}, transparent)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white mb-6 shadow-lg`}
                      style={{ boxShadow: `0 8px 24px ${item.glow}` }}>
                      {item.icon}
                    </div>

                    <div className={`text-xs font-black bg-gradient-to-r ${item.accent} bg-clip-text text-transparent mb-3 tracking-widest`}>STEP {item.step}</div>
                    <h3 className="text-xl font-black mb-3" style={{ color: '#1B1B1B' }}>{item.title}</h3>
                    <p className="leading-relaxed text-sm" style={{ color: '#C4C5BA' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REAL PORTRAITS SHOWCASE ── */}
        <section className="py-24 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#8B6212' }}>✦ Real Results</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: '#1B1B1B' }}>Meet Our Stars</h2>
            <p className="text-lg" style={{ color: '#C4C5BA' }}>Real pets transformed by Maîtrepets AI</p>
          </div>
          <MeetOurStars />
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="relative py-28 px-4 md:px-6 overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #F0EFEB 0%, #EAE9E4 50%, #F0EFEB 100%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(139,98,18,0.05) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ color: '#8B6212', backgroundColor: 'rgba(139,98,18,0.10)', border: '1px solid rgba(139,98,18,0.25)' }}>✦ Pricing</span>
              <h2 className="text-3xl md:text-5xl font-black mb-4 mt-4" style={{ color: '#1B1B1B' }}>Free to preview.<br className="hidden sm:block"/> Pay only when you love it.</h2>
              <p className="text-base max-w-xl mx-auto" style={{ color: '#C4C5BA' }}>Generate your AI portrait for free. Order a premium framed print only if it takes your breath away.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
              {[
                {
                  name: 'Preview',
                  price: 'Free',
                  sub: 'Always free',
                  desc: 'See your pet transformed into any of our 16 art styles instantly.',
                  features: ['HD AI portrait', 'All 16 styles', 'Instant preview', 'No credit card'],
                  cta: 'Generate Free',
                  popular: false,
                  accent: 'border-white/10',
                },
                {
                  name: '8×10" Framed',
                  price: `from $${PRODUCT_PRICES.framed.sizes.small.sell}`,
                  sub: 'Great for gifts',
                  desc: 'Perfect bedside or desk size. Arrives ready to display.',
                  features: ['Premium frame', 'Ready to hang', '7–10 day ship', 'Gift-ready packaging'],
                  cta: 'Order Print',
                  popular: false,
                  accent: 'border-white/10',
                },
                {
                  name: '16×20" Framed',
                  price: `from $${PRODUCT_PRICES.framed.sizes.large.sell}`,
                  sub: 'Most popular',
                  desc: 'The crowd favourite. Makes a stunning statement in any room.',
                  features: ['Premium frame', 'Ready to hang', '7–10 day ship', 'Certificate of art'],
                  cta: 'Order Print',
                  popular: true,
                  accent: 'border-gold',
                },
                {
                  name: '24×36" Framed',
                  price: `from $${PRODUCT_PRICES.framed.sizes.xxlarge.sell}`,
                  sub: 'Statement piece',
                  desc: 'Gallery-worthy. Dominates a wall and starts conversations.',
                  features: ['Premium frame', 'Ready to hang', '7–10 day ship', 'Certificate of art'],
                  cta: 'Order Print',
                  popular: false,
                  accent: 'border-white/10',
                },
              ].map((p) => (
                <div key={p.name} className={`relative rounded-3xl flex flex-col transition-all duration-300 hover:-translate-y-1`}
                  style={{
                    border: p.popular ? '1px solid #8B6212' : '1px solid rgba(196,197,186,0.30)',
                    background: p.popular
                      ? 'linear-gradient(145deg, rgba(139,98,18,0.12), rgba(139,98,18,0.05))'
                      : 'linear-gradient(145deg, rgba(27,27,27,0.03), rgba(27,27,27,0.015))',
                    boxShadow: p.popular ? '0 20px 60px rgba(139,98,18,0.15)' : 'none',
                  }}>

                  {p.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest whitespace-nowrap shadow-lg"
                      style={{ backgroundColor: '#8B6212', color: '#F0EFEB' }}>
                      MOST POPULAR
                    </div>
                  )}

                  <div className={`p-6 flex-1 ${p.popular ? 'pt-8' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#C4C5BA' }}>{p.sub}</p>
                        <p className="font-black text-base" style={{ color: '#1B1B1B' }}>{p.name}</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <span className="text-4xl font-black" style={{ color: '#1B1B1B' }}>{p.price}</span>
                      {p.price !== 'Free' && <span className="text-sm ml-1" style={{ color: '#C4C5BA' }}>/ print</span>}
                    </div>

                    <p className="text-sm leading-relaxed mb-6" style={{ color: '#C4C5BA' }}>{p.desc}</p>

                    <ul className="space-y-2.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(27,27,27,0.70)' }}>
                          <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              fontSize: '9px',
                              fontWeight: 900,
                              backgroundColor: p.popular ? 'rgba(139,98,18,0.20)' : 'rgba(27,27,27,0.07)',
                              color: p.popular ? '#8B6212' : '#8B6212',
                            }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 pt-0">
                    <Link href="/create"
                      className="block text-center py-3 rounded-2xl text-sm font-bold transition-all"
                      style={p.popular
                        ? { backgroundColor: '#8B6212', color: '#F0EFEB' }
                        : { backgroundColor: 'rgba(27,27,27,0.05)', border: '1px solid rgba(196,197,186,0.30)', color: '#1B1B1B' }
                      }>
                      {p.cta} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <p className="text-center text-sm mt-10" style={{ color: 'rgba(27,27,27,0.40)' }}>
              Express & fast shipping available at checkout. &nbsp;·&nbsp; Choose framed canvas or thin canvas at checkout.
            </p>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="relative py-28 px-4 md:px-6 overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #F0EFEB 0%, #EAE9E4 50%, #F0EFEB 100%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(139,98,18,0.04) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ color: '#8B6212', backgroundColor: 'rgba(139,98,18,0.10)', border: '1px solid rgba(139,98,18,0.25)' }}>✦ Reviews</span>
              <h2 className="text-3xl md:text-5xl font-black mb-4 mt-4" style={{ color: '#1B1B1B' }}>Loved by Pet Parents</h2>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <p className="text-sm font-medium" style={{ color: '#C4C5BA' }}>4.9 / 5 &nbsp;·&nbsp; 2,000+ happy customers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={t.name} className="group relative rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'linear-gradient(145deg, rgba(27,27,27,0.03), rgba(27,27,27,0.015))', border: '1px solid rgba(196,197,186,0.30)' }}>

                  {/* Quote mark */}
                  <div className="absolute top-5 right-6 text-6xl font-black leading-none select-none pointer-events-none"
                    style={{ color: 'rgba(139,98,18,0.10)', fontFamily: 'Georgia,serif' }}>"</div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(t.stars)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>

                  <p className="leading-relaxed mb-6 text-sm relative z-10" style={{ color: 'rgba(27,27,27,0.70)' }}>"{t.quote}"</p>

                  {/* Divider */}
                  <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(196,197,186,0.40), transparent)' }} />

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-lg"
                      style={{ background: i === 0 ? 'linear-gradient(135deg,#8B6212,#a0720f)' : i === 1 ? 'linear-gradient(135deg,#7a7b70,#8a8b7f)' : 'linear-gradient(135deg,#8B6212,#C4C5BA)' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#1B1B1B' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: '#C4C5BA' }}>{t.pet} owner</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#8B6212', backgroundColor: 'rgba(139,98,18,0.10)', border: '1px solid rgba(139,98,18,0.25)' }}>Verified</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-xs font-medium" style={{ color: '#C4C5BA' }}>
              {['Secure Checkout', 'Premium Print Quality', 'Worldwide Shipping', 'Satisfaction Guarantee'].map(text => (
                <div key={text} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(139,98,18,0.50)' }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 px-4 md:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ color: '#8B6212', backgroundColor: 'rgba(139,98,18,0.10)', border: '1px solid rgba(139,98,18,0.25)' }}>✦ FAQ</span>
            <h2 className="text-3xl md:text-5xl font-black mt-4" style={{ color: '#1B1B1B' }}>Got Questions?</h2>
            <p className="text-sm mt-3" style={{ color: '#C4C5BA' }}>Everything you need to know about Maîtrepets.</p>
          </div>
          <FaqAccordion />
        </section>

        {/* ── CTA ── */}
        <section className="py-28 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #EAE9E4 0%, #E0DDD5 100%)', borderTop: '1px solid rgba(196,197,186,0.50)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(139,98,18,0.08), transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #C4C5BA 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="mb-6 flex justify-center" style={{ color: 'rgba(139,98,18,0.50)' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-6xl font-black mb-5 leading-tight" style={{ color: '#1B1B1B' }}>Ready to Create<br />Your Masterpiece?</h2>
            <p className="text-base md:text-lg mb-8 max-w-md mx-auto px-4" style={{ color: '#C4C5BA' }}>Join thousands of pet parents who turned their photos into stunning art.</p>
            <Link href="/create" className="inline-flex items-center gap-2 font-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg transition-colors shadow-2xl"
              style={{ backgroundColor: '#8B6212', color: '#F0EFEB' }}>
              Create Your Portrait →
            </Link>
            <p className="text-sm mt-5" style={{ color: '#8B6212' }}>Free preview · No credit card required</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t py-8 px-4 md:px-6" style={{ backgroundColor: '#1B1B1B', borderColor: 'rgba(196,197,186,0.15)', color: '#C4C5BA' }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8B6212' }}>
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
              </svg>
              <span className="font-bold" style={{ color: '#F0EFEB' }}>Maîtrepets</span>
            </div>
            <p className="text-xs md:text-sm">© 2025 Maîtrepets. All rights reserved.</p>
            <div className="flex gap-4 md:gap-6 text-sm">
              <Link href="/privacy" className="transition-colors hover:text-white" style={{ color: '#C4C5BA' }}>Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-white" style={{ color: '#C4C5BA' }}>Terms</Link>
              <Link href="/refund" className="transition-colors hover:text-white" style={{ color: '#C4C5BA' }}>Refunds</Link>
              <a href="mailto:hello@maitrepets.com" className="transition-colors hover:text-white" style={{ color: '#C4C5BA' }}>Contact</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
