'use client';
import { useState, useEffect, useRef } from 'react';

// Maîtrepets → Masterpiece
// M  a  î  t  r  e  p  e  t  s
// M  a  s  t  e  r  p  i  e  c  [+e]

const A = ['M','a','î','t','r','e','p','e','t','s'];
const B = ['M','a','s','t','e','r','p','i','e','c'];

const G1 = [2, 4, 5]; // "Maître" → "Master"  — paint brush reveal
const G2 = [7, 8, 9]; // "pets"   → "piece"   — picture frame flip

const HOLD      = 3200; // ms to hold each word
const BHALF     = 260;  // half-sweep for brush
const FHALF     = 220;  // half-flip  for frame
const S1        = 170;  // stagger between group-1 letters
const S2        = 150;  // stagger between group-2 letters
const INTER_GAP = 700;  // delay between group-1 done → group-2 starts

export default function PaintReveal() {
  const [chars,        setChars]        = useState([...A]);
  // 'idle'|'b-out'|'b-in'|'f-out'|'f-in'
  const [anims,        setAnims]        = useState(Array(10).fill('idle'));
  const [extraVisible, setExtraVisible] = useState(false);
  const [extraAnim,    setExtraAnim]    = useState('hidden');
  const onBRef  = useRef(false);
  const holdRef = useRef(null);

  const setC = (i,v) => setChars(p => { const n=[...p]; n[i]=v; return n; });
  const setA = (i,v) => setAnims(p => { const n=[...p]; n[i]=v; return n; });

  // Paint-brush transition for G1 letters
  function brushFlip(pos, toChar, delay) {
    setTimeout(() => {
      setA(pos, 'b-out');
      setTimeout(() => { setC(pos, toChar); setA(pos, 'b-in');  }, BHALF);
      setTimeout(() => { setA(pos, 'idle'); }, BHALF * 2 + 30);
    }, delay);
  }

  // Picture-frame flip for G2 letters
  function frameFlip(pos, toChar, delay) {
    setTimeout(() => {
      setA(pos, 'f-out');
      setTimeout(() => { setC(pos, toChar); setA(pos, 'f-in');  }, FHALF);
      setTimeout(() => { setA(pos, 'idle'); }, FHALF * 2 + 30);
    }, delay);
  }

  function runCycle() {
    holdRef.current = setTimeout(() => {
      const toB  = !onBRef.current;
      const src  = toB ? B : A;
      const g1   = toB ? G1 : [...G1].reverse();
      const g2   = toB ? G2 : [...G2].reverse();
      const base = toB ? 0  : 400; // hide extra-e first when going back

      if (!toB) {
        setExtraAnim('out');
        setTimeout(() => { setExtraVisible(false); setExtraAnim('hidden'); }, 380);
      }

      // Group 1 — paint brush
      g1.forEach((pos, i) => brushFlip(pos, src[pos], base + i * S1));

      // Group 2 — picture frame  (starts after group-1 fully done + gap)
      const g2start = base + g1.length * S1 + BHALF * 2 + INTER_GAP;
      g2.forEach((pos, i) => frameFlip(pos, src[pos], g2start + i * S2));

      const total = g2start + g2.length * S2 + FHALF * 2 + 80;
      setTimeout(() => {
        if (toB) {
          setExtraVisible(true);
          setExtraAnim('in');
          setTimeout(() => setExtraAnim('show'), 480);
        }
        onBRef.current = toB;
        runCycle();
      }, total);
    }, HOLD);
  }

  useEffect(() => {
    runCycle();
    return () => clearTimeout(holdRef.current);
  }, []);

  return (
    <>
      <style>{`
        /* ── initial awwwards slide-up ───────────────── */
        @keyframes prIn {
          from { transform: translateY(115%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* ── scaleX flip halves ──────────────────────── */
        @keyframes scaleOut {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
        @keyframes scaleIn {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* ── paint brush sweep ───────────────────────── */
        @keyframes brushSweep {
          0%   { transform: translateX(-130%); }
          100% { transform: translateX( 130%); }
        }

        /* ── picture frame glow pulse ────────────────── */
        @keyframes frameGlow {
          0%   { box-shadow: 0 0 0 0px  rgba(218,165,32,0),   0 0 0px  rgba(218,165,32,0);   }
          35%  { box-shadow: 0 0 0 3px  rgba(218,165,32,0.95),0 0 18px rgba(218,165,32,0.45); }
          65%  { box-shadow: 0 0 0 3px  rgba(218,165,32,0.95),0 0 18px rgba(218,165,32,0.45); }
          100% { box-shadow: 0 0 0 0px  rgba(218,165,32,0),   0 0 0px  rgba(218,165,32,0);   }
        }

        /* ── extra 'e' slide ─────────────────────────── */
        @keyframes prUp {
          from { transform: translateY(115%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes prDown {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(115%); opacity: 0; }
        }

        /* ── base classes ────────────────────────────── */
        .pr-clip  { display:inline-block; overflow:hidden; vertical-align:bottom; line-height:1.05; }
        .pr-init  { display:inline-block; opacity:0;
          animation: prIn 0.72s cubic-bezier(0.22,1,0.36,1) forwards; }
        .pr-idle  { display:inline-block; opacity:1; }

        /* ── brush letter ────────────────────────────── */
        .pr-bwrap { position:relative; display:inline-block; }
        .pr-btrack {
          position: absolute;
          inset: -8px -6px;
          overflow: hidden;
          pointer-events: none;
          z-index: 3;
        }
        .pr-bstroke {
          position: absolute;
          inset: 0;
          width: 220%;
          background: linear-gradient(90deg,
            transparent       0%,
            rgba(160,90,10,.95) 12%,
            rgba(210,150,20,1)  32%,
            rgba(230,175,35,1)  50%,
            rgba(210,150,20,1)  68%,
            rgba(160,90,10,.95) 88%,
            transparent       100%
          );
          clip-path: polygon(
            0% 6%, 1.2% 1%, 2.8% 11%, 4.5% 0%, 6% 14%,
            100% 2%,
            100% 86%, 98.8% 98%, 97.2% 82%, 95.5% 96%, 94% 78%,
            0% 93%
          );
          animation: brushSweep ${BHALF * 2}ms cubic-bezier(0.38,0,0.22,1) forwards;
        }
        .pr-bout { animation: scaleOut ${BHALF}ms ease-in  forwards; display:inline-block; }
        .pr-bin  { animation: scaleIn  ${BHALF}ms ease-out forwards; display:inline-block; }

        /* ── frame letter ────────────────────────────── */
        .pr-fwrap {
          position: relative;
          display: inline-block;
          border-radius: 2px;
        }
        .pr-fwrap.pr-framing {
          animation: frameGlow ${FHALF * 2 + 40}ms ease-in-out forwards;
        }
        .pr-fout { animation: scaleOut ${FHALF}ms ease-in  forwards; display:inline-block; }
        .pr-fin  { animation: scaleIn  ${FHALF}ms ease-out forwards; display:inline-block; }

        /* ── extra 'e' ───────────────────────────────── */
        .pr-ein  { animation: prUp   0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
        .pr-eout { animation: prDown 0.32s ease-in forwards; }
        .pr-esh  { opacity:1; }
      `}</style>

      <div style={{
        fontSize:   'clamp(2.8rem, 9vw, 8rem)',
        fontWeight: 900,
        color:      '#fff',
        whiteSpace: 'nowrap',
        lineHeight: 1.05,
        display:    'inline-flex',
        alignItems: 'flex-end',
      }}>
        {chars.map((char, i) => {
          const a = anims[i];

          /* ── Group 1: paint brush ── */
          if (G1.includes(i)) {
            const brushing = a === 'b-out' || a === 'b-in';
            return (
              <span key={i} className="pr-clip">
                <span className="pr-bwrap">
                  {brushing && (
                    <span className="pr-btrack" key={`bt-${i}-${a}`}>
                      <span className="pr-bstroke" />
                    </span>
                  )}
                  <span key={`bc-${i}-${a}`}
                    className={a === 'b-out' ? 'pr-bout' : a === 'b-in' ? 'pr-bin' : 'pr-idle'}>
                    {char}
                  </span>
                </span>
              </span>
            );
          }

          /* ── Group 2: picture frame ── */
          if (G2.includes(i)) {
            const framing = a === 'f-out' || a === 'f-in';
            return (
              <span key={i} className="pr-clip">
                <span className={`pr-fwrap${framing ? ' pr-framing' : ''}`}>
                  <span key={`fc-${i}-${a}`}
                    className={a === 'f-out' ? 'pr-fout' : a === 'f-in' ? 'pr-fin' : 'pr-idle'}>
                    {char}
                  </span>
                </span>
              </span>
            );
          }

          /* ── Static chars: awwwards slide-up ── */
          return (
            <span key={i} className="pr-clip">
              <span className="pr-init" style={{ animationDelay: `${i * 0.055}s` }}>
                {char}
              </span>
            </span>
          );
        })}

        {/* trailing 'e' — appears in "piece" */}
        <span className="pr-clip">
          {extraVisible && (
            <span className={
              extraAnim === 'in'  ? 'pr-ein' :
              extraAnim === 'out' ? 'pr-eout': 'pr-esh'
            }>e</span>
          )}
        </span>
      </div>
    </>
  );
}
