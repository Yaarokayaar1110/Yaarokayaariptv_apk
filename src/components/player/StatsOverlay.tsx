import React from 'react';
import { X, Activity, Cpu, Gauge, Zap, Layers, Clock } from 'lucide-react';
import { Channel, PlaybackMode } from '../../types';

interface StatsOverlayProps {
  channel: Channel;
  playbackMode: PlaybackMode;
  bufferAhead: number;
  bufferHealth: string;
  resolution: string;
  fps: number;
  currentBitrate: number;
  droppedFrames: number;
  engineName: string;
  volumeBoost: number;
  onClose: () => void;
}

export const StatsOverlay: React.FC<StatsOverlayProps> = ({
  channel,
  playbackMode,
  bufferAhead,
  bufferHealth,
  resolution,
  fps,
  currentBitrate,
  droppedFrames,
  engineName,
  volumeBoost,
  onClose,
}) => {
  return (
    <div
      id="player-stats-panel"
      className="absolute top-16 left-4 z-40 w-80 sm:w-96 rounded-2xl bg-neutral-950/92 backdrop-blur-xl border border-neutral-700/80 p-4 text-xs font-mono shadow-2xl text-neutral-200 animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            Live Stream Diagnostics
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between py-1 border-b border-neutral-900">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-neutral-500" />
            Playback Engine:
          </span>
          <span className="text-amber-400 font-bold">{engineName}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-neutral-900">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-neutral-500" />
            Buffer Cache:
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                bufferHealth === 'optimal'
                  ? 'bg-emerald-400 animate-pulse'
                  : bufferHealth === 'good'
                  ? 'bg-amber-400'
                  : 'bg-red-400 animate-ping'
              }`}
            />
            <span className="text-white font-bold">{bufferAhead}s</span>
            <span className="text-neutral-500 text-[10px] capitalize">({bufferHealth})</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-neutral-900">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-neutral-500" />
            Video Resolution:
          </span>
          <span className="text-white font-bold">{resolution || channel.quality}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-neutral-900">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-neutral-500" />
            Render Rate:
          </span>
          <span className="text-neutral-200">{fps > 0 ? `${fps} FPS` : '25.0 FPS (Broadcast)'}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-neutral-900">
          <span className="text-neutral-400">Current Bitrate:</span>
          <span className="text-neutral-200">
            {currentBitrate > 0
              ? `${(currentBitrate / 1000000).toFixed(2)} Mbps`
              : 'Adaptive Variable'}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-neutral-900">
          <span className="text-neutral-400">Dropped Frames:</span>
          <span className={droppedFrames > 10 ? 'text-amber-400' : 'text-emerald-400'}>
            {droppedFrames}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-neutral-900">
          <span className="text-neutral-400">Audio Output:</span>
          <span className="text-neutral-200 font-bold">
            {volumeBoost > 100 ? `${volumeBoost}% (Boosted)` : `${volumeBoost}%`}
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            Engine Profile:
          </span>
          <span className="text-amber-300 uppercase tracking-wider text-[10px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
            {playbackMode} Mode
          </span>
        </div>
      </div>
    </div>
  );
};
