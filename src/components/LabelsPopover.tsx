import React, { useRef, useEffect, useState } from 'react';
import { Label } from '../types';
import { Search, Plus, Check } from 'lucide-react';

interface LabelsPopoverProps {
  allLabels: Label[];
  selectedLabels: string[];
  onToggleLabel: (labelName: string) => void;
  onCreateLabel: (name: string) => void;
  onClose: () => void;
}

export const LabelsPopover: React.FC<LabelsPopoverProps> = ({
  allLabels,
  selectedLabels,
  onToggleLabel,
  onCreateLabel,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredLabels = allLabels.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const exactMatchExists = allLabels.some(
    (l) => l.name.toLowerCase() === searchTerm.toLowerCase().trim()
  );

  const handleCreate = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    onCreateLabel(trimmed);
    onToggleLabel(trimmed);
    setSearchTerm('');
  };

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-11 left-0 z-50 w-56 bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700/80 rounded-xl shadow-xl p-2 text-xs text-stone-700 dark:text-stone-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="font-medium text-stone-500 dark:text-stone-400 pb-1.5 mb-1.5 border-b border-stone-100 dark:border-stone-800">
        Label note
      </div>

      <div className="relative mb-2">
        <input
          type="text"
          autoFocus
          placeholder="Enter label name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !exactMatchExists && searchTerm.trim()) {
              e.preventDefault();
              handleCreate();
            }
          }}
          className="w-full pl-7 pr-2 py-1 rounded bg-stone-100 dark:bg-stone-800 border-none text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-2" />
      </div>

      <div className="max-h-40 overflow-y-auto space-y-0.5">
        {filteredLabels.map((l) => {
          const isChecked = selectedLabels.includes(l.name);
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onToggleLabel(l.name)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
            >
              <span className="truncate pr-2">{l.name}</span>
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  isChecked
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'border-stone-300 dark:border-stone-600'
                }`}
              >
                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}

        {filteredLabels.length === 0 && !searchTerm.trim() && (
          <div className="text-center text-stone-400 py-2">No labels yet</div>
        )}

        {searchTerm.trim() && !exactMatchExists && (
          <button
            type="button"
            onClick={handleCreate}
            className="w-full flex items-center gap-1.5 px-2 py-2 text-amber-600 dark:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="truncate">Create &quot;{searchTerm.trim()}&quot;</span>
          </button>
        )}
      </div>
    </div>
  );
};
