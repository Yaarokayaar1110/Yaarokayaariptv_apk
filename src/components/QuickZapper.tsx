import React, { useEffect, useState, useRef } from 'react';
import { Channel } from '../types';

interface QuickZapperProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

export const QuickZapper: React.FC<QuickZapperProps> = ({ channels, onSelectChannel }) => {
  const [typedDigits, setTypedDigits] = useState<string>('');
  const [matchedChannel, setMatchedChannel] = useState<Channel | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key >= '0' && e.key <= '9') {
        const nextDigits = (typedDigits + e.key).slice(-3);
        setTypedDigits(nextDigits);

        const channelNum = parseInt(nextDigits, 10);
        const match = channels.find((c) => c.number === channelNum) || null;
        setMatchedChannel(match);

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
          if (match) {
            onSelectChannel(match);
          }
          setTypedDigits('');
          setMatchedChannel(null);
        }, 1200);
      } else if (e.key === 'Enter' && typedDigits) {
        if (timerRef.current) clearTimeout(timerRef.current);
        const channelNum = parseInt(typedDigits, 10);
        const match = channels.find((c) => c.number === channelNum);
        if (match) {
          onSelectChannel(match);
        }
        setTypedDigits('');
        setMatchedChannel(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [typedDigits, channels, onSelectChannel]);

  if (!typedDigits) return null;

  return (
    <div
      id="quick-zapper-overlay"
      className="fixed top-8 right-8 z-50 pointer-events-none animate-in fade-in zoom-in-90 duration-150"
    >
      <div className="bg-neutral-950/95 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center gap-4 min-w-[200px]">
        <div className="text-3xl font-black font-mono text-amber-400 tracking-wider">
          CH {typedDigits}
        </div>
        <div className="border-l border-neutral-800 pl-3">
          {matchedChannel ? (
            <div>
              <div className="text-xs font-bold text-white truncate max-w-[140px]">
                {matchedChannel.name}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">Tuning...</div>
            </div>
          ) : (
            <div className="text-[11px] text-neutral-400">Channel not found</div>
          )}
        </div>
      </div>
    </div>
  );
};
