import React, { useState, useRef, useEffect } from 'react';
import {
  SquareCheck,
  Paintbrush,
  Image as ImageIcon,
  Pin,
  PinOff,
  Palette,
  Bell,
  Archive,
  MoreVertical,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
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

interface NoteCreatorProps {
  onSaveNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  allLabels: Label[];
  onCreateLabel: (name: string) => void;
  isDark: boolean;
}

export const NoteCreator: React.FC<NoteCreatorProps> = ({
  onSaveNote,
  allLabels,
  onCreateLabel,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Popover states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showLabelsPopover, setShowLabelsPopover] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  // Handle outside click to save and collapse
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSaveAndClose();
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    isExpanded,
    title,
    content,
    checklistItems,
    images,
    drawings,
    color,
    selectedLabels,
    reminder,
    dismissedLinks,
    isPinned,
    isChecklist,
  ]);

  const hasContent =
    title.trim().length > 0 ||
    content.trim().length > 0 ||
    checklistItems.some((i) => i.text.trim().length > 0) ||
    images.length > 0 ||
    drawings.length > 0;

  const noteAllText = isChecklist
    ? checklistItems.map((i) => i.text).join(' ')
    : content;
  const detectedUrls = extractUrls(noteAllText).filter(
    (u) => !dismissedLinks.includes(u)
  );

  const resetState = () => {
    setTitle('');
    setContent('');
    setIsChecklist(false);
    setChecklistItems([]);
    setNewChecklistText('');
    setColor('default');
    setImages([]);
    setDrawings([]);
    setSelectedLabels([]);
    setReminder(null);
    setDismissedLinks([]);
    setIsPinned(false);
    setIsExpanded(false);
    setShowColorPicker(false);
    setShowReminderPicker(false);
    setShowLabelsPopover(false);
    setShowMoreMenu(false);
  };

  const handleSaveAndClose = () => {
    if (hasContent) {
      const validChecklist = checklistItems.filter((i) => i.text.trim().length > 0);
      onSaveNote({
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
        isArchived: false,
        isTrashed: false,
      });
    }
    resetState();
  };

  const handleStartChecklist = () => {
    setIsExpanded(true);
    setIsChecklist(true);
    if (checklistItems.length === 0) {
      setChecklistItems([{ id: 'c-' + Date.now(), text: '', completed: false }]);
    }
    setTimeout(() => newItemInputRef.current?.focus(), 100);
  };

  const handleAddChecklistItem = (text: string) => {
    if (!text.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: 'c-' + Date.now() + Math.random().toString(36).slice(2, 6), text: text.trim(), completed: false },
    ]);
    setNewChecklistText('');
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

    setIsExpanded(true);
    e.target.value = '';
  };

  const handleSaveDrawing = (dataUrl: string) => {
    setDrawings((prev) => [...prev, dataUrl]);
    setIsExpanded(true);
  };

  const colorDef = NOTE_COLORS[color];
  const activeCompletedItems = checklistItems.filter((i) => i.completed);
  const activeUncompletedItems = checklistItems.filter((i) => !i.completed);

  return (
    <>
      <div className="w-full max-w-2xl mx-auto px-4 mb-8">
        <div
          ref={containerRef}
          className={`rounded-2xl border transition-all duration-200 shadow-md ${
            colorDef.lightBg
          } ${colorDef.lightBorder} ${colorDef.darkBg} ${colorDef.darkBorder}`}
        >
          {/* Collapsed State */}
          {!isExpanded ? (
            <div className="flex items-center justify-between px-4 py-2.5">
              <input
                type="text"
                readOnly
                placeholder="Take a note..."
                onClick={() => {
                  setIsExpanded(true);
                  setTimeout(() => titleInputRef.current?.focus(), 50);
                }}
                className="w-full bg-transparent text-sm font-medium text-stone-600 dark:text-stone-300 placeholder-stone-500 dark:placeholder-stone-400 cursor-text focus:outline-none"
              />

              <div className="flex items-center gap-1 shrink-0 text-stone-500 dark:text-stone-400">
                <button
                  type="button"
                  onClick={handleStartChecklist}
                  className="p-2 rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
                  title="New list"
                >
                  <SquareCheck className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowDrawingModal(true)}
                  className="p-2 rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
                  title="New note with drawing"
                >
                  <Paintbrush className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
                  title="New note with image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded State */
            <div className="p-4 space-y-3">
              {/* Image Previews */}
              {(images.length > 0 || drawings.length > 0) && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {images.map((img, idx) => (
                    <div
                      key={`img-${idx}`}
                      className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-48 group"
                    >
                      <img
                        src={img}
                        alt="attachment"
                        className="object-cover max-h-48 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-90 hover:opacity-100"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {drawings.map((draw, idx) => (
                    <div
                      key={`draw-${idx}`}
                      className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-48 bg-white group"
                    >
                      <img
                        src={draw}
                        alt="drawing"
                        className="object-contain max-h-48 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDrawings((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-90 hover:opacity-100"
                        title="Remove drawing"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Title & Pin row */}
              <div className="flex items-center justify-between gap-2">
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-base font-semibold bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
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

              {/* Body Content / Checklist */}
              {!isChecklist ? (
                <textarea
                  placeholder="Take a note..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-sm text-stone-800 dark:text-stone-200 placeholder-stone-500 dark:placeholder-stone-400 resize-none focus:outline-none"
                />
              ) : (
                <div className="space-y-1.5 pt-1">
                  {/* Uncompleted items */}
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
                        className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add item prompt */}
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

                  {/* Completed items section */}
                  {activeCompletedItems.length > 0 && (
                    <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 mt-2">
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
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
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

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10 relative">
                <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                  {/* Reminder button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowReminderPicker(!showReminderPicker)
                      }
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title="Add image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Add drawing */}
                  <button
                    type="button"
                    onClick={() => setShowDrawingModal(true)}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title="Add drawing"
                  >
                    <Paintbrush className="w-4 h-4" />
                  </button>

                  {/* Archive shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      if (hasContent) {
                        const validChecklist = checklistItems.filter(
                          (i) => i.text.trim().length > 0
                        );
                        onSaveNote({
                          title: title.trim(),
                          content: content.trim(),
                          isChecklist,
                          checklistItems: validChecklist,
                          color,
                          images,
                          drawings,
                          labels: selectedLabels,
                          reminder,
                          isPinned,
                          isArchived: true,
                          isTrashed: false,
                        });
                      }
                      resetState();
                    }}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  {/* More options menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      title="More"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMoreMenu && (
                      <div className="absolute bottom-11 left-0 z-50 w-44 py-1.5 bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl text-xs text-stone-700 dark:text-stone-200">
                        <button
                          type="button"
                          onClick={() => {
                            setShowLabelsPopover(true);
                            setShowMoreMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          Add label
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

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleSaveAndClose}
                  className="px-5 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
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
