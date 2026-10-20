import React, { useRef, useEffect } from 'react';
import { NOTE_COLORS, NoteColorId } from '../types';
import { Check } from 'lucide-react';

interface ColorPickerPopoverProps {
  currentColor: NoteColorId;
  onSelectColor: (color: NoteColorId) => void;
  onClose: () => void;
  isDark: boolean;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  currentColor,
  onSelectColor,
  onClose,
  isDark,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const colors = Object.values(NOTE_COLORS);

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-11 left-0 z-50 p-2 bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700/80 rounded-xl shadow-xl flex flex-wrap gap-1.5 w-[148px]"
      onClick={(e) => e.stopPropagation()}
    >
      {colors.map((c) => {
        const isSelected = currentColor === c.id;
        const swatchBg = isDark ? c.swatchDark : c.swatchLight;
        return (
          <button
            key={c.id}
            type="button"
            title={c.name}
            onClick={() => {
              onSelectColor(c.id);
              onClose();
            }}
            className="w-7 h-7 rounded-full border border-stone-300 dark:border-stone-600 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400"
            style={{ backgroundColor: swatchBg }}
          >
            {isSelected && (
              <Check
                className={`w-4 h-4 ${
                  isDark && c.id === 'default'
                    ? 'text-white'
                    : c.id === 'storm' || c.id === 'dusk' || (isDark && c.id !== 'chalk')
                    ? 'text-white'
                    : 'text-stone-800'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
