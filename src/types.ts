export type ChannelCategory =
  | 'All'
  | 'Entertainment'
  | 'Movies & Classics'
  | 'News'
  | 'Music & Vibes'
  | 'Sports & Action'
  | 'Animation & Kids'
  | 'Documentary & Nature'
  | 'Tech & Space'
  | 'Devotional & Spiritual'
  | 'National'
  | 'Regional'
  | 'Custom & VOD';

export interface Channel {
  id: string;
  number: number;
  name: string;
  category: ChannelCategory | string;
  streamUrl: string;
  fallbackUrl?: string;
  logo?: string;
  quality: '4K' | '1080p FHD' | '720p HD' | 'HD' | 'Auto' | string;
  country: string;
  language: string;
  currentProgram: string;
  currentProgramDesc: string;
  nextProgram: string;
  nextProgramTime: string;
  accentColor: string;
  isLive: boolean;
  sourceType?: 'hls' | 'ts' | 'video' | 'youtube' | 'auto';
}

export type AspectRatio = '16:9' | '4:3' | 'cover' | 'contain';

export type PlaybackMode = 'smooth' | 'stable' | 'low-latency';

export interface QualityLevel {
  id: number;
  height: number;
  bitrate: number;
  label: string;
}

export type AppView = 'player' | 'all-channels' | 'catalogues' | 'favourites';

export interface PlayerSettings {
  aspectRatio: AspectRatio;
  playbackMode: PlaybackMode;
  volume: number;
  isMuted: boolean;
  autoPlayNext: boolean;
  showOsd: boolean;
}
