import React from 'react';
import { ThemeMode } from '../types/wallpaper';
import { Moon, Sun, Flame, Monitor, Sparkles, Keyboard } from 'lucide-react';

interface TopNavProps {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onOpenStudioModal?: () => void;
  onOpenShortcuts?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  themeMode,
  onThemeChange,
  onOpenStudioModal,
  onOpenShortcuts,
  activeTab,
  onTabChange,
}) => {
  const getThemeIcon = () => {
    switch (themeMode) {
      case 'dark-oled':
        return <Moon className="w-4 h-4 text-emerald-400" />;
      case 'night-warm':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'light':
        return <Sun className="w-4 h-4 text-amber-500" />;
      default:
        return <Moon className="w-4 h-4 text-sky-400" />;
    }
  };

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['dark-midnight', 'dark-oled', 'night-warm', 'light'];
    const nextIdx = (modes.indexOf(themeMode) + 1) % modes.length;
    onThemeChange(modes[nextIdx]);
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'dark-oled':
        return 'OLED Puro';
      case 'night-warm':
        return 'Noturno Âmbar';
      case 'light':
        return 'Modo Claro';
      default:
        return 'Modo Escuro';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-white/10 transition-colors bg-neutral-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('explore');
          }}
          className="text-xl font-bold tracking-tight text-white hover:text-sky-400 transition-colors whitespace-nowrap font-display"
        >
          LuminaLive
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <button
            onClick={() => onTabChange('explore')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'explore' ? 'text-white border-b-2 border-sky-400 pb-0.5' : 'text-neutral-400'
            }`}
          >
            Explorar
          </button>
          <button
            onClick={() => onTabChange('high-fps')}
            className={`transition-colors hover:text-white whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'high-fps' ? 'text-white border-b-2 border-sky-400 pb-0.5' : 'text-neutral-400'
            }`}
          >
            <span>240Hz Ultra</span>
          </button>
          <button
            onClick={() => onTabChange('artists')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'artists' ? 'text-white border-b-2 border-sky-400 pb-0.5' : 'text-neutral-400'
            }`}
          >
            Artistas
          </button>
          <button
            onClick={() => onTabChange('generator')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'generator' ? 'text-white border-b-2 border-sky-400 pb-0.5' : 'text-neutral-400'
            }`}
          >
            Personalizador
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              title="Atalhos de Teclado (Pressione '?')"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300 transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden lg:inline text-[11px] text-neutral-400">Atalhos</span>
              <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-neutral-900 border border-white/15 text-[10px] text-sky-300">?</kbd>
            </button>
          )}

          <button
            onClick={cycleTheme}
            title={`Tema atual: ${getThemeLabel()}. Clique para alternar (ou tecla 'T').`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-200 transition-colors whitespace-nowrap"
          >
            {getThemeIcon()}
            <span className="hidden sm:inline">{getThemeLabel()}</span>
          </button>

          {onOpenStudioModal && (
            <button
              onClick={onOpenStudioModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-950 bg-gradient-to-r from-sky-400 to-indigo-300 hover:from-sky-300 hover:to-indigo-200 transition-all shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
              <span>Studio Live</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
