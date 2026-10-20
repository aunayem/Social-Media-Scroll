# Google Keep Replica — Implementation Plan

An authentic, pixel-accurate replica of Google Keep built with React 19, Tailwind CSS, Lucide icons, and Motion animations. Provides seamless note creation across text, checklist to-dos, drawing canvas memos, and image attachments, organized with custom color themes, labels, reminders, pinning, masonry grid & list layouts, archive, and trash.

## User Review & Critical Decisions

> [!IMPORTANT]
> The core specifications and user preferences confirmed in Phase 1:
> - **Note Formats**: Text notes, interactive checklist to-dos (with reordering & checked item grouping), image attachments, and a full vector/brush drawing canvas modal.
> - **Organization & Layout**: Toggleable Masonry multi-column grid and single-column list views, pinned notes section, custom labels drawer, reminder filter, archive, and trash bin with restore/permanent delete.
> - **Visual Identity**: Authentic Google Keep Material 3 design system with light and dark mode toggles, 12 signature Keep pastel background tints and custom pattern accents, collapsible navigation rail, and expandable note creator.

- **Confirmed Decision 1**: Rich media includes native drawing pad with stroke colors, stroke width, eraser, undo/clear, and automatic export as note image attachments.
- **Confirmed Decision 2**: Storage runs on reactive browser `localStorage` with initial pre-populated realistic notes, automatic debounced auto-save, and JSON export/import backup for zero data loss.
- **Confirmed Decision 3**: Full keyboard shortcut support (Escape to close modals/creators, Enter to append to-do checklist items, `/` to focus search).

---

## 1. Overview & Core Concept

Google Keep is celebrated for its frictionless capture speed, playful color-coded post-it note aesthetic, and intuitive hierarchy. This replica provides:
- **Instant Note Creator**: A collapsed pill (`Take a note...`) with quick-action shortcuts for New List, New Drawing, and New Image, expanding smoothly into an inline editor with title, body, checklist items, image preview, reminder dates, color picker, and pin button.
- **Card-Based Masonry Grid & List Views**: Pinned notes on top, followed by Other Notes, arranged in responsive columns with smooth layout animations.
- **Checklist Mode**: Toggle between plain text and interactive checklist with strike-through styling, "Completed items" collapsible section, and keyboard navigation.
- **Full Drawing Canvas**: Hand-drawn sketches with pencil/highlighter/marker widths, color palette, clear canvas, and saving directly to note media.
- **Label Management**: Side drawer with custom label creation, note tagging, and label-filtered view.
- **Search & Quick Filters**: Real-time fuzzy query filtering by title, body, checklist item, color, or note type (text, list, drawing, image).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Quick Capture**:
   - User clicks the collapsed "Take a note..." bar or list/drawing shortcut.
   - The bar smoothly expands into a rich card.
   - User types title and notes, picks a background color (e.g., Light Yellow, Coral, Mint, Dusk), adds tags or sets a reminder, then clicks "Close" or outside. Note immediately appears in the grid.
2. **Interactive Checklist**:
   - User checks off items; checked items smoothly drop down to a collapsible "X Completed items" sub-section with strikethrough.
   - Adding a new line is seamless via `Enter` key.
3. **Drawing Canvas**:
   - User selects the Brush icon. A modal appears with a full HTML5 Canvas.
   - User draws with customized brush size and colors, previews the sketch, and clicks "Save Drawing". It attaches to the current or new note.
4. **Card Hover & Multi-Action Toolbar**:
   - Hovering any note reveals the Keep action bar: Remind Me, Add Collaborator (simulated), Change Color, Add Image, Archive, More (Delete, Add Label, Duplicate, Show Checkboxes, Copy to Clipboard), and Pin top-right.
5. **Sidebar Navigation & Views**:
   - Seamless switching between: **Notes**, **Reminders**, **Labels (custom)**, **Archive**, and **Trash**.
   - Trash allows permanent deletion or single-click restore.

### Visual Identity & Theme

