import { Note, Label } from '../types';

const STORAGE_KEY_NOTES = 'google_keep_notes_v1';
const STORAGE_KEY_LABELS = 'google_keep_labels_v1';
const STORAGE_KEY_LAYOUT = 'google_keep_layout_v1';
const STORAGE_KEY_THEME = 'google_keep_theme_v1';

// Sample drawing SVG data URI for demo note
const SAMPLE_DRAWING_DATA_URL =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="100%" height="100%" fill="%23ffffff"><rect width="100%" height="100%" fill="%232d3748"/><path d="M150,220 C130,170 120,130 180,80 C230,40 280,60 300,100 C320,140 290,190 270,220 Z" fill="none" stroke="%23fbbc04" stroke-width="6" stroke-linecap="round"/><path d="M190,220 L230,220 M195,235 L225,235 M205,250 L215,250" fill="none" stroke="%23fbbc04" stroke-width="5" stroke-linecap="round"/><circle cx="210" cy="140" r="12" fill="%23fbbf24"/><path d="M120,60 L90,40 M310,60 L340,40 M80,140 L40,140 M340,140 L380,140" stroke="%23fef08a" stroke-width="4" stroke-linecap="round"/><text x="250" y="275" font-family="sans-serif" font-size="20" fill="%23e2e8f0" text-anchor="middle">Google Keep Idea Board</text></svg>';

// Sample photo for demo note
const SAMPLE_IMAGE_DATA_URL =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ff7e5f"/><stop offset="100%" stop-color="%23feb47b"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g1)"/><path d="M0,280 Q150,220 300,270 T600,260 L600,360 L0,360 Z" fill="%232c3e50" opacity="0.9"/><path d="M0,300 Q200,250 400,290 T600,285 L600,360 L0,360 Z" fill="%231a252f"/><circle cx="480" cy="90" r="45" fill="%23fff" opacity="0.85"/><text x="40" y="70" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23ffffff">Weekend Mountain Trip</text><text x="40" y="105" font-family="sans-serif" font-size="16" fill="%23ffffff" opacity="0.9">Sunrise viewpoint &amp; trail map</text></svg>';

