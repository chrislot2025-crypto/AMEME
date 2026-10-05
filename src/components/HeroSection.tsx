import React, { useState } from 'react';
import { Wallpaper, RefreshRateOption } from '../types/wallpaper';
import { LiveCanvasEngine } from './LiveCanvasEngine';
import { Download, Play, Zap, Monitor, Sparkles, Image as ImageIcon, Film, Sliders } from 'lucide-react';

interface HeroSectionProps {
  featuredWallpaper: Wallpaper;
  onOpenStudio: (wallpaper: Wallpaper) => void;
  onDirectDownload: (wallpaper: Wallpaper, format: 'image' | 'video' | 'gif') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredWallpaper,
  onOpenStudio,
  onDirectDownload,
}) => {
  const [heroFps, setHeroFps] = useState<RefreshRateOption>(144);
  const [measuredFps, setMeasuredFps] = useState<number>(144);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(6.9);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);

  return (
    <section className="relative overflow-hidden border-b border-white/10 py-10 md:py-16">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Bold Typography & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              {/* Unboxed clean metadata (Zero-Pill discipline) */}
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                <span className="uppercase tracking-wider">Live Wallpaper Engine</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>Taxa até 240Hz</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>HDR 4K UHD</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
                Live wallpapers em alta definição com taxa de atualização sob controle.
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 max-w-xl font-normal leading-relaxed">
                Transforme seu desktop ou celular com papéis de parede animados fluidos. Baixe gratuitamente em vídeo MP4, GIF animado em loop ou imagens 4K cristalinas.
              </p>
            </div>

            {/* Quick action bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenStudio(featuredWallpaper)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-sky-400 text-neutral-950 hover:bg-sky-300 transition-all shadow-md shadow-sky-500/20 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Abrir no Studio Live</span>
              </button>

              <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg">
                <button
                  onClick={() => onDirectDownload(featuredWallpaper, 'image')}
                  title="Baixar imagem estática em 4K UHD"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Foto 4K</span>
                </button>
                <button
                  onClick={() => onDirectDownload(featuredWallpaper, 'video')}
                  title="Baixar vídeo em loop MP4/WebM"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <Film className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Vídeo MP4</span>
                </button>
                <button
                  onClick={() => onDirectDownload(featuredWallpaper, 'gif')}
                  title="Baixar animação em loop GIF"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>GIF Loop</span>
                </button>
              </div>
            </div>

            {/* Interactive Refresh Rate Switcher right in Hero */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Simulador de Taxa de Atualização (Hz)
                </span>
                <span className="font-mono text-neutral-400 tabular-nums">
                  Medido: <span className="text-emerald-400 font-semibold">{measuredFps} FPS</span> ({frameTimeMs.toFixed(1)}ms)
                </span>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg">
                {([30, 60, 120, 144, 240] as RefreshRateOption[]).map((hz) => (
                  <button
                    key={hz}
                    onClick={() => setHeroFps(hz)}
                    className={`flex-1 py-1.5 px-2 text-xs font-mono font-medium rounded-md transition-all ${
                      heroFps === hz
                        ? 'bg-sky-500 text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {hz}Hz
                  </button>
                ))}
              </div>
            </div>

            {/* Unboxed Metadata Stats */}
            <div className="pt-2 flex items-center gap-6 text-xs text-neutral-400">
              <div>
                <span className="block font-bold text-white text-base tabular-nums font-mono">240Hz</span>
                <span>Taxa Máxima Suportada</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="block font-bold text-white text-base tabular-nums font-mono">4K UHD</span>
                <span>Resolução Master 2160p</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="block font-bold text-white text-base tabular-nums font-mono">100%</span>
                <span>Gratuito e Livre de DRM</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Wallpaper Canvas Container */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-neutral-900 shadow-2xl group">
              {/* Header inside preview frame */}
              <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-white/90">LIVE RENDER</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-white/80">
                  <span className="tabular-nums bg-black/50 px-2 py-0.5 rounded border border-white/10">
                    {heroFps}Hz / {featuredWallpaper.resolution}
                  </span>
                </div>
              </div>

              {/* The Live Interactive Canvas */}
              <div className="aspect-video w-full relative">
                <LiveCanvasEngine
                  wallpaper={featuredWallpaper}
                  targetFps={heroFps}
                  speedMultiplier={speedMultiplier}
                  bloomGlow={true}
                  onFpsUpdate={(fps, ms) => {
                    setMeasuredFps(fps);
                    setFrameTimeMs(ms);
                  }}
                  className="w-full h-full"
                />
              </div>

              {/* Bottom Scrim with Wallpaper Title & Quick Controls */}
              <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {featuredWallpaper.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <span>Por {featuredWallpaper.artist.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredWallpaper.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenStudio(featuredWallpaper)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur-sm transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Ajustar Engine</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
