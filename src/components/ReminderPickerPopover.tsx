import React, { useRef, useEffect, useState } from 'react';
import { Clock, Calendar, Check, X } from 'lucide-react';

interface ReminderPickerPopoverProps {
  currentReminder: string | null;
  onSelectReminder: (reminder: string | null) => void;
  onClose: () => void;
}

export const ReminderPickerPopover: React.FC<ReminderPickerPopoverProps> = ({
  currentReminder,
  onSelectReminder,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('08:00');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const presets = [
    { label: 'Later today', time: '8:00 PM' },
    { label: 'Tomorrow morning', time: '8:00 AM' },
    { label: 'Next week', time: 'Mon, 8:00 AM' },
  ];

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) return;
    const dateObj = new Date(`${customDate}T${customTime}`);
    const formatted = dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    onSelectReminder(formatted);
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-11 left-0 z-50 w-64 bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700/80 rounded-xl shadow-xl p-2 text-xs text-stone-700 dark:text-stone-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-100 dark:border-stone-800">
        <span className="font-medium text-stone-500 dark:text-stone-400">Reminder</span>
        {currentReminder && (
          <button
            type="button"
            onClick={() => {
              onSelectReminder(null);
              onClose();
            }}
            className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {!showCustom ? (
        <div className="space-y-0.5">
          {presets.map((p) => {
            const val = `${p.label}, ${p.time}`;
            const isSelected = currentReminder === val;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onSelectReminder(val);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{p.label}</span>
                </div>
                <span className="text-stone-400 dark:text-stone-500">{p.time}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-300 font-medium"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Pick date &amp; time</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCustom} className="space-y-2 pt-1">
          <div>
            <label className="block text-[11px] text-stone-400 mb-1">Date</label>
            <input
              type="date"
              required
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-stone-300 dark:border-stone-700 bg-transparent text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-400 mb-1">Time</label>
            <input
              type="time"
              required
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-stone-300 dark:border-stone-700 bg-transparent text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="px-2.5 py-1 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 rounded"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium shadow-sm"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
