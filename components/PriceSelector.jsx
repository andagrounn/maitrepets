'use client';
import {
  EMOTION_MULTIPLIERS,
  SIZE_MULTIPLIERS,
  URGENCY_FEES,
  calculatePrice,
} from '@/lib/pricing';

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

export default function PriceSelector({ emotion, setEmotion, size, setSize, urgency, setUrgency, price }) {
  // Show strikethrough only when urgency or emotion bumps the price above base
  const basePrice = calculatePrice({ product: 'poster', size, style: 'chibi', petType: 'dog', urgency: 'standard', emotion: 'normal' });
  const saving = basePrice - price > 0 ? basePrice - price : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Occasion" value={emotion} onChange={setEmotion}
          options={Object.entries(EMOTION_MULTIPLIERS).map(([v, d]) => ({ value: v, label: d.label }))} />

        <Select label="Print Size" value={size} onChange={setSize} placeholder="Select a size…"
          options={Object.entries(SIZE_MULTIPLIERS).map(([v, d]) => ({ value: v, label: `${d.label} — ${d.desc}` }))} />

        <Select label="Delivery Speed" value={urgency} onChange={setUrgency}
          options={Object.entries(URGENCY_FEES).map(([v, d]) => ({ value: v, label: d.label }))} />
      </div>

    </div>
  );
}
