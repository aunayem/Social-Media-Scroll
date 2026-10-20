import React from 'react';
import { ViewMode, Label } from '../types';
import {
  Lightbulb,
  Bell,
  Tag,
  Pencil,
  Archive,
  Trash2,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeView: ViewMode;
  activeLabel: string | null;
  onSelectView: (view: ViewMode, labelName?: string) => void;
  labels: Label[];
  onOpenEditLabels: () => void;
  notesCounts: {
    notes: number;
    reminders: number;
    archive: number;
    trash: number;
    byLabel: Record<string, number>;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeView,
  activeLabel,
  onSelectView,
  labels,
  onOpenEditLabels,
  notesCounts,
}) => {
  return (
    <aside
      className={`shrink-0 z-30 transition-all duration-200 select-none ${
        isOpen ? 'w-64 sm:w-72' : 'w-16 hidden sm:block'
      }`}
    >
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-2 pr-2">
        <nav className="space-y-0.5">
          {/* Notes */}
          <button
            type="button"
            onClick={() => onSelectView('notes')}
            title="Notes"
            className={`w-full flex items-center gap-6 px-5 py-3 rounded-r-full text-sm font-medium transition-colors ${
              activeView === 'notes'
                ? 'bg-[#feefc3] text-[#202124] dark:bg-[#41331c] dark:text-[#fdd663]'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Lightbulb className="w-5 h-5 shrink-0" />
            {isOpen && (
              <span className="flex-1 text-left truncate flex items-center justify-between">
                <span>Notes</span>
                <span className="text-xs opacity-70 font-normal">
                  {notesCounts.notes}
                </span>
              </span>
            )}
          </button>

          {/* Reminders */}
          <button
            type="button"
            onClick={() => onSelectView('reminders')}
            title="Reminders"
            className={`w-full flex items-center gap-6 px-5 py-3 rounded-r-full text-sm font-medium transition-colors ${
              activeView === 'reminders'
                ? 'bg-[#feefc3] text-[#202124] dark:bg-[#41331c] dark:text-[#fdd663]'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Bell className="w-5 h-5 shrink-0" />
            {isOpen && (
              <span className="flex-1 text-left truncate flex items-center justify-between">
                <span>Reminders</span>
                {notesCounts.reminders > 0 && (
                  <span className="text-xs opacity-70 font-normal">
                    {notesCounts.reminders}
                  </span>
                )}
              </span>
            )}
          </button>

          {/* Labels separator / list */}
          <div className="my-2 border-t border-stone-200 dark:border-stone-800/80" />

          {isOpen && labels.length > 0 && (
            <div className="px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Labels
            </div>
          )}

          {labels.map((lbl) => {
            const isActive = activeView === 'label' && activeLabel === lbl.name;
            const count = notesCounts.byLabel[lbl.name] || 0;
            return (
              <button
                key={lbl.id}
                type="button"
                onClick={() => onSelectView('label', lbl.name)}
                title={lbl.name}
                className={`w-full flex items-center gap-6 px-5 py-3 rounded-r-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#feefc3] text-[#202124] dark:bg-[#41331c] dark:text-[#fdd663]'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                <Tag className="w-5 h-5 shrink-0" />
                {isOpen && (
                  <span className="flex-1 text-left truncate flex items-center justify-between">
                    <span className="truncate">{lbl.name}</span>
                    {count > 0 && (
                      <span className="text-xs opacity-70 font-normal">{count}</span>
                    )}
                  </span>
                )}
              </button>
            );
          })}

          {/* Edit labels */}
          <button
            type="button"
            onClick={onOpenEditLabels}
            title="Edit labels"
            className="w-full flex items-center gap-6 px-5 py-3 rounded-r-full text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
          >
            <Pencil className="w-5 h-5 shrink-0" />
            {isOpen && <span className="flex-1 text-left truncate">Edit labels</span>}
          </button>

          <div className="my-2 border-t border-stone-200 dark:border-stone-800/80" />

          {/* Archive */}
          <button
            type="button"
            onClick={() => onSelectView('archive')}
            title="Archive"
            className={`w-full flex items-center gap-6 px-5 py-3 rounded-r-full text-sm font-medium transition-colors ${
              activeView === 'archive'
                ? 'bg-[#feefc3] text-[#202124] dark:bg-[#41331c] dark:text-[#fdd663]'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Archive className="w-5 h-5 shrink-0" />
            {isOpen && (
              <span className="flex-1 text-left truncate flex items-center justify-between">
                <span>Archive</span>
                {notesCounts.archive > 0 && (
                  <span className="text-xs opacity-70 font-normal">
                    {notesCounts.archive}
                  </span>
                )}
              </span>
            )}
          </button>

          {/* Trash */}
          <button
            type="button"
            onClick={() => onSelectView('trash')}
            title="Trash"
            className={`w-full flex items-center gap-6 px-5 py-3 rounded-r-full text-sm font-medium transition-colors ${
              activeView === 'trash'
                ? 'bg-[#feefc3] text-[#202124] dark:bg-[#41331c] dark:text-[#fdd663]'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Trash2 className="w-5 h-5 shrink-0" />
            {isOpen && (
              <span className="flex-1 text-left truncate flex items-center justify-between">
                <span>Trash</span>
                {notesCounts.trash > 0 && (
                  <span className="text-xs opacity-70 font-normal">
                    {notesCounts.trash}
                  </span>
                )}
              </span>
            )}
          </button>
        </nav>
      </div>
    </aside>
  );
};
