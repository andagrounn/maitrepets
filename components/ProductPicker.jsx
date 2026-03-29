'use client';
import { PRODUCT_VARIANTS } from '@/lib/printful';

export default function ProductPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(PRODUCT_VARIANTS).map(([key, product]) => (
        <button key={key} onClick={() => onSelect(key)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            selected === key ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}>
          <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
          <p className="text-purple-600 font-bold mt-0.5">${product.price}</p>
          {key.includes('canvas') && <p className="text-xs text-gray-400 mt-0.5">Premium canvas print</p>}
          {key.includes('poster') && <p className="text-xs text-gray-400 mt-0.5">High-quality poster</p>}
        </button>
      ))}
    </div>
  );
}
