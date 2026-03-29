'use client';
import { useState, useEffect } from 'react';

const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';

const CARDS = [
  { url: `${S3}/generated/1774673789483-zzvbnopfst.png`,  pet: 'Rio',   style: 'Mosaic' },
  {
    url:      `${S3}/generated/1774801238129-e26rh2jl6lo.png`,
    original: `${S3}/uploads/7f554f65-5a02-4f15-b8be-22edf950a43d/1774801171860-IMG_0144.jpeg`,
    pet:      'Broc',
    style:    'Renaissance',
    flip:     true,
  },
  { url: `${S3}/generated/1774660430180-8754kz2iw4t.png`, pet: 'Luna',  style: 'Rococo' },
];

function FlipCard({ url, original, pet, style }) {
  const [showOriginal, setShowOriginal] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setShowOriginal(v => !v), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ perspective: '1000px', aspectRatio: '3/4' }}>
      <div className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transformStyle: 'preserve-3d', transform: showOriginal ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        {/* Front — AI portrait */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          style={{ backfaceVisibility: 'hidden' }}>
          <img src={url} alt="AI portrait" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">AI</span>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white font-black text-3xl">{pet}</p>
            <p className="text-gray-400 text-sm mt-1">{style} style</p>
          </div>
        </div>
        {/* Back — original photo */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <img src={original} alt="Original photo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Original</span>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white font-black text-3xl">{pet}</p>
            <p className="text-gray-400 text-sm mt-1">Original photo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MeetOurStars() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {CARDS.map((card) =>
        card.flip ? (
          <FlipCard key={card.pet} url={card.url} original={card.original} pet={card.pet} style={card.style} />
        ) : (
          <div key={card.pet} className="group relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer" style={{ aspectRatio: '3/4' }}>
            <img src={card.url} alt={card.pet} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white font-black text-3xl">{card.pet}</p>
              <p className="text-gray-400 text-sm mt-1">{card.style} style</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
