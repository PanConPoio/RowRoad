import React, { useState, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  type?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, type = 'video/mp4' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => {
      setError(`Error al cargar el video: ${video.error?.message || 'Desconocido'}`);
    };

    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('error', handleError);
    };
  }, []);

  const handleLoadedMetadata = () => {
    console.log('Video metadata loaded');
  };

  return (
    <div className="video-player">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <video 
          ref={videoRef}
          controls
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full max-h-[500px] object-contain rounded-md"
        >
          <source src={src} type={type} />
          Tu navegador no soporta el elemento de video.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;