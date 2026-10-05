import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navegação Geral',
      items: [
        { keys: ['/'], description: 'Focar na barra de busca' },
        { keys: ['Esc'], description: 'Fechar modal / Limpar busca' },
        { keys: ['?'], description: 'Abrir este guia de atalhos' },
        { keys: ['T'], description: 'Alternar modos de tema escuro / claro' },
        { keys: ['1', '2', '3', '4'], description: 'Alternar entre as abas do app' },
      ],
    },
    {
      title: 'Galeria & Navegação por Teclas',
      items: [
        { keys: ['←', '→'], description: 'Navegar entre wallpapers no grid' },
        { keys: ['↑', '↓'], description: 'Navegar pelas linhas da galeria' },
        { keys: ['Enter'], description: 'Abrir wallpaper selecionado no Studio' },
        { keys: ['L'], description: 'Favoritar o wallpaper atual' },
      ],
    },
    {
      title: 'Studio Live & Downloads',
      items: [
        { keys: ['F'], description: 'Alternar modo tela cheia' },
        { keys: ['D'], description: 'Baixar imagem estática em 4K' },
        { keys: ['V'], description: 'Baixar gravação de vídeo MP4' },
        { keys: ['G'], description: 'Baixar animação em loop GIF' },
        { keys: ['M'], description: 'Ativar / Mutar sintetizador ambiente' },
        { keys: ['←', '→'], description: 'Wallpaper anterior / próximo no Studio' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Atalhos de Teclado
              </h3>
              <p className="text-xs text-neutral-400">
                Navegue com velocidade máxima sem tirar as mãos do teclado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-2.5">
              <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-xs"
                  >
                    <span className="text-neutral-300">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 min-w-[22px] text-center font-mono text-[11px] font-semibold bg-neutral-900 border border-white/20 text-sky-300 rounded shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Pressione <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-white/20 text-neutral-300">Esc</kbd> para fechar</span>
          <span>LuminaLive Engine</span>
        </div>
      </div>
    </div>
  );
};
