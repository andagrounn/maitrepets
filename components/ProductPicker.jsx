'use client';
import { PRODUCT_VARIANTS } from '@/lib/printful';

export default function ProductPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(PRODUCT_VARIANTS).map(([key, product]) => (
        <button key={key} onClick={() => onSelect(key)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            selected === key ? 'border-gold bg-gold/8' : 'border-sage hover:border-gold/40 bg-ivory'
          }`}>
          <p className="font-semibold text-ink text-sm">{product.name}</p>
          <p className="text-gold font-bold mt-0.5">${product.price}</p>
          {key.includes('canvas') && <p className="text-xs text-sage mt-0.5">Premium canvas print</p>}
          {key.includes('poster') && <p className="text-xs text-sage mt-0.5">High-quality poster</p>}
        </button>
      ))}
    </div>
  );
}
