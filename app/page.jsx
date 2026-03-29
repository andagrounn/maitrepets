import Link from 'next/link';
import Navbar from '@/components/Navbar';

const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';

const GENERATED = [
  { url: `${S3}/generated/1774673789483-zzvbnopfst.png`,  pet: 'Rio',   style: 'Mosaic',      emoji: '🎨' },
  { url: `${S3}/generated/1774629784284-j1rt4wukw6.png`,  pet: 'Rocky', style: 'Renaissance', emoji: '🖼️' },
  { url: `${S3}/generated/1774660430180-8754kz2iw4t.png`, pet: 'Luna',  style: 'Rococo',      emoji: '🎀' },
];

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
  ...GENERATED,
  { url: `${S3}/generated/1774629095050-xzkiul0l8fn.png`,                               pet: 'Buddy', style: 'Folk Art', emoji: '🎨' },
  { url: `${S3}/generated/1774643764809-ln2zqseugf8.png`,                               pet: 'Max',   style: 'Kawaii',   emoji: '🍡' },
  { url: `${S3}/generated/1774622686162-jetc92ep4u.png`,                                pet: 'Mochi', style: 'Lofi Art', emoji: '🎧' },
];

const testimonials = [
  { name: 'Sarah M.', pet: 'Golden Retriever', quote: 'The Renaissance painting of my dog is insane — it looks like a real 16th century oil painting. Everyone who visits thinks I bought fine art.', stars: 5 },
  { name: 'Jake T.',  pet: 'Tabby Cat',        quote: "Got the Rococo style for my cat and it's absolutely unreal. Best $79 I've ever spent — it's hanging in my living room.",                      stars: 5 },
  { name: 'Maria L.', pet: 'Pug',              quote: "Ordered the Mosaic style as a memorial for my bird. I'll treasure this forever. The quality of the print is incredible.",                    stars: 5 },
];

