import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import mpegts from 'mpegts.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Radio,
  ChevronLeft,
  ChevronRight,
  Tv,
  AlertCircle,
  RotateCcw,
  PictureInPicture2,
  Sliders,
  Sparkles,
  Zap,
  Shield,
  Activity,
  RefreshCw,
  Layers,
  Share2,
  LayoutGrid,
} from 'lucide-react';
import { Channel, AspectRatio, PlaybackMode, QualityLevel } from '../types';
import { StatsOverlay } from './player/StatsOverlay';
import { QuickChannelSurf } from './player/QuickChannelSurf';

interface VideoPlayerProps {
  currentChannel: Channel | null;
  channels: Channel[];
  onNextChannel: () => void;
  onPrevChannel: () => void;
  onSelectChannel: (channel: Channel) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  totalChannels: number;
  isMiniPlayer?: boolean;
  onExpandPlayer?: () => void;
  onOpenAllChannels?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentChannel,
  channels,
  onNextChannel,
  onPrevChannel,
  onSelectChannel,
  onToggleSidebar,
  isSidebarOpen,
  totalChannels,
  isMiniPlayer = false,
  onExpandPlayer,
  onOpenAllChannels,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const mpegtsRef = useRef<mpegts.Player | null>(null);

  // Audio Boost Web Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [volumeBoost, setVolumeBoost] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [activeEngine, setActiveEngine] = useState<'HLS.js Live' | 'MPEG-TS Live' | 'HTML5 Native'>('HLS.js Live');
  const [showOsd, setShowOsd] = useState<boolean>(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showQuickSurf, setShowQuickSurf] = useState<boolean>(false);

  // Quality & Diagnostics
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(-1);
  const [bufferAhead, setBufferAhead] = useState<number>(0);
  const [currentBitrate, setCurrentBitrate] = useState<number>(0);
  const [streamResolution, setStreamResolution] = useState<string>('Auto');

  const osdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide OSD controls
  const triggerOsd = useCallback((durationMs: number = 4000) => {
    setShowOsd(true);
    if (osdTimerRef.current) {
      clearTimeout(osdTimerRef.current);
    }
    osdTimerRef.current = setTimeout(() => {
      setShowOsd(false);
      setShowSettingsMenu(false);
      setShowQualityMenu(false);
    }, durationMs);
  }, []);

