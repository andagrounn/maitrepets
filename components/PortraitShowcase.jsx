'use client';
import { useState, useEffect } from 'react';

export const PORTRAITS = [
  {
    ai:    'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com/generated/1774673789483-zzvbnopfst.png',
    pet:   'Rio',
    style: 'Mosaic',
  },
  {
    ai:       'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com/generated/1774629784284-j1rt4wukw6.png',
    original: 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com/uploads/028f47db-0c96-42d8-a8d4-da132822e06d/1774629725494-Dogs_love.jpg',
    pet:   'Rocky',
    style: 'Renaissance',
    flip:  true,
  },
  {
    ai:    'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com/generated/1774660430180-8754kz2iw4t.png',
    pet:   'Luna',
    style: 'Rococo',
  },
];

export function FlipCard({ ai, original, pet, style }) {
  const [showOriginal, setShowOriginal] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setShowOriginal(v => !v), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ perspective: '1000px', aspectRatio: '3/4' }} className="flex-1 mt-[-24px]">
      <div className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transformStyle: 'preserve-3d', transform: showOriginal ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        {/* Front — AI */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
          <img src={ai} alt="AI portrait" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">AI</span>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight">{pet}</p>
            <p className="text-white/60 text-xs">{style}</p>
          </div>
        </div>
        {/* Back — Original */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <img src={original} alt="Original photo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Original</span>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight">{pet}</p>
            <p className="text-white/60 text-xs">Original photo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.6c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.8 7.2v6h7.7c4.5-4.2 7.4-10.3 7.4-17.5z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.6v6.2C6.5 42.6 14.7 48 24 48z" fill="#34A853"/>
      <path d="M10.5 28.6c-.5-1.4-.7-2.9-.7-4.6s.2-3.2.7-4.6v-6.2H2.6C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z" fill="#FBBC05"/>
      <path d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.5 0 24 0 14.7 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.7 17.7 9.5 24 9.5z" fill="#EA4335"/>
    </svg>
  );
}
