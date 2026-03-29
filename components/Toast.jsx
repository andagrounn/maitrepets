'use client';
import { useEffect, useState } from 'react';

const CONFIG = {
  error: {
    bg:   'bg-gray-900',
    bar:  'bg-red-500',
    text: 'text-white',
    icon: (
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </span>
    ),
  },
  success: {
    bg:   'bg-gray-900',
    bar:  'bg-green-500',
    text: 'text-white',
    icon: (
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
        </svg>
      </span>
    ),
  },
  warning: {
    bg:   'bg-gray-900',
    bar:  'bg-yellow-400',
    text: 'text-white',
    icon: (
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </span>
    ),
  },
  info: {
    bg:   'bg-gray-900',
    bar:  'bg-blue-400',
    text: 'text-white',
    icon: (
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-400/20 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </span>
    ),
  },
};

export function Toast({ message, type = 'error', onDismiss, duration = 4000 }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const c = CONFIG[type] || CONFIG.info;

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    setProgress(100);

    // Shrink progress bar
    const step = 100 / (duration / 50);
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.max(0, p - step));
    }, 50);

    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);

    return () => { clearTimeout(hide); clearInterval(progressTimer); };
  }, [message]);

  if (!message) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <div className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium max-w-xs overflow-hidden ${c.bg} ${c.text}`}>
        {c.icon}
        <span className="flex-1 leading-snug">{message}</span>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full opacity-40 hover:opacity-80 transition-opacity text-white"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
          </svg>
        </button>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-50" style={{ width: `${progress}%`, background: c.bar.replace('bg-', '') }} />
        <div className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full ${c.bar}`} style={{ width: `${progress}%`, transition: 'width 50ms linear' }} />
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  function showToast(message, type = 'error') {
    setToast({ message, type, id: Date.now() });
  }
  function dismiss() { setToast(null); }
  return { toast, showToast, dismiss };
}