  // Teardown all player engines cleanly
  const destroyCurrentEngines = useCallback(() => {
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {
        // ignore teardown errors
      }
      hlsRef.current = null;
    }
    if (mpegtsRef.current) {
      try {
        mpegtsRef.current.pause();
        mpegtsRef.current.unload();
        mpegtsRef.current.detachMediaElement();
        mpegtsRef.current.destroy();
      } catch {
        // ignore teardown errors
      }
      mpegtsRef.current = null;
    }
  }, []);

  // Web Audio API Gain Booster (+150% sound enhancement)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
          gainNodeRef.current = audioContextRef.current.createGain();
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(video);
          sourceNodeRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(audioContextRef.current.destination);
        }
      }

      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = volumeBoost ? 1.8 : 1.0;
      }
    } catch {
      // AudioContext already attached or restricted by browser
    }
  }, [volumeBoost]);

  // Master Stream Loader: Automatically chooses and configures HLS.js or MPEG-TS.js
  const loadStream = useCallback(
    (targetUrl: string, isFallbackAttempt: boolean = false) => {
      const video = videoRef.current;
      if (!targetUrl || !video) return;

      setIsLoading(true);
      setErrorNotice(null);
      destroyCurrentEngines();

      let finalUrl = targetUrl.split('|')[0].trim();
      // Ensure backend proxy handles external unproxied links
      if (!finalUrl.startsWith('/api/proxy') && !finalUrl.startsWith('http://localhost') && !finalUrl.startsWith('/')) {
        finalUrl = `/api/proxy?url=${encodeURIComponent(finalUrl)}`;
      }

      const isTsStream =
        currentChannel?.sourceType === 'ts' ||
        targetUrl.includes('extension=ts') ||
        targetUrl.includes('.ts') ||
        targetUrl.includes('live.ts');

      // 1. MPEG-TS Live Stream Engine (for direct .ts, MPEG-TS IP relays, Doraemon & Sony Max TS)
      if (isTsStream && mpegts.isSupported()) {
        setActiveEngine('MPEG-TS Live');
        try {
          const tsPlayer = mpegts.createPlayer(
            {
              type: 'mse',
              isLive: true,
              url: finalUrl,
            },
            {
              enableWorker: true,
              lazyLoad: false,
              enableStashBuffer: false,
              stashInitialSize: 128,
              liveBufferLatencyChasing: true,
              liveBufferLatencyMaxLatency: 3.5,
              liveBufferLatencyMinRemain: 0.8,
              autoCleanupSourceBuffer: true,
            }
          );

          mpegtsRef.current = tsPlayer;
          tsPlayer.attachMediaElement(video);
          tsPlayer.load();

          tsPlayer.on(mpegts.Events.ERROR, (errorType, errorDetail) => {
            console.warn('mpegts error:', errorType, errorDetail);
            if (!isFallbackAttempt && currentChannel?.fallbackUrl) {
              setErrorNotice('Primary MPEG-TS feed interrupted. Auto-switching to backup mirror...');
              setUsingFallback(true);
              setTimeout(() => {
                loadStream(currentChannel.fallbackUrl!, true);
              }, 800);
            } else {
              setErrorNotice('MPEG-TS stream error. Tap "Retry Feed" or switch channel.');
            }
          });

          video
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
              video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
              setIsLoading(false);
            });

          return;
        } catch (err) {
          console.error('Failed to init mpegts player:', err);
        }
      }

      // 2. HLS.js Live Stream Engine (with AES-128 support, low latency, and adaptive bitrate)
      if (Hls.isSupported()) {
        setActiveEngine('HLS.js Live');
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1024 * 1024,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          liveDurationInfinity: true,
          fragLoadingTimeOut: 20000,
          manifestLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 5,
          manifestLoadingMaxRetry: 5,
          levelLoadingMaxRetry: 5,
          startLevel: -1,
        });

        hlsRef.current = hls;
        hls.loadSource(finalUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setIsLoading(false);
          setErrorNotice(null);

          if (data.levels && data.levels.length > 0) {
            const extracted: QualityLevel[] = data.levels.map((lvl, idx) => ({
              id: idx,
              height: lvl.height || 0,
              bitrate: lvl.bitrate || 0,
              label: lvl.height ? `${lvl.height}p` : `${Math.round((lvl.bitrate || 0) / 1000)}k`,
            }));
            setQualityLevels(extracted);
          } else {
            setQualityLevels([]);
          }

          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
              video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            });
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          const lvl = hls.levels[data.level];
          if (lvl) {
            setStreamResolution(lvl.height ? `${lvl.height}p` : 'Auto');
            setCurrentBitrate(lvl.bitrate || 0);
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (!isFallbackAttempt && currentChannel?.fallbackUrl) {
                  setErrorNotice('Stream mirror switching to backup feed...');
                  setUsingFallback(true);
                  setTimeout(() => {
                    loadStream(currentChannel.fallbackUrl!, true);
                  }, 800);
                } else {
                  setErrorNotice('Network connection interrupted. Auto-retrying stream...');
                  hls.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                if (!isFallbackAttempt && currentChannel?.fallbackUrl) {
                  setUsingFallback(true);
                  loadStream(currentChannel.fallbackUrl!, true);
                } else {
                  setErrorNotice('Playback failed. Tap "Retry Feed" or select another channel.');
                }
                break;
            }
          }
        });
      } else {
        // 3. Direct HTML5 Native Video Tag (e.g. Safari native HLS or direct MP4/WebM)
        setActiveEngine('HTML5 Native');
        video.src = finalUrl;
        video.load();
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            video.muted = true;
            setIsMuted(true);
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
            setIsLoading(false);
          });
      }
    },
    [currentChannel, destroyCurrentEngines]
  );

  // Load stream whenever currentChannel changes
  useEffect(() => {
    if (currentChannel) {
      setUsingFallback(false);
      loadStream(currentChannel.streamUrl, false);
    }

    return () => {
      destroyCurrentEngines();
    };
  }, [currentChannel, loadStream, destroyCurrentEngines]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const ahead = Math.max(0, bufferedEnd - video.currentTime);
        setBufferAhead(Math.round(ahead));
      }
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('progress', handleProgress);
    };
  }, []);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in search or input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'c':
        case 'C':
          setShowQuickSurf((prev) => !prev);
          break;
        case 'a':
        case 'A':
          if (onOpenAllChannels) {
            onOpenAllChannels();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.min(1, v + 0.05);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          triggerOsd();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.max(0, v - 0.05);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          triggerOsd();
          break;
        case 'ArrowLeft':
        case '[':
          e.preventDefault();
          onPrevChannel();
          break;
        case 'ArrowRight':
        case ']':
          e.preventDefault();
          onNextChannel();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevChannel, onNextChannel, triggerOsd]);

  // Controls
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
    triggerOsd();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    triggerOsd();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
    triggerOsd();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
    triggerOsd();
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
    triggerOsd();
  };

  const handleQualitySelect = (levelIndex: number) => {
    setSelectedQualityIndex(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
    setShowQualityMenu(false);
    triggerOsd();
  };

  const reloadCurrentStream = () => {
    if (!currentChannel) return;
    setIsLoading(true);
    setErrorNotice(null);
    const target = usingFallback && currentChannel.fallbackUrl ? currentChannel.fallbackUrl : currentChannel.streamUrl;
    loadStream(target, usingFallback);
    triggerOsd();
  };

  const toggleStreamMirror = () => {
    if (!currentChannel || !currentChannel.fallbackUrl) return;
    const nextUsingFallback = !usingFallback;
    setUsingFallback(nextUsingFallback);
    const target = nextUsingFallback ? currentChannel.fallbackUrl : currentChannel.streamUrl;
    loadStream(target, nextUsingFallback);
    triggerOsd();
  };

  if (!currentChannel) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-400 p-6">
        <Tv className="w-16 h-16 mb-4 text-neutral-600 animate-pulse" />
        <h2 className="text-xl font-bold text-white mb-2">No Channel Selected</h2>
        <p className="text-sm text-neutral-500">Choose a channel from the lineup to start live playback.</p>
      </div>
    );
  }

  // Determine video aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '4:3':
        return 'aspect-[4/3] object-cover';
      case 'cover':
        return 'w-full h-full object-cover';
      case 'contain':
        return 'w-full h-full object-contain';
      case '16:9':
      default:
        return 'w-full h-full object-contain';
    }
  };

  return (
    <div
      ref={containerRef}
      id={isMiniPlayer ? 'floating-mini-player' : 'live-video-player-root'}
      onMouseMove={() => triggerOsd()}
      onClick={() => {
        if (isMiniPlayer) {
          onExpandPlayer?.();
        } else {
          triggerOsd();
        }
      }}
      className={
        isMiniPlayer
          ? 'w-44 sm:w-52 md:w-56 aspect-video bg-black rounded-xl shadow-2xl border-2 border-amber-500/80 overflow-hidden cursor-pointer group hover:border-amber-400 hover:scale-[1.03] transition-all relative'
          : 'relative w-full h-full bg-black select-none overflow-hidden flex items-center justify-center group'
      }
      title={isMiniPlayer ? 'Click to open Full Screen Live Player' : undefined}
    >
      {/* HTML5 Video Element (PERSISTENT - ZERO RELOADS OR PAUSES) */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        className={`transition-all duration-300 ${
          isMiniPlayer ? 'w-full h-full object-contain' : getAspectRatioClass()
        }`}
      />

      {/* When in MiniPlayer Mode: Render compact floating mini PIP overlay */}
      {isMiniPlayer ? (
        <>
          {/* Loading Spinner for Mini Player */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
              <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            </div>
          )}

          {/* Hover Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-black/85 px-1.5 py-0.5 rounded-md border border-neutral-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-amber-400">
                  CH {String(currentChannel.number).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-semibold text-white truncate max-w-[85px] sm:max-w-[110px]">
                  {currentChannel.name}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpandPlayer?.();
                }}
                className="p-1 rounded-md bg-amber-500 text-neutral-950 hover:bg-amber-400 font-bold shadow cursor-pointer"
                title="Expand to Full Player"
              >
                <Maximize className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between pointer-events-auto">
              <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 drop-shadow">
                <Play className="w-2.5 h-2.5 fill-current" /> Expand Player
              </span>
              <span className="text-[9px] font-mono font-bold text-neutral-300 bg-neutral-900/90 border border-neutral-700 px-1 py-0.2 rounded">
                {currentChannel.quality}
              </span>
            </div>
          </div>

          {/* Always visible minimal bottom badge on mini-player */}
          <div className="absolute bottom-1.5 left-1.5 group-hover:opacity-0 transition-opacity bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-neutral-800 flex items-center gap-1.5 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-white truncate max-w-[140px]">
              CH {String(currentChannel.number).padStart(2, '0')} • {currentChannel.name}
            </span>
          </div>
        </>
      ) : (
        /* Full Cinema Player OSD and Controls */
        <>

      {/* Quick Channel Surf Drawer (Left Side) */}
      {showQuickSurf && (
        <QuickChannelSurf
          channels={channels}
          currentChannel={currentChannel}
          onSelectChannel={(ch) => {
            onSelectChannel(ch);
            setShowQuickSurf(false);
          }}
          onClose={() => setShowQuickSurf(false)}
        />
      )}

      {/* Stream Diagnostics Modal */}
      {showStats && (
        <StatsOverlay
          channel={currentChannel}
          playbackMode="low-latency"
          bufferAhead={bufferAhead}
          bufferHealth={bufferAhead > 3 ? 'optimal' : bufferAhead > 0.5 ? 'good' : 'buffering'}
          resolution={streamResolution}
          fps={25}
          currentBitrate={currentBitrate}
          droppedFrames={0}
          engineName={activeEngine}
          volumeBoost={volumeBoost ? 1.8 : 1.0}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30 pointer-events-none transition-opacity">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <Radio className="w-6 h-6 text-amber-400 absolute animate-pulse" />
          </div>
          <span className="mt-4 text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            Connecting to Live Feed...
          </span>
          <span className="text-xs text-neutral-400 font-mono mt-1">Engine: {activeEngine}</span>
        </div>
      )}

      {/* Error / Notice Overlay */}
      {errorNotice && (
        <div className="absolute top-20 inset-x-4 max-w-xl mx-auto z-40 bg-neutral-950/95 border border-red-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white">Stream Alert</h4>
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{errorNotice}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-neutral-800 justify-end">
            {currentChannel.fallbackUrl && (
              <button
                onClick={toggleStreamMirror}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {usingFallback ? 'Switch to Primary Feed' : 'Try Backup Mirror'}
              </button>
            )}
            <button
              onClick={reloadCurrentStream}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Feed
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER OSD BAR */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-20 flex items-center justify-between transition-all duration-300 ${
          showOsd ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Left: Channel Info & Badges */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            title="Toggle Lineup Sidebar"
            className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/60 backdrop-blur-md shadow-lg transition-colors cursor-pointer"
          >
            <Tv className="w-5 h-5 text-amber-400" />
          </button>

          <button
            onClick={() => setShowQuickSurf(true)}
            title="Quick Channel Surf (C)"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/60 backdrop-blur-md shadow-lg transition-colors cursor-pointer text-xs font-semibold"
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Channel Surf (C)</span>
          </button>

          {onOpenAllChannels && (
            <button
              onClick={onOpenAllChannels}
              title="Open Full Screen All Channels Grid (A)"
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/60 backdrop-blur-md shadow-lg transition-colors cursor-pointer text-xs font-semibold"
            >
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span>All Channels (A)</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-lg bg-neutral-950 border border-neutral-800 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow">
              {currentChannel.logo ? (
                <img
                  src={currentChannel.logo}
                  alt={currentChannel.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-mono font-black text-amber-400 text-sm">
                  {String(currentChannel.number).padStart(2, '0')}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white drop-shadow">
                  CH {String(currentChannel.number).padStart(2, '0')} • {currentChannel.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-neutral-300 drop-shadow line-clamp-1">
                {currentChannel.currentProgram}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Engine Indicator & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Active Engine Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono text-neutral-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeEngine}</span>
          </div>

          {/* Mirror Switcher */}
          {currentChannel.fallbackUrl && (
            <button
              onClick={toggleStreamMirror}
              title="Switch Between Stream Mirrors"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-md transition-all cursor-pointer ${
                usingFallback
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-300 hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{usingFallback ? 'Mirror 2' : 'Mirror 1'}</span>
            </button>
          )}

          {/* Stream Diagnostics Button */}
          <button
            onClick={() => setShowStats((s) => !s)}
            title="Stream Diagnostics (Geek Stats)"
            className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 backdrop-blur-md shadow-lg transition-colors cursor-pointer"
          >
            <Activity className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* BOTTOM CONTROLS OSD BAR */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex flex-col gap-3 transition-all duration-300 ${
          showOsd ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls: Play/Pause, Channel Step, Volume */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prev Channel */}
            <button
              onClick={onPrevChannel}
              title="Previous Channel ([)"
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/60 backdrop-blur-md transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              className="w-12 h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            {/* Next Channel */}
            <button
              onClick={onNextChannel}
              title="Next Channel (])"
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/60 backdrop-blur-md transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Volume & Audio Boost */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <button
                onClick={toggleMute}
                title="Mute / Unmute (M)"
                className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 backdrop-blur-md transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : volume > 0.5 ? (
                  <Volume2 className="w-5 h-5 text-amber-400" />
                ) : (
                  <Volume1 className="w-5 h-5 text-amber-400" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 sm:w-28 accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-neutral-800"
              />

              {/* Volume Boost Button (+150%) */}
              <button
                onClick={() => setVolumeBoost((b) => !b)}
                title="Audio Boost (+150% Amplification)"
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                  volumeBoost
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 font-extrabold shadow'
                    : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                +150%
              </button>
            </div>
          </div>

          {/* Right Controls: Quality, Aspect Ratio, Reload, PiP, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quality Selector */}
            {qualityLevels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu((q) => !q)}
                  className="px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>
                    {selectedQualityIndex === -1 ? 'Auto' : qualityLevels[selectedQualityIndex]?.label || 'Quality'}
                  </span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-12 right-0 w-36 bg-neutral-950/95 border border-neutral-800 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-in fade-in duration-150">
                    <button
                      onClick={() => handleQualitySelect(-1)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        selectedQualityIndex === -1
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      Auto Bitrate
                    </button>
                    {qualityLevels.map((lvl) => (
                      <button
                        key={lvl.id}
                        onClick={() => handleQualitySelect(lvl.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          selectedQualityIndex === lvl.id
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aspect Ratio Toggle */}
            <button
              onClick={() => {
                const next: Record<AspectRatio, AspectRatio> = {
                  '16:9': '4:3',
                  '4:3': 'cover',
                  cover: 'contain',
                  contain: '16:9',
                };
                setAspectRatio((prev) => next[prev]);
                triggerOsd();
              }}
              title="Toggle Aspect Ratio (16:9 / 4:3 / Fill / Fit)"
              className="px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              {aspectRatio.toUpperCase()}
            </button>

            {/* Reload Stream Feed */}
            <button
              onClick={reloadCurrentStream}
              title="Reload Stream (Clear Buffer & Reconnect)"
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
            </button>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              title="Picture-in-Picture"
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Fullscreen (F)"
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