export const INITIAL_LABELS: Label[] = [
  { id: 'lbl-1', name: 'Work' },
  { id: 'lbl-2', name: 'Personal' },
  { id: 'lbl-3', name: 'Ideas' },
  { id: 'lbl-4', name: 'Recipes' },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to Google Keep ✨',
    content:
      'Capture what is on your mind. Organize with colors, pins, custom labels, checklists, drawing sketches, and reminders.\n\nQuick Tips:\n• Press "/" to quickly search notes\n• Click checkboxes directly from the card\n• Toggle between Grid and List view in the top bar\n• Switch between authentic Light and Dark mode',
    isChecklist: false,
    checklistItems: [],
    color: 'sand',
    images: [],
    drawings: [],
    labels: ['Personal', 'Ideas'],
    reminder: 'Today, 6:00 PM',
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'note-groceries',
    title: 'Farmer\'s Market & Pantry',
    content: '',
    isChecklist: true,
    checklistItems: [
      { id: 'c-1', text: 'Organic sourdough loaf', completed: true },
      { id: 'c-2', text: 'Avocados (3 ripe ones)', completed: false },
      { id: 'c-3', text: 'Fresh rosemary and sweet basil', completed: false },
      { id: 'c-4', text: 'Almond milk (unsweetened)', completed: true },
      { id: 'c-5', text: 'Greek yogurt & honey', completed: false },
      { id: 'c-6', text: 'Dark chocolate 85%', completed: false },
    ],
    color: 'mint',
    images: [],
    drawings: [],
    labels: ['Recipes', 'Personal'],
    reminder: 'Tomorrow, 9:00 AM',
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    createdAt: Date.now() - 3600000 * 18,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'note-drawing',
    title: 'App Architecture Concept',
    content: 'Sketched the new modular system layout during the morning design brainstorm. Keep the navigation rail fluid and responsive.',
    isChecklist: false,
    checklistItems: [],
    color: 'dusk',
    images: [],
    drawings: [SAMPLE_DRAWING_DATA_URL],
    labels: ['Work', 'Ideas'],
    reminder: null,
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: Date.now() - 3600000 * 30,
    updatedAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'note-trip',
    title: 'Spring Cabin Getaway',
    content: 'Packed list & itinerary:\n1. Check tire pressure and fuel\n2. Download offline hiking trail maps\n3. Pack warm windbreaker and binoculars\n4. Pick up keys from lockbox at 3 PM',
    isChecklist: false,
    checklistItems: [],
    color: 'coral',
    images: [SAMPLE_IMAGE_DATA_URL],
    drawings: [],
    labels: ['Personal'],
    reminder: null,
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: Date.now() - 3600000 * 40,
    updatedAt: Date.now() - 3600000 * 15,
  },
  {
    id: 'note-recipe',
    title: 'Grandma’s Citrus Roasted Salmon',
    content: 'Prep: 15 min | Cook: 18 min at 400°F\n\n• Season wild salmon fillet with sea salt, smoked paprika, and crushed garlic\n• Layer thin slices of blood orange and Meyer lemon on top\n• Drizzle olive oil and fresh dill sprigs\n• Roast until flaky and caramelizing on edges',
    isChecklist: false,
    checklistItems: [],
    color: 'peach',
    images: [],
    drawings: [],
    labels: ['Recipes'],
    reminder: null,
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: Date.now() - 3600000 * 50,
    updatedAt: Date.now() - 3600000 * 20,
  },
  {
    id: 'note-sprint',
    title: 'Q4 Product Deliverables',
    content: '',
    isChecklist: true,
    checklistItems: [
      { id: 's-1', text: 'Finalize UX wireframes for settings', completed: true },
      { id: 's-2', text: 'Conduct user validation interviews', completed: true },
      { id: 's-3', text: 'Optimize bundle size & first paint metric', completed: false },
      { id: 's-4', text: 'Draft release changelog & documentation', completed: false },
    ],
    color: 'fog',
    images: [],
    drawings: [],
    labels: ['Work'],
    reminder: 'Next week, Monday 10:00 AM',
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: Date.now() - 3600000 * 60,
    updatedAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'note-book-recs',
    title: 'Reading List 2026',
    content: '• Thinking, Fast and Slow — Daniel Kahneman\n• The Design of Everyday Things — Don Norman\n• Designing Data-Intensive Applications — Martin Kleppmann\n• Atomic Habits — James Clear',
    isChecklist: false,
    checklistItems: [],
    color: 'sage',
    images: [],
    drawings: [],
    labels: ['Ideas'],
    reminder: null,
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: Date.now() - 3600000 * 80,
    updatedAt: Date.now() - 3600000 * 30,
  },
  {
    id: 'note-bookmarks',
    title: 'Design & Engineering Bookmarks 🌐',
    content: 'Check out the design system guidelines and web documentation:\n• Material Design 3: https://m3.material.io\n• GitHub: https://github.com/google\n• MDN Web Docs: https://developer.mozilla.org',
    isChecklist: false,
    checklistItems: [],
    color: 'storm',
    images: [],
    drawings: [],
    labels: ['Work', 'Ideas'],
    reminder: null,
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    createdAt: Date.now() - 3600000 * 45,
    updatedAt: Date.now() - 3600000 * 18,
  },
];

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      saveNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // If user had previous storage without the demo bookmark note, include it
      const hasBookmarks = parsed.some((n: Note) => n.id === 'note-bookmarks');
      if (!hasBookmarks) {
        const bookmarksNote = INITIAL_NOTES.find((n) => n.id === 'note-bookmarks');
        if (bookmarksNote) {
          const updated = [...parsed, bookmarksNote];
          saveNotes(updated);
          return updated;
        }
      }
      return parsed;
    }
    return INITIAL_NOTES;
  } catch (err) {
    console.error('Failed to load notes from localStorage', err);
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to localStorage', err);
  }
}

export function loadLabels(): Label[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LABELS);
    if (!raw) {
      saveLabels(INITIAL_LABELS);
      return INITIAL_LABELS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LABELS;
  } catch (err) {
    console.error('Failed to load labels from localStorage', err);
    return INITIAL_LABELS;
  }
}

export function saveLabels(labels: Label[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LABELS, JSON.stringify(labels));
  } catch (err) {
    console.error('Failed to save labels to localStorage', err);
  }
}

export function loadLayout(): 'grid' | 'list' {
  try {
    return (localStorage.getItem(STORAGE_KEY_LAYOUT) as 'grid' | 'list') || 'grid';
  } catch {
    return 'grid';
  }
}

export function saveLayout(layout: 'grid' | 'list'): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAYOUT, layout);
  } catch (err) {
    console.error(err);
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null;
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (err) {
    console.error(err);
  }
}

export function exportBackup(notes: Note[], labels: Label[]): void {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
    labels,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `google-keep-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<{ notes: Note[]; labels: Label[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.notes)) {
          resolve({
            notes: parsed.notes,
            labels: Array.isArray(parsed.labels) ? parsed.labels : INITIAL_LABELS,
          });
        } else {
          reject(new Error('Invalid backup file format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
