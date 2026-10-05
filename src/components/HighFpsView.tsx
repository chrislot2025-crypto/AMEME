import React, { useState } from 'react';
import { WALLPAPERS } from '../data/wallpapers';
import { Wallpaper, RefreshRateOption } from '../types/wallpaper';
import { WallpaperCard } from './WallpaperCard';
import { Zap, Monitor, Cpu, Gauge, Check } from 'lucide-react';
import { LiveCanvasEngine } from './LiveCanvasEngine';

interface HighFpsViewProps {
  onSelectWallpaper: (w: Wallpaper) => void;
  onDownload: (w: Wallpaper, format: 'image' | 'video' | 'gif') => void;
}

export const HighFpsView: React.FC<HighFpsViewProps> = ({
  onSelectWallpaper,
  onDownload,
}) => {
  const [benchmarkFps, setBenchmarkFps] = useState<RefreshRateOption>(240);
  const [measuredFps, setMeasuredFps] = useState<number>(240);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(4.1);

  const sampleWallpaper = WALLPAPERS[2]; // Cosmic Aurora 240Hz
  const highFpsWallpapers = WALLPAPERS.filter((w) => w.nativeFps >= 144);

  return (
    <div className="py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
          <Zap className="w-3.5 h-3.5" />
          <span>MOTOR DE ALTA TAXA DE ATUALIZAÇÃO</span>
          <span aria-hidden="true">·</span>
          <span>120Hz / 144Hz / 240Hz NATIVO</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display text-balance">
          Experiência Ultra Fluida para Monitores Gamers e Displays Pro
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
          Nossos live wallpapers são renderizados com interpolação de quadros de alta precisão e algoritmos de pacing de delta-tempo. Teste abaixo a diferença em tempo real entre as taxas de quadros.
        </p>
      </div>

      {/* Interactive FPS Benchmark Lab */}
      <div className="rounded-2xl border border-white/15 bg-neutral-900/80 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              Laboratório de Taxa de Quadros em Tempo Real
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Alterne a taxa de atualização abaixo para testar a resposta do motor gráfico na sua tela.
            </p>
          </div>

          {/* Telemetry pill */}
          <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/10 font-mono text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">FPS REAL</span>
              <span className="text-emerald-400 font-bold text-sm tabular-nums">
                {measuredFps} FPS
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-neutral-500 block text-[10px]">FRAME TIME</span>
              <span className="text-sky-300 font-bold text-sm tabular-nums">
                {frameTimeMs.toFixed(1)} ms
              </span>
            </div>
          </div>
        </div>

        {/* Frame rate switch buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {([60, 120, 144, 240] as RefreshRateOption[]).map((hz) => (
            <button
              key={hz}
              onClick={() => setBenchmarkFps(hz)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                benchmarkFps === hz
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg'
                  : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold">{hz} Hz</span>
                {benchmarkFps === hz && <Check className="w-4 h-4 text-sky-400" />}
              </div>
              <span className="text-[11px] text-neutral-400 block mt-1">
                {hz === 60 && 'Taxa padrão de escritório'}
                {hz === 120 && 'Telas ProMotion / 120Hz'}
                {hz === 144 && 'Padrão competitivo gamer'}
                {hz === 240 && 'Ultra alta velocidade esportiva'}
              </span>
            </button>
          ))}
        </div>

        {/* The Live Interactive Canvas at Benchmark FPS */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/15 bg-black">
          <LiveCanvasEngine
            wallpaper={sampleWallpaper}
            targetFps={benchmarkFps}
            speedMultiplier={1.0}
            onFpsUpdate={(fps, ms) => {
              setMeasuredFps(fps);
              setFrameTimeMs(ms);
            }}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Wallpapers with 144Hz & 240Hz native support */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-display">
          Coleção Selecionada para 144Hz e 240Hz
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highFpsWallpapers.map((w) => (
            <WallpaperCard
              key={w.id}
              wallpaper={w}
              onSelect={onSelectWallpaper}
              onDownload={onDownload}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
