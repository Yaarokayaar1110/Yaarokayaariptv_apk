import React from 'react';
import { Sparkles, FileCode, CheckCircle2, Play, X, Shield, Zap } from 'lucide-react';

interface DeveloperInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelCount: number;
}

export const DeveloperInfoModal: React.FC<DeveloperInfoModalProps> = ({
  isOpen,
  onClose,
  channelCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="dev-info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="dev-info-modal-content"
        className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-xl w-full p-6 text-neutral-100 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                Yaarokayaar Universal IPTV
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Universal Player
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                High-performance player with fixed verified broadcast channels
              </p>
            </div>
          </div>
          <button
            id="close-dev-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-neutral-300">
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-medium text-white block mb-0.5">
                Multi-Format Playback Engine
              </span>
              Supports <strong>HLS (.m3u8)</strong> live feeds with adaptive bitrate switching, and <strong>Direct HTML5 video files (MP4, WebM)</strong> with full timeline seeking and volume boost.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-medium text-white block mb-0.5">
                Smart Proxy Relay & CORS Protection
              </span>
              Equipped with a built-in proxy at <code className="text-amber-300">/api/proxy</code> that forwards byte-range headers and user-agent credentials, eliminating CORS blocks and hotlink restrictions.
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified Pre-Configured Channels:
            </h3>
            <div className="rounded-xl bg-neutral-950 p-3.5 border border-neutral-800 text-xs text-neutral-300">
              <p className="text-neutral-400 mb-2">
                Currently includes <strong className="text-amber-400">{channelCount} verified feeds</strong> (SONY TV HD & Ultra, SONY SAB HD & Ultra, Sony Pal, Sony WAH, Sony MAX, Sony MAX 2, and Doraemon Special).
              </p>
              <p className="text-emerald-400 font-medium">
                External stream URL inputs and playlist uploads are locked to guarantee reliable playback.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Got it, Let's Stream!
          </button>
        </div>
      </div>
    </div>
  );
};
