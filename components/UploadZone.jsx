'use client';
import { useCallback, useState } from 'react';

export default function UploadZone({ onFile, preview }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFile(file);
  };

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gray-900" style={{ aspectRatio: '4/3' }}>
        <img src={preview} alt="Your pet" className="w-full h-full object-contain" />
        <label className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer hover:bg-white shadow-sm border border-gray-200">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </label>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        dragging ? 'border-purple-500 bg-purple-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/50'
      }`}
      style={{ aspectRatio: '4/3' }}>
      <div className="text-center p-6">
        <div className="text-5xl mb-3">🐾</div>
        <p className="font-semibold text-gray-700 mb-1">Drop your pet photo here</p>
        <p className="text-sm text-gray-500 mb-4">or click to browse</p>
        <span className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg font-medium">Choose Photo</span>
        <p className="text-xs text-gray-400 mt-3">JPG, PNG, WebP · Max 10MB</p>
      </div>
      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleChange} />
    </label>
  );
}
