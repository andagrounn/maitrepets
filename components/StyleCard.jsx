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
  comicbook:   'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&q=80',
  dadaism:     'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80',
  renaissance: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400&q=80',
};

export default function StyleCard({ styleKey, selected, onClick, popular = false }) {
  const theme = STYLE_PROMPTS[styleKey];
  return (
    <button
      onClick={() => onClick(styleKey)}
      className={`group relative overflow-hidden rounded-2xl aspect-square transition-all duration-200 ${
        selected ? 'ring-4 ring-purple-500 scale-105 shadow-xl' : 'hover:scale-105 hover:shadow-lg'
      }`}
    >
      <img
        src={themeImages[styleKey]}
        alt={theme.label}
        className="w-full h-full object-cover"
      />
      <div className={`absolute inset-0 transition-all duration-200 ${
        selected ? 'bg-purple-600/40' : 'bg-black/30 group-hover:bg-black/10'
      }`} />
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white font-bold text-xs leading-tight">
          {theme.emoji} {theme.label}
        </p>
      </div>
      {/* Fire badge — top left */}
      {popular && !selected && (
        <div className="absolute top-1.5 left-1.5 text-base leading-none" title="Popular style">
          🔥
        </div>
      )}
      {selected && (
        <div className="absolute top-2 right-2 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
