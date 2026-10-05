import React from 'react';
import { WallpaperCategory, ResolutionOption, RefreshRateOption } from '../types/wallpaper';
import { ARTISTS } from '../data/artists';
import { Search, X, SlidersHorizontal, ArrowUpDown, User } from 'lucide-react';

interface FilterBarProps {
  selectedCategory: WallpaperCategory;
  onSelectCategory: (cat: WallpaperCategory) => void;
  selectedArtistId: string;
  onSelectArtistId: (artistId: string) => void;
  selectedResolution: string;
  onSelectResolution: (res: string) => void;
  selectedFps: number | 'all';
  onSelectFps: (fps: number | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'popular' | 'downloads' | 'fps' | 'newest';
  onSortChange: (sort: 'popular' | 'downloads' | 'fps' | 'newest') => void;
  totalResults: number;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  onOpenShortcuts?: () => void;
}

const CATEGORIES: WallpaperCategory[] = [
  'Todos',
  'Cyberpunk',
  'Anime & Manga',
  'Natureza & Paisagens',
  'Espaço & Cosmos',
  'Minimalista',
  'Fluxo Abstrato',
  'Pixel Art & Retro',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedArtistId,
  onSelectArtistId,
  selectedResolution,
  onSelectResolution,
  selectedFps,
  onSelectFps,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
  searchInputRef,
  onOpenShortcuts,
}) => {
  const hasActiveFilters =
    selectedCategory !== 'Todos' ||
    selectedArtistId !== 'all' ||
    selectedResolution !== 'all' ||
    selectedFps !== 'all' ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    onSelectCategory('Todos');
    onSelectArtistId('all');
    onSelectResolution('all');
    onSelectFps('all');
    onSearchChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (searchQuery) {
        onSearchChange('');
      } else {
        searchInputRef?.current?.blur();
      }
    }
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        {/* Search input with clean icon & [/] shortcut tag */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pesquisar live wallpapers... (Pressione '/' para buscar)"
            className="w-full pl-10 pr-16 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="pointer-events-auto text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-800 border border-white/10 rounded">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Secondary Dropdown Selectors: Artist, Resolution, FPS, Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Artist Selector */}
          <div className="relative">
            <select
              value={selectedArtistId}
              onChange={(e) => onSelectArtistId(e.target.value)}
              className="appearance-none bg-neutral-900 border border-white/10 text-neutral-200 text-xs font-medium rounded-lg px-3 py-2 pr-7 hover:border-white/20 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">Todos os Artistas ({ARTISTS.length})</option>
              {ARTISTS.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name} ({artist.totalWorks})
                </option>
              ))}
            </select>
          </div>

          {/* Resolution Selector */}
          <div className="relative">
            <select
              value={selectedResolution}
              onChange={(e) => onSelectResolution(e.target.value)}
              className="appearance-none bg-neutral-900 border border-white/10 text-neutral-200 text-xs font-medium rounded-lg px-3 py-2 pr-7 hover:border-white/20 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">Todas Resoluções</option>
              <option value="4K UHD">4K UHD (2160p)</option>
              <option value="2K QHD">2K QHD (1440p)</option>
              <option value="1080p FHD">1080p FHD</option>
              <option value="Ultrawide 21:9">Ultrawide 21:9</option>
            </select>
          </div>

          {/* FPS Selector */}
          <div className="relative">
            <select
              value={selectedFps}
              onChange={(e) => onSelectFps(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="appearance-none bg-neutral-900 border border-white/10 text-neutral-200 text-xs font-medium rounded-lg px-3 py-2 pr-7 hover:border-white/20 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">Taxa de Atualização</option>
              <option value="60">60Hz Padrão</option>
              <option value="120">120Hz ProMotion</option>
              <option value="144">144Hz Gaming</option>
              <option value="240">240Hz Ultra High</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="appearance-none bg-neutral-900 border border-white/10 text-neutral-200 text-xs font-medium rounded-lg px-3 py-2 pr-7 hover:border-white/20 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="popular">Mais Populares</option>
              <option value="downloads">Mais Baixados</option>
              <option value="fps">Maior Taxa (FPS)</option>
              <option value="newest">Mais Recentes</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Category Tabs (Segmented control) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors rounded-lg ${
                isActive
                  ? 'bg-white text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search results summary count */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
        <span>
          Exibindo <span className="font-semibold text-white font-mono">{totalResults}</span> live wallpapers
          {selectedCategory !== 'Todos' && ` em ${selectedCategory}`}
          {selectedArtistId !== 'all' && ` pelo artista selecionado`}
        </span>
        <span className="font-mono text-neutral-500">Master 4K / WebM / MP4 / GIF</span>
      </div>
    </div>
  );
};
