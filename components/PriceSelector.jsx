'use client';
import { SIZE_MULTIPLIERS, URGENCY_FEES } from '@/lib/pricing';

const Select = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-sage uppercase tracking-wide mb-1.5">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-ivory border border-sage rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all appearance-none cursor-pointer">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export default function PriceSelector({ size, setSize, urgency, setUrgency }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Print Size" value={size} onChange={setSize} placeholder="Select a size…"
          options={Object.entries(SIZE_MULTIPLIERS).map(([v, d]) => ({ value: v, label: `${d.label} — ${d.desc}` }))} />

        <Select label="Delivery Speed" value={urgency} onChange={setUrgency}
          options={Object.entries(URGENCY_FEES).map(([v, d]) => ({ value: v, label: d.label }))} />
      </div>
    </div>
  );
}
