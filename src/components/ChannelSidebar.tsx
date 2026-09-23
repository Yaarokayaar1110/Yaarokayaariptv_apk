import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  Tv,
  Radio,
  SlidersHorizontal,
  X,
  Volume2,
  Sparkles,
  Play,
} from 'lucide-react';
import { Channel, ChannelCategory } from '../types';
import { CATEGORIES } from '../data/channels';

interface ChannelSidebarProps {
  channels: Channel[];
  currentChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenDevInfo: () => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  channels,
  currentChannel,
  onSelectChannel,
  isOpen,
  onClose,
  onOpenDevInfo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('iptv_favorites');
      return saved ? JSON.parse(saved) : ['ch-01', 'ch-02'];
    } catch {
      return ['ch-01', 'ch-02'];
    }
  });

  // Toggle favorite channel
  const toggleFavorite = (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId];
      try {
        localStorage.setItem('iptv_favorites', JSON.stringify(next));
      } catch {
        // local storage error ignored
      }
      return next;
    });
  };

  // Filter channels based on search query, category, and favorites
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      // Category filter
      if (selectedCategory !== 'All' && ch.category !== selectedCategory) {
        return false;
      }

      // Favorites filter
      if (onlyFavorites && !favorites.includes(ch.id)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ch.name.toLowerCase().includes(q);
        const matchesNumber = String(ch.number).includes(q);
        const matchesCategory = ch.category.toLowerCase().includes(q);
        const matchesLanguage = ch.language.toLowerCase().includes(q);
        const matchesProgram = ch.currentProgram.toLowerCase().includes(q);
        return matchesName || matchesNumber || matchesCategory || matchesLanguage || matchesProgram;
      }

      return true;
    });
  }, [channels, selectedCategory, onlyFavorites, favorites, searchQuery]);

  return (
    <aside
      id="channel-guide-sidebar"
      className={`fixed md:static inset-y-0 left-0 z-40 w-full sm:w-[420px] md:w-[420px] lg:w-[460px] xl:w-[500px] shrink-0 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-all duration-300 transform shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  All Channels Lineup
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {channels.length}
                </span>
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>24/7 Verified Live Broadcasts & Films</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Close Button on Mobile */}
            <button
              id="close-sidebar-mobile-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white md:hidden hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close channel guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Search Input at Top */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="sidebar-realtime-search-input"
            type="text"
            placeholder="Search channels by name, number, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('');
            }}
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
              title="Clear search (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Real-time Search active query badge */}
        {searchQuery.trim() && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs flex items-center justify-between text-amber-300">
            <span className="truncate">
              Search: <strong className="text-white">"{searchQuery}"</strong>
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 shrink-0 ml-2">
              {filteredChannels.length} found
            </span>
          </div>
        )}

        {/* Favorites vs All Quick Toggle */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              id="show-all-channels-btn"
              onClick={() => {
                setOnlyFavorites(false);
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                !onlyFavorites && selectedCategory === 'All' && !searchQuery.trim()
                  ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              All Channels ({channels.length})
            </button>
            <button
              id="show-fav-channels-btn"
              onClick={() => setOnlyFavorites(true)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyFavorites
                  ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Favourites ({favorites.length})</span>
            </button>
          </div>

          <span className="text-xs text-neutral-400 font-mono">
            {filteredChannels.length} visible
          </span>
        </div>
      </div>

      {/* Category Filter Horizontal Scrollbar */}
      <div className="px-4 py-2.5 border-b border-neutral-900 bg-neutral-950/60 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
        <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 shrink-0 mr-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as ChannelCategory)}
            className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all shrink-0 cursor-pointer font-medium ${
              selectedCategory === cat
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'bg-neutral-900 border border-neutral-800/80 text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-850'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Channels Scrollable List (Enlarged Cards) */}
      <div
        id="channels-scroll-list"
        className="flex-1 overflow-y-auto divide-y divide-neutral-900/60 p-3 sm:p-4 space-y-2.5"
      >
        {filteredChannels.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Radio className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-neutral-300">No channels found</p>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your search keyword or selecting "All" category.
            </p>
          </div>
        ) : (
          filteredChannels.map((channel) => {
            const isSelected = currentChannel ? channel.id === currentChannel.id : false;
            const isFav = favorites.includes(channel.id);

            return (
              <div
                key={channel.id}
                id={`channel-item-${channel.number}`}
                onClick={() => onSelectChannel(channel)}
                className={`group relative p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between gap-3.5 ${
                  isSelected
                    ? 'bg-neutral-900/90 border-2 border-amber-500/80 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20'
                    : 'bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                {/* Left: Channel Number & Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Channel Thumbnail / Large Logo Badge */}
                  <div
                    className={`w-20 h-16 sm:w-24 sm:h-18 rounded-xl shrink-0 flex items-center justify-center font-mono border overflow-hidden transition-all relative ${
                      isSelected
                        ? 'bg-black border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 group-hover:border-neutral-700 group-hover:text-white'
                    }`}
                  >
                    {channel.logo ? (
                      <div className="w-full h-full relative flex items-center justify-center p-2 bg-black/60">
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain filter drop-shadow"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 bg-black/90 text-amber-400 rounded-md font-mono border border-amber-500/30">
                          {channel.number}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          CH
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none mt-0.5">
                          {String(channel.number).padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    {/* Active Play Icon Overlay when hovering or selected */}
                    {isSelected && (
                      <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow">
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Channel Meta Info */}
                  <div className="min-w-0 flex-1">
                    {/* Row 1: Channel Name & Resolution Badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-sm sm:text-base font-bold tracking-tight truncate ${
                          isSelected ? 'text-amber-400' : 'text-white group-hover:text-amber-300'
                        }`}
                      >
                        {channel.name}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/80 font-mono">
                        {channel.quality}
                      </span>
                    </div>

                    {/* Row 2: Currently Playing Program */}
                    <p className="text-xs sm:text-sm text-neutral-300 font-medium line-clamp-1">
                      {channel.currentProgram}
                    </p>

                    {/* Row 3: Category & Language Badges */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 font-medium text-[11px]">
                        {channel.category}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-neutral-400 text-[11px]">{channel.language}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Favorite Toggle & Playing Status */}
                <div className="flex flex-col items-end justify-between h-14 shrink-0 pl-1">
                  <button
                    onClick={(e) => toggleFavorite(e, channel.id)}
                    className="p-2 rounded-xl text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star
                      className={`w-4 h-4 sm:w-5 h-5 ${
                        isFav ? 'fill-amber-400 text-amber-400' : 'text-neutral-500'
                      }`}
                    />
                  </button>

                  {isSelected ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 text-xs font-black font-mono shadow-md">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>ON AIR</span>
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                      <span>Watch</span>
                      <Play className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="p-3.5 sm:p-4 border-t border-neutral-800/80 bg-neutral-950/95 text-xs text-neutral-400 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-neutral-300">Universal Player Active</span>
        </div>
        <button
          onClick={onOpenDevInfo}
          className="text-amber-400 hover:underline font-semibold cursor-pointer"
        >
          View System Status
        </button>
      </div>
    </aside>
  );
};
