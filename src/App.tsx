import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WALLPAPERS } from './data/wallpapers';
import { Wallpaper, WallpaperCategory, ThemeMode } from './types/wallpaper';
import { TopNav } from './components/TopNav';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { WallpaperCard } from './components/WallpaperCard';
import { WallpaperStudioModal } from './components/WallpaperStudioModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ArtistsView } from './components/ArtistsView';
import { HighFpsView } from './components/HighFpsView';
import { CustomWallpaperCreator } from './components/CustomWallpaperCreator';
import { Footer } from './components/Footer';
import { downloadWallpaperImage, downloadLiveVideoLoop, downloadAnimatedGif } from './utils/downloadEngine';
import { Sparkles, Download, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  // Theme state: defaults to dark-midnight (Modo Escuro Integrado)
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark-midnight');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('explore');

  // Active studio modal
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);

  // Keyboard shortcuts cheat sheet modal
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Keyboard navigation index in explorer grid
  const [keyboardSelectedIndex, setKeyboardSelectedIndex] = useState<number>(-1);

  // Search input ref for instant '/' shortcut focus
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<WallpaperCategory>('Todos');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('all');
  const [selectedResolution, setSelectedResolution] = useState<string>('all');
  const [selectedFps, setSelectedFps] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'downloads' | 'fps' | 'newest'>('popular');

  // Favorites
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(['wp-cyber-city']));

  // Toast / notification state for direct downloads
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastLoading, setToastLoading] = useState<boolean>(false);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered & sorted wallpapers list
  const filteredWallpapers = useMemo(() => {
    return WALLPAPERS.filter((w) => {
      // Category match
      if (selectedCategory !== 'Todos' && w.category !== selectedCategory) {
        return false;
      }
      // Artist match
      if (selectedArtistId !== 'all' && w.artist.id !== selectedArtistId) {
        return false;
      }
      // Resolution match
      if (selectedResolution !== 'all' && w.resolution !== selectedResolution) {
        return false;
      }
      // FPS match
      if (selectedFps !== 'all' && w.nativeFps < selectedFps) {
        return false;
      }
      // Search query match
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const inTitle = w.title.toLowerCase().includes(q);
        const inArtist = w.artist.name.toLowerCase().includes(q);
        const inDesc = w.description.toLowerCase().includes(q);
        const inTags = w.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inArtist && !inDesc && !inTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.views - a.views;
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      if (sortBy === 'fps') return b.nativeFps - a.nativeFps;
      return 0; // default order
    });
  }, [selectedCategory, selectedArtistId, selectedResolution, selectedFps, searchQuery, sortBy]);

  // Reset keyboard selected index when filter results change
  useEffect(() => {
    setKeyboardSelectedIndex(-1);
  }, [filteredWallpapers]);

  // Handle direct download from card buttons
  const handleDirectDownload = async (wallpaper: Wallpaper, format: 'image' | 'video' | 'gif') => {
    setToastLoading(true);
    setToastMessage(`Processando download de ${format.toUpperCase()} para "${wallpaper.title}"...`);

    try {
      if (format === 'image') {
        await downloadWallpaperImage(wallpaper, wallpaper.resolution, null, (_, status) => {
          setToastMessage(status);
        });
      } else {
        // Open studio modal so user can capture live canvas at selected FPS
        setSelectedWallpaper(wallpaper);
        setToastMessage(`Abrindo Studio para gravação do loop ${format.toUpperCase()} a ${wallpaper.nativeFps} FPS...`);
      }
      setTimeout(() => {
        setToastLoading(false);
        setToastMessage(null);
      }, 3500);
    } catch (err) {
      setToastLoading(false);
      setToastMessage('Erro no processamento do download.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Handler for selecting an artist from view or modal
  const handleSelectArtist = (artistId: string) => {
    setSelectedArtistId(artistId);
    setActiveTab('explore');
  };

  // Cycle themes helper
  const cycleTheme = () => {
    const modes: ThemeMode[] = ['dark-midnight', 'dark-oled', 'night-warm', 'light'];
    const nextIdx = (modes.indexOf(themeMode) + 1) % modes.length;
    setThemeMode(modes[nextIdx]);
  };

  // Global Keyboard Shortcuts System
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      const isInputActive = activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);

      // Shortcut: Esc to close modals or blur input
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          e.preventDefault();
          setIsShortcutsOpen(false);
          return;
        }
        if (selectedWallpaper) {
          e.preventDefault();
          setSelectedWallpaper(null);
          return;
        }
        if (isInputActive) {
          activeElement?.blur();
          return;
        }
        if (searchQuery) {
          e.preventDefault();
          setSearchQuery('');
          return;
        }
        if (keyboardSelectedIndex !== -1) {
          e.preventDefault();
          setKeyboardSelectedIndex(-1);
          return;
        }
      }

      // If user is currently typing in an input, don't trigger global navigation keys
      if (isInputActive) {
        return;
      }

      // Shortcut: '/' to focus search input
      if (e.key === '/') {
        e.preventDefault();
        setActiveTab('explore');
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 10);
        return;
      }

      // Shortcut: '?' to toggle keyboard shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Shortcut: 't' or 'T' to cycle themes
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        cycleTheme();
        return;
      }

      // Shortcut: '1', '2', '3', '4' to switch tabs
      if (e.key === '1') {
        e.preventDefault();
        setActiveTab('explore');
        return;
      } else if (e.key === '2') {
        e.preventDefault();
        setActiveTab('high-fps');
        return;
      } else if (e.key === '3') {
        e.preventDefault();
        setActiveTab('artists');
        return;
      } else if (e.key === '4') {
        e.preventDefault();
        setActiveTab('generator');
        return;
      }

      // Arrow Key Navigation in Explorer Grid (when modal is NOT open)
      if (activeTab === 'explore' && !selectedWallpaper && filteredWallpapers.length > 0) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setKeyboardSelectedIndex((prev) => {
            const next = prev < filteredWallpapers.length - 1 ? prev + 1 : 0;
            return next;
          });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setKeyboardSelectedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : filteredWallpapers.length - 1;
            return next;
          });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setKeyboardSelectedIndex((prev) => {
            // Jump forward 4 cards (one row in grid)
            const next = Math.min(filteredWallpapers.length - 1, Math.max(0, prev + 4));
            return next;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setKeyboardSelectedIndex((prev) => {
            // Jump backward 4 cards
            const next = Math.max(0, prev - 4);
            return next;
          });
        } else if (e.key === 'Enter') {
          if (keyboardSelectedIndex >= 0 && keyboardSelectedIndex < filteredWallpapers.length) {
            e.preventDefault();
            setSelectedWallpaper(filteredWallpapers[keyboardSelectedIndex]);
          }
        } else if (e.key === 'l' || e.key === 'L') {
          if (keyboardSelectedIndex >= 0 && keyboardSelectedIndex < filteredWallpapers.length) {
            e.preventDefault();
            toggleLike(filteredWallpapers[keyboardSelectedIndex].id);
          }
        } else if (e.key === 'd' || e.key === 'D') {
          if (keyboardSelectedIndex >= 0 && keyboardSelectedIndex < filteredWallpapers.length) {
            e.preventDefault();
            handleDirectDownload(filteredWallpapers[keyboardSelectedIndex], 'image');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isShortcutsOpen,
    selectedWallpaper,
    searchQuery,
    keyboardSelectedIndex,
    activeTab,
    filteredWallpapers,
    themeMode,
  ]);

  // Current wallpaper index for Studio Modal prev/next navigation
  const modalCurrentIndex = selectedWallpaper
    ? filteredWallpapers.findIndex((w) => w.id === selectedWallpaper.id)
    : -1;
  const hasPrevWallpaper = modalCurrentIndex > 0;
  const hasNextWallpaper = modalCurrentIndex >= 0 && modalCurrentIndex < filteredWallpapers.length - 1;

  const handlePrevWallpaper = () => {
    if (hasPrevWallpaper) {
      setSelectedWallpaper(filteredWallpapers[modalCurrentIndex - 1]);
    }
  };

  const handleNextWallpaper = () => {
    if (hasNextWallpaper) {
      setSelectedWallpaper(filteredWallpapers[modalCurrentIndex + 1]);
    }
  };

  // Determine root theme class
  const getThemeClass = () => {
    switch (themeMode) {
      case 'dark-oled':
        return 'bg-black text-neutral-100 dark';
      case 'night-warm':
        return 'bg-[#0f0e0c] text-[#f5eedb] dark';
      case 'light':
        return 'bg-neutral-50 text-neutral-900';
      default:
        return 'bg-[#090b10] text-neutral-100 dark';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${getThemeClass()}`}>
      {/* Top Navigation with Shortcuts button */}
      <TopNav
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenStudioModal={() => setSelectedWallpaper(WALLPAPERS[0])}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        {activeTab === 'explore' && (
          <>
            {/* Hero Section with Live Interactive Preview */}
            <HeroSection
              featuredWallpaper={WALLPAPERS[0]}
              onOpenStudio={setSelectedWallpaper}
              onDirectDownload={handleDirectDownload}
            />

            {/* Filter Bar with Advanced Search and [/] shortcut hint */}
            <FilterBar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedArtistId={selectedArtistId}
              onSelectArtistId={setSelectedArtistId}
              selectedResolution={selectedResolution}
              onSelectResolution={setSelectedResolution}
              selectedFps={selectedFps}
              onSelectFps={setSelectedFps}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalResults={filteredWallpapers.length}
              searchInputRef={searchInputRef}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
            />

            {/* Quick keyboard navigation hint bar */}
            {filteredWallpapers.length > 0 && (
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="text-neutral-400">Navegação rápida:</span>
                  <kbd className="px-1 py-0.2 bg-neutral-900 border border-white/10 rounded text-neutral-300">←</kbd>
                  <kbd className="px-1 py-0.2 bg-neutral-900 border border-white/10 rounded text-neutral-300">→</kbd>
                  <span>para selecionar</span>
                  <span aria-hidden="true">·</span>
                  <kbd className="px-1 py-0.2 bg-neutral-900 border border-white/10 rounded text-neutral-300">Enter</kbd>
                  <span>para abrir</span>
                  <span aria-hidden="true">·</span>
                  <kbd className="px-1 py-0.2 bg-neutral-900 border border-white/10 rounded text-neutral-300">/</kbd>
                  <span>para buscar</span>
                </span>
                <button
                  onClick={() => setIsShortcutsOpen(true)}
                  className="hover:text-sky-400 transition-colors hidden sm:inline"
                >
                  Ver todos atalhos (?)
                </button>
              </div>
            )}

            {/* Wallpapers Grid */}
            <div className="py-6">
              {filteredWallpapers.length === 0 ? (
                <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-8">
                  <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
                  <h3 className="text-base font-semibold text-white">
                    Nenhum live wallpaper encontrado
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Tente relaxar os filtros de busca, categoria ou selecionar outro artista.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('Todos');
                      setSelectedArtistId('all');
                      setSelectedResolution('all');
                      setSelectedFps('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Restaurar Filtros Padrão
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredWallpapers.map((wallpaper, idx) => (
                    <WallpaperCard
                      key={wallpaper.id}
                      wallpaper={wallpaper}
                      isSelected={keyboardSelectedIndex === idx}
                      onSelect={(w) => {
                        setKeyboardSelectedIndex(idx);
                        setSelectedWallpaper(w);
                      }}
                      onDownload={handleDirectDownload}
                      onToggleLike={toggleLike}
                      isLiked={likedIds.has(wallpaper.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: High FPS (240Hz Ultra) View */}
        {activeTab === 'high-fps' && (
          <HighFpsView
            onSelectWallpaper={setSelectedWallpaper}
            onDownload={handleDirectDownload}
          />
        )}

        {/* Tab 3: Artists View */}
        {activeTab === 'artists' && (
          <ArtistsView onSelectArtist={handleSelectArtist} />
        )}

        {/* Tab 4: Procedural Customizer Studio */}
        {activeTab === 'generator' && (
          <CustomWallpaperCreator />
        )}
      </main>

      {/* Interactive Live Wallpaper Studio Modal with Prev / Next keyboard support */}
      {selectedWallpaper && (
        <WallpaperStudioModal
          wallpaper={selectedWallpaper}
          onClose={() => setSelectedWallpaper(null)}
          onSelectArtist={handleSelectArtist}
          onPrevWallpaper={handlePrevWallpaper}
          onNextWallpaper={handleNextWallpaper}
          hasPrev={hasPrevWallpaper}
          hasNext={hasNextWallpaper}
        />
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900 border border-white/20 text-white text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          {toastLoading ? (
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <Footer
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}
