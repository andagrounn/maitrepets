// ── Single source of truth for product pricing ──────────────────────────────
export const PRODUCT_PRICES = {
  framed: {
    label:      'Framed Canvas',
    printLabel: 'Printful Framed Canvas',
    sizes: {
      small:   { sell: 59.99,  printful: 16.95, desc: '8×10"'  },
      medium:  { sell: 74.99,  printful: 21.50, desc: '11×14"' },
      large:   { sell: 94.99,  printful: 28.95, desc: '16×20"' },
      xlarge:  { sell: 119.99, printful: 35.50, desc: '18×24"' },
      xxlarge: { sell: 159.99, printful: 52.95, desc: '24×36"' },
    },
  },
  canvas: {
    label:      'Thin Canvas',
    printLabel: 'Printful Thin Canvas Print',
    sizes: {
      small:   { sell: 44.99,  printful: 11.95, desc: '8×10"'  },
      medium:  { sell: 54.99,  printful: 15.50, desc: '11×14"' },
      large:   { sell: 69.99,  printful: 21.95, desc: '16×20"' },
      xlarge:  { sell: 89.99,  printful: 28.50, desc: '18×24"' },
      xxlarge: { sell: 124.99, printful: 42.95, desc: '24×36"' },
    },
  },
};

export const SIZE_MULTIPLIERS = {
  small:  { label: 'Small',       desc: '8×10"',   productKey: 'poster-8x10'  },
  medium: { label: 'Medium',      desc: '11×14"',  productKey: 'poster-11x14' },
  large:  { label: 'Large',       desc: '16×20"',  productKey: 'poster-16x20' },
  xlarge: { label: 'Extra Large', desc: '18×24"',  productKey: 'poster-18x24' },
  xxlarge:{ label: 'Jumbo',       desc: '24×36"',  productKey: 'poster-24x36' },
};

export const THEME_MULTIPLIERS = {
  chibi:       { mul: 1.2, label: 'Chibi' },
  naiveart:    { mul: 1.2, label: 'Naive Art' },
  kawaii:      { mul: 1.2, label: 'Kawaii' },
  mosaic:      { mul: 1.4, label: 'Mosaic' },
  steampunk:   { mul: 1.4, label: 'Steampunk' },
  doodleart:   { mul: 1.3, label: 'Doodle Art' },
  folkart:     { mul: 1.3, label: 'Folk Art' },
  lofiart:     { mul: 1.2, label: 'Lofi Art' },
  comicbook:   { mul: 1.3, label: 'Comic Book' },
  dadaism:     { mul: 1.4, label: 'Dadaism' },
  renaissance: { mul: 1.5, label: 'Renaissance' },
};

export const PET_MULTIPLIERS = {
  dog:   { mul: 1.2, label: '🐶 Dog' },
  cat:   { mul: 1.1, label: '🐱 Cat' },
  other: { mul: 1.0, label: 'Other' },
};

export const EMOTION_MULTIPLIERS = {
  normal:   { mul: 1.0, label: 'Just for me',             badge: null },
  gift:     { mul: 1.2, label: '🎁 Gift for someone',     badge: 'Gift' },
  memorial: { mul: 1.5, label: '🕊️ In memory of my pet', badge: 'Memorial' },
};

export const URGENCY_FEES = {
  standard: { fee: 0,  label: 'Standard (7–10 days)',    badge: null },
  fast:     { fee: 10, label: 'Fast (3–5 days) +$10',    badge: '⚡ Fast' },
  express:  { fee: 25, label: 'Express (1–2 days) +$25', badge: '🚀 Express' },
};

export function calculatePrice({ size = 'large', urgency = 'standard', product = 'framed' } = {}) {
  const base    = PRODUCT_PRICES[product]?.sizes[size]?.sell ?? 79.99;
  const rushFee = URGENCY_FEES[urgency]?.fee ?? 0;
  return Math.round(base + rushFee);
}

export function getPriceBreakdown(params) {
  const { product = 'poster', size = 'large', style = 'titanic', petType = 'dog', urgency = 'standard', emotion = 'normal' } = params;
  const base     = BASE_PRICES[product] ?? BASE_PRICES.poster;
  const sizeMul  = SIZE_MULTIPLIERS[size]?.mul ?? 1.4;
  const themeMul = THEME_MULTIPLIERS[style]?.mul ?? 1.3;
  const petMul   = PET_MULTIPLIERS[petType]?.mul ?? 1.0;
  const emotMul  = EMOTION_MULTIPLIERS[emotion]?.mul ?? 1.0;
  const rushFee  = URGENCY_FEES[urgency]?.fee ?? 0;

  return [
    { label: 'Base price',                                              value: `$${base}` },
    sizeMul  !== 1 && { label: `Size (${SIZE_MULTIPLIERS[size]?.label})`,     value: `×${sizeMul}` },
    themeMul !== 1 && { label: `Theme (${THEME_MULTIPLIERS[style]?.label})`,  value: `×${themeMul}` },
    petMul   !== 1 && { label: 'Pet type',                                    value: `×${petMul}` },
    emotMul  !== 1 && { label: EMOTION_MULTIPLIERS[emotion]?.label,           value: `×${emotMul}` },
    rushFee  >   0 && { label: URGENCY_FEES[urgency]?.label,                  value: `+$${rushFee}` },
  ].filter(Boolean);
}
