import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  Tv, Film, Smartphone, StretchHorizontal, Sparkles
} from 'lucide-react';

export const PropertyVideoShowcase: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [viewMode, setViewMode] = useState<'widescreen' | 'zoom' | 'portrait'>('widescreen');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
    if (!isTheaterMode && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const switchMode = (mode: 'widescreen' | 'zoom' | 'portrait') => {
    if (mode === viewMode) return;
    const currentT = videoRef.current ? videoRef.current.currentTime : 0;
    const wasPlaying = !videoRef.current?.paused;
    setViewMode(mode);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentT;
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    }, 60);
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
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);

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
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Determine video source and sizing class based on viewMode
  const videoSrc = viewMode === 'widescreen'
    ? '/videos/ozar-widescreen-1080p.mp4'
    : '/videos/ozar-clean-1080p.mp4';

  const posterSrc = '/videos/ozar-widescreen-poster.jpg';

  const videoFitClass = viewMode === 'zoom'
    ? 'object-cover object-center'
    : viewMode === 'portrait'
    ? 'object-contain object-center'
    : 'object-cover md:object-contain object-center';

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`w-full relative bg-slate-950 overflow-hidden shadow-2xl select-none group transition-all duration-500 ease-in-out ${
        isTheaterMode 
          ? 'h-[85vh] min-h-[580px] max-h-[920px]' 
          : 'aspect-video min-h-[440px] sm:min-h-[520px] md:h-[640px] lg:h-[740px] xl:h-[800px] max-h-[82vh]'
      }`}
    >
      {/* 1. Main Full-Width Video Element */}
      <video
        key={videoSrc}
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        playsInline
        autoPlay
        muted
        loop
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        className={`w-full h-full ${videoFitClass} cursor-pointer transition-all duration-500`}
      />

      {/* 2. Top-Left: High Definition Quality Badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30 flex items-center gap-2.5 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold tracking-wide text-white">Full HD 1080p</span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-teal-400" />
          <span className="hidden sm:inline-block text-[11px] text-slate-300 font-medium">Toàn cảnh không gian</span>
        </div>
      </div>

      {/* 3. Top-Right Corner: Pure Dwell Logo */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-2 pointer-events-none">
        <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
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
        <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
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
        } bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-14 pb-5 px-4 sm:px-8`}
      >
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Progress Timeline Scrubber */}
          <div 
            onClick={handleSeek}
            className="w-full h-1.5 hover:h-2.5 bg-white/20 hover:bg-white/35 rounded-full cursor-pointer transition-all relative overflow-hidden group/bar"
            title="Tua đến vị trí"
          >
            <div 
              className="h-full bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-white text-xs sm:text-sm">
            {/* Left Controls: Play, Sound, Timer */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Tạm dừng (Space)' : 'Phát tiếp (Space)'}
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                )}
              </button>

              <span className="text-xs text-slate-300 font-mono tracking-wider pl-1">
                {currentTime} / {duration}
              </span>

              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30">
                1080p HD
              </span>
            </div>

            {/* Right Controls: View Mode Switcher, Theater Mode, Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* View Mode Toggle Pill */}
              <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => switchMode('widescreen')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    viewMode === 'widescreen'
                      ? 'bg-teal-500 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title="Chế độ toàn cảnh 16:9 rộng mở, trọn vẹn toàn bộ không gian"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Toàn cảnh 16:9</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('zoom')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    viewMode === 'zoom'
                      ? 'bg-teal-500 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title="Chế độ tràn ngang toàn bộ chiều rộng"
                >
                  <StretchHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tràn ngang</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('portrait')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    viewMode === 'portrait'
                      ? 'bg-teal-500 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title="Chế độ dọc nguyên bản 9:16 nét căng"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chuẩn dọc</span>
                </button>
              </div>

              {/* Theater Mode Toggle */}
              <button
                type="button"
                onClick={toggleTheaterMode}
                className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
                  isTheaterMode 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white/10 hover:bg-white/25 text-slate-200 hover:text-white'
                }`}
                title={isTheaterMode ? 'Thu nhỏ về kích thước chuẩn' : 'Chế độ rạp chiếu (Mở rộng 85% màn hình)'}
              >
                <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/25 text-slate-200 hover:text-white transition-all cursor-pointer"
                title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình (F)'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

