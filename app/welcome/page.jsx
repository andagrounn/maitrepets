'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

/* ─── Images ─── */
const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';
const RD = 'https://replicate.delivery/xezq';

const PORTRAITS = [
  { url: `${S3}/generated/1774629784284-j1rt4wukw6.png`,                                    style: 'Renaissance',  pet: 'Rocky' },
  { url: `${S3}/generated/1774660430180-8754kz2iw4t.png`,                                   style: 'Rococo',       pet: 'Luna'  },
  { url: `${S3}/generated/1774673789483-zzvbnopfst.png`,                                    style: 'Mosaic',       pet: 'Rio'   },
  { url: `${S3}/generated/1774643764809-ln2zqseugf8.png`,                                   style: 'Cubism',       pet: 'Max'   },
  { url: `${S3}/generated/1774629095050-xzkiul0l8fn.png`,                                   style: 'Art Informel', pet: 'Buddy' },
  { url: `${S3}/generated/1774622686162-jetc92ep4u.png`,                                    style: 'Vernacular',   pet: 'Mochi' },
  { url: `${RD}/Aycym3aFMIYAPFJjYLvHtdkZehuUKrn030BC0NJ8CS0mDXKLA/tmp8loxrm6p.png`,       style: 'Titanic',      pet: 'Duke'  },
  { url: `${RD}/HjDQ4mIqF9JRANgmwsAIdgSbujNejFC3fyutG3eFVajwojpsA/tmp2owxmba1.webp`,      style: 'Joker',        pet: 'Bella' },
  { url: `${RD}/wWQOJ3ELKQoTKBgBW44fmjf5ddaeAyHUHJgqRY6SfZAUm6SZB/tmporzt5vx8.webp`,     style: 'Barbie',       pet: 'Daisy' },
  { url: `${RD}/MezlJ8KrKT2YJCnWJoTGUltnM5KofE6pPCxyPai99En7r7UWA/tmpk69qwu60.jpg`,       style: 'Gangster',     pet: 'Rex'   },
  { url: `${RD}/NxlZaUBW6Z61GBSbV8s183ce6tfOYEcLpeDiG8LYafqlaWSZB/out-0.webp`,            style: 'Lion King',    pet: 'Simba' },
  { url: `${RD}/rUsyzZ0FQDaUHVweUQxGR4s47k5Lat7DYe11GQ2QIpUjDlUWA/out-0.webp`,            style: 'Vintage',      pet: 'Pearl' },
  { url: `${RD}/n9Wkfk5PL3QEUSTm7wPxmHF4HRyesK8PXRkBzpbNV4WZJlUWA/out-0.webp`,           style: 'Egypt',        pet: 'Cleo'  },
  { url: `${RD}/VzYQixW3ed1oJCb0jMIeDZSV1saHWCTll3b6Tat2kdAXn8UWA/tmpmv_w4lzz.jpg`,      style: 'Gothic',       pet: 'Shadow'},
  { url: `${RD}/cHfQpXb5JvwfR0lLA0s22ZR5JnZLEAgcngG1fFdTq5EcN5psA/tmpkaabssf3.jpg`,      style: 'Steampunk',    pet: 'Copper'},
];

/* Portraits pinned to the hero gallery wall */
const WALL = [
  { i: 0,  x: '4%',   y: '8%',   w: 160, rot: -7,  delay: 0.2 },
  { i: 1,  x: '18%',  y: '4%',   w: 200, rot:  4,  delay: 0.35 },
  { i: 2,  x: '60%',  y: '6%',   w: 185, rot: -3,  delay: 0.5  },
  { i: 3,  x: '76%',  y: '10%',  w: 155, rot:  8,  delay: 0.65 },
  { i: 4,  x: '2%',   y: '54%',  w: 150, rot:  5,  delay: 0.4  },
  { i: 5,  x: '80%',  y: '48%',  w: 175, rot: -6,  delay: 0.55 },
  { i: 6,  x: '38%',  y: '72%',  w: 140, rot:  3,  delay: 0.7  },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', pet: 'Golden Retriever', quote: 'The Renaissance painting of my dog looks like a real 16th-century oil painting. Everyone who visits thinks I bought fine art.', stars: 5 },
  { name: 'Jake T.',  pet: 'Tabby Cat',        quote: "Got the Rococo style for my cat and it's absolutely unreal. Best $79 I've ever spent — it's hanging in my living room.", stars: 5 },
  { name: 'Maria L.', pet: 'Pug',              quote: "Ordered the Mosaic style as a memorial for my bird. I'll treasure this forever. The print quality is extraordinary.", stars: 5 },
];

