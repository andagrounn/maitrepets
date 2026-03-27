'use client';
import { useEffect, useRef, useState } from 'react';

const THEME_STYLES = {
  titanic:     { accent: '#4fc3f7', tagline: 'A love story that will never be forgotten.' },
  avengers:    { accent: '#ef5350', tagline: 'The universe will never be the same.' },
  barbie:      { accent: '#f48fb1', tagline: 'She can do anything. She can be anyone.' },
  lionking:    { accent: '#ffb300', tagline: 'The greatest adventure of all is finding your place in the circle of life.' },
  gangster:    { accent: '#b0bec5', tagline: 'Power. Loyalty. Respect. Everything has a price.' },
  jurassicpark:{ accent: '#66bb6a', tagline: 'Life finds a way.' },
  harrypotter: { accent: '#ce93d8', tagline: 'The magic was inside you all along.' },
  starwars:    { accent: '#ffe082', tagline: 'A long time ago in a galaxy far, far away...' },
  pirates:     { accent: '#80cbc4', tagline: 'Not all treasure is silver and gold, mate.' },
  joker:       { accent: '#9c27b0', tagline: 'Why so serious?' },
};

export default function MoviePosterCanvas({ imageUrl, movieTitle, actorName, petName, theme }) {
  const canvasRef = useRef(null);
  const [posterUrl, setPosterUrl] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    renderPoster();
  }, [imageUrl, movieTitle, actorName, petName, theme]);

  async function renderPoster() {
    setRendering(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const W = 800;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    // Draw image — cover fill
    const scale = Math.max(W / img.width, H / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    const sx = (W - sw) / 2;
    const sy = (H - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);

    const ts = THEME_STYLES[theme] || THEME_STYLES.titanic;

    // Top vignette
    const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.35);
    topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
    topGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, H * 0.35);

    // Bottom vignette
    const botGrad = ctx.createLinearGradient(0, H * 0.45, 0, H);
    botGrad.addColorStop(0, 'rgba(0,0,0,0)');
    botGrad.addColorStop(0.5, 'rgba(0,0,0,0.7)');
    botGrad.addColorStop(1, 'rgba(0,0,0,0.97)');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H * 0.45, W, H);

    // ── TOP: "AN ARTIFYAI ORIGINAL PRODUCTION" ──
    ctx.fillStyle = ts.accent;
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText('AN ARTIFYAI ORIGINAL PRODUCTION', W / 2, 42);

    // Accent line under header
    ctx.fillStyle = ts.accent;
    ctx.fillRect(W / 2 - 120, 52, 240, 2);

    // ── STARRING LINE ──
    const starringY = H - 360;
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'center';
    const starring = actorName && petName
      ? `${actorName}  ·  as  ·  ${petName}`
      : actorName || petName || '';
    if (starring) ctx.fillText(starring, W / 2, starringY);

    // ── MOVIE TITLE ──
    const title = movieTitle || 'UNTITLED';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 20;

    // Auto-size title font
    let fontSize = 110;
    ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
    while (ctx.measureText(title.toUpperCase()).width > W - 60 && fontSize > 40) {
      fontSize -= 4;
      ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
    }

    // Title shadow/glow
    ctx.fillStyle = ts.accent;
    ctx.fillText(title.toUpperCase(), W / 2 + 3, H - 240 + 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title.toUpperCase(), W / 2, H - 240);
    ctx.shadowBlur = 0;

    // Accent underline
    ctx.fillStyle = ts.accent;
    const titleWidth = Math.min(ctx.measureText(title.toUpperCase()).width + 40, W - 40);
    ctx.fillRect(W / 2 - titleWidth / 2, H - 216, titleWidth, 3);

    // ── TAGLINE ──
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(ts.tagline, W / 2, H - 175);

    // ── BOTTOM CREDITS BAR ──
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, H - 130, W, 1);

    ctx.font = '13px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    const year = new Date().getFullYear();
    ctx.fillText(
      `© ${year} Maîtrepets Studios  ·  All Rights Reserved  ·  maitrepets.com`,
      W / 2, H - 108
    );

    const credits = petName
      ? `${petName.toUpperCase()} · DIRECTED BY A.I. · PRODUCED BY ARTIFYAI · ORIGINAL SOUNDTRACK`
      : 'DIRECTED BY A.I. · PRODUCED BY ARTIFYAI · ORIGINAL SOUNDTRACK';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(credits, W / 2, H - 86);

    // Rating box
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 20, H - 72, 40, 26);
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('PG', W / 2, H - 53);

    // Maîtrepets watermark bottom right
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillStyle = ts.accent;
    ctx.fillText('Maîtrepets', W - 24, H - 24);

    const url = canvas.toDataURL('image/jpeg', 0.95);
    setPosterUrl(url);
    setRendering(false);
  }

  return (
    <div className="relative w-full">
      {/* Hidden canvas used for rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {rendering && (
        <div className="aspect-[2/3] bg-gray-900 rounded-2xl flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Compositing poster...</p>
          </div>
        </div>
      )}

      {posterUrl && !rendering && (
        <>
          <div className="space-y-3">
            <div className="relative group cursor-zoom-in" onClick={() => setLightbox(true)}>
              <img
                src={posterUrl}
                alt="Movie Poster"
                className="w-full rounded-2xl shadow-2xl ring-2 ring-purple-500/30"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-2xl transition-all flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  🔍 View Full Poster
                </span>
              </div>
            </div>
            <a
              href={posterUrl}
              download={`${movieTitle || 'movie-poster'}.jpg`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl transition-all"
            >
              ⬇️ Download Poster
            </a>
          </div>

          {/* Lightbox */}
          {lightbox && (
            <div
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={() => setLightbox(false)}
            >
              <button
                className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light leading-none"
                onClick={() => setLightbox(false)}
              >
                ×
              </button>
              <img
                src={posterUrl}
                alt="Movie Poster Full"
                className="h-[92vh] w-auto object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <a
                href={posterUrl}
                download={`${movieTitle || 'movie-poster'}.jpg`}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                ⬇️ Download Poster
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
