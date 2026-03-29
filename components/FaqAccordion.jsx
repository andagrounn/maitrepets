'use client';
import { useState } from 'react';

const faqs = [
  { q: 'What kind of photo should I upload?',  a: "A clear, front-facing photo with good lighting works best. Make sure your pet's face is visible and in focus." },
  { q: 'How long does shipping take?',          a: 'Standard framed prints ship within 3–5 business days and arrive in 7–10 days. Express options available at checkout.' },
  { q: 'Can I get a refund?',                  a: 'Physical prints that arrive damaged or defective are eligible for a full replacement or refund. Digital downloads are non-refundable once delivered.' },
  { q: 'What sizes are available?',             a: 'We offer framed canvas prints in 8×10, 11×14, 16×20, 18×24, and 24×36 inches. Thin canvas prints (no frame) are also available at checkout.' },
  { q: 'How does the AI work?',                a: "Our proprietary AI model analyzes your pet's unique features — coat, eyes, expression, and personality — then renders a stunning portrait in your chosen art style at full HD resolution." },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              isOpen ? 'border-purple-500/40 bg-purple-900/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
            >
              <span className={`font-bold text-sm md:text-base transition-colors ${isOpen ? 'text-white' : 'text-gray-200'}`}>
                {faq.q}
              </span>
              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                isOpen ? 'bg-purple-600 rotate-45' : 'bg-white/10'
              }`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="6" y1="1" x2="6" y2="11"/>
                  <line x1="1" y1="6" x2="11" y2="6"/>
                </svg>
              </span>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <div className="px-6 pb-5">
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
