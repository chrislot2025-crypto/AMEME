import React from 'react';
import { ARTISTS } from '../data/artists';
import { WALLPAPERS } from '../data/wallpapers';
import { CheckCircle2, ArrowRight, Eye, Download, Sparkles } from 'lucide-react';

interface ArtistsViewProps {
  onSelectArtist: (artistId: string) => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ onSelectArtist }) => {
  return (
    <div className="py-8 space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Artistas Digitais & Estúdios de Motion
        </h2>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Conheça os criadores por trás dos live wallpapers em alta definição. Filtre obras exclusivas por artista com suporte a renderização até 240Hz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTISTS.map((artist) => {
          const artistWallpapers = WALLPAPERS.filter((w) => w.artist.id === artist.id);
          const totalDownloads = artistWallpapers.reduce((sum, w) => sum + w.downloads, 0);

          return (
            <div
              key={artist.id}
              className="p-5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-white/20 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-white/15"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {artist.name}
                      </h3>
                      {artist.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">{artist.handle}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {artist.bio}
                </p>

                {/* Micro portfolio previews */}
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  {artistWallpapers.slice(0, 3).map((w) => (
                    <div key={w.id} className="aspect-video rounded-md overflow-hidden bg-black/60 relative">
                      <img
                        src={w.thumbnail}
                        alt={w.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom footer */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-neutral-400 font-mono tabular-nums">
                  <span>{artist.totalWorks} obras</span>
                  <span aria-hidden="true"> · </span>
                  <span>{(totalDownloads / 1000).toFixed(1)}k downloads</span>
                </div>

                <button
                  onClick={() => onSelectArtist(artist.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <span>Ver Wallpapers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
