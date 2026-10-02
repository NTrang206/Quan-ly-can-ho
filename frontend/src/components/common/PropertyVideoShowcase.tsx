import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, 
  StretchHorizontal, Square
} from 'lucide-react';

export const PropertyVideoShowcase: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    // Seamlessly loop before the outro text at the end of the video
    if (current >= 26.0) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      return;
    }
    if (dur > 0) {
      const maxDuration = Math.min(dur, 26.0);
      setProgress((current / maxDuration) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(formatTime(Math.min(videoRef.current.duration, 26.0)));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const targetPercent = Math.max(0, Math.min(1, clickX / width));
    const maxDuration = Math.min(videoRef.current.duration, 26.0);
    videoRef.current.currentTime = targetPercent * maxDuration;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full relative bg-slate-950 overflow-hidden shadow-2xl select-none group h-[280px] sm:h-[340px] md:h-[380px] lg:h-[400px]"
    >
      {/* 1. Main Full-Width Video Element */}
      <video
        ref={videoRef}
        src="/videos/ozar-clean-delogo.mp4"
        poster="/videos/ozar-luxury-apartments-poster.jpg"
        playsInline
        autoPlay
        muted
        loop
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        className={`w-full h-full ${
          fitMode === 'cover' ? 'object-cover object-center' : 'object-contain'
        } cursor-pointer transition-all duration-500`}
      />

      {/* 2. Top-Right Corner: Pure Dwell Logo (no black box, no Living badge) */}
      <div className="absolute top-3 right-4 sm:top-5 sm:right-7 z-30 flex items-center gap-2 pointer-events-none">
        <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6">
            <rect x="13" y="8" width="18" height="34" rx="2" fill="#0284c7" />
            <rect x="25" y="16" width="13" height="26" rx="1.5" fill="#38bdf8" />
            <rect x="16" y="12" width="3" height="3" rx="0.5" fill="white" />
            <rect x="21" y="12" width="3" height="3" rx="0.5" fill="white" />
            <rect x="16" y="18" width="3" height="3" rx="0.5" fill="white" />
            <rect x="21" y="18" width="3" height="3" rx="0.5" fill="white" />
            <rect x="16" y="24" width="3" height="3" rx="0.5" fill="white" />
            <rect x="21" y="24" width="3" height="3" rx="0.5" fill="white" />
            <rect x="16" y="30" width="3" height="3" rx="0.5" fill="white" />
            <rect x="21" y="30" width="3" height="3" rx="0.5" fill="white" />
            <path d="M9 42H39" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          Dwell
        </span>
      </div>

      {/* 4. Center Play/Pause Indicator (when paused) */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-teal-600/90 hover:bg-teal-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all transform hover:scale-110 active:scale-95 z-30 cursor-pointer"
          title="Bấm để phát video"
        >
          <Play className="w-10 h-10 ml-1.5 text-white" />
        </button>
      )}

      {/* 5. Bottom Overlay Floating Controls Bar */}
      <div 
        className={`absolute bottom-0 inset-x-0 z-30 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-12 pb-5 px-4 sm:px-8`}
      >
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Progress Timeline Scrubber */}
          <div 
            onClick={handleSeek}
            className="w-full h-1.5 hover:h-2.5 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition-all relative overflow-hidden group/bar"
            title="Tua đến vị trí"
          >
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-sky-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls Buttons */}
          <div className="flex items-center justify-between text-white text-xs sm:text-sm">
            {/* Left Controls: Play, Sound, Timer */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
                title={isPlaying ? 'Tạm dừng (Space)' : 'Phát tiếp (Space)'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-slate-300" />
                ) : (
                  <Volume2 className="w-5 h-5 text-teal-400" />
                )}
              </button>

              <span className="text-xs text-slate-300 font-mono tracking-wider pl-1">
                {currentTime} / {duration}
              </span>
            </div>

            {/* Right Controls: Fit Toggle & Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFitMode(fitMode === 'cover' ? 'contain' : 'cover')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-xs font-medium transition-colors cursor-pointer"
                title={fitMode === 'cover' ? 'Chuyển sang xem nguyên khung (Contain)' : 'Chuyển sang tràn viền toàn màn hình (Cover)'}
              >
                {fitMode === 'cover' ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-teal-300" />
                    <span className="hidden sm:inline">Tràn ngang (Cover)</span>
                  </>
                ) : (
                  <>
                    <StretchHorizontal className="w-3.5 h-3.5 text-sky-300" />
                    <span className="hidden sm:inline">Vừa khung (Contain)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
                title="Toàn màn hình"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
