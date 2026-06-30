import React, { forwardRef } from 'react';
import { Play, Volume2, Maximize, Loader } from 'lucide-react';

const VideoPlayer = forwardRef(({ videoUrl, title }, ref) => {
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoaded = () => {
    setIsLoading(false);
  };

  // Check if URL is from YouTube
  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
  
  // Check if URL is from Vimeo
  const isVimeo = videoUrl?.includes('vimeo.com');

  return (
    <div className="relative aspect-video bg-black rounded-t-card overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Loader className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {isYouTube ? (
        // YouTube Embed
        <iframe
          className="w-full h-full"
          src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoaded}
        />
      ) : isVimeo ? (
        // Vimeo Embed
        <iframe
          className="w-full h-full"
          src={videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
          title={title}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={handleLoaded}
        />
      ) : (
        // HTML5 Video Player (for self-hosted videos)
        <video
          ref={ref}
          className="w-full h-full"
          controls
          onLoadedData={handleLoaded}
          poster="/video-placeholder.jpg"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Video Controls Overlay (only for better UX on HTML5 video) */}
      {!isYouTube && !isVimeo && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-primary transition-colors duration-300">
              <Play className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-primary transition-colors duration-300">
              <Volume2 className="w-5 h-5" />
            </button>
            <div className="flex-1 h-1 bg-white bg-opacity-30 rounded-full cursor-pointer">
              <div className="h-full w-1/3 bg-primary rounded-full" />
            </div>
            <button className="text-white hover:text-primary transition-colors duration-300">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;