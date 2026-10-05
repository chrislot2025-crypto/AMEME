export type WallpaperCategory = 
  | 'Todos'
  | 'Cyberpunk'
  | 'Espaço & Cosmos'
  | 'Anime & Manga'
  | 'Natureza & Paisagens'
  | 'Minimalista'
  | 'Fluxo Abstrato'
  | 'Pixel Art & Retro';

export type ResolutionOption = '4K UHD' | '2K QHD' | '1080p FHD' | 'Ultrawide 21:9';

export type RefreshRateOption = 30 | 60 | 90 | 120 | 144 | 240;

export interface Artist {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  totalWorks: number;
  bio: string;
}

export interface Wallpaper {
  id: string;
  title: string;
  artist: Artist;
  category: WallpaperCategory;
  tags: string[];
  resolution: ResolutionOption;
  aspectRatio: '16:9' | '21:9' | '9:16';
  nativeFps: RefreshRateOption;
  duration: string;
  fileSizes: {
    image4k: string;
    videoMp4: string;
    gifAnim: string;
  };
  thumbnail: string;
  engineType: 'cyber-metropolis' | 'cyber-samurai' | 'cosmic-aurora' | 'deep-space' | 'matrix-rain' | 'fluid-nebula' | 'retrowave-grid' | 'zen-particles';
  views: number;
  downloads: number;
  likes: number;
  description: string;
  featured?: boolean;
}

export type ThemeMode = 'dark-oled' | 'dark-midnight' | 'night-warm' | 'light';
