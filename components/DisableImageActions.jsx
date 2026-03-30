'use client';
import { useEffect } from 'react';

export default function DisableImageActions() {
  useEffect(() => {
    function block(e) {
      if (e.target.tagName === 'IMG') e.preventDefault();
    }
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);
  return null;
}
