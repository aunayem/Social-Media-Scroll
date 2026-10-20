import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  PinOff,
  Palette,
  Bell,
  Archive,
  ArchiveRestore,
  MoreVertical,
  Plus,
  X,
  Check,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Paintbrush,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Note,
  NoteColorId,
  ChecklistItem,
  Label,
  NOTE_COLORS,
} from '../types';
import { ColorPickerPopover } from './ColorPickerPopover';
import { ReminderPickerPopover } from './ReminderPickerPopover';
import { LabelsPopover } from './LabelsPopover';
import { DrawingModal } from './DrawingModal';
import { LinkPreviewCard } from './LinkPreviewCard';
import { extractUrls } from '../utils/linkPreview';

interface NoteEditModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  allLabels: Label[];
  onCreateLabel: (name: string) => void;
  isDark: boolean;
}

export const NoteEditModal: React.FC<NoteEditModalProps> = ({
  note,
  isOpen,
  onClose,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
  allLabels,
  onCreateLabel,
  isDark,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [color, setColor] = useState<NoteColorId>('default');
  const [images, setImages] = useState<string[]>([]);
  const [drawings, setDrawings] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [reminder, setReminder] = useState<string | null>(null);
  const [dismissedLinks, setDismissedLinks] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  // Popover states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showLabelsPopover, setShowLabelsPopover] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsChecklist(note.isChecklist);
      setChecklistItems(note.checklistItems || []);
      setColor(note.color || 'default');
      setImages(note.images || []);
      setDrawings(note.drawings || []);
      setSelectedLabels(note.labels || []);
      setReminder(note.reminder || null);
      setDismissedLinks(note.dismissedLinks || []);
      setIsPinned(note.isPinned || false);
      setIsArchived(note.isArchived || false);
    }
  }, [note]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleSaveAndClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    note,
    title,
    content,
    checklistItems,
    images,
    drawings,
    selectedLabels,
    reminder,
    dismissedLinks,
    color,
    isPinned,
    isArchived,
  ]);

  const noteAllText = isChecklist
    ? checklistItems.map((i) => i.text).join(' ')
    : content;
  const detectedUrls = extractUrls(noteAllText).filter(
    (u) => !dismissedLinks.includes(u)
  );

  if (!isOpen || !note) return null;

  const handleSaveAndClose = () => {
    const validChecklist = checklistItems.filter((i) => i.text.trim().length > 0);
    onUpdateNote({
      ...note,
      title: title.trim(),
      content: content.trim(),
      isChecklist,
      checklistItems: validChecklist,
      color,
      images,
      drawings,
      labels: selectedLabels,
      reminder,
      dismissedLinks,
      isPinned,
      isArchived,
      updatedAt: Date.now(),
    });
    onClose();
  };

  const handleToggleCheckItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleUpdateCheckItemText = (id: string, newText: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: newText } : item))
    );
  };

  const handleRemoveCheckItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddChecklistItem = (text: string) => {
    if (!text.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      {
        id: 'c-' + Date.now() + Math.random().toString(36).slice(2, 6),
        text: text.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSaveDrawing = (dataUrl: string) => {
    setDrawings((prev) => [...prev, dataUrl]);
  };

  const colorDef = NOTE_COLORS[color] || NOTE_COLORS.default;
  const activeCompletedItems = checklistItems.filter((i) => i.completed);
  const activeUncompletedItems = checklistItems.filter((i) => !i.completed);

  const formattedEditedDate = new Date(note.updatedAt).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
        onClick={handleSaveAndClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
            colorDef.lightBg
          } ${colorDef.lightBorder} ${colorDef.darkBg} ${colorDef.darkBorder}`}
        >
          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {/* Media Gallery */}
            {(images.length > 0 || drawings.length > 0) && (
              <div className="flex flex-wrap gap-2 pb-2">
                {images.map((img, idx) => (
                  <div
                    key={`modal-img-${idx}`}
                    className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-56 group"
                  >
                    <img
                      src={img}
                      alt="attachment"
                      className="object-cover max-h-56 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {drawings.map((draw, idx) => (
                  <div
                    key={`modal-draw-${idx}`}
                    className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-56 bg-white group"
                  >
                    <img
                      src={draw}
                      alt="drawing"
                      className="object-contain max-h-56 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDrawings((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                      title="Remove drawing"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Title and Pin button */}
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-semibold bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                  isPinned
                    ? 'text-amber-500'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
                title={isPinned ? 'Unpin note' : 'Pin note'}
              >
                {isPinned ? (
                  <Pin className="w-5 h-5 fill-current" />
                ) : (
                  <PinOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Note Body: Text or Checklist */}
            {!isChecklist ? (
              <textarea
                placeholder="Note"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full bg-transparent text-sm text-stone-800 dark:text-stone-200 placeholder-stone-500 dark:placeholder-stone-400 resize-none focus:outline-none leading-relaxed"
              />
            ) : (
              <div className="space-y-1.5 pt-1">
                {activeUncompletedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-sm group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleCheckItem(item.id)}
                      className="w-4 h-4 rounded border border-stone-400 hover:border-amber-500 flex items-center justify-center shrink-0 transition-colors"
                    >
                      {item.completed && <Check className="w-3 h-3 text-amber-500" />}
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        handleUpdateCheckItemText(item.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          newItemInputRef.current?.focus();
                        }
                      }}
                      className="flex-1 bg-transparent border-none text-stone-800 dark:text-stone-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckItem(item.id)}
                      className="p-1 text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add item line */}
                <div className="flex items-center gap-2 text-sm text-stone-500 pt-1">
                  <Plus className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    ref={newItemInputRef}
                    type="text"
                    placeholder="List item"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newChecklistText.trim()) {
                        e.preventDefault();
                        handleAddChecklistItem(newChecklistText);
                      }
                    }}
                    className="flex-1 bg-transparent text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none"
                  />
                  {newChecklistText.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddChecklistItem(newChecklistText)}
                      className="p-1 text-amber-500 hover:text-amber-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Completed items fold */}
                {activeCompletedItems.length > 0 && (
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-700/60 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 font-medium py-1"
                    >
                      {showCompleted ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {activeCompletedItems.length} completed item
                        {activeCompletedItems.length > 1 ? 's' : ''}
                      </span>
                    </button>

                    {showCompleted && (
                      <div className="space-y-1 mt-1 pl-1">
                        {activeCompletedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 text-sm group text-stone-400 dark:text-stone-500"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleCheckItem(item.id)}
                              className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center shrink-0"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </button>
                            <span className="flex-1 line-through truncate">
                              {item.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCheckItem(item.id)}
                              className="p-1 text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Link Previews */}
            {detectedUrls.length > 0 && (
              <div className="space-y-2 pt-2">
                {detectedUrls.map((url) => (
                  <LinkPreviewCard
                    key={url}
                    url={url}
                    onRemove={() =>
                      setDismissedLinks((prev) => [...prev, url])
                    }
                  />
                ))}
              </div>
            )}

            {/* Chips: Reminder and Labels */}
            {(reminder || selectedLabels.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {reminder && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-200">
                    <Bell className="w-3 h-3 text-stone-400" />
                    <span>{reminder}</span>
                    <button
                      type="button"
                      onClick={() => setReminder(null)}
                      className="ml-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedLabels.map((lbl) => (
                  <span
                    key={lbl}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-200"
                  >
                    <span>{lbl}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedLabels((prev) =>
                          prev.filter((l) => l !== lbl)
                        )
                      }
                      className="ml-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 sm:px-5 flex items-center justify-between border-t border-black/5 dark:border-white/10 bg-black/2 dark:bg-white/2 relative">
            <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
              {/* Reminder button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowReminderPicker(!showReminderPicker)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="Remind me"
                >
                  <Bell className="w-4 h-4" />
                </button>
                {showReminderPicker && (
                  <ReminderPickerPopover
                    currentReminder={reminder}
                    onSelectReminder={(rem) => setReminder(rem)}
                    onClose={() => setShowReminderPicker(false)}
                  />
                )}
              </div>

              {/* Color picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="Background options"
                >
                  <Palette className="w-4 h-4" />
                </button>
                {showColorPicker && (
                  <ColorPickerPopover
                    currentColor={color}
                    onSelectColor={(c) => setColor(c)}
                    onClose={() => setShowColorPicker(false)}
                    isDark={isDark}
                  />
                )}
              </div>

              {/* Add image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Add image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Add drawing */}
              <button
                type="button"
                onClick={() => setShowDrawingModal(true)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Add drawing"
              >
                <Paintbrush className="w-4 h-4" />
              </button>

              {/* Archive / Unarchive */}
              <button
                type="button"
                onClick={() => setIsArchived(!isArchived)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={isArchived ? 'Unarchive' : 'Archive'}
              >
                {isArchived ? (
                  <ArchiveRestore className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </button>

              {/* More options menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="More"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMoreMenu && (
                  <div className="absolute bottom-11 left-0 z-50 w-44 py-1.5 bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl text-xs text-stone-700 dark:text-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteNote(note.id);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                      <span>Delete note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowLabelsPopover(true);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      Change labels
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onDuplicateNote(note);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>Make a copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsChecklist(!isChecklist);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      {isChecklist ? 'Hide checkboxes' : 'Show checkboxes'}
                    </button>
                  </div>
                )}

                {showLabelsPopover && (
                  <LabelsPopover
                    allLabels={allLabels}
                    selectedLabels={selectedLabels}
                    onToggleLabel={(labelName) =>
                      setSelectedLabels((prev) =>
                        prev.includes(labelName)
                          ? prev.filter((l) => l !== labelName)
                          : [...prev, labelName]
                      )
                    }
                    onCreateLabel={onCreateLabel}
                    onClose={() => setShowLabelsPopover(false)}
                  />
                )}
              </div>
            </div>

            {/* Edited timestamp & Close */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-stone-400 hidden sm:inline">
                Edited {formattedEditedDate}
              </span>
              <button
                type="button"
                onClick={handleSaveAndClose}
                className="px-5 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Drawing Modal */}
      <DrawingModal
        isOpen={showDrawingModal}
        onClose={() => setShowDrawingModal(false)}
        onSaveDrawing={handleSaveDrawing}
      />
    </>
  );
};