- **Aesthetic Direction**: Authentic Google Keep Material Design 3. Clean flat surfaces, subtle 1px border lines (`border-stone-200 dark:border-stone-700/60`), rounded-xl note cards (`rounded-2xl`), floating search bar with subtle shadow.
- **Color Palette & Keep Themes**:
  - Light mode canvas: `#ffffff` / `#f8f9fa` with Google Keep Yellow primary accent (`#fbbc04`).
  - Dark mode canvas: `#202124` surface, `#2d2e30` cards, `#e8eaed` text.
  - 12 Note Background Tints (both light & dark calibrated): Default (white/neutral), Coral, Peach, Sand, Mint, Sage, Fog, Storm, Dusk, Blossom, Clay, Chalk.
- **Typography & Hierarchy**:
  - Google Product Sans inspired font stack (`Outfit`, `Plus Jakarta Sans`, system sans-serif).
  - Headline weight: SemiBold 500/600 for card titles, Regular 400 with 1.5 line height for body text.
- **Interactive Feedback & Motion**:
  - Smooth expansion and collapse via CSS and Motion.
  - Hover elevation transitions and tactile button ripples.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Masonry Grid Layout vs Fixed Grid**
  - *Chosen Approach*: CSS multi-column / Flex masonry layout adapting across 1, 2, 3, and 4 columns based on screen width.
  - *Why*: Google Keep notes vary drastically in height (short reminder vs 10-item grocery list vs drawing attachment). True masonry eliminates awkward whitespace gaps.
- **Decision 2: Integrated Drawing Engine**
  - *Chosen Approach*: Direct HTML5 Canvas drawing modal with stroke smoothing, color selector, thickness presets, and PNG dataURL generation.
  - *Why*: Allows zero-external-dependency, instant, offline-capable sketching that attaches directly to notes.
- **Decision 3: LocalStorage with Export/Import Backup**
  - *Chosen Approach*: Client-side persistence in `localStorage` with reactive updates, accompanied by a JSON backup export & restore option in Settings.
  - *Why*: Fast, instant load, works offline without cloud authentication friction, and provides users confidence their notes won't disappear.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Google Keep App Shell                          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ TopBar: Hamburger | Keep Logo | Search Bar | Grid/List | Theme   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────────┬─────────────────────────────────────────────┐  │
│  │ Navigation Rail    │ Main Content Canvas                         │  │
│  │  - Notes           │  ┌───────────────────────────────────────┐  │  │
│  │  - Reminders       │  │ Note Creator (Collapsed / Expanded)   │  │  │
│  │  - Custom Labels   │  └───────────────────────────────────────┘  │  │
│  │  - Edit Labels     │                                             │  │
│  │  - Archive         │  ┌───────────────────────────────────────┐  │  │
│  │  - Trash           │  │ Pinned Notes Section (Masonry/List)   │  │  │
│  │  - Settings / Data │  ├───────────────────────────────────────┤  │  │
│  │                    │  │ Other Notes Section (Masonry/List)    │  │  │
│  │                    │  └───────────────────────────────────────┘  │  │
│  └────────────────────┴─────────────────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────── Modals ─────────────────────────────────┐  │
│  │ • Note Detail Edit Modal     • Drawing Canvas Modal              │  │
│  │ • Label Manager Modal        • Image Attachment Preview Modal    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

```typescript
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type NoteColorId = 
  | 'default' | 'coral' | 'peach' | 'sand' 
  | 'mint' | 'sage' | 'fog' | 'storm' 
  | 'dusk' | 'blossom' | 'clay' | 'chalk';

export interface Note {
  id: string;
  title: string;
  content: string; // Plain text or summary
  isChecklist: boolean;
  checklistItems: ChecklistItem[];
  color: NoteColorId;
  images: string[]; // data URLs or generated URLs
  drawings: string[]; // data URLs
  labels: string[]; // label IDs
  reminder: string | null; // ISO date string or human label
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### Interactive State Mutations & Handlers

- **Note Editing & Creation**: Full state updates with debounce, automatic timestamp maintenance.
- **Card Action Bar Handlers**:
  - Color Picker popover with 12 palette colors.
  - Reminder Picker (Today, Tomorrow, Next Week, or custom date/time).
  - Add Image file input (reads as base64 data URL).
  - Drawing modal trigger (opens canvas and appends result).
  - Toggle Pin / Archive / Trash.
  - Duplicate note & Copy text to clipboard with toast notification.
- **Trash Management**: "Empty Trash" button with confirmation, individual note "Delete Forever" and "Restore".
- **Label Management**: Create, rename, delete labels; dynamic counts and instant multi-tagging on notes.
