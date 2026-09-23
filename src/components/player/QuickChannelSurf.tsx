import React from 'react';
import { X, Search, Radio, ChevronRight, Play } from 'lucide-react';
import { Channel } from '../../types';

interface QuickChannelSurfProps {
  channels: Channel[];
  currentChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
  onClose: () => void;
}

export const QuickChannelSurf: React.FC<QuickChannelSurfProps> = ({
  channels,
  currentChannel,
  onSelectChannel,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredChannels = channels.filter(
    (ch) =>
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(ch.number).includes(searchQuery)
  );

  return (
    <div
      id="quick-channel-surf-overlay"
      className="absolute inset-y-0 left-0 z-40 w-80 sm:w-96 bg-neutral-950/95 backdrop-blur-2xl border-r border-neutral-800 p-4 sm:p-5 flex flex-col shadow-2xl animate-in slide-in-from-left duration-250"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Quick Channel Surf</h3>
            <span className="text-[11px] text-neutral-400">All channels lineup</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search channel or CH #..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredChannels.map((channel) => {
          const isSelected = channel.id === currentChannel.id;
          return (
            <button
              key={channel.id}
              onClick={() => {
                onSelectChannel(channel);
                onClose();
              }}
              className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-neutral-900/70 border-neutral-800 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-200 hover:text-white'
              }`}
            >
              {/* Channel Logo / Number */}
              <div
                className={`w-14 h-12 rounded-lg flex items-center justify-center font-mono font-bold shrink-0 border overflow-hidden relative ${
                  isSelected
                    ? 'bg-black border-amber-400 text-amber-400 shadow'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                {channel.logo ? (
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm font-black text-amber-400">
                    {String(channel.number).padStart(2, '0')}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm truncate text-white">
                    {channel.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 font-mono text-neutral-400">
                    {channel.quality}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 truncate mt-0.5">
                  {channel.currentProgram}
                </div>
              </div>

              {isSelected ? (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
