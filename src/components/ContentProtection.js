import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const Watermark = ({ text }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
      style={{ opacity: 0.5 }}
      data-testid="watermark-overlay"
    >
      <div className="w-full h-full flex flex-wrap items-center justify-center gap-16 -rotate-[35deg] scale-150 z-[9999]">
        {Array.from({ length: 200 }).map((_, i) => (
          <span key={i} className="text-white text-xl font-bold whitespace-nowrap tracking-widest uppercase z-[9999]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function ContentProtection({ children, showWatermark = false, watermarkText = '' }) {
  const { user } = useAuth();

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const handleKeyDown = useCallback((e) => {
    // Block common screenshot and source viewing shortcuts

    // Ctrl+S (Save), Ctrl+U (View Source), Ctrl+P (Print)
    if (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) {
      e.preventDefault();
      return false;
    }

    // Dev Tools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
      e.preventDefault();
      return false;
    }

    // Ctrl+A (Select All), Ctrl+C (Copy), Ctrl+X (Cut)
    if (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'x')) {
      e.preventDefault();
      return false;
    }

    // PrintScreen
    if (e.key === 'PrintScreen' || e.key === 'Snapshot') {
      e.preventDefault();
      // Clear clipboard if possible (browser dependent)
      navigator.clipboard.writeText("");
      return false;
    }
  }, []);

  const preventDefaults = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  useEffect(() => {
    // Apply protection globally to the document when this component is mounted
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', preventDefaults);
    document.addEventListener('selectstart', preventDefaults);
    document.addEventListener('copy', preventDefaults);
    document.addEventListener('cut', preventDefaults);

    // Disable image dragging globally
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
      img.draggable = false;
      img.oncontextmenu = (e) => e.preventDefault();
    });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', preventDefaults);
      document.removeEventListener('selectstart', preventDefaults);
      document.removeEventListener('copy', preventDefaults);
      document.removeEventListener('cut', preventDefaults);
    };
  }, [handleContextMenu, handleKeyDown, preventDefaults]);

  // Determine the final watermark text
  const platformName = "Third Eye Computer Education";
  const studentName = user && user.name ? user.name : "Student";
  const finalWatermarkText = user ? `${platformName} | ${studentName}` : (watermarkText || platformName);

  return (
    <div
      className="content-protected relative min-h-full w-full"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onContextMenu={handleContextMenu}
      onDragStart={preventDefaults}
      data-testid="content-protection-wrapper"
    >
      {children}
      {showWatermark && <Watermark text={finalWatermarkText} />}
    </div>
  );
}
