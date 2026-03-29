'use client';
import { useState, useEffect, useRef } from 'react';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'TT', name: 'Trinidad & Tobago' },
  { code: 'BB', name: 'Barbados' },
];

export default function ShippingForm({ data, onChange, onSubmit, onBack, loading, productKey, price }) {
  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  const [rates, setRates]           = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const debounceRef = useRef(null);

  // Address is complete enough to fetch rates
  const canFetchRates = data.country && data.zip && data.city;

  // Fetch shipping rates whenever address fields change
  useEffect(() => {
    if (!canFetchRates) { setRates([]); setSelectedRate(null); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setRatesLoading(true);
      setRatesError(null);
      try {
        const res = await fetch('/api/shipping-rates', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productKey, shipping: data }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch rates');
        setRates(json.rates || []);
        // Auto-select the cheapest (first) rate
        if (json.rates?.length > 0) {
          setSelectedRate(json.rates[0]);
          onChange({ ...data, shippingMethod: json.rates[0].id, shippingRate: json.rates[0].rate });
        }
      } catch (err) {
        setRatesError(err.message);
        setRates([]);
      } finally {
        setRatesLoading(false);
      }
    }, 700);

    return () => clearTimeout(debounceRef.current);
  }, [data.country, data.zip, data.city, data.state, productKey]);

  function pickRate(rate) {
    setSelectedRate(rate);
    onChange({ ...data, shippingMethod: rate.id, shippingRate: rate.rate });
  }

  const shippingCost = selectedRate ? parseFloat(selectedRate.rate) : 0;
  const total = price ? (parseFloat(price) + shippingCost).toFixed(2) : null;

  const valid = data.name && data.address1 && data.city && data.zip && data.country && selectedRate;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Shipping Address</h2>
        <p className="text-gray-500 text-sm">Where should we send your portrait?</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Full name */}
        <div>
          <label className="label">Full Name *</label>
          <input className="input" placeholder="Jane Smith" value={data.name || ''} onChange={set('name')} />
        </div>

        {/* Address */}
        <div>
          <label className="label">Address Line 1 *</label>
          <input className="input" placeholder="123 Main Street" value={data.address1 || ''} onChange={set('address1')} />
        </div>
        <div>
          <label className="label">Address Line 2</label>
          <input className="input" placeholder="Apt, Suite, Unit (optional)" value={data.address2 || ''} onChange={set('address2')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City *</label>
            <input className="input" placeholder="Miami" value={data.city || ''} onChange={set('city')} />
          </div>
          <div>
            <label className="label">State / Province</label>
            <input className="input" placeholder="FL" value={data.state || ''} onChange={set('state')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">ZIP / Postal Code *</label>
            <input className="input" placeholder="33101" value={data.zip || ''} onChange={set('zip')} />
          </div>
          <div>
            <label className="label">Country *</label>
            <select className="input" value={data.country || 'US'} onChange={set('country')}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" placeholder="+1 305 000 0000" value={data.phone || ''} onChange={set('phone')} />
        </div>
      </div>

      {/* ── Shipping Rates ── */}
      <div>
        <label className="label">Shipping Method *</label>

        {!canFetchRates && (
          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
            Enter your city, ZIP, and country to see shipping options.
          </p>
        )}

        {canFetchRates && ratesLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
            <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Calculating shipping rates…
          </div>
        )}

        {canFetchRates && ratesError && (
          <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3">{ratesError}</p>
        )}

        {rates.length > 0 && (
          <div className="space-y-2 mt-1">
            {rates.map((rate) => {
              const isSelected = selectedRate?.id === rate.id;
              return (
                <button
                  key={rate.id}
                  type="button"
                  onClick={() => pickRate(rate)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm text-left transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
                    </div>
                    <div>
                      <p className="font-medium">{rate.name}</p>
                      {rate.minDeliveryDate && (
                        <p className="text-xs text-gray-400">
                          Est. delivery: {rate.minDeliveryDate} – {rate.maxDeliveryDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">${parseFloat(rate.rate).toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Order total */}
      {selectedRate && total && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Portrait</span>
            <span>${parseFloat(price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping ({selectedRate.id})</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
      )}

      {/* Trust */}
      <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
        <span>🔒</span>
        <span>Your address is only used for shipping. Never shared or sold.</span>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1 py-3">← Back</button>
        <button onClick={onSubmit} disabled={!valid || loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2.5">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pay ${total || price} <span className="opacity-70">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
