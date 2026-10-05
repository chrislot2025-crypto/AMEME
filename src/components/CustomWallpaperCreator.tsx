import React, { useState, useRef } from 'react';
import { RefreshRateOption, ResolutionOption, Wallpaper } from '../types/wallpaper';
import { downloadLiveVideoLoop, downloadWallpaperImage, downloadAnimatedGif, DownloadProgress } from '../utils/downloadEngine';
import { Sparkles, Download, Zap, Sliders, Image as ImageIcon, Film, Play, RefreshCw, Upload, CheckCircle2, Loader2 } from 'lucide-react';

export const CustomWallpaperCreator: React.FC = () => {
  const [styleMode, setStyleMode] = useState<'matrix' | 'nebula' | 'cyber-waves' | 'warp-speed'>('nebula');
  const [customFps, setCustomFps] = useState<RefreshRateOption>(120);
  const [resolution, setResolution] = useState<ResolutionOption>('4K UHD');
  const [accentColor, setAccentColor] = useState<string>('#38bdf8');
  const [speed, setSpeed] = useState<number>(1.2);
  const [density, setDensity] = useState<number>(150);
  const [measuredFps, setMeasuredFps] = useState<number>(120);
  const [downloadState, setDownloadState] = useState<DownloadProgress>({
    active: false,
    type: null,
    progress: 0,
    statusText: '',
    fileName: '',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let animId: number;
    let time = 0;
    const frameInterval = 1000 / customFps;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    // Particle pools
    const stars = Array.from({ length: density }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random(),
      pz: 1,
    }));

    const render = (now: number) => {
      if (!isRunning) return;
      animId = requestAnimationFrame(render);

      const elapsed = now - lastTime;
      if (elapsed < frameInterval - 1) return;
      lastTime = now - (elapsed % frameInterval);

      frameCount++;
      if (now - fpsTimer >= 500) {
        setMeasuredFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
      }

      time += (elapsed / 1000) * speed;

      const w = canvas.width;
      const h = canvas.height;

      // Dark background
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, w, h);

      if (styleMode === 'nebula') {
        // Bioluminescent cosmic nebula
        const cx = w * 0.5;
        const cy = h * 0.5;
        for (let i = 0; i < 5; i++) {
          const radius = 120 + i * 45 + Math.sin(time + i) * 30;
          const grad = ctx.createRadialGradient(
            cx + Math.cos(time * 0.5 + i) * 60,
            cy + Math.sin(time * 0.5 + i) * 40,
            10,
            cx,
            cy,
            radius
          );
          grad.addColorStop(0, accentColor + '99');
          grad.addColorStop(0.5, '#6366f144');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      } else if (styleMode === 'warp-speed') {
        // Warp drive stars
        const cx = w * 0.5;
        const cy = h * 0.5;
        ctx.fillStyle = accentColor;
        ctx.strokeStyle = accentColor;

        stars.forEach((s) => {
          s.z -= 0.008 * speed;
          if (s.z <= 0) {
            s.z = 1;
            s.x = (Math.random() - 0.5) * 2;
            s.y = (Math.random() - 0.5) * 2;
          }

          const k = 300 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          if (px >= 0 && px < w && py >= 0 && py < h) {
            const size = Math.max(1, (1 - s.z) * 3.5);
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else if (styleMode === 'cyber-waves') {
        // Sine wave spectrum
        ctx.lineWidth = 2;
        for (let j = 0; j < 6; j++) {
          ctx.strokeStyle = j % 2 === 0 ? accentColor : '#a855f7';
          ctx.beginPath();
          for (let x = 0; x < w; x += 15) {
            const y = h * 0.5 + Math.sin(x * 0.01 + time * 2 + j * 0.6) * (60 + j * 12);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else {
        // Matrix data stream
        ctx.fillStyle = accentColor;
        ctx.font = '16px monospace';
        for (let i = 0; i < 30; i++) {
          const x = i * (w / 30);
          const y = ((time * 300 + i * 90) % h);
          ctx.fillText(String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96)), x, y);
        }
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [styleMode, customFps, speed, density, accentColor]);

  // Download actions
  const mockWallpaper: Wallpaper = {
    id: 'custom-procedural',
    title: `LuminaLive_Custom_${styleMode}`,
    artist: { id: 'user-custom', name: 'Você (Custom)', handle: '@user', avatar: '', verified: true, totalWorks: 1, bio: '' },
    category: 'Fluxo Abstrato',
    tags: ['Custom', 'Live Wallpaper', `${customFps}Hz`],
    resolution,
    aspectRatio: '16:9',
    nativeFps: customFps,
    duration: '0:10 Loop',
    fileSizes: { image4k: '14MB', videoMp4: '42MB', gifAnim: '25MB' },
    thumbnail: '',
    engineType: 'fluid-nebula',
    views: 1,
    downloads: 1,
    likes: 1,
    description: 'Wallpaper animado gerado pelo motor procedural LuminaLive.',
  };

  const handleDownload = async (type: 'image' | 'video' | 'gif') => {
    if (!canvasRef.current) return;
    setDownloadState({
      active: true,
      type,
      progress: 10,
      statusText: `Preparando download de ${type.toUpperCase()}...`,
      fileName: `Custom_${styleMode}`,
    });

    try {
      if (type === 'image') {
        await downloadWallpaperImage(mockWallpaper, resolution, canvasRef.current, (p, s) => {
          setDownloadState((prev) => ({ ...prev, progress: p, statusText: s }));
        });
      } else if (type === 'video') {
        await downloadLiveVideoLoop(mockWallpaper, canvasRef.current, customFps, 3.5, (p, s) => {
          setDownloadState((prev) => ({ ...prev, progress: p, statusText: s }));
        });
      } else {
        await downloadAnimatedGif(mockWallpaper, canvasRef.current, 30, (p, s) => {
          setDownloadState((prev) => ({ ...prev, progress: p, statusText: s }));
        });
      }
      setTimeout(() => {
        setDownloadState((prev) => ({ ...prev, active: false }));
      }, 1200);
    } catch (err) {
      setDownloadState((prev) => ({ ...prev, active: false }));
      alert('Erro ao processar download.');
    }
  };

  return (
    <div className="py-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Personalizador Procedural de Live Wallpapers
        </h2>
        <p className="text-sm text-neutral-400">
          Ajuste parâmetros físicos, taxas de atualização extremas até 240Hz, esquemas de cores e baixe imediatamente em MP4, GIF ou imagem 4K.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
            {/* OSD Telemetry */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
              <span className="bg-black/75 px-2.5 py-1 rounded border border-white/10 font-mono text-xs text-emerald-400 tabular-nums">
                {measuredFps} FPS (Alvo: {customFps}Hz)
              </span>
              <span className="bg-black/75 px-2 py-1 rounded border border-white/10 font-mono text-xs text-sky-400">
                {resolution}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={1920}
              height={1080}
              className="w-full h-full object-cover block"
            />
          </div>

          {/* Download progress bar */}
          {downloadState.active && (
            <div className="p-3.5 rounded-xl bg-sky-950/80 border border-sky-500/30 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs text-white">
                  <span>{downloadState.statusText}</span>
                  <span className="font-mono text-sky-300 font-bold">{downloadState.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all duration-150"
                    style={{ width: `${downloadState.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Download Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleDownload('image')}
              disabled={downloadState.active}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Baixar Imagem 4K</span>
            </button>

            <button
              onClick={() => handleDownload('video')}
              disabled={downloadState.active}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Film className="w-4 h-4" />
              <span>Baixar Vídeo MP4 ({customFps} FPS)</span>
            </button>

            <button
              onClick={() => handleDownload('gif')}
              disabled={downloadState.active}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 border border-amber-500/30 hover:bg-neutral-800 text-amber-300 font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Baixar Loop GIF</span>
            </button>
          </div>
        </div>

        {/* Right: Customization Controls */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white uppercase tracking-wider block">
              Estilo Procedural
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'nebula', name: 'Nebulosa Cósmica' },
                { id: 'warp-speed', name: 'Warp Speed Hiper' },
                { id: 'cyber-waves', name: 'Ondas Cyberpunk' },
                { id: 'matrix', name: 'Matrix Data Rain' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setStyleMode(m.id as any)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    styleMode === m.id
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                      : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh rate customizer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Taxa de Atualização
              </span>
              <span className="font-mono text-sky-400 font-bold">{customFps} Hz</span>
            </div>

            <div className="flex gap-1">
              {([30, 60, 120, 144, 240] as RefreshRateOption[]).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setCustomFps(hz)}
                  className={`flex-1 py-1.5 text-xs font-mono rounded transition-colors ${
                    customFps === hz
                      ? 'bg-sky-500 text-neutral-950 font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  {hz}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white uppercase tracking-wider block">
              Cor do Feixe de Luz / Plasma
            </label>
            <div className="flex items-center gap-2">
              {['#38bdf8', '#f43f5e', '#10b981', '#a855f7', '#fbbf24', '#ffffff'].map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    accentColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Speed & Density */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Velocidade de Deslocamento</span>
                <span className="font-mono text-neutral-400">{speed}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.2"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Densidade de Partículas</span>
                <span className="font-mono text-neutral-400">{density}</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="25"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