/* ─── Gold frame component ─── */
function Frame({ src, alt, style: s, className }) {
  return (
    <div className={`mpt-frame ${className || ''}`} style={s}>
      <img src={src} alt={alt} className="mpt-frame-img" />
    </div>
  );
}

export default function WelcomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY      = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <>
      {/* ── Global styles for this page ── */}
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700;1,900&family=Tenor+Sans&display=swap');

        :root {
          --mpt-bg:   #0C0A07;
          --mpt-bg2:  #110E09;
          --mpt-gold: #C9A84C;
          --mpt-golddim: rgba(201,168,76,0.35);
          --mpt-cream: #F2EAD3;
          --mpt-muted: rgba(242,234,211,0.42);
        }

        /* PAGE RESET */
        body { background: var(--mpt-bg) !important; }

        .mpt-page {
          background: var(--mpt-bg);
          color: var(--mpt-cream);
          overflow-x: hidden;
        }

        /* ── NOISE GRAIN ── */
        .mpt-grain {
          pointer-events: none;
          position: fixed; inset: 0; z-index: 9999;
          opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ── GOLD FRAMES ── */
        .mpt-frame {
          background: linear-gradient(145deg, #D9B84A 0%, #8B6512 35%, #C8A030 55%, #6B4E10 80%, #D9B84A 100%);
          padding: 5px;
          box-shadow:
            0 2px 0 rgba(255,255,255,0.12),
            0 -1px 0 rgba(0,0,0,0.4),
            0 8px 32px rgba(0,0,0,0.65),
            0 0 80px rgba(201,168,76,0.06),
            inset 0 0 0 1px rgba(255,255,255,0.08);
          position: relative;
        }
        .mpt-frame::after {
          content: '';
          position: absolute; inset: 3px;
          border: 1px solid rgba(255,255,255,0.08);
          pointer-events: none;
        }
        .mpt-frame-img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: contrast(1.04) saturate(0.95);
          transition: filter 0.4s;
        }

        /* ── NAVBAR ── */
        .mpt-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px;
          background: linear-gradient(180deg, rgba(12,10,7,0.85) 0%, transparent 100%);
        }
        .mpt-logo {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 700;
          font-size: 20px; color: var(--mpt-cream);
          letter-spacing: 0.04em;
          text-decoration: none;
        }
        .mpt-logo em { color: var(--mpt-gold); font-style: normal; }
        .mpt-nav-link {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: var(--mpt-gold);
          border: 1px solid var(--mpt-golddim);
          padding: 9px 22px;
          text-decoration: none;
          transition: all 0.25s ease;
          background: transparent;
        }
        .mpt-nav-link:hover { background: var(--mpt-gold); color: var(--mpt-bg); }

        /* ── HERO ── */
        .mpt-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(ellipse 90% 80% at 50% 30%, #1A1008 0%, #0C0A07 70%);
        }

        /* subtle ruled lines */
        .mpt-hero::before,
        .mpt-hero::after {
          content: '';
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.07) 25%, rgba(201,168,76,0.07) 75%, transparent);
          pointer-events: none;
        }
        .mpt-hero::before { top: 16%; }
        .mpt-hero::after  { bottom: 16%; }

        /* ── HERO TEXT ── */
        .mpt-eyebrow {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 9px; letter-spacing: 6px; text-transform: uppercase;
          color: var(--mpt-gold);
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px;
        }
        .mpt-eyebrow-line {
          width: 36px; height: 1px;
          background: var(--mpt-golddim);
          flex-shrink: 0;
        }

        .mpt-headline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 700;
          font-size: clamp(68px, 11vw, 136px);
          line-height: 0.88;
          color: var(--mpt-cream);
          text-align: center;
          letter-spacing: -0.025em;
          margin-bottom: 24px;
        }
        .mpt-headline-gold {
          color: var(--mpt-gold);
          display: block;
        }

        .mpt-sub {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
          color: var(--mpt-muted);
          text-align: center;
          margin-bottom: 48px;
        }

        /* ── BUTTONS ── */
        .mpt-btn-primary {
          display: inline-block;
          padding: 16px 44px;
          background: linear-gradient(135deg, #C9A84C 0%, #8B6512 50%, #C9A84C 100%);
          background-size: 200% 100%;
          color: #0C0A07;
          font-family: 'Tenor Sans', sans-serif;
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 8px 40px rgba(201,168,76,0.22), 0 2px 0 rgba(255,255,255,0.1) inset;
          transition: background-position 0.4s ease, box-shadow 0.3s ease, transform 0.2s ease;
        }
        .mpt-btn-primary:hover {
          background-position: 100% 0;
          box-shadow: 0 12px 56px rgba(201,168,76,0.35);
          transform: translateY(-2px);
        }

        .mpt-btn-ghost {
          display: inline-block;
          padding: 16px 28px;
          font-family: 'Tenor Sans', sans-serif;
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: var(--mpt-gold);
          text-decoration: none;
          border-bottom: 1px solid var(--mpt-golddim);
          transition: border-color 0.2s, color 0.2s;
        }
        .mpt-btn-ghost:hover { color: var(--mpt-cream); border-color: rgba(242,234,211,0.4); }

        .mpt-hero-meta {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(242,234,211,0.18);
          text-align: center;
          margin-top: 28px;
        }

        /* ── SCROLL INDICATOR ── */
        @keyframes mptScrollPulse {
          0%, 100% { transform: scaleY(1); opacity: 0.4; }
          50%       { transform: scaleY(0.4); opacity: 0.1; }
        }
        .mpt-scroll-indicator {
          position: absolute; bottom: 32px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          font-family: 'Tenor Sans', sans-serif;
          font-size: 8px; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(242,234,211,0.2);
        }
        .mpt-scroll-bar {
          width: 1px; height: 44px;
          background: linear-gradient(180deg, transparent, var(--mpt-gold) 60%, transparent);
          animation: mptScrollPulse 2.2s ease-in-out infinite;
          transform-origin: top;
        }

        /* ── MARQUEE ── */
        .mpt-marquee-section {
          padding: 64px 0;
          background: var(--mpt-bg2);
          border-top: 1px solid rgba(201,168,76,0.07);
          border-bottom: 1px solid rgba(201,168,76,0.07);
          overflow: hidden;
          position: relative;
        }
        .mpt-marquee-fade-l {
          position: absolute; left: 0; top: 0; bottom: 0; width: 100px;
          background: linear-gradient(90deg, var(--mpt-bg2), transparent);
          z-index: 2; pointer-events: none;
        }
        .mpt-marquee-fade-r {
          position: absolute; right: 0; top: 0; bottom: 0; width: 100px;
          background: linear-gradient(270deg, var(--mpt-bg2), transparent);
          z-index: 2; pointer-events: none;
        }
        .mpt-marquee-row { overflow: hidden; margin-bottom: 14px; }
        .mpt-marquee-row:last-child { margin-bottom: 0; }
        .mpt-marquee-track {
          display: flex; gap: 14px; width: max-content;
        }
        @keyframes mptMarqL { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
        @keyframes mptMarqR { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
        .mpt-marq-l { animation: mptMarqL 38s linear infinite; }
        .mpt-marq-r { animation: mptMarqR 46s linear infinite; }
        .mpt-marq-l:hover, .mpt-marq-r:hover { animation-play-state: paused; }

        .mpt-marq-card { flex-shrink: 0; }
        .mpt-marq-label {
          padding: 5px 0 2px;
          font-family: 'Tenor Sans', sans-serif;
          font-size: 8px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(201,168,76,0.5);
          text-align: center;
          background: var(--mpt-bg2);
        }

        /* ── SECTION HEADERS ── */
        .mpt-section-eyebrow {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 9px; letter-spacing: 6px; text-transform: uppercase;
          color: var(--mpt-gold);
          display: block; margin-bottom: 16px;
        }
        .mpt-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 700;
          font-size: clamp(38px, 5.5vw, 68px);
          color: var(--mpt-cream);
          line-height: 1;
          letter-spacing: -0.01em;
        }

        /* ── STYLE GRID ── */
        .mpt-gallery-section {
          padding: 120px 48px;
          background: var(--mpt-bg);
        }
        .mpt-style-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .mpt-style-card {
          cursor: pointer;
          position: relative;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s;
        }
        .mpt-style-card:hover {
          transform: translateY(-6px) rotate(-0.5deg);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.08);
        }
        .mpt-style-card:hover .mpt-style-hover { opacity: 1; }
        .mpt-style-hover {
          position: absolute; inset: 5px;
          background: rgba(12,10,7,0.72);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 3;
        }
        .mpt-style-hover-name {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 20px;
          color: var(--mpt-cream);
        }
        .mpt-style-hover-link {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
          color: var(--mpt-gold);
          text-decoration: none;
          border-bottom: 1px solid var(--mpt-golddim);
          padding-bottom: 2px;
        }
        .mpt-card-footer {
          padding: 10px 2px;
          display: flex; justify-content: space-between; align-items: baseline;
        }
        .mpt-card-style {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 15px;
          color: rgba(242,234,211,0.65);
        }
        .mpt-card-pet {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(201,168,76,0.45);
        }

        /* ── HOW IT WORKS ── */
        .mpt-hiw-section {
          padding: 120px 48px;
          background: var(--mpt-bg2);
          text-align: center;
        }
        .mpt-steps {
          display: flex;
          max-width: 860px;
          margin: 0 auto;
          position: relative;
        }
        .mpt-steps-line {
          position: absolute;
          top: 28px; left: 17%; right: 17%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.18) 30%, rgba(201,168,76,0.18) 70%, transparent);
        }
        .mpt-step { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0 28px; }
        .mpt-step-num {
          width: 56px; height: 56px; border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.3);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 22px;
          color: var(--mpt-gold);
          background: var(--mpt-bg2);
          position: relative; z-index: 1;
          margin-bottom: 20px;
        }
        .mpt-step-title {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--mpt-cream);
          margin-bottom: 10px;
        }
        .mpt-step-desc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 16px;
          color: var(--mpt-muted);
          line-height: 1.6;
        }

        /* ── TESTIMONIALS ── */
        .mpt-testi-section {
          padding: 120px 48px;
          background: var(--mpt-bg);
        }
        .mpt-testi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 1060px;
          margin: 0 auto;
        }
        .mpt-testi-card {
          padding: 36px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(201,168,76,0.1);
          position: relative; overflow: hidden;
        }
        .mpt-testi-card::before {
          content: '"';
          position: absolute; top: -18px; left: 20px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 130px; font-style: italic;
          color: rgba(201,168,76,0.055);
          line-height: 1; user-select: none;
        }
        .mpt-stars { color: var(--mpt-gold); font-size: 11px; letter-spacing: 3px; margin-bottom: 14px; }
        .mpt-testi-quote {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 17px;
          color: rgba(242,234,211,0.62);
          line-height: 1.75; margin-bottom: 24px;
          position: relative; z-index: 1;
        }
        .mpt-testi-name {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--mpt-cream);
        }
        .mpt-testi-pet {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(201,168,76,0.4);
          margin-top: 4px;
        }

        /* ── CTA ── */
        .mpt-cta-section {
          padding: 160px 48px;
          text-align: center;
          background: var(--mpt-bg2);
          position: relative; overflow: hidden;
        }
        .mpt-cta-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(139,101,18,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        /* corner ornaments */
        .mpt-corner {
          position: absolute;
          width: 48px; height: 48px;
          pointer-events: none;
        }
        .mpt-corner-tl { top: 40px; left: 40px; border-top: 1px solid rgba(201,168,76,0.18); border-left: 1px solid rgba(201,168,76,0.18); }
        .mpt-corner-tr { top: 40px; right: 40px; border-top: 1px solid rgba(201,168,76,0.18); border-right: 1px solid rgba(201,168,76,0.18); }
        .mpt-corner-bl { bottom: 40px; left: 40px; border-bottom: 1px solid rgba(201,168,76,0.18); border-left: 1px solid rgba(201,168,76,0.18); }
        .mpt-corner-br { bottom: 40px; right: 40px; border-bottom: 1px solid rgba(201,168,76,0.18); border-right: 1px solid rgba(201,168,76,0.18); }

        .mpt-cta-headline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 700;
          font-size: clamp(48px, 8vw, 100px);
          color: var(--mpt-cream);
          line-height: 0.93;
          letter-spacing: -0.025em;
          margin-bottom: 20px;
          position: relative; z-index: 1;
        }
        .mpt-cta-sub {
          font-family: 'Tenor Sans', sans-serif;
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(242,234,211,0.3);
          margin-bottom: 52px;
        }
        .mpt-cta-meta {
          margin-top: 24px;
          font-family: 'Tenor Sans', sans-serif;
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(242,234,211,0.16);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .mpt-nav { padding: 18px 24px; }
          .mpt-gallery-section, .mpt-hiw-section,
          .mpt-testi-section, .mpt-cta-section { padding: 80px 24px; }
          .mpt-steps { flex-direction: column; gap: 40px; }
          .mpt-steps-line { display: none; }
          .mpt-cta-section { padding: 100px 24px; }
          .mpt-corner { display: none; }

          /* Hide wall portraits on mobile */
          .mpt-wall-portrait { display: none; }
        }
      `}</style>

      {/* Grain overlay */}
      <div className="mpt-grain" aria-hidden />

      <div className="mpt-page">

        {/* ══════════════════ NAV ══════════════════ */}
        <nav className="mpt-nav">
          <Link href="/" className="mpt-logo">Maître<em>pets</em></Link>
          <Link href="/create" className="mpt-nav-link">Create Portrait</Link>
        </nav>

        {/* ══════════════════ HERO ══════════════════ */}
        <section className="mpt-hero" ref={heroRef}>

          {/* Gallery wall portraits */}
          {WALL.map((p, idx) => (
            <motion.div
              key={idx}
              className="mpt-wall-portrait"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.3, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                left: p.x, top: p.y,
                width: p.w,
                transform: `rotate(${p.rot}deg)`,
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              <Frame src={PORTRAITS[p.i].url} alt={`${PORTRAITS[p.i].pet} — ${PORTRAITS[p.i].style}`} />
              <div style={{
                textAlign: 'center', marginTop: 7,
                fontFamily: 'Tenor Sans, sans-serif',
                fontSize: 8, letterSpacing: 2, textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.45)',
              }}>
                {PORTRAITS[p.i].style}
              </div>
            </motion.div>
          ))}

          {/* Vignette edges */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(12,10,7,0.85) 100%)', pointerEvents: 'none', zIndex: 3 }} />

          {/* Center content */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 32px' }}
          >
            <motion.div
              className="mpt-eyebrow"
              style={{ justifyContent: 'center' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.9 }}
            >
              <span className="mpt-eyebrow-line" />
              Fine Art Pet Portraits
              <span className="mpt-eyebrow-line" />
            </motion.div>

            <motion.h1
              className="mpt-headline"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              Your Pet.
              <span className="mpt-headline-gold">A Masterpiece.</span>
            </motion.h1>

            <motion.p
              className="mpt-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.8 }}
            >
              Transformed by AI &nbsp;·&nbsp; Printed for Eternity
            </motion.p>

            <motion.div
              style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.95, duration: 0.7 }}
            >
              <Link href="/create" className="mpt-btn-primary">Begin Your Portrait</Link>
              <a href="#gallery" className="mpt-btn-ghost">View Gallery ↓</a>
            </motion.div>

            <motion.p
              className="mpt-hero-meta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              Free Preview &nbsp;·&nbsp; 16 Art Styles &nbsp;·&nbsp; Ships Worldwide
            </motion.p>
          </motion.div>

          {/* Scroll indicator */}
          <div className="mpt-scroll-indicator">
            <div className="mpt-scroll-bar" />
            Scroll
          </div>
        </section>

        {/* ══════════════════ MARQUEE ══════════════════ */}
        <section className="mpt-marquee-section">
          <div className="mpt-marquee-fade-l" />
          <div className="mpt-marquee-fade-r" />

          {/* Row 1 — left */}
          <div className="mpt-marquee-row">
            <div className="mpt-marquee-track mpt-marq-l">
              {[...PORTRAITS, ...PORTRAITS].map((p, i) => (
                <div key={i} className="mpt-marq-card">
                  <div className="mpt-frame" style={{ width: 112 }}>
                    <img src={p.url} alt={p.style} className="mpt-frame-img" style={{ width: 112, height: 148, objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div className="mpt-marq-label">{p.style}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — right */}
          <div className="mpt-marquee-row">
            <div className="mpt-marquee-track mpt-marq-r">
              {[...PORTRAITS.slice(6), ...PORTRAITS, ...PORTRAITS.slice(0, 6)].map((p, i) => (
                <div key={i} className="mpt-marq-card">
                  <div className="mpt-frame" style={{ width: 134 }}>
                    <img src={p.url} alt={p.style} className="mpt-frame-img" style={{ width: 134, height: 176, objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div className="mpt-marq-label">{p.style}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════ STYLE GALLERY ══════════════════ */}
        <section id="gallery" className="mpt-gallery-section">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 72 }}
          >
            <span className="mpt-section-eyebrow">✦ &nbsp; The Collection &nbsp; ✦</span>
            <h2 className="mpt-section-title">
              16 Styles.<br />Infinite Masterpieces.
            </h2>
          </motion.div>

          <div className="mpt-style-grid">
            {PORTRAITS.slice(0, 9).map((p, i) => (
              <motion.div
                key={i}
                className="mpt-style-card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
              >
                <div className="mpt-frame" style={{ position: 'relative' }}>
                  <img
                    src={p.url} alt={`${p.pet} — ${p.style}`}
                    className="mpt-frame-img"
                    style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
                  />
                  <div className="mpt-style-hover">
                    <span className="mpt-style-hover-name">{p.style}</span>
                    <Link href="/create" className="mpt-style-hover-link">Create This →</Link>
                  </div>
                </div>
                <div className="mpt-card-footer">
                  <span className="mpt-card-style">{p.style}</span>
                  <span className="mpt-card-pet">{p.pet}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/create" style={{
              fontFamily: 'Tenor Sans, sans-serif',
              fontSize: 10, letterSpacing: 4, textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.45)', textDecoration: 'none',
              borderBottom: '1px solid rgba(201,168,76,0.2)', paddingBottom: 2,
            }}>
              + 7 more styles
            </Link>
          </div>
        </section>

        {/* ══════════════════ HOW IT WORKS ══════════════════ */}
        <section className="mpt-hiw-section">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            style={{ marginBottom: 80 }}
          >
            <span className="mpt-section-eyebrow">✦ &nbsp; The Process &nbsp; ✦</span>
            <h2 className="mpt-section-title">
              From Snapshot<br />to Heirloom
            </h2>
          </motion.div>

          <div className="mpt-steps">
            <div className="mpt-steps-line" />
            {[
              { num: 'I',   title: 'Upload Your Photo',  desc: 'A clear, well-lit photo. That\'s the only ingredient you need.' },
              { num: 'II',  title: 'Choose Your Style',  desc: 'Pick from 16 art movements. Preview free, no commitment.' },
              { num: 'III', title: 'We Print & Deliver', desc: 'Museum-quality canvas or paper. Shipped to your door.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="mpt-step"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.14 }}
              >
                <div className="mpt-step-num">{step.num}</div>
                <div className="mpt-step-title">{step.title}</div>
                <div className="mpt-step-desc">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════ TESTIMONIALS ══════════════════ */}
        <section className="mpt-testi-section">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <span className="mpt-section-eyebrow">✦ &nbsp; Collectors Say &nbsp; ✦</span>
            <h2 className="mpt-section-title">The Reviews Are In.</h2>
          </motion.div>

          <div className="mpt-testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                className="mpt-testi-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <div className="mpt-stars">{'★'.repeat(t.stars)}</div>
                <p className="mpt-testi-quote">"{t.quote}"</p>
                <div className="mpt-testi-name">{t.name}</div>
                <div className="mpt-testi-pet">{t.pet}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════ CTA ══════════════════ */}
        <section className="mpt-cta-section">
          <div className="mpt-cta-glow" />
          <div className="mpt-corner mpt-corner-tl" />
          <div className="mpt-corner mpt-corner-tr" />
          <div className="mpt-corner mpt-corner-bl" />
          <div className="mpt-corner mpt-corner-br" />

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <span className="mpt-section-eyebrow" style={{ textAlign: 'center', display: 'block', marginBottom: 24 }}>
              ✦ &nbsp; Begin Your Commission &nbsp; ✦
            </span>
            <h2 className="mpt-cta-headline">
              Your pet deserves<br />to be immortalized.
            </h2>
            <p className="mpt-cta-sub">
              Join thousands who turned their best friend into fine art.
            </p>
            <Link href="/create" className="mpt-btn-primary" style={{ fontSize: 11, letterSpacing: 5, padding: '18px 52px' }}>
              Create Your Masterpiece →
            </Link>
            <p className="mpt-cta-meta">
              Free Preview &nbsp;·&nbsp; No Credit Card Required &nbsp;·&nbsp; Ships Worldwide
            </p>
          </motion.div>
        </section>

      </div>
    </>
  );
}
