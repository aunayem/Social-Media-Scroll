import React, { useState, useRef } from 'react';
import {
  Pin,
  PinOff,
  Palette,
  Bell,
  Archive,
  ArchiveRestore,
  MoreVertical,
  Check,
  X,
  Trash2,
  RotateCcw,
  Copy,
  Tag,
  ImageIcon,
} from 'lucide-react';
import {
  Note,
  NoteColorId,
  Label,
  NOTE_COLORS,
} from '../types';
import { ColorPickerPopover } from './ColorPickerPopover';
import { ReminderPickerPopover } from './ReminderPickerPopover';
import { LabelsPopover } from './LabelsPopover';
import { FormattedText } from './FormattedText';
import { LinkPreviewCard } from './LinkPreviewCard';
import { extractUrls } from '../utils/linkPreview';

interface NoteCardProps {
  note: Note;
  onOpenEdit: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteNote: (id: string) => void; // Move to trash or delete forever
  onRestoreNote?: (id: string) => void;
  onDeleteForever?: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onUpdateNote: (updatedNote: Note) => void;
  allLabels: Label[];
  onCreateLabel: (name: string) => void;
  isDark: boolean;
  isTrashView?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onOpenEdit,
  onTogglePin,
  onToggleArchive,
  onDeleteNote,
  onRestoreNote,
  onDeleteForever,
  onDuplicateNote,
  onUpdateNote,
  allLabels,
  onCreateLabel,
  isDark,
  isTrashView = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showLabelsPopover, setShowLabelsPopover] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorDef = NOTE_COLORS[note.color] || NOTE_COLORS.default;

  const handleToggleCheckItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedItems = note.checklistItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateNote({
      ...note,
      checklistItems: updatedItems,
      updatedAt: Date.now(),
    });
  };

  const handleCopyNoteText = (e: React.MouseEvent) => {
    e.stopPropagation();
    let text = note.title ? `${note.title}\n\n` : '';
    if (note.isChecklist) {
      text += note.checklistItems
        .map((i) => `[${i.completed ? 'x' : ' '}] ${i.text}`)
        .join('\n');
    } else {
      text += note.content;
    }
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setShowMoreMenu(false);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateNote({
            ...note,
            images: [...note.images, event.target!.result as string],
            updatedAt: Date.now(),
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const visibleChecklist = note.checklistItems.slice(0, 6);
  const remainingCount = note.checklistItems.length - visibleChecklist.length;

  // Extract URLs for hyperlinks and rich link preview
  const noteAllText = note.isChecklist
    ? note.checklistItems.map((i) => i.text).join(' ')
    : note.content;
  const detectedUrls = extractUrls(noteAllText).filter(
    (u) => !(note.dismissedLinks || []).includes(u)
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMoreMenu(false);
      }}
      onClick={() => {
        if (!isTrashView) onOpenEdit(note);
      }}
      className={`relative rounded-2xl border transition-all duration-200 group flex flex-col justify-between overflow-hidden ${
        colorDef.lightBg
      } ${colorDef.lightBorder} ${colorDef.darkBg} ${colorDef.darkBorder} ${
        !isTrashView ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      }`}
    >
      {/* Top Media Gallery (Images & Drawings) */}
      {(note.images.length > 0 || note.drawings.length > 0) && (
        <div className="w-full flex flex-col">
          {note.images.map((img, idx) => (
            <div
              key={`card-img-${idx}`}
              className="w-full overflow-hidden max-h-56 bg-stone-100 dark:bg-stone-800"
            >
              <img
                src={img}
                alt="attachment"
                className="w-full object-cover max-h-56 transition-transform duration-300 group-hover:scale-102"
              />
            </div>
          ))}
          {note.drawings.map((draw, idx) => (
            <div
              key={`card-draw-${idx}`}
              className="w-full overflow-hidden max-h-56 bg-white dark:bg-stone-900 border-b border-black/5"
            >
              <img
                src={draw}
                alt="drawing sketch"
                className="w-full object-contain max-h-56"
              />
            </div>
          ))}
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 space-y-2 flex-1">
        {/* Title and Pin button */}
        <div className="flex items-start justify-between gap-2">
          {note.title && (
            <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug break-words">
              {note.title}
            </h3>
          )}

          {!isTrashView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              className={`p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-opacity ml-auto ${
                note.isPinned
                  ? 'text-amber-500 opacity-100'
                  : isHovered
                  ? 'text-stone-500 hover:text-stone-700 opacity-100'
                  : 'opacity-0'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
            >
              {note.isPinned ? (
                <Pin className="w-4 h-4 fill-current" />
              ) : (
                <PinOff className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Note Content */}
        {!note.isChecklist ? (
          note.content && (
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap line-clamp-10 break-words leading-relaxed font-normal">
              <FormattedText text={note.content} />
            </p>
          )
        ) : (
          <div className="space-y-1.5 pt-1">
            {visibleChecklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 text-xs sm:text-sm"
              >
                <button
                  type="button"
                  disabled={isTrashView}
                  onClick={(e) => handleToggleCheckItem(item.id, e)}
                  className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    item.completed
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'border-stone-400 hover:border-amber-500'
                  }`}
                >
                  {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span
                  className={`flex-1 break-words leading-tight ${
                    item.completed
                      ? 'line-through text-stone-400 dark:text-stone-500'
                      : 'text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <FormattedText text={item.text} />
                </span>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="text-xs text-stone-400 pl-6 font-medium">
                +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Link Previews */}
        {detectedUrls.length > 0 && (
          <div className="space-y-1.5 pt-1.5">
            {detectedUrls.map((url) => (
              <LinkPreviewCard
                key={url}
                url={url}
                compact
                onRemove={
                  !isTrashView
                    ? () => {
                        const updatedDismissed = [
                          ...(note.dismissedLinks || []),
                          url,
                        ];
                        onUpdateNote({
                          ...note,
                          dismissedLinks: updatedDismissed,
                          updatedAt: Date.now(),
                        });
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Chips: Reminder and Labels */}
        {(note.reminder || note.labels.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {note.reminder && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-200">
                <Bell className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate max-w-[140px]">{note.reminder}</span>
                {!isTrashView && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateNote({ ...note, reminder: null, updatedAt: Date.now() });
                    }}
                    className="ml-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            )}

            {note.labels.map((lbl) => (
              <span
                key={lbl}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-200"
              >
                <Tag className="w-3 h-3 text-stone-400 shrink-0" />
                <span>{lbl}</span>
                {!isTrashView && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateNote({
                        ...note,
                        labels: note.labels.filter((l) => l !== lbl),
                        updatedAt: Date.now(),
                      });
                    }}
                    className="ml-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Toolbar on Bottom */}
      <div
        className={`px-3 py-1.5 flex items-center justify-between border-t border-black/5 dark:border-white/5 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isTrashView ? (
          <>
            <div className="flex items-center gap-0.5 sm:gap-1 text-stone-600 dark:text-stone-300">
              {/* Reminder button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowReminderPicker(!showReminderPicker)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="Remind me"
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                {showReminderPicker && (
                  <ReminderPickerPopover
                    currentReminder={note.reminder}
                    onSelectReminder={(rem) =>
                      onUpdateNote({
                        ...note,
                        reminder: rem,
                        updatedAt: Date.now(),
                      })
                    }
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
                  <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                {showColorPicker && (
                  <ColorPickerPopover
                    currentColor={note.color}
                    onSelectColor={(c) =>
                      onUpdateNote({ ...note, color: c, updatedAt: Date.now() })
                    }
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
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Archive / Unarchive */}
              <button
                type="button"
                onClick={() => onToggleArchive(note.id)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={note.isArchived ? 'Unarchive' : 'Archive'}
              >
                {note.isArchived ? (
                  <ArchiveRestore className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>

              {/* More options menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="More"
                >
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {showMoreMenu && (
                  <div className="absolute bottom-9 left-0 z-50 w-44 py-1.5 bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl text-xs text-stone-700 dark:text-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteNote(note.id);
                        setShowMoreMenu(false);
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
                      className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <Tag className="w-3.5 h-3.5 text-stone-400" />
                      <span>Change labels</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onDuplicateNote(note);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>Make a copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyNoteText}
                      className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>{copyFeedback ? 'Copied!' : 'Copy to clipboard'}</span>
                    </button>
                  </div>
                )}

                {showLabelsPopover && (
                  <LabelsPopover
                    allLabels={allLabels}
                    selectedLabels={note.labels}
                    onToggleLabel={(labelName) => {
                      const updated = note.labels.includes(labelName)
                        ? note.labels.filter((l) => l !== labelName)
                        : [...note.labels, labelName];
                      onUpdateNote({ ...note, labels: updated, updatedAt: Date.now() });
                    }}
                    onCreateLabel={onCreateLabel}
                    onClose={() => setShowLabelsPopover(false)}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          /* Trash View Actions */
          <div className="w-full flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
            <button
              type="button"
              onClick={() => onDeleteForever && onDeleteForever(note.id)}
              className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition-colors"
              title="Delete forever"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRestoreNote && onRestoreNote(note.id)}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input for card image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};
