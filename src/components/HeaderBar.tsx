import React from 'react';
import { Tv, Sparkles, Keyboard, Layers, Star, Radio } from 'lucide-react';
import { Channel, AppView } from '../types';
import { AppLogo } from './AppLogo';

interface HeaderBarProps {
  currentChannel: Channel | null;
  totalChannels: number;
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenShortcuts: () => void;
  onOpenDevInfo?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentChannel,
  totalChannels,
  activeView,
  onChangeView,
  isSidebarOpen,
  onToggleSidebar,
  onOpenShortcuts,
  onOpenDevInfo,
}) => {
  return (
    <header
      id="main-app-header"
      className="h-14 bg-neutral-950 border-b border-neutral-800 px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none"
    >
      {/* Brand & Universal Badge */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onChangeView('player')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Yaarokayaar Universal IPTV"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Tv className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-white">
                YAAROKAYAAR <span className="text-amber-400">IPTV</span>
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-emerald-400 border border-neutral-800 font-mono">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                Universal Player
              </span>
            </div>
          </div>
        </div>

        {/* Current Channel Info Quick Tag */}
        {currentChannel ? (
          <div className="hidden 2xl:flex items-center gap-2 ml-3 pl-3 border-l border-neutral-800 text-xs">
            <span className="text-neutral-500">Playing:</span>
            <span className="font-mono text-amber-400 font-bold">
              CH {String(currentChannel.number).padStart(2, '0')}
            </span>
            <span className="text-white font-medium truncate max-w-[150px]">
              {currentChannel.name}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          </div>
        ) : (
          <div className="hidden 2xl:flex items-center gap-2 ml-3 pl-3 border-l border-neutral-800 text-xs text-neutral-500">
            <span>Ready to stream</span>
          </div>
        )}
      </div>

      {/* Main Navigation Tabs: Live TV, All Channels, Catalogues, Favourites */}
      <nav className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800/80">
        <button
          id="nav-tab-player"
          onClick={() => onChangeView('player')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'player'
              ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Live Player</span>
        </button>

        <button
          id="nav-tab-all-channels"
          onClick={() => {
            onChangeView('all-channels');
            window.dispatchEvent(new CustomEvent('iptv:show-all-channels'));
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'all-channels'
              ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">All Channels</span>
          <span className="sm:hidden">Channels</span>
        </button>

        <button
          id="nav-tab-catalogues"
          onClick={() => onChangeView('catalogues')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'catalogues'
              ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Catalogues</span>
        </button>

        <button
          id="nav-tab-favourites"
          onClick={() => onChangeView('favourites')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'favourites'
              ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Favourites</span>
          <span className="sm:hidden">Favs</span>
        </button>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Remote Shortcuts */}
        <button
          id="open-shortcuts-btn"
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          title="Remote Control Shortcuts"
        >
          <Keyboard className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden lg:inline">Shortcuts</span>
        </button>

        {/* In player view: Toggle Channel Guide Sidebar */}
        {activeView === 'player' && (
          <button
            id="toggle-guide-sidebar-btn"
            onClick={onToggleSidebar}
            className={`px-2.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isSidebarOpen
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm font-bold'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-800 hover:text-white'
            }`}
            title="Toggle Channel List"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide ({totalChannels})</span>
          </button>
        )}
      </div>
    </header>
  );
};
