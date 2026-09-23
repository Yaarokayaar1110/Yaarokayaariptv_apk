import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Play,
  Star,
  Tv,
  Layers,
  Search,
  Sparkles,
  Radio,
  Clock,
  Compass,
  Volume2,
  X,
  SlidersHorizontal,
  Maximize,
  Minimize,
  Grid3X3,
  LayoutGrid,
  List,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Channel, ChannelCategory, AppView } from '../types';
import { CATEGORIES } from '../data/channels';

interface DashboardViewProps {
  channels: Channel[];
  currentChannel: Channel | null;
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  onSelectChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (channelId: string) => void;
}

type ViewLayout = 'list' | 'medium' | 'small';

export const DashboardView: React.FC<DashboardViewProps> = ({
  channels,
  currentChannel,
  activeView,
  onChangeView,
  onSelectChannel,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ChannelCategory | 'All'>('All');
  const [selectedCatalogue, setSelectedCatalogue] = useState<ChannelCategory | 'All'>('All');
  const [viewLayout, setViewLayout] = useState<ViewLayout>(() => {
    try {
      return (localStorage.getItem('iptv_view_layout') as ViewLayout) || 'list';
    } catch {
      return 'list';
    }
  });
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync browser fullscreen status
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Ensure correct filter state when entering views
  useEffect(() => {
    if (activeView === 'all-channels') {
      setSelectedCategoryFilter('All');
      setSelectedCatalogue('All');
      setSearchQuery('');
    } else if (activeView === 'catalogues') {
      // In catalogues, ensure it strictly defaults to a filtered category (Entertainment), never 'All'
      setSelectedCategoryFilter((prev) => (prev === 'All' ? 'Entertainment' : prev));
      setSearchQuery('');
    }

    const resetToAllChannels = () => {
      setSelectedCategoryFilter('All');
      setSelectedCatalogue('All');
      setSearchQuery('');
    };

    window.addEventListener('iptv:show-all-channels', resetToAllChannels);
    return () => window.removeEventListener('iptv:show-all-channels', resetToAllChannels);
  }, [activeView]);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleViewLayoutChange = (layout: ViewLayout) => {
    setViewLayout(layout);
    try {
      localStorage.setItem('iptv_view_layout', layout);
    } catch {
      // ignore
    }
  };

  // Helper for generating initials / monograms when image logo fails or is loading
  const getChannelInitials = (name: string, num: number) => {
    const clean = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].slice(0, 3)} ${parts[1].slice(0, 3)}`.toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 4).toUpperCase();
    }
    return `CH ${num}`;
  };

  // Categories with channel counts
  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      name: cat,
      count: cat === 'All' ? channels.length : channels.filter((c) => c.category === cat).length,
    }));
  }, [channels]);

  // Filtered channels according to activeView, category filter, and real-time search
  const displayedChannels = useMemo(() => {
    let list = channels;

    if (activeView === 'favourites') {
      list = list.filter((ch) => favorites.includes(ch.id));
    } else if (activeView === 'catalogues') {
      const activeFilter = selectedCategoryFilter === 'All' ? 'Entertainment' : selectedCategoryFilter;
      list = list.filter((ch) => ch.category === activeFilter);
    }

    // Real-time search query filter: matches channel name, number, or category
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          ch.category.toLowerCase().includes(q) ||
          String(ch.number).includes(q) ||
          (ch.currentProgram && ch.currentProgram.toLowerCase().includes(q)) ||
          (ch.language && ch.language.toLowerCase().includes(q))
      );
    }

    return list;
  }, [channels, activeView, favorites, selectedCategoryFilter, searchQuery]);

  return (
    <div
      ref={containerRef}
      id="dashboard-fullscreen-container"
      className="flex-1 flex flex-col h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto select-none"
    >
      {/* STICKY FULL-SCREEN TOOLBAR */}
      <div className={`sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800/90 px-4 sm:px-6 shadow-xl ${
        activeView === 'all-channels' ? 'py-2.5' : 'py-3.5'
      }`}>
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Left: View Header & Live Count Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm sm:text-base font-black text-white tracking-wide text-left flex items-center gap-2">
                  <span>
                    {activeView === 'all-channels'
                      ? 'All Channels'
                      : activeView === 'catalogues'
                      ? `Catalogue: ${selectedCategoryFilter === 'All' ? 'Entertainment' : selectedCategoryFilter}`
                      : 'Favourites Lineup'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] sm:text-[11px] font-mono text-amber-400 font-bold">
                  {displayedChannels.length} Channels
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Live Broadcast
                </span>
              </div>
            </div>
          </div>

          {/* Center: Search Input (Compact Size for All Channels) */}
          <div className={`relative ${
            activeView === 'all-channels'
              ? 'w-full sm:w-56 md:w-64 shrink'
              : 'flex-1 max-w-xs md:max-w-sm'
          }`}>
            <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="fullscreen-channel-search-input"
              type="text"
              placeholder={activeView === 'all-channels' ? 'Search channels...' : 'Search by name, number...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchQuery('');
              }}
              className={`w-full pl-8 pr-7 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all shadow-inner ${
                activeView === 'all-channels' ? 'h-8' : 'h-9'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 rounded-lg hover:bg-neutral-800 transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right Controls: View Layout Selector & Fullscreen Toggle & Return to Player */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Layout Toggle: List (Default) vs Cards vs Compact */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-0.5">
              <button
                id="view-layout-list-btn"
                onClick={() => handleViewLayoutChange('list')}
                title="List View with Logos (Default)"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'list'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List View</span>
                <span className="sm:hidden">List</span>
              </button>

              <button
                id="view-layout-medium-btn"
                onClick={() => handleViewLayoutChange('medium')}
                title="Cards Grid"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'medium'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
                <span className="sm:hidden">Cards</span>
              </button>

              <button
                id="view-layout-small-btn"
                onClick={() => handleViewLayoutChange('small')}
                title="Compact Grid"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'small'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compact</span>
                <span className="sm:hidden">Compact</span>
              </button>
            </div>

            {/* Browser Fullscreen Toggle Button */}
            <button
              onClick={toggleBrowserFullscreen}
              title={isBrowserFullscreen ? 'Exit Full Screen' : 'Open Full Screen'}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isBrowserFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Full Screen</span>
                </>
              )}
            </button>

            {/* Back to Live Player Button */}
            <button
              onClick={() => onChangeView('player')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Live</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills Bar: ONLY SHOWN IN CATALOGUES OPTION */}
        {activeView === 'catalogues' && (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-neutral-900">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              Catalogue Filter:
            </span>

            {CATEGORIES.filter((c) => c !== 'All').map((cat) => {
              const currentActiveCat = selectedCategoryFilter === 'All' ? 'Entertainment' : selectedCategoryFilter;
              const isSelected = currentActiveCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategoryFilter(cat as ChannelCategory);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                      : 'bg-neutral-900/90 border border-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-850'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-neutral-950 text-amber-400 font-bold' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {channels.filter((c) => c.category === cat).length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CHANNELS GRID: FULL SCREEN EDGE-TO-EDGE */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 w-full">
        {/* Active Filter Notification Banner (Catalogues view only) */}
        {activeView === 'catalogues' && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>
                Filtered Category: <strong>{selectedCategoryFilter === 'All' ? 'Entertainment' : selectedCategoryFilter}</strong> ({displayedChannels.length} channels)
                {searchQuery.trim() && ` • matching "${searchQuery}"`}
              </span>
            </div>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition-colors cursor-pointer text-[11px]"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {displayedChannels.length === 0 ? (
          <div className="py-20 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-3xl max-w-xl mx-auto p-8">
            <Radio className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Channels Matched</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Try searching with another keyword or resetting the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('All');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewLayout === 'list' ? (
          /* =========================================================================
             CHANNEL LIST VIEW (WITH LOGO, CHANNEL NUMBER, EPG PROGRAM, ACTIONS)
             ========================================================================= */
          <div className="max-w-5xl mx-auto space-y-2.5 sm:space-y-3">
            {displayedChannels.map((channel) => {
              const isCurrentlyPlaying = currentChannel?.id === channel.id;
              const isFav = favorites.includes(channel.id);

              return (
                <div
                  key={channel.id}
                  id={`channel-list-item-${channel.number}`}
                  onClick={() => {
                    onSelectChannel(channel);
                    onChangeView('player');
                  }}
                  className={`group relative rounded-2xl p-3 sm:p-4 bg-neutral-900/80 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:shadow-xl hover:translate-x-1 ${
                    isCurrentlyPlaying
                      ? 'border-amber-500 bg-neutral-900 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'border-neutral-800 hover:border-amber-500/60 hover:bg-neutral-900'
                  }`}
                >
                  {/* Left Section: Number + Logo + Channel Details */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Channel Number Badge */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-12 sm:w-14">
                      <span className="px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs font-bold text-amber-400 shadow-inner">
                        CH {String(channel.number).padStart(2, '0')}
                      </span>
                      {isCurrentlyPlaying && (
                        <span className="mt-1 flex items-center gap-0.5 text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>

                    {/* PROMINENT CHANNEL LOGO CONTAINER */}
                    <div className="w-20 sm:w-28 h-13 sm:h-16 rounded-xl bg-neutral-950 border border-neutral-800/90 flex items-center justify-center p-2 shrink-0 group-hover:border-neutral-700 group-hover:bg-black transition-all shadow-inner relative overflow-hidden">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-mono text-xs sm:text-sm font-black text-amber-400 tracking-wider">
                          {getChannelInitials(channel.name, channel.number)}
                        </span>
                      )}
                    </div>

                    {/* Channel Name, Category, Quality & On-Air Program */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {channel.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                          {channel.quality}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800/80 text-[10px] text-neutral-400">
                          {channel.category}
                        </span>
                        {channel.language && (
                          <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] text-neutral-500">
                            {channel.language}
                          </span>
                        )}
                      </div>

                      {/* On Air Program Title */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-neutral-500 font-semibold">Now:</span>
                        <span className="text-neutral-200 font-medium truncate">
                          {channel.currentProgram || 'Live Satellite Feed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Favorite button & Watch Live Button */}
                  <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(channel.id);
                      }}
                      className="p-2 rounded-xl text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? 'fill-amber-400 text-amber-400' : 'text-neutral-500'
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChannel(channel);
                        onChangeView('player');
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                        isCurrentlyPlaying
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {isCurrentlyPlaying ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 animate-pulse text-red-400" />
                          <span>Playing Now</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Live</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewLayout === 'small' ? (
          /* =========================================================================
             SMALL ICON GRID (Compact, fast browsing, shows all channels at a glance)
             ========================================================================= */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
            {displayedChannels.map((channel) => {
              const isCurrentlyPlaying = currentChannel?.id === channel.id;
              const isFav = favorites.includes(channel.id);

              return (
                <div
                  key={channel.id}
                  id={`channel-card-sm-${channel.number}`}
                  onClick={() => {
                    onSelectChannel(channel);
                    onChangeView('player');
                  }}
                  className={`group relative rounded-2xl p-3 bg-neutral-900/70 border transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:translate-y-[-2px] ${
                    isCurrentlyPlaying
                      ? 'border-amber-500 bg-neutral-900 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                      : 'border-neutral-800/90 hover:border-amber-500/60 hover:bg-neutral-900'
                  }`}
                >
                  {/* Top: Channel Number Badge & Favorite Star */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="px-2 py-0.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] font-bold text-amber-400">
                      CH {String(channel.number).padStart(2, '0')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(channel.id);
                      }}
                      className="p-1 rounded-lg text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-amber-400 text-amber-400' : 'text-neutral-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* SMALL CHANNEL ICON CONTAINER (Clear & Clean) */}
                  <div className="w-full h-16 rounded-xl bg-neutral-950 border border-neutral-800/90 flex items-center justify-center p-2 mb-2.5 overflow-hidden group-hover:border-neutral-700 transition-all shadow-inner relative">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="font-mono text-xs font-black text-amber-400 tracking-wider">
                        {getChannelInitials(channel.name, channel.number)}
                      </span>
                    )}

                    {isCurrentlyPlaying && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-red-600 text-white text-[8px] font-bold uppercase rounded font-mono">
                        Playing
                      </span>
                    )}
                  </div>

                  {/* Channel Name & Category */}
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {channel.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                      <span className="truncate">{channel.category}</span>
                      <span className="font-mono font-bold text-neutral-300 shrink-0 ml-1">
                        {channel.quality}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay "Watch Live" prompt */}
                  <div className="mt-2 pt-1.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-amber-400 font-bold group-hover:text-amber-300">
                    <span>{isCurrentlyPlaying ? 'Resume' : 'Play Live'}</span>
                    <Play className="w-3 h-3 fill-current group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             MEDIUM ICON GRID (Standard TV Card with prominent Medium Channel Logos)
             ========================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
            {displayedChannels.map((channel) => {
              const isCurrentlyPlaying = currentChannel?.id === channel.id;
              const isFav = favorites.includes(channel.id);

              return (
                <div
                  key={channel.id}
                  id={`channel-card-md-${channel.number}`}
                  onClick={() => {
                    onSelectChannel(channel);
                    onChangeView('player');
                  }}
                  className={`group relative rounded-2xl p-4 bg-neutral-900/80 border transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-2xl hover:translate-y-[-3px] ${
                    isCurrentlyPlaying
                      ? 'border-amber-500 bg-neutral-900 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/15'
                      : 'border-neutral-800 hover:border-amber-500/60 hover:bg-neutral-900'
                  }`}
                >
                  {/* Top Bar: Channel Number, Quality Tag, Favorite Star */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs font-bold text-amber-400 shadow-sm">
                        CH {String(channel.number).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
                        {channel.quality}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCurrentlyPlaying && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          <Volume2 className="w-3 h-3 animate-pulse" />
                          <span>PLAYING</span>
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFav ? 'fill-amber-400 text-amber-400' : 'text-neutral-500'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* MEDIUM CHANNEL ICON DISPLAY CONTAINER (Prominent & Pristine) */}
                  <div className="w-full h-24 sm:h-28 rounded-xl bg-neutral-950 border border-neutral-800/90 flex items-center justify-center p-3 mb-3.5 overflow-hidden group-hover:border-neutral-700 group-hover:bg-black transition-all shadow-inner relative">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-mono text-sm font-black text-amber-400 tracking-wider">
                          {getChannelInitials(channel.name, channel.number)}
                        </span>
                        <span className="text-[10px] text-neutral-500 mt-1 uppercase">Broadcast</span>
                      </div>
                    )}

                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-neutral-400 font-mono border border-neutral-800">
                      LIVE
                    </span>
                  </div>

                  {/* Channel Title & Category */}
                  <div className="mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {channel.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                      <span>{channel.category}</span>
                      <span>•</span>
                      <span>{channel.language}</span>
                    </div>
                  </div>

                  {/* Current Program Snippet */}
                  <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 mb-3.5 text-xs">
                    <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3" />
                      <span>On Air Now</span>
                    </div>
                    <div className="font-semibold text-neutral-200 line-clamp-1">
                      {channel.currentProgram}
                    </div>
                  </div>

                  {/* Watch Live Button */}
                  <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-500">
                      CH {String(channel.number).padStart(2, '0')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChannel(channel);
                        onChangeView('player');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCurrentlyPlaying
                          ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-800 group-hover:bg-amber-500 text-white group-hover:text-neutral-950'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isCurrentlyPlaying ? 'Resume' : 'Watch Live'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
