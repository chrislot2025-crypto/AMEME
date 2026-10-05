import React, { useState, useRef } from 'react';
import { Wallpaper, RefreshRateOption, ResolutionOption } from '../types/wallpaper';
import { LiveCanvasEngine } from './LiveCanvasEngine';
import { downloadWallpaperImage, downloadLiveVideoLoop, downloadAnimatedGif, DownloadProgress } from '../utils/downloadEngine';
import {
  X,
  Download,
  Zap,
  Sliders,
  Sparkles,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Image as ImageIcon,
  Film,
  Volume2,
  VolumeX,
  CheckCircle2,
  Loader2,
  User,
  Monitor,
  Cpu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface WallpaperStudioModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onSelectArtist: (artistId: string) => void;
  onPrevWallpaper?: () => void;
  onNextWallpaper?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const WallpaperStudioModal: React.FC<WallpaperStudioModalProps> = ({
  wallpaper,
  onClose,
  onSelectArtist,
  onPrevWallpaper,
  onNextWallpaper,
  hasPrev = false,
  hasNext = false,
}) => {
  if (!wallpaper) return null;

  // Customization state
  const [targetFps, setTargetFps] = useState<RefreshRateOption>(wallpaper.nativeFps);
  const [measuredFps, setMeasuredFps] = useState<number>(wallpaper.nativeFps);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(1000 / wallpaper.nativeFps);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [bloomGlow, setBloomGlow] = useState<boolean>(true);
  const [scanlines, setScanlines] = useState<boolean>(false);
  const [particlesDensity, setParticlesDensity] = useState<number>(1.0);
  const [selectedResolution, setSelectedResolution] = useState<ResolutionOption>(wallpaper.resolution);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Download status state
  const [downloadState, setDownloadState] = useState<DownloadProgress>({
    active: false,
    type: null,
    progress: 0,
    statusText: '',
    fileName: '',
  });

  const canvasInstanceRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioOscillatorRef = useRef<OscillatorNode | null>(null);

  // Toggle ambient audio synth
  const toggleAudio = () => {
    if (isPlayingAudio) {
      if (audioOscillatorRef.current) {
        audioOscillatorRef.current.stop();
        audioOscillatorRef.current.disconnect();
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Create warm ambient drone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 gentle drone

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        audioOscillatorRef.current = osc;
        setIsPlayingAudio(true);
      } catch (err) {
        console.error('Audio error:', err);
      }
    }
  };

  // Download Handlers
  const handleDownloadImage = async () => {
    try {
      setDownloadState({
        active: true,
        type: 'image',
        progress: 10,
        statusText: 'Iniciando captura em 4K...',
        fileName: `${wallpaper.title}.png`,
      });

      await downloadWallpaperImage(
        wallpaper,
        selectedResolution,
        canvasInstanceRef.current,
        (progress, status) => {
          setDownloadState((prev) => ({ ...prev, progress, statusText: status }));
        }
      );

      setTimeout(() => {
        setDownloadState((prev) => ({ ...prev, active: false }));
      }, 1500);
    } catch (err) {
      setDownloadState({
        active: false,
        type: null,
        progress: 0,
        statusText: 'Erro ao gerar imagem.',
        fileName: '',
      });
      alert('Não foi possível gerar a imagem. Tente novamente.');
    }
  };

  const handleDownloadVideo = async () => {
    if (!canvasInstanceRef.current) return;
    try {
      setDownloadState({
        active: true,
        type: 'video',
        progress: 5,
        statusText: `Preparando gravação a ${targetFps} FPS...`,
        fileName: `${wallpaper.title}_${targetFps}fps.webm`,
      });

      await downloadLiveVideoLoop(
        wallpaper,
        canvasInstanceRef.current,
        targetFps,
        4.0, // 4-second loop
        (progress, status) => {
          setDownloadState((prev) => ({ ...prev, progress, statusText: status }));
        }
      );

      setTimeout(() => {
        setDownloadState((prev) => ({ ...prev, active: false }));
      }, 1500);
    } catch (err) {
      setDownloadState({
        active: false,
        type: null,
        progress: 0,
        statusText: 'Erro ao gravar vídeo.',
        fileName: '',
      });
      alert('Erro na gravação do vídeo. Seu navegador pode ter bloqueado a captura de tela.');
    }
  };

  const handleDownloadGif = async () => {
    if (!canvasInstanceRef.current) return;
    try {
      setDownloadState({
        active: true,
        type: 'gif',
        progress: 10,
        statusText: 'Gerando quadros do loop GIF...',
        fileName: `${wallpaper.title}_loop.webm`,
      });

      await downloadAnimatedGif(
        wallpaper,
        canvasInstanceRef.current,
        30,
        (progress, status) => {
          setDownloadState((prev) => ({ ...prev, progress, statusText: status }));
        }
      );

      setTimeout(() => {
        setDownloadState((prev) => ({ ...prev, active: false }));
      }, 1500);
    } catch (err) {
      setDownloadState({
        active: false,
        type: null,
        progress: 0,
        statusText: 'Erro ao gerar GIF.',
        fileName: '',
      });
    }
  };

  // Keyboard shortcuts listener for the Studio Modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (hasPrev && onPrevWallpaper) {
          e.preventDefault();
          onPrevWallpaper();
        }
      } else if (e.key === 'ArrowRight') {
        if (hasNext && onNextWallpaper) {
          e.preventDefault();
          onNextWallpaper();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleDownloadImage();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleDownloadVideo();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleDownloadGif();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, hasNext, onPrevWallpaper, onNextWallpaper, onClose, isPlayingAudio]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-6xl flex flex-col bg-neutral-950 border border-white/15 rounded-none md:rounded-2xl overflow-hidden shadow-2xl ${
          isFullscreen ? 'h-full max-w-none rounded-none' : 'max-h-[95vh]'
        }`}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {wallpaper.title}
              </h2>
              {/* Clean unboxed metadata */}
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{wallpaper.category}</span>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => {
                    onSelectArtist(wallpaper.artist.id);
                    onClose();
                  }}
                  className="hover:text-sky-400 underline underline-offset-2 transition-colors"
                >
                  {wallpaper.artist.name}
                </button>
                <span aria-hidden="true">·</span>
                <span>{selectedResolution}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next navigation buttons */}
            {(onPrevWallpaper || onNextWallpaper) && (
              <div className="hidden sm:flex items-center gap-1 mr-2 p-1 bg-white/5 border border-white/10 rounded-lg">
                <button
                  onClick={onPrevWallpaper}
                  disabled={!hasPrev}
                  title="Wallpaper anterior (Seta Esquerda ←)"
                  className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-neutral-500 px-1">← / →</span>
                <button
                  onClick={onNextWallpaper}
                  disabled={!hasNext}
                  title="Próximo wallpaper (Seta Direita →)"
                  className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={toggleAudio}
              title={isPlayingAudio ? 'Mutar áudio ambiente (tecla M)' : 'Ouvir sintetizador ambiente relaxante (tecla M)'}
              className={`p-2 rounded-lg border transition-colors ${
                isPlayingAudio
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Sair da tela cheia (tecla F)' : 'Modo tela cheia (tecla F)'}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              title="Fechar Studio (tecla Esc)"
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-rose-500/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split Studio */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Canvas Preview Area (8 cols) */}
          <div className="lg:col-span-8 p-4 md:p-6 flex flex-col justify-center items-center bg-neutral-950 relative border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="w-full relative aspect-video rounded-xl overflow-hidden border border-white/15 bg-black shadow-2xl">
              {/* Telemetry OSD Overlay */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
                <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-white/15 text-xs font-mono text-emerald-400 tabular-nums flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{measuredFps} FPS</span>
                  <span className="text-neutral-500">|</span>
                  <span className="text-neutral-300">{frameTimeMs.toFixed(1)} ms</span>
                </div>
                <div className="bg-black/75 backdrop-blur-md px-2 py-1 rounded border border-white/15 text-[11px] font-mono text-sky-300">
                  Target: {targetFps}Hz
                </div>
              </div>

              {/* Live Canvas Engine */}
              <LiveCanvasEngine
                wallpaper={wallpaper}
                targetFps={targetFps}
                speedMultiplier={speedMultiplier}
                bloomGlow={bloomGlow}
                scanlines={scanlines}
                particlesDensity={particlesDensity}
                onFpsUpdate={(fps, ms) => {
                  setMeasuredFps(fps);
                  setFrameTimeMs(ms);
                }}
                canvasRefCallback={(c) => {
                  canvasInstanceRef.current = c;
                }}
                className="w-full h-full"
              />

              {/* Watermark/Engine label */}
              <div className="absolute bottom-3 right-3 z-20 pointer-events-none bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-neutral-400">
                LuminaLive v2.4 Engine · 4K Native
              </div>
            </div>

            {/* In-canvas notification for download progress */}
            {downloadState.active && (
              <div className="w-full mt-4 p-3.5 rounded-xl bg-sky-950/80 border border-sky-500/30 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-sky-400 animate-spin shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{downloadState.statusText}</span>
                    <span className="font-mono text-sky-300 font-bold tabular-nums">
                      {downloadState.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-200"
                      style={{ width: `${downloadState.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Customization & Download Controls (4 cols) */}
          <div className="lg:col-span-4 p-5 space-y-6 bg-neutral-900/40 overflow-y-auto">
            {/* 1. Taxa de Atualização em Alta Definição (Custom Refresh Rate) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Taxa de Atualização (Hz)
                </label>
                <span className="text-xs font-mono font-bold text-sky-400 tabular-nums">
                  {targetFps} Hz
                </span>
              </div>

              {/* Segmented refresh rate buttons */}
              <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-900 border border-white/10 rounded-lg">
                {([30, 60, 90, 120, 240] as RefreshRateOption[]).map((hz) => (
                  <button
                    key={hz}
                    onClick={() => setTargetFps(hz)}
                    className={`py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                      targetFps === hz
                        ? 'bg-sky-500 text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {hz}
                  </button>
                ))}
              </div>

              {/* Fine tuning slider */}
              <input
                type="range"
                min="24"
                max="240"
                step="6"
                value={targetFps}
                onChange={(e) => setTargetFps(Number(e.target.value) as RefreshRateOption)}
                className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>24Hz Cinema</span>
                <span>60Hz Padrão</span>
                <span>120Hz Pro</span>
                <span>240Hz Ultra</span>
              </div>
            </div>

            {/* 2. Motion Speed & Particles */}
            <div className="space-y-4 pt-3 border-t border-white/10">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300 font-medium">Velocidade da Animação</span>
                  <span className="font-mono text-neutral-400 tabular-nums">{speedMultiplier}x</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="2.5"
                  step="0.25"
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Visual Shaders toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setBloomGlow(!bloomGlow)}
                  className={`p-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                    bloomGlow
                      ? 'bg-sky-950/60 border-sky-500/40 text-sky-200'
                      : 'bg-neutral-900 border-white/10 text-neutral-400'
                  }`}
                >
                  <span className="block font-semibold">Brilho Neon / Bloom</span>
                  <span className="text-[10px] text-neutral-400">
                    {bloomGlow ? 'Ativado' : 'Desativado'}
                  </span>
                </button>

                <button
                  onClick={() => setScanlines(!scanlines)}
                  className={`p-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                    scanlines
                      ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
                      : 'bg-neutral-900 border-white/10 text-neutral-400'
                  }`}
                >
                  <span className="block font-semibold">Filtro CRT Retrô</span>
                  <span className="text-[10px] text-neutral-400">
                    {scanlines ? 'Ativado' : 'Desativado'}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. DOWNLOAD CENTER (COLOCA BOTAO PRA BAIXAR IMAGEM, VIDEO, GIF) */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Opções de Download em Alta Definição
              </h4>

              {/* Resolution Profile Selector for Download */}
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-400">Resolução do Arquivo:</span>
                <select
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value as ResolutionOption)}
                  className="w-full bg-neutral-900 border border-white/10 text-neutral-200 text-xs rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-sky-500"
                >
                  <option value="4K UHD">4K UHD Master (3840 × 2160)</option>
                  <option value="2K QHD">2K Quad HD (2560 × 1440)</option>
                  <option value="1080p FHD">Full HD (1920 × 1080)</option>
                  <option value="Ultrawide 21:9">Ultrawide (3440 × 1440)</option>
                </select>
              </div>

              {/* Download Buttons Stack */}
              <div className="space-y-2 pt-1">
                {/* 1. Download 4K Image */}
                <button
                  onClick={handleDownloadImage}
                  disabled={downloadState.active}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold text-xs transition-all shadow-sm active:scale-98 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Baixar Imagem Estática ({selectedResolution})</span>
                  </div>
                  <span className="font-mono text-[11px] font-normal opacity-80">
                    {wallpaper.fileSizes.image4k}
                  </span>
                </button>

                {/* 2. Download Live MP4 Video Loop */}
                <button
                  onClick={handleDownloadVideo}
                  disabled={downloadState.active}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-98 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span>Baixar Vídeo MP4 ({targetFps} FPS Loop)</span>
                  </div>
                  <span className="font-mono text-[11px] font-normal opacity-80">
                    {wallpaper.fileSizes.videoMp4}
                  </span>
                </button>

                {/* 3. Download Animated GIF */}
                <button
                  onClick={handleDownloadGif}
                  disabled={downloadState.active}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-xs border border-amber-500/20 transition-all active:scale-98 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Baixar GIF Animado em Loop</span>
                  </div>
                  <span className="font-mono text-[11px] font-normal opacity-80">
                    {wallpaper.fileSizes.gifAnim}
                  </span>
                </button>
              </div>
            </div>

            {/* Artist Card */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-3 bg-white/5 p-3 rounded-xl">
              <img
                src={wallpaper.artist.avatar}
                alt={wallpaper.artist.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">
                    {wallpaper.artist.name}
                  </span>
                  {wallpaper.artist.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 truncate">
                  {wallpaper.artist.bio}
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectArtist(wallpaper.artist.id);
                  onClose();
                }}
                className="text-xs text-sky-400 hover:text-sky-300 whitespace-nowrap font-medium"
              >
                Ver Obras
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
