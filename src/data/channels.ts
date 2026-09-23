import { Channel } from '../types';

/**
 * ============================================================================
 * EXCLUSIVE PLAYLIST LINEUP (SONYLIV OTT PREMIUM & SPECIAL FEEDS)
 * ============================================================================
 * Verified live stream feeds equipped with Dual-Engine (HLS + MPEG-TS) playback.
 * All streams are configured through the Smart Proxy Relay with ExoPlayer User-Agent
 * and origin referer headers to guarantee smooth, non-buffering live playback.
 * ============================================================================
 */

export const PREDEFINED_CHANNELS: Channel[] = [
  {
    id: 'ch-01',
    number: 1,
    name: 'SONY TV ᴴᴰ ▶',
    category: 'Entertainment',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009246') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009246') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/sethd.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '1080p FHD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony Entertainment Television HD',
    currentProgramDesc: 'Flagship entertainment, blockbuster family shows and live reality programs.',
    nextProgram: 'The Kapil Sharma Show / Crime Patrol',
    nextProgramTime: '21:00',
    accentColor: '#3b82f6',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-02',
    number: 2,
    name: 'SONY TV ᴜʟᴛʀa ▶',
    category: 'Entertainment',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009246') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009246') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/sethd.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '4K',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony TV Ultra HD Feed',
    currentProgramDesc: 'High-bitrate pristine broadcast direct from OTT Premium CDN.',
    nextProgram: 'CID / Indian Idol',
    nextProgramTime: '22:00',
    accentColor: '#2563eb',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-03',
    number: 3,
    name: 'SONY SAB ᴴᴰ ▶',
    category: 'Entertainment',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009248') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009248') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/sabhd.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '1080p FHD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Taarak Mehta Ka Ooltah Chashmah HD',
    currentProgramDesc: "India's beloved comedy, feel-good family shows and laughter specials.",
    nextProgram: 'Wagle Ki Duniya',
    nextProgramTime: '20:30',
    accentColor: '#f59e0b',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-04',
    number: 4,
    name: 'SONY SAB ᴜʟᴛʀa ▶',
    category: 'Entertainment',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009248') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009248') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/sabhd.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '4K',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony SAB Ultra Feed',
    currentProgramDesc: 'Continuous HD comedic entertainment & family laughter.',
    nextProgram: 'Pushpa Impossible',
    nextProgramTime: '21:30',
    accentColor: '#d97706',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-05',
    number: 5,
    name: 'Sony Pal ᴴᴰ ▶',
    category: 'Entertainment',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009273') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009273') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/pal.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '1080p FHD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony Pal Classic Drama Hour',
    currentProgramDesc: 'Evergreen stories, romantic dramas, and timeless family television.',
    nextProgram: 'Balveer Returns',
    nextProgramTime: '19:00',
    accentColor: '#ec4899',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-06',
    number: 6,
    name: 'Sony Pal ᴜʟᴛʀa ▶',
    category: 'Entertainment',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009273') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009273') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/pal.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '4K',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony Pal Ultra Broadcast',
    currentProgramDesc: 'High-definition relay of Pal channels and hit serials.',
    nextProgram: 'Taarak Mehta Golden Episodes',
    nextProgramTime: '20:00',
    accentColor: '#db2777',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-07',
    number: 7,
    name: 'Sony WAH ᴴᴰ ▶',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009253') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009253') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/wah.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '1080p FHD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony WAH Blockbuster Cinema',
    currentProgramDesc: 'Non-stop action, South Hindi dubbed blockbusters and Bollywood hits.',
    nextProgram: 'Action Express Premiere',
    nextProgramTime: '18:30',
    accentColor: '#ef4444',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-08',
    number: 8,
    name: 'Sony WAH ᴜʟᴛʀa ▶',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009253') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009253') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/wah.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '4K',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony WAH Ultra Cinema Stream',
    currentProgramDesc: 'Pristine 4K stream of top Hindi cinema.',
    nextProgram: 'Mega Action Film',
    nextProgramTime: '21:00',
    accentColor: '#dc2626',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-09',
    number: 9,
    name: 'Sony MAX ▶',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009249') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009249') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/max.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '1080p FHD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony MAX Deewana Bana De',
    currentProgramDesc: 'Bollywood premier movies, world television premieres, and cricket highlights.',
    nextProgram: 'Sooryavansham Special',
    nextProgramTime: '20:00',
    accentColor: '#f97316',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-10',
    number: 10,
    name: 'Sony MAX ᴜʟᴛʀa ▶',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009249') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009249') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/max.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '4K',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony MAX Ultra Cinema',
    currentProgramDesc: 'Crisp cinematic stream directly from OTT broadcast master.',
    nextProgram: 'Blockbuster World Premiere',
    nextProgramTime: '22:00',
    accentColor: '#ea580c',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-11',
    number: 11,
    name: 'Sony MAX ᴴᴰ ▶',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009247') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009247') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/maxhd.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '1080p FHD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony MAX HD Bollywood Theatre',
    currentProgramDesc: 'High-definition Bollywood movies with 5.1 surround sound audio.',
    nextProgram: 'KGF Chapter / Bahubali',
    nextProgramTime: '20:15',
    accentColor: '#e11d48',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-12',
    number: 12,
    name: 'Sony MAX ᴜʟᴛʀa 2 ▶',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009247') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009247') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/maxhd.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '4K',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony MAX HD Ultra Relay',
    currentProgramDesc: 'Direct worker stream with full bit-rate transparency.',
    nextProgram: 'Superhit Night Movie',
    nextProgramTime: '23:00',
    accentColor: '#be123c',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-13',
    number: 13,
    name: 'Sony MAX 2 ᴴᴰ ▶',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000044878') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000044878') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/max2.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '1080p FHD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony MAX 2 - Jab Dekho Kuch Naya',
    currentProgramDesc: 'Timeless Bollywood cinema, golden retro hits from 70s, 80s, 90s and 2000s.',
    nextProgram: 'Classic Romance Special',
    nextProgramTime: '19:30',
    accentColor: '#8b5cf6',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-14',
    number: 14,
    name: 'Sony MAX 2 ᴜʟᴛʀa ▶',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000044878') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000044878') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    fallbackUrl: '/api/proxy?url=' + encodeURIComponent('https://cloudplay-sonyliv.pages.dev/max2.m3u8'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '4K',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony MAX 2 Ultra Feed',
    currentProgramDesc: 'Pristine 4K classic film feed.',
    nextProgram: 'Evergreen Cinema Showcase',
    nextProgramTime: '22:00',
    accentColor: '#7c3aed',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-15',
    number: 15,
    name: 'Sony Max 1 ᴴᴰ',
    category: 'Movies & Classics',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent(
        'http://tv.cloudcdn.me:80/live.ts?channelId=132468&uid=15301&deviceMac=00:1A:79:31:34:0E'
      ),
    fallbackUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009249') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009249') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    logo: 'https://i.ibb.co/tptfLr0L/unnamed.png',
    quality: '1080p FHD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony Max 1 Live TS Stream',
    currentProgramDesc: 'Direct broadcast MPEG-TS transport stream relay decoded by mpegts.js.',
    nextProgram: 'Evening Feature Film',
    nextProgramTime: '21:00',
    accentColor: '#f59e0b',
    isLive: true,
    sourceType: 'ts',
  },
  {
    id: 'ch-16',
    number: 16,
    name: 'SONY SAB SD OFFICIAL INDIA',
    category: 'Entertainment',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://fifa.assadikb.workers.dev/?id=sonysab_hd') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 7.1.2) ExoPlayerLib/2.14.1'),
    fallbackUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009248') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009248') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    logo: 'https://i.ibb.co/9H8mBLSg/images.jpg',
    quality: 'SD',
    country: 'India',
    language: 'Hindi',
    currentProgram: 'Sony SAB Official Feed',
    currentProgramDesc: 'Official worker relay for Sony SAB entertainment.',
    nextProgram: 'Comedy Hour',
    nextProgramTime: '20:00',
    accentColor: '#10b981',
    isLive: true,
    sourceType: 'hls',
  },
  {
    id: 'ch-17',
    number: 17,
    name: 'Doraemon OFFICIAL SpeciaL',
    category: 'Animation & Kids',
    streamUrl:
      '/api/proxy?url=' +
      encodeURIComponent(
        'http://main.light-ott.net/play/live.php?mac=00:1A:79:C8:62:98&stream=734308&extension=ts'
      ),
    fallbackUrl:
      '/api/proxy?url=' +
      encodeURIComponent('https://sony.dongobd247.workers.dev/stream.m3u8?id=1000009246') +
      '&referer=' +
      encodeURIComponent('https://playyonogames.in/sliv/stream.m3u8?id=1000009246') +
      '&ua=' +
      encodeURIComponent('oxoo/1.3.9.d (Linux;Android 16) ExoPlayerLib/2.14.1'),
    logo: 'https://i.ibb.co/5xxbSfyp/images.jpg',
    quality: 'HD',
    country: 'Universal',
    language: 'Hindi / Universal',
    currentProgram: 'Doraemon 24/7 Special Episodes Marathon',
    currentProgramDesc: 'All-day non-stop Doraemon adventures, gadget magic, Nobita and friends specials.',
    nextProgram: 'Doraemon Movie: Stand By Me',
    nextProgramTime: '19:00',
    accentColor: '#0284c7',
    isLive: true,
    sourceType: 'ts',
  },
];

export const CATEGORIES: string[] = [
  'All',
  'Entertainment',
  'Movies & Classics',
  'Animation & Kids',
];
