import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Focus search bar' },
    { key: 'c', description: 'Create a new note' },
    { key: 'Esc', description: 'Close note creator, modal, or popover' },
    { key: 'g', description: 'Toggle between Grid and List views' },
    { key: 'd', description: 'Toggle between Dark and Light mode' },
    { key: 'Enter', description: 'Add next checklist item (in checklist mode)' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl p-5 text-stone-800 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-base">Keyboard shortcuts</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-stone-600 dark:text-stone-300">{s.description}</span>
              <kbd className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded font-mono text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-stone-100 dark:border-stone-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
