'use client';
import {
  EMOTION_MULTIPLIERS,
  SIZE_MULTIPLIERS,
  URGENCY_FEES,
  calculatePrice,
} from '@/lib/pricing';
import { FRAME_COLORS } from '@/lib/printful';

const Select = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export default function PriceSelector({ emotion, setEmotion, size, setSize, urgency, setUrgency, price, frameColor, setFrameColor, printType, setPrintType }) {
  return (
    <div className="space-y-4">

      {/* Print Type toggle */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Print Type</label>
        <div className="flex gap-2">
          {[
            { id: 'framed', label: 'Framed Poster', icon: '🖼️' },
            { id: 'canvas', label: 'Canvas Print',  icon: '🎨' },
          ].map((t) => (
            <button key={t.id} onClick={() => setPrintType(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${printType === t.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Occasion" value={emotion} onChange={setEmotion}
          options={Object.entries(EMOTION_MULTIPLIERS).map(([v, d]) => ({ value: v, label: d.label }))} />

        <Select label="Print Size" value={size} onChange={setSize} placeholder="Select a size…"
          options={Object.entries(SIZE_MULTIPLIERS).map(([v, d]) => ({ value: v, label: `${d.label} — ${d.desc}` }))} />

        <Select label="Delivery Speed" value={urgency} onChange={setUrgency}
          options={Object.entries(URGENCY_FEES).map(([v, d]) => ({ value: v, label: d.label }))} />

        {/* Frame Color — only for framed posters */}
        {printType === 'framed' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Frame Color</label>
            <div className="flex gap-3 mt-0.5">
              {FRAME_COLORS.map((c) => (
                <button key={c.id} onClick={() => setFrameColor(c.id)} className="flex flex-col items-center gap-1">
                  <span className={`w-8 h-8 rounded-full border-2 transition-all ${frameColor === c.id ? 'scale-110 border-purple-500 shadow-md shadow-purple-200' : 'border-gray-200 hover:border-gray-400'}`}
                    style={{ backgroundColor: c.hex, boxShadow: c.id === 'white' ? 'inset 0 0 0 1px #e5e7eb' : undefined }} />
                  <span className={`text-[10px] font-medium ${frameColor === c.id ? 'text-purple-600' : 'text-gray-400'}`}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
