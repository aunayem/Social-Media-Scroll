import React, { useState } from 'react';
import { Label } from '../types';
import { Tag, Plus, Check, Pencil, Trash2, X } from 'lucide-react';

interface LabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: Label[];
  onCreateLabel: (name: string) => void;
  onRenameLabel: (id: string, newName: string) => void;
  onDeleteLabel: (id: string) => void;
}

export const LabelsModal: React.FC<LabelsModalProps> = ({
  isOpen,
  onClose,
  labels,
  onCreateLabel,
  onRenameLabel,
  onDeleteLabel,
}) => {
  const [newLabelName, setNewLabelName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newLabelName.trim();
    if (!trimmed) return;
    onCreateLabel(trimmed);
    setNewLabelName('');
  };

  const handleStartEdit = (l: Label) => {
    setEditingId(l.id);
    setEditingName(l.name);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      onRenameLabel(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#28292c] border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl p-4 text-stone-800 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-700/80">
          <h2 className="font-semibold text-base">Edit labels</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create new label row */}
        <form onSubmit={handleCreate} className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setNewLabelName('')}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <Plus className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Create new label"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            className="flex-1 text-sm bg-transparent border-b border-transparent focus:border-stone-400 dark:focus:border-stone-500 pb-1 focus:outline-none placeholder-stone-400"
          />
          {newLabelName.trim() && (
            <button
              type="submit"
              className="p-1.5 text-amber-500 hover:text-amber-600 transition-colors"
              title="Save label"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Existing labels list */}
        <div className="max-h-60 overflow-y-auto space-y-1 my-2 pr-1">
          {labels.map((l) => {
            const isEditing = editingId === l.id;
            return (
              <div
                key={l.id}
                className="flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-stone-100/70 dark:hover:bg-stone-700/50 group transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onDeleteLabel(l.id)}
                  className="p-1 text-stone-400 hover:text-red-500 group-hover:text-stone-500 transition-colors"
                  title="Delete label"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(l.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => handleSaveEdit(l.id)}
                    className="flex-1 text-sm bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-amber-400 focus:outline-none"
                  />
                ) : (
                  <span
                    className="flex-1 text-sm truncate cursor-pointer"
                    onClick={() => handleStartEdit(l)}
                  >
                    {l.name}
                  </span>
                )}

                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(l.id)}
                    className="p-1 text-amber-500 hover:text-amber-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(l)}
                    className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Rename label"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 mt-3 border-t border-stone-100 dark:border-stone-700/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
