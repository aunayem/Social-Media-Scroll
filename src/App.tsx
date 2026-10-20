import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Note,
  Label,
  ViewMode,
  LayoutMode,
  FilterOptions,
} from './types';
import {
  loadNotes,
  saveNotes,
  loadLabels,
  saveLabels,
  loadLayout,
  saveLayout,
  loadTheme,
  saveTheme,
  exportBackup,
  importBackup,
  INITIAL_NOTES,
  INITIAL_LABELS,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { NoteCreator } from './components/NoteCreator';
import { NoteCard } from './components/NoteCard';
import { NoteEditModal } from './components/NoteEditModal';
import { LabelsModal } from './components/LabelsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import {
  Lightbulb,
  Bell,
  Archive,
  Trash2,
  Tag,
  Search,
} from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [labels, setLabels] = useState<Label[]>(() => loadLabels());
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => loadLayout());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [activeView, setActiveView] = useState<ViewMode>('notes');
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter state
  const [filters, setFilters] = useState<FilterOptions>({ query: '' });

  // Modals state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditLabelsOpen, setIsEditLabelsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync dark class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist notes and labels on state changes
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    saveLabels(labels);
  }, [labels]);

  useEffect(() => {
    saveLayout(layoutMode);
  }, [layoutMode]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement;

      if (!isInput) {
        if (e.key === '/') {
          e.preventDefault();
          searchInputRef.current?.focus();
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          setLayoutMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute count metrics for sidebar
  const notesCounts = useMemo(() => {
    const activeNotes = notes.filter((n) => !n.isArchived && !n.isTrashed);
    const reminders = notes.filter((n) => !n.isTrashed && n.reminder !== null);
    const archive = notes.filter((n) => n.isArchived && !n.isTrashed);
    const trash = notes.filter((n) => n.isTrashed);

    const byLabel: Record<string, number> = {};
    labels.forEach((l) => {
      byLabel[l.name] = notes.filter(
        (n) => !n.isTrashed && n.labels.includes(l.name)
      ).length;
    });

    return {
      notes: activeNotes.length,
      reminders: reminders.length,
      archive: archive.length,
      trash: trash.length,
      byLabel,
    };
  }, [notes, labels]);

  // Filter notes based on active view and filters
  const displayedNotes = useMemo(() => {
    return notes.filter((note) => {
      // View mode filter
      if (activeView === 'notes') {
        if (note.isArchived || note.isTrashed) return false;
      } else if (activeView === 'reminders') {
        if (note.isTrashed || !note.reminder) return false;
      } else if (activeView === 'label') {
        if (note.isTrashed || !note.labels.includes(activeLabel || ''))
          return false;
      } else if (activeView === 'archive') {
        if (!note.isArchived || note.isTrashed) return false;
      } else if (activeView === 'trash') {
        if (!note.isTrashed) return false;
      }

      // Query filter
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        const checklistMatch = note.checklistItems.some((item) =>
          item.text.toLowerCase().includes(q)
        );
        const labelMatch = note.labels.some((l) => l.toLowerCase().includes(q));
        if (!titleMatch && !contentMatch && !checklistMatch && !labelMatch) {
          return false;
        }
      }

      // Color filter
      if (filters.color && note.color !== filters.color) {
        return false;
      }

      // Type filters
      if (filters.hasReminder && !note.reminder) return false;
      if (filters.hasChecklist && !note.isChecklist) return false;
      if (filters.hasDrawing && note.drawings.length === 0) return false;
      if (filters.hasImage && note.images.length === 0) return false;

      return true;
    });
  }, [notes, activeView, activeLabel, filters]);

  // Separate into pinned and others
  const pinnedNotes = useMemo(
    () => displayedNotes.filter((n) => n.isPinned),
    [displayedNotes]
  );
  const otherNotes = useMemo(
    () => displayedNotes.filter((n) => !n.isPinned),
    [displayedNotes]
  );

  // Handlers for Note CRUD
  const handleSaveNewNote = (
    noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newNote: Note = {
      ...noteData,
      id: 'note-' + Date.now() + Math.random().toString(36).slice(2, 6),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    showToast('Note created');
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleToggleArchive = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextArchived = !n.isArchived;
          showToast(nextArchived ? 'Note archived' : 'Note unarchived');
          return {
            ...n,
            isArchived: nextArchived,
            isPinned: nextArchived ? false : n.isPinned,
          };
        }
        return n;
      })
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isTrashed: true, isPinned: false } : n
      )
    );
    showToast('Note moved to trash');
  };

  const handleRestoreNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isTrashed: false } : n))
    );
    showToast('Note restored');
  };

  const handleDeleteForever = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Note deleted permanently');
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Empty trash? All notes in trash will be permanently deleted.')) {
      setNotes((prev) => prev.filter((n) => !n.isTrashed));
      showToast('Trash emptied');
    }
  };

  const handleDuplicateNote = (noteToCopy: Note) => {
    const copy: Note = {
      ...noteToCopy,
      id: 'note-' + Date.now() + Math.random().toString(36).slice(2, 6),
      title: noteToCopy.title ? `${noteToCopy.title} (Copy)` : '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [copy, ...prev]);
    showToast('Note copied');
  };

  // Label handlers
  const handleCreateLabel = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (labels.some((l) => l.name.toLowerCase() === trimmed.toLowerCase()))
      return;
    const newLbl: Label = {
      id: 'lbl-' + Date.now(),
      name: trimmed,
    };
    setLabels((prev) => [...prev, newLbl]);
    showToast(`Label "${trimmed}" created`);
  };

  const handleRenameLabel = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const oldLabel = labels.find((l) => l.id === id);
    if (!oldLabel) return;

    setLabels((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name: trimmed } : l))
    );

    // Update notes tagged with this label
    setNotes((prev) =>
      prev.map((note) => ({
        ...note,
        labels: note.labels.map((lbl) => (lbl === oldLabel.name ? trimmed : lbl)),
      }))
    );

    if (activeLabel === oldLabel.name) {
      setActiveLabel(trimmed);
    }
    showToast(`Label renamed to "${trimmed}"`);
  };

  const handleDeleteLabel = (id: string) => {
    const labelToDelete = labels.find((l) => l.id === id);
    if (!labelToDelete) return;

    setLabels((prev) => prev.filter((l) => l.id !== id));

    // Remove from notes
    setNotes((prev) =>
      prev.map((note) => ({
        ...note,
        labels: note.labels.filter((lbl) => lbl !== labelToDelete.name),
      }))
    );

    if (activeLabel === labelToDelete.name) {
      setActiveView('notes');
      setActiveLabel(null);
    }
    showToast(`Label "${labelToDelete.name}" deleted`);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setNotes(loadNotes());
      setIsRefreshing(false);
      showToast('Notes synchronized');
    }, 500);
  };

  const handleImportBackupFile = async (file: File) => {
    try {
      const backup = await importBackup(file);
      setNotes(backup.notes);
      setLabels(backup.labels);
      showToast(`Imported ${backup.notes.length} notes`);
    } catch {
      showToast('Failed to import backup file');
    }
  };

  const handleResetSampleNotes = () => {
    if (window.confirm('Reset all notes and labels to default demo data?')) {
      setNotes(INITIAL_NOTES);
      setLabels(INITIAL_LABELS);
      showToast('Sample notes restored');
    }
  };

  // View titles
  const viewTitle = useMemo(() => {
    switch (activeView) {
      case 'notes':
        return 'Notes';
      case 'reminders':
        return 'Reminders';
      case 'label':
        return activeLabel || 'Label';
      case 'archive':
        return 'Archive';
      case 'trash':
        return 'Trash';
    }
  }, [activeView, activeLabel]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] text-stone-800 dark:text-[#e8eaed] flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar */}
      <TopBar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        layoutMode={layoutMode}
        onToggleLayout={() =>
          setLayoutMode((prev) => (prev === 'grid' ? 'list' : 'grid'))
        }
        isDark={theme === 'dark'}
        onToggleTheme={() =>
          setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
        }
        filters={filters}
        onUpdateFilters={setFilters}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onExportBackup={() => exportBackup(notes, labels)}
        onImportBackup={handleImportBackupFile}
        onResetSampleNotes={handleResetSampleNotes}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        searchInputRef={searchInputRef}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex max-w-full overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          activeView={activeView}
          activeLabel={activeLabel}
          onSelectView={(view, labelName) => {
            setActiveView(view);
            setActiveLabel(labelName || null);
          }}
          labels={labels}
          onOpenEditLabels={() => setIsEditLabelsOpen(true)}
          notesCounts={notesCounts}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-8 py-6 transition-all">
          {/* Note Creator only in main 'notes' or 'label' view */}
          {activeView !== 'trash' && activeView !== 'archive' && (
            <NoteCreator
              onSaveNote={(noteData) => {
                // If currently viewing a label, automatically attach that label!
                const assignedLabels =
                  activeView === 'label' && activeLabel
                    ? Array.from(new Set([...noteData.labels, activeLabel]))
                    : noteData.labels;
                handleSaveNewNote({ ...noteData, labels: assignedLabels });
              }}
              allLabels={labels}
              onCreateLabel={handleCreateLabel}
              isDark={theme === 'dark'}
            />
          )}

          {/* Trash Header Banner */}
          {activeView === 'trash' && (
            <div className="max-w-2xl mx-auto mb-6 p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              <span className="italic">
                Notes in Trash are deleted after 7 days
              </span>
              {notesCounts.trash > 0 && (
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  className="px-3 py-1.5 font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                >
                  Empty Trash
                </button>
              )}
            </div>
          )}

          {/* Active Filter Chips indicator */}
          {(filters.query ||
            filters.color ||
            filters.hasReminder ||
            filters.hasChecklist ||
            filters.hasDrawing ||
            filters.hasImage) && (
            <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>
                  Showing {displayedNotes.length} matching result
                  {displayedNotes.length === 1 ? '' : 's'}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    query: '',
                    color: undefined,
                    hasReminder: undefined,
                    hasChecklist: undefined,
                    hasDrawing: undefined,
                    hasImage: undefined,
                  })
                }
                className="text-amber-600 dark:text-amber-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Notes Content Grid / List */}
          <div
            className={`max-w-6xl mx-auto ${
              layoutMode === 'list' ? 'max-w-2xl' : ''
            }`}
          >
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div className="mb-8">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3 px-1">
                  Pinned
                </h4>
                <div
                  className={
                    layoutMode === 'grid'
                      ? 'masonry-grid'
                      : 'space-y-4'
                  }
                >
                  {pinnedNotes.map((note) => (
                    <div
                      key={note.id}
                      className={layoutMode === 'grid' ? 'masonry-item' : ''}
                    >
                      <NoteCard
                        note={note}
                        onOpenEdit={(n) => setEditingNote(n)}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onDeleteNote={handleDeleteNote}
                        onDuplicateNote={handleDuplicateNote}
                        onUpdateNote={handleUpdateNote}
                        allLabels={labels}
                        onCreateLabel={handleCreateLabel}
                        isDark={theme === 'dark'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes Section */}
            {otherNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3 px-1">
                    Others
                  </h4>
                )}
                <div
                  className={
                    layoutMode === 'grid'
                      ? 'masonry-grid'
                      : 'space-y-4'
                  }
                >
                  {otherNotes.map((note) => (
                    <div
                      key={note.id}
                      className={layoutMode === 'grid' ? 'masonry-item' : ''}
                    >
                      <NoteCard
                        note={note}
                        onOpenEdit={(n) => setEditingNote(n)}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onDeleteNote={handleDeleteNote}
                        onRestoreNote={handleRestoreNote}
                        onDeleteForever={handleDeleteForever}
                        onDuplicateNote={handleDuplicateNote}
                        onUpdateNote={handleUpdateNote}
                        allLabels={labels}
                        onCreateLabel={handleCreateLabel}
                        isDark={theme === 'dark'}
                        isTrashView={activeView === 'trash'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty States */}
            {displayedNotes.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center text-stone-400 dark:text-stone-500 select-none">
                {activeView === 'notes' && !filters.query && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center mb-4 text-amber-500">
                      <Lightbulb className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <p className="text-base font-medium text-stone-600 dark:text-stone-300">
                      Notes you add appear here
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Type in the box above or press C to take a note
                    </p>
                  </>
                )}

                {activeView === 'reminders' && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center mb-4">
                      <Bell className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <p className="text-base font-medium text-stone-600 dark:text-stone-300">
                      Notes with upcoming reminders appear here
                    </p>
                  </>
                )}

                {activeView === 'archive' && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center mb-4">
                      <Archive className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <p className="text-base font-medium text-stone-600 dark:text-stone-300">
                      Your archived notes appear here
                    </p>
                  </>
                )}

                {activeView === 'trash' && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center mb-4">
                      <Trash2 className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <p className="text-base font-medium text-stone-600 dark:text-stone-300">
                      No notes in Trash
                    </p>
                  </>
                )}

                {activeView === 'label' && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center mb-4">
                      <Tag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <p className="text-base font-medium text-stone-600 dark:text-stone-300">
                      No notes with this label yet
                    </p>
                  </>
                )}

                {filters.query && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <p className="text-base font-medium text-stone-600 dark:text-stone-300">
                      No matching results found
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Check your spelling or try different keywords
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Note Edit Modal */}
      <NoteEditModal
        note={editingNote}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        onDuplicateNote={handleDuplicateNote}
        allLabels={labels}
        onCreateLabel={handleCreateLabel}
        isDark={theme === 'dark'}
      />

      {/* Edit Labels Modal */}
      <LabelsModal
        isOpen={isEditLabelsOpen}
        onClose={() => setIsEditLabelsOpen(false)}
        labels={labels}
        onCreateLabel={handleCreateLabel}
        onRenameLabel={handleRenameLabel}
        onDeleteLabel={handleDeleteLabel}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
