/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { PREDEFINED_CHANNELS } from './data/channels';
import { Channel, AppView } from './types';
import { HeaderBar } from './components/HeaderBar';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelSidebar } from './components/ChannelSidebar';
import { DashboardView } from './components/DashboardView';
import { QuickZapper } from './components/QuickZapper';
import { DeveloperInfoModal } from './components/DeveloperInfoModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export default function App() {
  const channels = PREDEFINED_CHANNELS;
  const [activeView, setActiveView] = useState<AppView>('player');

  const [currentChannel, setCurrentChannel] = useState<Channel | null>(() => {
    try {
      const savedNumber = localStorage.getItem('iptv_last_channel');
      if (savedNumber && PREDEFINED_CHANNELS.length > 0) {
        const found = PREDEFINED_CHANNELS.find((c) => c.number === parseInt(savedNumber, 10));
        if (found) return found;
      }
    } catch {
      // ignore storage error
    }
    return PREDEFINED_CHANNELS[0] || null;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('iptv_favorites');
      return saved ? JSON.parse(saved) : ['ch-01', 'ch-02'];
    } catch {
      return ['ch-01', 'ch-02'];
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDevInfoOpen, setIsDevInfoOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Toggle favorite channel and persist
  const handleToggleFavorite = useCallback((channelId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId];
      try {
        localStorage.setItem('iptv_favorites', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Switch channel instantly and persist
  const handleSelectChannel = useCallback((channel: Channel) => {
    setCurrentChannel(channel);
    try {
      localStorage.setItem('iptv_last_channel', String(channel.number));
    } catch {
      // ignore
    }
  }, []);

  // Next Channel with cyclical loop
  const handleNextChannel = useCallback(() => {
    if (!currentChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    if (currentIndex === -1) {
      handleSelectChannel(channels[0]);
      return;
    }
    const nextIndex = (currentIndex + 1) % channels.length;
    handleSelectChannel(channels[nextIndex]);
  }, [channels, currentChannel, handleSelectChannel]);

  // Prev Channel with cyclical loop
  const handlePrevChannel = useCallback(() => {
    if (!currentChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    if (currentIndex === -1) {
      handleSelectChannel(channels[channels.length - 1]);
      return;
    }
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    handleSelectChannel(channels[prevIndex]);
  }, [channels, currentChannel, handleSelectChannel]);

  // On mobile screens, close guide sidebar by default
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <div
      id="iptv-app-root"
      className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none"
    >
      {/* Top Application Header */}
      <HeaderBar
        currentChannel={currentChannel}
        totalChannels={channels.length}
        activeView={activeView}
        onChangeView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenDevInfo={() => setIsDevInfoOpen(true)}
      />

      {/* Main Content Area */}
      <div id="iptv-main-content-area" className="flex-1 flex overflow-hidden relative">
        {/* Quick Channel Guide Sidebar (Shown in player view when toggled) */}
        <ChannelSidebar
          channels={channels}
          currentChannel={currentChannel}
          onSelectChannel={handleSelectChannel}
          isOpen={activeView === 'player' && isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenDevInfo={() => setIsDevInfoOpen(true)}
        />

        {/* Dashboard View: All Channels, Catalogues, Favourites */}
        <div
          className={`flex-1 flex flex-col h-full w-full overflow-hidden ${
            activeView !== 'player' ? 'flex' : 'hidden'
          }`}
        >
          <DashboardView
            channels={channels}
            currentChannel={currentChannel}
            activeView={activeView}
            onChangeView={setActiveView}
            onSelectChannel={(ch) => {
              handleSelectChannel(ch);
              setActiveView('player');
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        {/* Single Persistent Live TV Video Player (Never unmounted - streams continuously) */}
        <main
          className={
            activeView === 'player'
              ? 'flex-1 flex flex-col h-full overflow-hidden relative'
              : 'fixed bottom-5 right-5 z-50 pointer-events-auto'
          }
        >
          <VideoPlayer
            currentChannel={currentChannel}
            channels={channels}
            onNextChannel={handleNextChannel}
            onPrevChannel={handlePrevChannel}
            onSelectChannel={handleSelectChannel}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            isSidebarOpen={isSidebarOpen}
            totalChannels={channels.length}
            isMiniPlayer={activeView !== 'player'}
            onExpandPlayer={() => setActiveView('player')}
            onOpenAllChannels={() => setActiveView('all-channels')}
          />
        </main>
      </div>

      {/* Quick TV Remote Digit Zapper (Press 0-9 on keyboard to jump channel) */}
      <QuickZapper channels={channels} onSelectChannel={handleSelectChannel} />

      {/* Developer & System Info Modal */}
      <DeveloperInfoModal
        isOpen={isDevInfoOpen}
        onClose={() => setIsDevInfoOpen(false)}
        channelCount={channels.length}
      />

      {/* Remote Control Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
