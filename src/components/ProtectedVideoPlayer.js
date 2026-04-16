import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ProtectedVideoPlayer({ url, title, isYouTube = false, onEnded }) {
  const playerRef = useRef(null);

  useEffect(() => {
    // Optional: You could still set a default playback rate if needed, 
    // but without controls it default to 1.
  }, [url]);

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
            controlsList="nodownload" 
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

      {/* Subtle protection overlay at the top (doesn't block play button) */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 z-10"
        onContextMenu={(e) => { e.preventDefault(); return false; }}
      />
    </div>
  );
}
