'use client';
import {
  EMOTION_MULTIPLIERS,
  SIZE_MULTIPLIERS,
  URGENCY_FEES,
  calculatePrice,
} from '@/lib/pricing';

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer">
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

        <Select label="Print Size" value={size} onChange={setSize}
          options={Object.entries(SIZE_MULTIPLIERS).map(([v, d]) => ({ value: v, label: `${d.label} — ${d.desc}` }))} />

        <Select label="Delivery Speed" value={urgency} onChange={setUrgency}
          options={Object.entries(URGENCY_FEES).map(([v, d]) => ({ value: v, label: d.label }))} />
      </div>

      {/* Live Price Display */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5 text-center">
        <p className="text-sm text-gray-500 mb-0.5">Your price</p>
        <div className="flex items-center justify-center gap-3">
          {saving && <span className="text-gray-400 line-through text-lg">${basePrice}</span>}
          <span className="text-4xl font-black text-purple-600">${price}</span>
        </div>
        {saving && (
          <div className="inline-block mt-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-0.5 rounded-full">
            You save ${saving} 🎉
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">Limited-time offer</p>
      </div>
    </div>
  );
}
