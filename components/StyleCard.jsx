'use client';
import { STYLE_PROMPTS } from '@/lib/replicate';

const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';
const RD = 'https://replicate.delivery/xezq';

const themeImages = {
  // ── Generated pet portraits ──────────────────────────────────────────────
  renaissance:   `${S3}/generated/1774629784284-j1rt4wukw6.png`,
  rococo:        `${S3}/generated/1774660430180-8754kz2iw4t.png`,
  mosaic:        `${S3}/generated/1774673789483-zzvbnopfst.png`,
  cubism:        `${S3}/generated/1774643764809-ln2zqseugf8.png`,
  artinformel:   `${S3}/generated/1774629095050-xzkiul0l8fn.png`,
  vernacularart: `${S3}/generated/1774622686162-jetc92ep4u.png`,
  naiveart:      `${RD}/FPe1wHE73xSSIKm2kbKbTtTeFxify14yQJsJfz49AX4UJMUZB/tmpum6q1mkm.jpg`,
  steampunk:     `${RD}/cHfQpXb5JvwfR0lLA0s22ZR5JnZLEAgcngG1fFdTq5EcN5psA/tmpkaabssf3.jpg`,
  rembrandt:     `${RD}/VzYQixW3ed1oJCb0jMIeDZSV1saHWCTll3b6Tat2kdAXn8UWA/tmpmv_w4lzz.jpg`,
  davinci:       `${S3}/generated/1774629784284-j1rt4wukw6.png`,
  // ── Fallbacks for styles without a dedicated generated image ─────────────
  enhanced:      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&q=80',
  weirdcore:     'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80',
  dadaism:       'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80',
  neoclassicism: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&q=80',
  romanticism:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
  expressionism: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&q=80',
};

export default function StyleCard({ styleKey, selected, onClick, popular = false, compact = false, previewUrl }) {
  const theme = STYLE_PROMPTS[styleKey];
  const imgSrc = previewUrl || themeImages[styleKey];
  return (
    <button
      onClick={() => onClick(styleKey)}
      className={`group relative overflow-hidden aspect-square transition-all duration-200 ${
        compact ? 'rounded-lg' : 'rounded-2xl'
      } ${
        selected ? 'ring-2 ring-purple-500 scale-105 shadow-lg' : 'hover:scale-105 hover:shadow-md'
      }`}
    >
      <img
        src={imgSrc}
        alt={theme.label}
        className="w-full h-full object-cover"
      />
      <div className={`absolute inset-0 transition-all duration-200 ${
        selected ? 'bg-purple-600/40' : 'bg-black/30 group-hover:bg-black/10'
      }`} />
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent ${compact ? 'p-1' : 'p-2.5'}`}>
        <p className={`text-white font-bold leading-tight ${compact ? 'text-[8px]' : 'text-xs'}`}>
          {theme.label}
        </p>
      </div>
      {/* Fire badge — top left */}
      {popular && !selected && (
        <div className={`absolute top-1 left-1 leading-none ${compact ? 'text-xs' : 'text-base'}`} title="Popular style">
          🔥
        </div>
      )}
      {selected && (
        <div className={`absolute bg-purple-500 rounded-full flex items-center justify-center shadow-lg ${compact ? 'top-1 right-1 w-4 h-4' : 'top-2 right-2 w-6 h-6'}`}>
          <svg className={`text-white ${compact ? 'w-2.5 h-2.5' : 'w-4 h-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
