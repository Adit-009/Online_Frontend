import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Maximize, Minimize } from 'lucide-react';

export default function ProtectedVideoPlayer({ url, title, isYouTube = false, onEnded, showFullscreenButton = false }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      const enterFs = 
        containerRef.current.requestFullscreen?.bind(containerRef.current) ||
        containerRef.current.webkitRequestFullscreen?.bind(containerRef.current) ||
        containerRef.current.mozRequestFullScreen?.bind(containerRef.current) ||
        containerRef.current.msRequestFullscreen?.bind(containerRef.current);
      
      if (enterFs) enterFs();
    } else {
      const exitFs = 
        document.exitFullscreen?.bind(document) ||
        document.webkitExitFullscreen?.bind(document) ||
        document.mozCancelFullScreen?.bind(document) ||
        document.msExitFullscreen?.bind(document);
      
      if (exitFs) exitFs();
    }
  };

  const getSecureEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;

    // Parse YouTube video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    if (!videoId) return null;

    // Build secure embed URL with minimum required params for max compatibility
    const params = new URLSearchParams({
      modestbranding: '1',    // Minimal YouTube branding
      rel: '0',               // No related videos at the end
      showinfo: '0',          // Hide video title/info bar
      fs: '0',                // Disable native fullscreen button (we use our custom one)
      playsinline: '1',       // Play inline on mobile
      autoplay: '0'
    });

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  const embedUrl = isYouTube ? getSecureEmbedUrl(url) : url;

  if (!url) return (
    <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground">
      No video available
    </div>
  );

  return (
    <div
      ref={containerRef}
      key={url} // Force remount if URL changes
      className="relative w-full h-full group bg-black overflow-hidden rounded-lg shadow-2xl"
      onContextMenu={(e) => { e.preventDefault(); return false; }}
      data-testid="protected-video-player"
    >
      {isYouTube && embedUrl ? (
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms allow-popups-to-escape-sandbox"
          data-testid="youtube-embed-iframe"
        />
      ) : (
        <div className="relative w-full h-full">
          <video
            ref={playerRef}
            className="w-full h-full object-contain"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            onContextMenu={(e) => { e.preventDefault(); return false; }}
            controls
            autoPlay={false}
            poster={null}
            onError={(e) => toast.error("Error playing video file")}
            onEnded={() => onEnded && onEnded()}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Premium Fullscreen Button (Same as CoursePlayer) */}
      {showFullscreenButton && (
        <div className="absolute top-4 right-4 z-[10000] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={handleFullscreen}
            className="bg-black/70 hover:bg-black/90 backdrop-blur-md p-3 rounded-xl text-white transition-all active:scale-95 border border-white/30 shadow-2xl flex items-center gap-2"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase tracking-wider">{isFullscreen ? 'Exit' : 'Full Screen'}</span>
          </button>
        </div>
      )}

      {/* Subtle protection overlay at the top (doesn't block play button) */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-10"
        onContextMenu={(e) => { e.preventDefault(); return false; }}
      />
    </div>
  );
}