const faqs = [
  { q: 'What kind of photo should I upload?',  a: "A clear, front-facing photo with good lighting works best. Make sure your pet's face is visible and in focus." },
  { q: 'How long does shipping take?',          a: 'Standard framed prints ship within 3–5 business days and arrive in 7–10 days. Express options available at checkout.' },
  { q: 'Can I get a refund?',                  a: 'Physical prints that arrive damaged or defective are eligible for a full replacement or refund. Digital downloads are non-refundable once delivered.' },
  { q: 'What sizes are available?',             a: 'We offer framed poster prints in 8×10, 11×14, 16×20, 18×24, and 24×36 inches.' },
  { q: 'How does the AI work?',                a: "We use GPT-4o to understand your pet's unique features, then generate stunning artwork in the chosen style at full HD resolution." },
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
          box-shadow: 0 50px 100px rgba(0,0,0,0.8), 0 0 60px rgba(168,85,247,0.3) !important;
        }

      `}</style>

      <Navbar />

      <main className="bg-[#0a0a0f]">

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">

          {/* ambient glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-700/20 rounded-full blur-[140px]" />
            <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-pink-700/15 rounded-full blur-[100px]" />
          </div>

          {/* dot grid */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '52px 52px' }} />

          {/* center */}
          <div className="relative z-10 text-center max-w-3xl">

            {/* badge */}
            <div className="fade-up inline-flex items-center gap-2 bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-semibold px-4 py-2 rounded-full mb-10 backdrop-blur-sm tracking-widest uppercase" style={{ animationDelay: '0.1s' }}>
              ✦ AI Fine Art Pet Portraits
            </div>

            {/* brand */}
            <h1 className="mb-6 leading-[0.9]" aria-label={BRAND}>
              <span
                className="font-black text-white tracking-tight"
                style={{ fontSize: 'clamp(2.2rem, 9vw, 8rem)', display: 'block', whiteSpace: 'nowrap' }}
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

            <p className="fade-up text-base md:text-2xl text-gray-400 mb-8 max-w-lg mx-auto px-2" style={{ animationDelay: '1.05s' }}>
              Turn your pet into a{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">masterpiece</span>
              . Printed &amp; delivered to your door.
            </p>

            <div className="fade-up flex flex-col sm:flex-row gap-3 justify-center px-4" style={{ animationDelay: '1.25s' }}>
              <Link href="/create"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base md:text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-purple-900/60">
                Create Your Portrait →
              </Link>
              <a href="#gallery"
                className="border border-white/20 text-white font-semibold text-base md:text-lg px-8 py-4 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm">
                See Examples ↓
              </a>
            </div>

            <p className="fade-up text-gray-600 text-sm mt-6" style={{ animationDelay: '1.45s' }}>
              Free preview · No credit card required · 16 art styles
            </p>
          </div>

          {/* scroll pill */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
              <div className="w-1 h-1.5 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </section>

        {/* ── POLAROID WALL ── */}
        <section id="gallery" className="relative py-24 overflow-hidden">

          {/* Studio wall background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0d0b09 0%, #110e0b 50%, #0a0807 100%)' }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.4) 3px,rgba(255,255,255,0.4) 4px),repeating-linear-gradient(90deg,transparent,transparent 3px,rgba(255,255,255,0.4) 3px,rgba(255,255,255,0.4) 4px)',
          }} />
          {/* Warm glow center */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(120,60,20,0.08) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6">

            <div className="text-center mb-16">
              <span className="inline-block text-amber-500/70 text-xs font-bold tracking-widest uppercase mb-4">✦ The Studio</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3">Every pet is a work of art.</h2>
              <p className="text-gray-600 text-base">Hover to lift a canvas</p>
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
                      0 12px 40px rgba(0,0,0,0.85),
                      0 4px 12px rgba(0,0,0,0.6)
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

                  {/* Style label tag */}
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '1px', height: '10px', background: 'rgba(180,160,120,0.4)' }} />
                    <div style={{
                      background: 'linear-gradient(135deg, #2a1f0e, #3d2f18)',
                      border: '1px solid rgba(180,140,60,0.3)',
                      padding: '3px 10px',
                      borderRadius: '2px',
                    }}>
                      <p style={{ fontSize: '9px', fontWeight: '700', color: '#c8a050', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {p.pet ? `${p.pet} · ${p.style}` : p.style}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-20">
              <Link href="/create" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-purple-900/40">
                Create Your Portrait →
              </Link>
            </div>

          </div>
        </section>

        {/* ── STYLES GRID ── */}
        <section id="styles" className="py-24 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">✦ Art Styles</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">16 Unique Styles</h2>
            <p className="text-gray-400 text-lg">Your pet, reimagined in any artistic universe</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STYLES_GRID.map((s) => (
              <div key={s.style} className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-purple-900/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-white/5">
                <img src={s.url} alt={s.style} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-black text-xl">{s.style}</p>
                  <p className="text-gray-400 text-xs mt-1">{s.pet}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/create" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-purple-900/40">
              Try All 16 Styles Free →
            </Link>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-24 px-4 md:px-6 bg-white/[0.03] border-y border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">✦ How It Works</span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">From photo to wall art<br className="hidden sm:block" /> in minutes.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '01', icon: '📸', title: 'Upload Your Photo',  desc: "Select a clear, front-facing shot of your pet. The better the photo, the more stunning the result." },
                { step: '02', icon: '🎨', title: 'Pick an Art Style',  desc: 'Choose from 16 unique styles — Renaissance, Mosaic, Rococo, Chibi, Comic Book, and more.' },
                { step: '03', icon: '📦', title: 'Print & Receive',    desc: 'Order a premium framed print. Professionally crafted and shipped worldwide to your door.' },
              ].map((item) => (
                <div key={item.step} className="relative p-8 rounded-3xl bg-white/5 hover:bg-purple-900/20 transition-colors border border-white/10 group overflow-hidden">
                  <div className="absolute top-5 right-5 text-7xl font-black text-white/[0.04] group-hover:text-white/[0.08] transition-colors select-none leading-none">{item.step}</div>
                  <div className="text-5xl mb-5">{item.icon}</div>
                  <div className="text-xs font-black text-purple-500 mb-3 tracking-widest">STEP {item.step}</div>
                  <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REAL PORTRAITS SHOWCASE ── */}
        <section className="py-24 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">✦ Real Results</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Meet Our Stars</h2>
            <p className="text-gray-400 text-lg">Real pets transformed by Maîtrepets AI</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GENERATED.map((item) => (
              <div key={item.pet} className="group relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <img src={item.url} alt={item.pet} className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="bg-purple-600/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">{item.emoji} {item.style}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-black text-3xl">{item.pet}</p>
                  <p className="text-gray-400 text-sm mt-1">{item.style} style</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-24 px-4 md:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">✦ Pricing</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Simple Pricing</h2>
            <p className="text-gray-400 text-lg">Free to generate. Pay only if you love it.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Preview',      price: 'Free',  desc: 'AI digital art',  features: ['HD resolution', 'All 16 styles', 'Instant preview'],  popular: false },
              { name: '8×10 Framed',  price: '$60+',  desc: 'Starter print',   features: ['Premium framed', 'Ready to hang', '7–10 day ship'],  popular: false },
              { name: '16×20 Framed', price: '$79+',  desc: 'Most popular',    features: ['Premium framed', 'Ready to hang', '7–10 day ship'],  popular: true  },
              { name: '24×36 Framed', price: '$139+', desc: 'Statement piece', features: ['Premium framed', 'Ready to hang', '7–10 day ship'],  popular: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl p-4 sm:p-6 relative border ${p.popular ? 'border-purple-500 bg-purple-900/30 shadow-2xl shadow-purple-900/40' : 'border-white/10 bg-white/5'}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wide whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                <p className="font-bold text-white text-sm">{p.name}</p>
                <p className="text-3xl font-black text-white mt-2 mb-1">{p.price}</p>
                <p className="text-gray-500 text-xs mb-4">{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="text-purple-400 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/create" className={`block text-center py-2.5 rounded-xl text-xs font-bold transition-all ${p.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 px-4 md:px-6 bg-white/[0.03] border-y border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">✦ Reviews</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3">Loved by Pet Parents</h2>
              <div className="text-yellow-400 text-xl mb-2">★★★★★</div>
              <p className="text-gray-400">4.9/5 from 2,000+ happy customers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-3xl p-7 bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
                  <div className="text-yellow-400 text-lg mb-4">{'★'.repeat(t.stars)}</div>
                  <p className="text-gray-300 leading-relaxed mb-5 text-sm">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.pet} owner</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 px-4 md:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">✦ FAQ</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Got Questions?</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl p-6 bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
                <h3 className="font-bold text-white mb-2 text-sm">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-pink-900/50 border-t border-white/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.25),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🐾</div>
            <h2 className="text-3xl md:text-6xl font-black text-white mb-5 leading-tight">Ready to Create<br />Your Masterpiece?</h2>
            <p className="text-purple-200 text-base md:text-lg mb-8 max-w-md mx-auto px-4">Join thousands of pet parents who turned their photos into stunning art.</p>
            <Link href="/create" className="inline-flex items-center gap-2 bg-white text-purple-700 font-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-base md:text-lg hover:bg-purple-50 transition-colors shadow-2xl">
              Create Your Portrait →
            </Link>
            <p className="text-purple-400 text-sm mt-5">Free preview · No credit card required</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-black/60 border-t border-white/10 text-gray-500 py-8 px-4 md:px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-white font-bold">Maîtrepets</span>
            </div>
            <p className="text-xs md:text-sm">© 2025 Maîtrepets. All rights reserved.</p>
            <div className="flex gap-4 md:gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/refund" className="hover:text-white transition-colors">Refunds</Link>
              <a href="mailto:hello@maitrepets.com" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
