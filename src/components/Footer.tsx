import React from 'react';
import { ThemeMode } from '../types/wallpaper';
import { Sparkles, Moon, Sun, Flame, Monitor } from 'lucide-react';

interface FooterProps {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  themeMode,
  onThemeChange,
  onNavigateTab,
}) => {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 py-12 text-xs text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-base font-bold text-white font-display">
              LuminaLive
            </span>
            <p className="text-neutral-500 max-w-sm">
              Plataforma de live wallpapers em alta definição com suporte nativo a taxas de atualização até 240Hz, downloads em MP4, GIF e 4K.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center gap-6 text-neutral-400">
            <button
              onClick={() => onNavigateTab('explore')}
              className="hover:text-white transition-colors"
            >
              Explorar Wallpapers
            </button>
            <button
              onClick={() => onNavigateTab('high-fps')}
              className="hover:text-white transition-colors"
            >
              Monitor 240Hz
            </button>
            <button
              onClick={() => onNavigateTab('artists')}
              className="hover:text-white transition-colors"
            >
              Artistas Verificados
            </button>
            <button
              onClick={() => onNavigateTab('generator')}
              className="hover:text-white transition-colors"
            >
              Motor Procedural
            </button>
          </div>

          {/* Theme switcher in footer */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Tema Noturno:</span>
            <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-lg">
              <button
                onClick={() => onThemeChange('dark-midnight')}
                title="Modo Escuro Midnight"
                className={`p-1.5 rounded transition-colors ${
                  themeMode === 'dark-midnight' ? 'bg-sky-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onThemeChange('dark-oled')}
                title="Modo OLED Preto Puro"
                className={`p-1.5 rounded transition-colors ${
                  themeMode === 'dark-oled' ? 'bg-emerald-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onThemeChange('night-warm')}
                title="Filtro Noturno Âmbar"
                className={`p-1.5 rounded transition-colors ${
                  themeMode === 'night-warm' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onThemeChange('light')}
                title="Modo Claro"
                className={`p-1.5 rounded transition-colors ${
                  themeMode === 'light' ? 'bg-white text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-[11px]">
          <span>© 2026 LuminaLive Wallpapers. Livre de DRM e marcas d'água invasivas.</span>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono">
            <span>UHD 3840×2160</span>
            <span aria-hidden="true">·</span>
            <span>VP9 / MP4</span>
            <span aria-hidden="true">·</span>
            <span>240Hz Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
