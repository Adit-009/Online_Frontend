import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings2, Maximize, Minimize } from 'lucide-react';

export default function ProtectedVideoPlayer({ url, title, isYouTube = false, onEnded }) {
  const videoRef = useRef(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const speedOptions = [1, 1.25, 1.5, 2, 3];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, url]); // Re-apply when speed or video changes

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
      fs: '0',                // Disable native fullscreen button
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
            ref={videoRef}
            className="w-full h-full object-contain"
            controlsList="nodownload nofullscreen" // Force our custom container fullscreen
            disablePictureInPicture
            disableRemotePlayback
            onContextMenu={(e) => { e.preventDefault(); return false; }}
            controls
            autoPlay={false}
            poster={null}
            onError={(e) => toast.error("Error playing video file")}
            onEnded={() => onEnded && onEnded()}
            onLoadedMetadata={() => {
              if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
            }}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Custom Playback Speed Control Overlay */}
          <div className="absolute right-4 bottom-16 sm:bottom-20 z-20 flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {showSpeedMenu && (
              <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg shadow-xl mb-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackSpeed(speed);
                      setShowSpeedMenu(false);
                      toast.success(`Speed set to ${speed}x`);
                    }}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                      playbackSpeed === speed 
                        ? 'bg-primary text-primary-foreground font-bold' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="bg-background/50 hover:bg-background/80 backdrop-blur-sm border border-border p-2 rounded-full text-foreground shadow-lg transition-all active:scale-95"
              title="Playback Speed"
            >
              <Settings2 className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1 rounded-full">
                {playbackSpeed}x
              </span>
            </button>
            
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  containerRef.current.requestFullscreen().catch(err => {
                    toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
                  });
                  setIsFullscreen(true);
                } else {
                  document.exitFullscreen();
                  setIsFullscreen(false);
                }
              }}
              className="mt-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm border border-border p-2 rounded-full text-foreground shadow-lg transition-all active:scale-95"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
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
