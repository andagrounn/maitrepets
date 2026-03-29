'use client';
import { STYLE_PROMPTS } from '@/lib/replicate';

const themeImages = {
  chibi:       'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
  naiveart:    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80',
  kawaii:      'https://images.unsplash.com/photo-1596079890701-dd42edf4f0a8?w=400&q=80',
  mosaic:      'https://images.unsplash.com/photo-1558618047-f4e90e8c80be?w=400&q=80',
  steampunk:   'https://images.unsplash.com/photo-1509515837298-2c67a3933321?w=400&q=80',
  doodleart:   'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80',
  folkart:     'https://images.unsplash.com/photo-1551913902-c92207136625?w=400&q=80',
  lofiart:     'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80',
  rembrandt:   'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&q=80',
  dadaism:     'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80',
  renaissance:   'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400&q=80',
  neoclassicism: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&q=80',
  davinci:       'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400&q=80',
  romanticism:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
  expressionism: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&q=80',
  rococo:        'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&q=80',
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
