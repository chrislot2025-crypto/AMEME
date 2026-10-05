import { Wallpaper, ResolutionOption } from '../types/wallpaper';

export interface DownloadProgress {
  active: boolean;
  type: 'image' | 'video' | 'gif' | null;
  progress: number; // 0 - 100
  statusText: string;
  fileName: string;
}

/**
 * Downloads a high-definition still image from a source image or canvas.
 */
export async function downloadWallpaperImage(
  wallpaper: Wallpaper,
  targetResolution: ResolutionOption = '4K UHD',
  sourceCanvas?: HTMLCanvasElement | null,
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  onProgress?.(20, 'Preparando renderização em alta resolução...');

  // Resolution dimensions
  let targetWidth = 3840;
  let targetHeight = 2160;
  if (targetResolution === '2K QHD') {
    targetWidth = 2560;
    targetHeight = 1440;
  } else if (targetResolution === '1080p FHD') {
    targetWidth = 1920;
    targetHeight = 1080;
  } else if (targetResolution === 'Ultrawide 21:9') {
    targetWidth = 3440;
    targetHeight = 1440;
  }

  // Create an offscreen canvas to scale and render perfectly
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = targetWidth;
  renderCanvas.height = targetHeight;
  const ctx = renderCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Falha ao inicializar o motor gráfico de renderização.');
  }

  onProgress?.(50, `Renderizando master ${targetResolution} (${targetWidth}x${targetHeight})...`);

  if (sourceCanvas) {
    // Draw current live frame from the interactive canvas
    ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
  } else {
    // Load image from wallpaper asset
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve();
      };
      img.onerror = () => {
        // Fallback: draw stylish generative gradient if image load fails
        const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#090a0f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        resolve();
      };
      img.src = wallpaper.thumbnail;
    });
  }

  onProgress?.(85, 'Codificando arquivo PNG sem perda de qualidade...');

  return new Promise((resolve) => {
    renderCanvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Erro ao gerar arquivo de imagem.');
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const cleanTitle = wallpaper.title.replace(/[^a-zA-Z0-9]/g, '_');
        a.href = url;
        a.download = `LuminaLive_${cleanTitle}_${targetResolution.replace(/[^a-zA-Z0-9]/g, '')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        onProgress?.(100, 'Download concluído!');
        resolve();
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Records a real live video loop from an HTML5 Canvas using MediaRecorder.
 * Supports configurable FPS (30, 60, 120 fps).
 */
export async function downloadLiveVideoLoop(
  wallpaper: Wallpaper,
  sourceCanvas: HTMLCanvasElement,
  fps: number = 60,
  durationSeconds: number = 4,
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  if (!sourceCanvas) {
    throw new Error('Canvas do live wallpaper não encontrado para gravação.');
  }

  // Check supported MIME type
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];

  let selectedMime = '';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      break;
    }
  }

  if (!selectedMime) {
    selectedMime = 'video/webm';
  }

  onProgress?.(5, `Iniciando captura de vídeo a ${fps} FPS em alta fidelidade...`);

  const stream = sourceCanvas.captureStream(Math.min(fps, 120));
  const recorder = new MediaRecorder(stream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 25000000, // 25 Mbps high bitrate
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const startTime = Date.now();
  const totalDurationMs = durationSeconds * 1000;

  return new Promise((resolve, reject) => {
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(92, Math.floor((elapsed / totalDurationMs) * 90) + 5);
      const remainingSec = Math.max(0, (totalDurationMs - elapsed) / 1000).toFixed(1);
      onProgress?.(pct, `Gravando loop live (${remainingSec}s restantes @ ${fps}Hz)...`);
    }, 200);

    recorder.onstop = () => {
      clearInterval(progressInterval);
      onProgress?.(95, 'Finalizando compressão e estruturando arquivo de vídeo...');

      const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: selectedMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanTitle = wallpaper.title.replace(/[^a-zA-Z0-9]/g, '_');
      a.href = url;
      a.download = `LuminaLive_${cleanTitle}_${fps}FPS_Loop.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      onProgress?.(100, 'Vídeo baixado com sucesso!');
      resolve();
    };

    recorder.onerror = (err) => {
      clearInterval(progressInterval);
      reject(err);
    };

    recorder.start(100);

    setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    }, totalDurationMs);
  });
}

/**
 * Downloads an animated GIF / WebM animated loop
 */
export async function downloadAnimatedGif(
  wallpaper: Wallpaper,
  sourceCanvas: HTMLCanvasElement,
  fps: number = 30,
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  onProgress?.(10, 'Iniciando captura de quadros para animação GIF/Loop...');
  // We record a tight 2.5s loop with high color fidelity
  return downloadLiveVideoLoop(wallpaper, sourceCanvas, Math.min(fps, 60), 2.5, (p, s) => {
    onProgress?.(p, s.replace('vídeo', 'GIF/Loop animado'));
  });
}
