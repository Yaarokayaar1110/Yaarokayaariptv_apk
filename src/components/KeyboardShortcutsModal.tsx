import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause live stream' },
    { key: 'A', action: 'Open Full Screen All Channels Grid' },
    { key: 'C', action: 'Toggle Quick Channel Surf Overlay' },
    { key: '← / → ([ / ])', action: 'Previous / Next Channel' },
    { key: '↑ / ↓', action: 'Volume Up / Volume Down' },
    { key: '0 – 9', action: 'Direct Channel Number Jump (e.g. Press 2 for CH 02)' },
    { key: 'F', action: 'Toggle Fullscreen Mode' },
    { key: 'M', action: 'Mute / Unmute Audio' },
    { key: 'P', action: 'Picture-in-Picture Mode' },
  ];

  return (
    <div
      id="shortcuts-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="shortcuts-modal-content"
        className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-md w-full p-6 text-neutral-100 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">TV Remote & Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-xs"
            >
              <span className="text-neutral-300">{sc.action}</span>
              <kbd className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 font-mono text-[11px] text-amber-400 font-semibold shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
