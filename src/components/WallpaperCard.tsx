import React, { useState } from 'react';
import { Wallpaper } from '../types/wallpaper';
import { Download, Play, Image as ImageIcon, Film, Sparkles, Heart, Eye } from 'lucide-react';
import { LiveCanvasEngine } from './LiveCanvasEngine';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onSelect: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper, format: 'image' | 'video' | 'gif') => void;
  onToggleLike?: (id: string) => void;
  isLiked?: boolean;
  isSelected?: boolean;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  onSelect,
  onDownload,
  onToggleLike,
  isLiked = false,
  isSelected = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(wallpaper);
        } else if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          onToggleLike?.(wallpaper.id);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setDownloadDropdown(false);
      }}
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-neutral-900 border transition-all duration-300 shadow-lg hover:shadow-2xl outline-none ${
        isSelected
          ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-neutral-950 border-sky-400/80 shadow-sky-500/20'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      {/* Media Canvas / Preview Area */}
      <div
        onClick={() => onSelect(wallpaper)}
        className="relative aspect-video w-full overflow-hidden bg-neutral-950 cursor-pointer"
      >
        {isHovered ? (
          /* Live Canvas running dynamically on hover at wallpaper native FPS! */
          <LiveCanvasEngine
            wallpaper={wallpaper}
            targetFps={wallpaper.nativeFps}
            speedMultiplier={1.0}
            className="w-full h-full"
          />
        ) : (
          /* High-res image poster with smooth zoom on hover */
          <img
            src={wallpaper.thumbnail}
            alt={wallpaper.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Styled gradient fallback
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* Top Floating Badge Bar */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 tabular-nums">
              {wallpaper.nativeFps}Hz
            </span>
            <span className="font-mono text-[11px] text-sky-300 bg-sky-950/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-sky-500/20">
              {wallpaper.resolution}
            </span>
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            {onToggleLike && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike(wallpaper.id);
                }}
                title="Favoritar"
                className={`p-1.5 rounded-md backdrop-blur-md transition-colors ${
                  isLiked
                    ? 'bg-rose-500/90 text-white'
                    : 'bg-black/60 text-neutral-300 hover:text-white hover:bg-black/80'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Center Play Overlay on Hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="p-3 rounded-full bg-sky-500/90 text-neutral-950 shadow-xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration / Format Scrim */}
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <span className="text-[10px] font-mono text-neutral-300 bg-black/75 px-1.5 py-0.5 rounded">
            {wallpaper.duration}
          </span>
        </div>
      </div>

      {/* Card Info & Download Action Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata Header (Zero-Pill Discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            <span className="text-sky-400 font-medium">{wallpaper.category}</span>
            <span aria-hidden="true">·</span>
            <span>{wallpaper.artist.name}</span>
          </div>

          <h3
            onClick={() => onSelect(wallpaper)}
            className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-1 cursor-pointer"
            title={wallpaper.title}
          >
            {wallpaper.title}
          </h3>

          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {wallpaper.description}
          </p>
        </div>

        {/* Bottom Bar: Stats & Instant Download Buttons */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          {/* Metadata counter (clean typography) */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums">
            <span className="flex items-center gap-1" title="Visualizações">
              <Eye className="w-3 h-3 text-neutral-400" />
              {(wallpaper.views / 1000).toFixed(0)}k
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1" title="Downloads">
              <Download className="w-3 h-3 text-neutral-400" />
              {(wallpaper.downloads / 1000).toFixed(0)}k
            </span>
          </div>

          {/* Three Direct Working Download Buttons: Imagem, Vídeo MP4, GIF */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDownload(wallpaper, 'image')}
              title={`Baixar Imagem 4K (${wallpaper.fileSizes.image4k})`}
              className="px-2 py-1 text-[11px] font-medium rounded bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white border border-white/10 transition-colors flex items-center gap-1"
            >
              <ImageIcon className="w-3 h-3 text-sky-400" />
              <span>4K</span>
            </button>

            <button
              onClick={() => onDownload(wallpaper, 'video')}
              title={`Baixar Vídeo MP4/WebM Loop (${wallpaper.fileSizes.videoMp4})`}
              className="px-2 py-1 text-[11px] font-medium rounded bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white border border-white/10 transition-colors flex items-center gap-1"
            >
              <Film className="w-3 h-3 text-indigo-400" />
              <span>MP4</span>
            </button>

            <button
              onClick={() => onDownload(wallpaper, 'gif')}
              title={`Baixar GIF Animado (${wallpaper.fileSizes.gifAnim})`}
              className="px-2 py-1 text-[11px] font-medium rounded bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white border border-white/10 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>GIF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
