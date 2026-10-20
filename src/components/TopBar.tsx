import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  RotateCw,
  LayoutGrid,
  List,
  Sun,
  Moon,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Keyboard,
  Filter,
  Check,
} from 'lucide-react';
import { LayoutMode, FilterOptions, NoteColorId, NOTE_COLORS } from '../types';

interface TopBarProps {
  onToggleSidebar: () => void;
  layoutMode: LayoutMode;
  onToggleLayout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  filters: FilterOptions;
  onUpdateFilters: (updater: (prev: FilterOptions) => FilterOptions) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetSampleNotes: () => void;
  onOpenShortcuts: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  layoutMode,
  onToggleLayout,
  isDark,
  onToggleTheme,
  filters,
  onUpdateFilters,
  onRefresh,
  isRefreshing,
  onExportBackup,
  onImportBackup,
  onResetSampleNotes,
  onOpenShortcuts,
  searchInputRef,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
      e.target.value = '';
    }
  };

  const hasActiveFilters = Boolean(
    filters.color ||
      filters.hasReminder ||
      filters.hasDrawing ||
      filters.hasImage ||
      filters.hasChecklist
  );

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#202124] border-b border-stone-200 dark:border-stone-800/80 px-2 sm:px-4 py-2 transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 sm:p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            title="Main menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Google Keep lightbulb icon mark */}
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-xs">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white fill-current stroke-current"
              >
                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-1.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-medium tracking-tight text-stone-700 dark:text-stone-200 hidden xs:inline">
              Notes
            </span>
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-stone-400 dark:text-stone-500 pointer-events-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search notes, checklists, drawings..."
              value={filters.query}
              onChange={(e) =>
                onUpdateFilters((prev) => ({ ...prev, query: e.target.value }))
              }
              className="w-full pl-9 sm:pl-11 pr-16 sm:pr-20 py-2 sm:py-2.5 rounded-xl bg-stone-100/90 dark:bg-[#2d2e30] border border-transparent focus:border-stone-300 dark:focus:border-stone-600 focus:bg-white dark:focus:bg-[#28292c] text-sm text-stone-800 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 transition-all shadow-xs focus:shadow-md focus:outline-none"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {filters.query && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateFilters((prev) => ({ ...prev, query: '' }))
                  }
                  className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Filter menu trigger */}
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`p-1.5 rounded-full transition-colors ${
                    hasActiveFilters
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                  }`}
                  title="Filter notes"
                >
                  <Filter className="w-4 h-4" />
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 top-9 w-64 p-3 bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-700">
                      <span className="font-semibold text-stone-700 dark:text-stone-200">
                        Filter by Type
                      </span>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateFilters((prev) => ({
                              ...prev,
                              color: undefined,
                              hasReminder: undefined,
                              hasDrawing: undefined,
                              hasImage: undefined,
                              hasChecklist: undefined,
                            }))
                          }
                          className="text-amber-600 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 text-stone-600 dark:text-stone-300">
                      <label className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(filters.hasReminder)}
                          onChange={(e) =>
                            onUpdateFilters((prev) => ({
                              ...prev,
                              hasReminder: e.target.checked ? true : undefined,
                            }))
                          }
                          className="rounded text-amber-500"
                        />
                        <span>Has Reminder</span>
                      </label>
                      <label className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(filters.hasChecklist)}
                          onChange={(e) =>
                            onUpdateFilters((prev) => ({
                              ...prev,
                              hasChecklist: e.target.checked ? true : undefined,
                            }))
                          }
                          className="rounded text-amber-500"
                        />
                        <span>Checklists</span>
                      </label>
                      <label className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(filters.hasDrawing)}
                          onChange={(e) =>
                            onUpdateFilters((prev) => ({
                              ...prev,
                              hasDrawing: e.target.checked ? true : undefined,
                            }))
                          }
                          className="rounded text-amber-500"
                        />
                        <span>Drawings</span>
                      </label>
                      <label className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(filters.hasImage)}
                          onChange={(e) =>
                            onUpdateFilters((prev) => ({
                              ...prev,
                              hasImage: e.target.checked ? true : undefined,
                            }))
                          }
                          className="rounded text-amber-500"
                        />
                        <span>Images</span>
                      </label>
                    </div>

                    <div className="pt-2 mt-2 border-t border-stone-100 dark:border-stone-700">
                      <span className="font-semibold block mb-1.5 text-stone-700 dark:text-stone-200">
                        Filter by Color
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {Object.values(NOTE_COLORS).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            title={c.name}
                            onClick={() =>
                              onUpdateFilters((prev) => ({
                                ...prev,
                                color: prev.color === c.id ? undefined : c.id,
                              }))
                            }
                            className="w-5 h-5 rounded-full border border-stone-300 dark:border-stone-600 flex items-center justify-center transition-transform hover:scale-110"
                            style={{
                              backgroundColor: isDark
                                ? c.swatchDark
                                : c.swatchLight,
                            }}
                          >
                            {filters.color === c.id && (
                              <Check className="w-3 h-3 text-stone-900" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Refresh sync */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            title="Refresh notes"
          >
            <RotateCw
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isRefreshing ? 'animate-spin text-amber-500' : ''
              }`}
            />
          </button>

          {/* Grid / List Toggle */}
          <button
            type="button"
            onClick={onToggleLayout}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            title={layoutMode === 'grid' ? 'List view' : 'Grid view'}
          >
            {layoutMode === 'grid' ? (
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Settings Menu */}
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
              title="Settings &amp; Backup"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 top-10 w-52 py-1.5 bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl z-50 text-xs text-stone-700 dark:text-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    onExportBackup();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-stone-400" />
                  <span>Export Notes (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <Upload className="w-4 h-4 text-stone-400" />
                  <span>Import Notes (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onResetSampleNotes();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <RefreshCw className="w-4 h-4 text-stone-400" />
                  <span>Restore Sample Data</span>
                </button>

                <div className="my-1 border-t border-stone-100 dark:border-stone-700" />

                <button
                  type="button"
                  onClick={() => {
                    onOpenShortcuts();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                >
                  <Keyboard className="w-4 h-4 text-stone-400" />
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* User profile avatar (Google style) */}
          <div
            className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-500 to-red-500 text-white font-medium text-xs flex items-center justify-center shadow-xs cursor-default shrink-0 ml-1"
            title="Nayem (Email.Nayem@gmail.com)"
          >
            N
          </div>
        </div>
      </div>
    </header>
  );
};
