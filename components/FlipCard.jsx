'use client';

// Archival Gallery palette
const PAL = {
  ink:   '#1B1B1B',
  ivory: '#F0EFEB',
  sage:  '#C4C5BA',
  gold:  '#8B6212',
};

export default function FlipCard({ ai, original, pet, style, emoji, flipped = false }) {
  return (
    <div style={{ perspective: '1000px' }} className="aspect-[3/4]">
      <div
        className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front — AI portrait */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img src={ai} alt="AI portrait" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          <div className="absolute top-4 right-4">
            <span className="bg-gold/90 backdrop-blur-sm text-ivory text-xs font-bold px-3 py-1 rounded-full">
              {emoji} {style}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white font-black text-3xl">{pet}</p>
            <p className="text-gray-400 text-sm mt-1">{style} style</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {original ? (
            /* Original photo back */
            <>
              <img src={original} alt="Original photo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <div className="absolute top-4 right-4">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm"
                  style={{ background: PAL.ivory, color: PAL.ink }}
                >
                  Original
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-black text-3xl">{pet}</p>
                <p className="text-sm mt-1" style={{ color: PAL.sage }}>Original photo</p>
              </div>
            </>
          ) : (
            /* Archival info card back */
            <div className="w-full h-full flex flex-col" style={{ background: PAL.ivory }}>
              {/* Subtle grid texture */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, ${PAL.ink} 0px, ${PAL.ink} 1px, transparent 1px, transparent 28px),
                                    repeating-linear-gradient(90deg, ${PAL.ink} 0px, ${PAL.ink} 1px, transparent 1px, transparent 28px)`,
                }}
              />
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: PAL.gold }} />

              <div className="relative flex-1 flex flex-col justify-between p-7">
                {/* Style badge */}
                <div>
                  <span
                    className="text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-sm"
                    style={{ background: PAL.sage + '40', color: PAL.ink, border: `1px solid ${PAL.sage}` }}
                  >
                    {style}
                  </span>
                </div>

                {/* Center content */}
                <div>
                  <div
                    className="w-10 h-px mb-6"
                    style={{ background: PAL.gold }}
                  />
                  <p
                    className="font-black text-4xl leading-none mb-2"
                    style={{ color: PAL.ink }}
                  >
                    {pet}
                  </p>
                  <p
                    className="text-sm leading-relaxed mt-4"
                    style={{ color: PAL.ink + 'aa' }}
                  >
                    Transformed into a {style.toLowerCase()} masterpiece<br />by Maîtrepets AI.
                  </p>
                </div>

                {/* Bottom CTA */}
                <div>
                  <div
                    className="w-full py-2.5 rounded text-xs font-black tracking-widest uppercase text-center"
                    style={{ background: PAL.gold, color: PAL.ivory }}
                  >
                    Create Yours →
                  </div>
                  <p
                    className="text-center text-[10px] mt-3 tracking-widest uppercase"
                    style={{ color: PAL.sage }}
                  >
                    Free Preview · No Card Required
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
