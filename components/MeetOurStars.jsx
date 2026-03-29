'use client';
import { useState, useEffect, useRef } from 'react';
import FlipCard from './FlipCard';

const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';

const CARDS = [
  { ai: `${S3}/generated/1774673789483-zzvbnopfst.png`, pet: 'Rio',   style: 'Mosaic',      emoji: '🎨' },
  { ai: `${S3}/generated/1774629784284-j1rt4wukw6.png`, original: `${S3}/uploads/028f47db-0c96-42d8-a8d4-da132822e06d/1774629725494-Dogs_love.jpg`, pet: 'Rocky', style: 'Renaissance', emoji: '🖼️' },
  { ai: `${S3}/generated/1774660430180-8754kz2iw4t.png`, pet: 'Luna',  style: 'Rococo',      emoji: '🎀' },
];

export default function MeetOurStars() {
  const [flippedIdx, setFlippedIdx] = useState(null);
  const lastIdxRef = useRef(null);

  useEffect(() => {
    function scheduleNext() {
      // Pick a random index different from the last one
      let next;
      do { next = Math.floor(Math.random() * CARDS.length); }
      while (next === lastIdxRef.current);

      const showDelay  = 1800 + Math.random() * 1200; // pause before flipping
      const holdDelay  = 2800 + Math.random() * 1000; // hold flipped state

      setTimeout(() => {
        lastIdxRef.current = next;
        setFlippedIdx(next);
        setTimeout(() => {
          setFlippedIdx(null);
          scheduleNext();
        }, holdDelay);
      }, showDelay);
    }

    scheduleNext();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {CARDS.map((card, i) => (
        <FlipCard
          key={card.pet}
          ai={card.ai}
          original={card.original}
          pet={card.pet}
          style={card.style}
          emoji={card.emoji}
          flipped={flippedIdx === i}
        />
      ))}
    </div>
  );
}
