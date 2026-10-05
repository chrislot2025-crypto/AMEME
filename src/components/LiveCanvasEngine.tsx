import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshRateOption, Wallpaper } from '../types/wallpaper';

interface LiveCanvasEngineProps {
  wallpaper: Wallpaper;
  targetFps: RefreshRateOption;
  speedMultiplier?: number;
  bloomGlow?: boolean;
  scanlines?: boolean;
  particlesDensity?: number; // 0.5 - 2.0
  isInteractive?: boolean;
  onFpsUpdate?: (measuredFps: number, frameTimeMs: number) => void;
  canvasRefCallback?: (canvas: HTMLCanvasElement | null) => void;
  className?: string;
}

export const LiveCanvasEngine: React.FC<LiveCanvasEngineProps> = ({
  wallpaper,
  targetFps = 60,
  speedMultiplier = 1.0,
  bloomGlow = true,
  scanlines = false,
  particlesDensity = 1.0,
  isInteractive = true,
  onFpsUpdate,
  canvasRefCallback,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const fpsCounterRef = useRef<{ frames: number; lastTime: number }>({ frames: 0, lastTime: performance.now() });
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0.5, y: 0.5, active: false });

  // Preload wallpaper background image if available
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = wallpaper.thumbnail;
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, [wallpaper.thumbnail]);

  useEffect(() => {
    if (canvasRef.current && canvasRefCallback) {
      canvasRefCallback(canvasRef.current);
    }
  }, [canvasRefCallback]);

  // Handle pointer tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteractive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      active: true,
    };
  }, [isInteractive]);

  const handleMouseLeave = useCallback(() => {
    mousePosRef.current.active = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let isRunning = true;
    let time = 0;
    const frameInterval = 1000 / targetFps;

    // Simulation states
    const numParticles = Math.floor(120 * particlesDensity);
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.002,
      vy: Math.random() * 0.003 + 0.001,
      size: Math.random() * 2.5 + 0.8,
      alpha: Math.random() * 0.7 + 0.3,
      pulseSpeed: Math.random() * 2 + 1,
    }));

    // Matrix rain columns state
    const matrixColumns = 45;
    const matrixDrops = Array.from({ length: matrixColumns }, () => Math.floor(Math.random() * 30));

    // Vehicles for cyber metropolis
    const vehicles = Array.from({ length: 8 }, () => ({
      x: Math.random(),
      y: 0.3 + Math.random() * 0.4,
      speed: 0.001 + Math.random() * 0.003,
      size: 4 + Math.random() * 6,
      color: Math.random() > 0.5 ? '#38bdf8' : '#f43f5e',
    }));

    const render = (now: number) => {
      if (!isRunning) return;

      animFrameId.current = requestAnimationFrame(render);

      const elapsedSinceLast = now - lastFrameTimeRef.current;
      if (elapsedSinceLast < frameInterval - 1) {
        // Pacing for requested refresh rate
        return;
      }

      // Calculate frame times and actual FPS
      const actualDeltaMs = elapsedSinceLast;
      lastFrameTimeRef.current = now - (elapsedSinceLast % frameInterval);

      fpsCounterRef.current.frames++;
      if (now - fpsCounterRef.current.lastTime >= 500) {
        const measured = Math.round((fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime));
        onFpsUpdate?.(Math.min(measured, targetFps), actualDeltaMs);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }

      // Progress animation time scaled by user speed multiplier
      time += (actualDeltaMs / 1000) * speedMultiplier;

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      const mx = mousePosRef.current.active ? mousePosRef.current.x : 0.5;
      const my = mousePosRef.current.active ? mousePosRef.current.y : 0.5;
      const parallaxX = (mx - 0.5) * 20;
      const parallaxY = (my - 0.5) * 15;

      // 1. Draw base background image if available, else clean gradient
      if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.save();
        ctx.translate(parallaxX * 0.5, parallaxY * 0.5);
        ctx.drawImage(bgImageRef.current, -10, -10, width + 20, height + 20);
        ctx.restore();

        // Slight dark scrim to make live graphics pop
        ctx.fillStyle = 'rgba(7, 10, 18, 0.22)';
        ctx.fillRect(0, 0, width, height);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0a0d18');
        bgGrad.addColorStop(0.5, '#121829');
        bgGrad.addColorStop(1, '#05070d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Render dynamic procedural live wallpaper layers based on engineType
      const engine = wallpaper.engineType;

      if (engine === 'cyber-metropolis') {
        // Holographic highway traffic & neon rain
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        vehicles.forEach((v) => {
          v.x += v.speed * speedMultiplier * 1.5;
          if (v.x > 1.2) v.x = -0.2;

          const px = v.x * width + parallaxX;
          const py = v.y * height + parallaxY;

          // Light trail
          const trailGrad = ctx.createLinearGradient(px - 50, py, px, py);
          trailGrad.addColorStop(0, 'rgba(0,0,0,0)');
          trailGrad.addColorStop(1, v.color);
          ctx.fillStyle = trailGrad;
          ctx.fillRect(px - 50, py - 1, 50, 2);

          // Headlight glow
          ctx.fillStyle = v.color;
          ctx.beginPath();
          ctx.arc(px, py, v.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Rain ripples & streaks
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 40; i++) {
          const rx = (Math.sin(i * 99 + time * 3) * 0.5 + 0.5) * width;
          const ry = ((i * 17 + time * 600) % height);
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 12);
        }
        ctx.stroke();
        ctx.restore();
      } else if (engine === 'cyber-samurai') {
        // Plasma katana discharge & floating cyber embers
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const swordX = width * 0.62 + parallaxX;
        const swordY = height * 0.45 + parallaxY;

        // Pulsing katana blade glow
        const glowRadius = 35 + Math.sin(time * 8) * 12;
        const swordGlow = ctx.createRadialGradient(swordX, swordY, 2, swordX, swordY, glowRadius);
        swordGlow.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
        swordGlow.addColorStop(0.4, 'rgba(236, 72, 153, 0.4)');
        swordGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = swordGlow;
        ctx.fillRect(swordX - 60, swordY - 60, 120, 120);

        // Cyber ember sparks drifting upward
        particles.slice(0, 40).forEach((p) => {
          p.y -= (0.002 + p.vy * 0.001) * speedMultiplier;
          if (p.y < 0) p.y = 1;
          const px = (p.x * width + Math.sin(time * 2 + p.pulseSpeed) * 30 + parallaxX) % width;
          const py = p.y * height;
          ctx.fillStyle = `rgba(244, 63, 94, ${p.alpha * (0.6 + Math.sin(time * 6 + p.x) * 0.4)})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else if (engine === 'cosmic-aurora') {
        // Volumetric undulating aurora borealis ribbons
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let r = 0; r < 3; r++) {
          const ribbonOffset = r * 0.8;
          ctx.beginPath();
          ctx.moveTo(0, height * 0.25);

          for (let x = 0; x <= width; x += 30) {
            const wave1 = Math.sin(x * 0.003 + time * 0.8 + ribbonOffset) * 45;
            const wave2 = Math.cos(x * 0.006 - time * 0.5 + ribbonOffset) * 25;
            const y = height * (0.2 + r * 0.08) + wave1 + wave2 + parallaxY * 0.8;
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height * 0.65);
          ctx.lineTo(0, height * 0.65);
          ctx.closePath();

          const auroraGrad = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.6);
          if (r === 0) {
            auroraGrad.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
            auroraGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
            auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else if (r === 1) {
            auroraGrad.addColorStop(0, 'rgba(167, 139, 250, 0.4)');
            auroraGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.2)');
            auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            auroraGrad.addColorStop(0, 'rgba(236, 72, 153, 0.3)');
            auroraGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.15)');
            auroraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }

          ctx.fillStyle = auroraGrad;
          ctx.fill();
        }

        // Water mirror ripples at bottom
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(0, height * 0.72, width, height * 0.28);
        ctx.restore();
      } else if (engine === 'deep-space') {
        // Rotating galaxy spiral & cosmic star clusters
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const centerX = width * 0.5 + parallaxX;
        const centerY = height * 0.5 + parallaxY;

        // Spiral arms
        const arms = 3;
        const spiralSpeed = time * 0.3;
        for (let a = 0; a < arms; a++) {
          const armAngle = (a * 2 * Math.PI) / arms;
          for (let d = 20; d < Math.min(width, height) * 0.48; d += 6) {
            const rot = armAngle + spiralSpeed + d * 0.009;
            const px = centerX + Math.cos(rot) * d;
            const py = centerY + Math.sin(rot) * (d * 0.55); // tilted ellipse
            const glow = Math.max(0, 1 - d / (Math.min(width, height) * 0.48));
            ctx.fillStyle = `rgba(168, 85, 247, ${glow * 0.35})`;
            ctx.beginPath();
            ctx.arc(px, py, 2.5 * glow + 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Bright galactic nucleus
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 80);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        coreGrad.addColorStop(0.3, 'rgba(216, 180, 254, 0.6)');
        coreGrad.addColorStop(0.8, 'rgba(59, 130, 246, 0.2)');
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (engine === 'matrix-rain') {
        // High frame-rate Phosphor Katakana & Hex Stream
        ctx.save();
        ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#22c55e';
        ctx.font = '14px JetBrains Mono, monospace';

        const colWidth = width / matrixColumns;
        const chars = '0123456789ABCDEF$#@%&*日木火土金水月';

        for (let i = 0; i < matrixDrops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = i * colWidth;
          const y = matrixDrops[i] * 18;

          // Leading bright glyph
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, x, y);

          // Trail glyph
          ctx.fillStyle = '#10b981';
          ctx.fillText(chars.charAt(Math.floor(Math.random() * chars.length)), x, y - 18);

          if (y > height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i]++;
        }
        ctx.restore();
      } else if (engine === 'retrowave-grid') {
        // 3D Wireframe Grid rushing forward + Sunset
        ctx.save();
        const horizon = height * 0.58;

        // Sliced synth sun
        const sunRadius = Math.min(width, height) * 0.22;
        const sunX = width * 0.5 + parallaxX * 0.5;
        const sunY = horizon - sunRadius * 0.3;

        const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
        sunGrad.addColorStop(0, '#fde047');
        sunGrad.addColorStop(0.5, '#f43f5e');
        sunGrad.addColorStop(1, '#9333ea');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI, true);
        ctx.fill();

        // Horizontal slices through sun
        ctx.fillStyle = '#090a0f';
        for (let s = 1; s <= 7; s++) {
          const sy = sunY - sunRadius * 0.2 + s * 14;
          const sh = 2 + s * 1.2;
          ctx.fillRect(sunX - sunRadius, sy, sunRadius * 2, sh);
        }

        // Perspective grid lines
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.2;
        ctx.beginPath();

        // Radiating perspective lines
        const vanishingX = width * 0.5 + parallaxX * 0.5;
        for (let vx = -width; vx <= width * 2; vx += width * 0.08) {
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(vx, height);
        }

        // Moving horizontal rungs
        const gridSpeed = (time * 40 * speedMultiplier) % 30;
        for (let gy = 0; gy < height - horizon; gy += 18) {
          const expY = horizon + Math.pow(gy / (height - horizon), 1.8) * (height - horizon) + gridSpeed * 0.2;
          if (expY <= height) {
            ctx.moveTo(0, expY);
            ctx.lineTo(width, expY);
          }
        }
        ctx.stroke();
        ctx.restore();
      } else {
        // Default / Zen particles / Fluid flow
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        particles.forEach((p) => {
          p.y -= p.vy * speedMultiplier;
          p.x += p.vx * speedMultiplier;
          if (p.y < 0) p.y = 1;
          if (p.x < 0) p.x = 1;
          if (p.x > 1) p.x = 0;

          const px = p.x * width + parallaxX;
          const py = p.y * height + parallaxY;
          const pulse = (Math.sin(time * p.pulseSpeed) + 1) * 0.5;
          ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha * pulse * 0.8})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 + pulse * 0.5), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 3. Scanline overlay if enabled
      if (scanlines) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      // 4. Subtle cinematic vignette
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.4,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [wallpaper, targetFps, speedMultiplier, scanlines, particlesDensity, isInteractive, onFpsUpdate]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full object-cover block cursor-crosshair"
      />
    </div>
  );
};
