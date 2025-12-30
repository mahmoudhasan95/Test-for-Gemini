import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

declare global {
  interface Window {
    WaveSurfer: any;
  }
}

interface WaveformPlayerProps {
  audioUrl: string;
  height?: number;
  showPlayButton?: boolean;
  compact?: boolean;
}

export function WaveformPlayer({
  audioUrl,
  height = 80,
  showPlayButton = true,
  compact = false
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const playerIdRef = useRef<string>(`player-${Date.now()}-${Math.random()}`);
  const { registerPlayer, unregisterPlayer, notifyPlaying } = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setError(null);
    setIsReady(false);
    setIsLoading(true);
    setProgress(0);
    setCurrentTime('0:00');
    setIsPlaying(false);

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!containerRef.current || !window.WaveSurfer) {
      return;
    }

    const wavesurfer = window.WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#9ca3af',
      progressColor: '#4b5563',
      cursorColor: '#1f2937',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: height,
      barGap: 2,
      responsive: true,
      normalize: true,
      backend: 'MediaElement',
      mediaControls: false,
    });

    wavesurferRef.current = wavesurfer;

    const loadTimeout = setTimeout(() => {
      if (!isReady) {
        console.error('Audio failed to load within 30 seconds');
      }
    }, 30000);

    wavesurfer.load(audioUrl);

    const mediaElement = wavesurfer.getMediaElement();
    if (mediaElement) {
      mediaElement.setAttribute('playsinline', 'true');
      mediaElement.setAttribute('webkit-playsinline', 'true');
      mediaElement.setAttribute('preload', 'metadata');
      mediaElement.setAttribute('crossorigin', 'anonymous');
      mediaElement.volume = 1.0;
      mediaElement.muted = false;
    }

    wavesurfer.on('ready', () => {
      clearTimeout(loadTimeout);
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
      setIsReady(true);
      setIsLoading(false);
      setError(null);
      setDuration(formatTime(wavesurfer.getDuration()));
      setProgress(0);

      const resetVisualState = () => {
        if (wavesurfer.isPlaying()) {
          wavesurfer.pause();
        }
        wavesurfer.seekTo(0);
        setProgress(0);
        setCurrentTime('0:00');
        setIsPlaying(false);
      };

      const playerWithReset = {
        ...wavesurfer,
        reset: resetVisualState
      };

      registerPlayer(playerIdRef.current, playerWithReset);

      const mediaElement = wavesurfer.getMediaElement();
      if (mediaElement) {
        mediaElement.volume = 1.0;
        mediaElement.muted = false;
      }
    });

    const updateProgress = () => {
      if (!isDraggingRef.current) {
        const current = wavesurfer.getCurrentTime();
        const total = wavesurfer.getDuration();
        setCurrentTime(formatTime(current));
        if (total > 0) {
          setProgress((current / total) * 100);
        }
      }
    };

    wavesurfer.on('audioprocess', updateProgress);
    wavesurfer.on('seek', updateProgress);
    wavesurfer.on('interaction', updateProgress);

    const startProgressLoop = () => {
      const loop = () => {
        if (wavesurfer && wavesurfer.isPlaying()) {
          updateProgress();
          animationFrameRef.current = requestAnimationFrame(loop);
        }
      };
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    const stopProgressLoop = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    wavesurfer.on('play', () => {
      setIsPlaying(true);
      startProgressLoop();
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
      stopProgressLoop();
      updateProgress();
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
      stopProgressLoop();
      setProgress(100);
    });

    wavesurfer.on('error', (err: any) => {
      if (err.name !== 'AbortError') {
        console.error('WaveSurfer error:', err);
      }
    });

    if (mediaElement) {
      mediaElement.addEventListener('error', (e: any) => {
        const errorCode = mediaElement.error?.code;
        const errorMessage = mediaElement.error?.message || 'Unknown error';
        console.error('Audio element error:', { event: e, error: mediaElement.error, code: errorCode, message: errorMessage });
      });
    }

    return () => {
      clearTimeout(loadTimeout);
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      unregisterPlayer(playerIdRef.current);
      if (wavesurfer) {
        wavesurfer.stop();
        wavesurfer.destroy();
      }
    };
  }, [audioUrl, height, registerPlayer, unregisterPlayer, notifyPlaying]);

  const togglePlayPause = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wavesurferRef.current) {
      const isCurrentlyPlaying = wavesurferRef.current.isPlaying();
      if (!isCurrentlyPlaying) {
        notifyPlaying(playerIdRef.current);

        const mediaElement = wavesurferRef.current.getMediaElement();
        if (mediaElement) {
          mediaElement.volume = 1.0;
          mediaElement.muted = false;
        }

        try {
          await wavesurferRef.current.play();
        } catch (error) {
          console.error('Error starting playback:', error);
          setError('Failed to play audio. Please try again.');
        }
      } else {
        wavesurferRef.current.pause();
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
      const mediaElement = wavesurferRef.current.getMediaElement();
      if (mediaElement) {
        mediaElement.volume = newVolume;
      }
    }
  };

  const handleWaveformClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const seekToPosition = (clientX: number) => {
    if (!progressBarRef.current || !wavesurferRef.current || !isReady) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const duration = wavesurferRef.current.getDuration();
    const seekTime = (percentage / 100) * duration;

    wavesurferRef.current.seekTo(percentage / 100);
    setProgress(percentage);
    setCurrentTime(formatTime(seekTime));
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    seekToPosition(e.clientX);
  };

  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    isDraggingRef.current = true;
    seekToPosition(e.clientX);
  };

  const handleProgressBarTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    isDraggingRef.current = true;
    if (e.touches.length > 0) {
      seekToPosition(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      seekToPosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        seekToPosition(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      isDraggingRef.current = false;
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isReady]);

  if (compact) {
    return (
      <div className="w-full relative" onClick={handleWaveformClick}>
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-50"
            style={{ height: `${height}px` }}
          >
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              Loading...
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full cursor-pointer"
          style={{ minHeight: `${height}px`, opacity: isReady ? 1 : 0 }}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-3" onClick={handleWaveformClick}>
      <div className="flex items-center gap-4">
        {showPlayButton && (
          <button
            onClick={togglePlayPause}
            disabled={!isReady}
            className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" fill="white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            )}
          </button>
        )}
        <div className="flex-1 relative">
          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded"
              style={{ height: `${height}px` }}
            >
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                Loading...
              </div>
            </div>
          )}
          <div
            ref={containerRef}
            className="w-full cursor-pointer"
            style={{ minHeight: `${height}px`, opacity: isReady ? 1 : 0 }}
          />
        </div>
      </div>

      <div
        ref={progressBarRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
        onClick={handleProgressBarClick}
        onMouseDown={handleProgressBarMouseDown}
        onTouchStart={handleProgressBarTouchStart}
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-600 to-gray-800 rounded-full"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-900 rounded-full shadow-lg transition-transform group-hover:scale-125"
          style={{
            left: `calc(${progress}% - 8px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="font-mono">{currentTime}</span>
        <div
          className="flex items-center gap-2"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Volume2 className="w-4 h-4 text-gray-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
          />
        </div>
        <span className="font-mono">{duration}</span>
      </div>
    </div>
  );
}
