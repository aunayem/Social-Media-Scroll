export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type NoteColorId =
  | 'default'
  | 'coral'
  | 'peach'
  | 'sand'
  | 'mint'
  | 'sage'
  | 'fog'
  | 'storm'
  | 'dusk'
  | 'blossom'
  | 'clay'
  | 'chalk';

export interface NoteColorDef {
  id: NoteColorId;
  name: string;
  lightBg: string;
  lightBorder: string;
  darkBg: string;
  darkBorder: string;
  swatchLight: string;
  swatchDark: string;
}

export const NOTE_COLORS: Record<NoteColorId, NoteColorDef> = {
  default: {
    id: 'default',
    name: 'Default',
    lightBg: 'bg-white',
    lightBorder: 'border-stone-200/90',
    darkBg: 'dark:bg-[#202124]',
    darkBorder: 'dark:border-[#5f6368]/60',
    swatchLight: '#ffffff',
    swatchDark: '#202124',
  },
  coral: {
    id: 'coral',
    name: 'Coral',
    lightBg: 'bg-[#faafa8]',
    lightBorder: 'border-[#f28b82]',
    darkBg: 'dark:bg-[#77172e]',
    darkBorder: 'dark:border-[#8f1e39]',
    swatchLight: '#faafa8',
    swatchDark: '#77172e',
  },
  peach: {
    id: 'peach',
    name: 'Peach',
    lightBg: 'bg-[#f39f76]',
    lightBorder: 'border-[#f08552]',
    darkBg: 'dark:bg-[#692b17]',
    darkBorder: 'dark:border-[#833820]',
    swatchLight: '#f39f76',
    swatchDark: '#692b17',
  },
  sand: {
    id: 'sand',
    name: 'Sand',
    lightBg: 'bg-[#fff8b8]',
    lightBorder: 'border-[#f7ec7d]',
    darkBg: 'dark:bg-[#7c4a03]',
    darkBorder: 'dark:border-[#965a05]',
    swatchLight: '#fff8b8',
    swatchDark: '#7c4a03',
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    lightBg: 'bg-[#e2f6d3]',
    lightBorder: 'border-[#ccf0b2]',
    darkBg: 'dark:bg-[#264d3b]',
    darkBorder: 'dark:border-[#32614b]',
    swatchLight: '#e2f6d3',
    swatchDark: '#264d3b',
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    lightBg: 'bg-[#b4ddd3]',
    lightBorder: 'border-[#98cebf]',
    darkBg: 'dark:bg-[#0c625d]',
    darkBorder: 'dark:border-[#137a74]',
    swatchLight: '#b4ddd3',
    swatchDark: '#0c625d',
  },
  fog: {
    id: 'fog',
    name: 'Fog',
    lightBg: 'bg-[#d4e4ed]',
    lightBorder: 'border-[#bad6e4]',
    darkBg: 'dark:bg-[#256377]',
    darkBorder: 'dark:border-[#2f7b94]',
    swatchLight: '#d4e4ed',
    swatchDark: '#256377',
  },
  storm: {
    id: 'storm',
    name: 'Storm',
    lightBg: 'bg-[#aeccdc]',
    lightBorder: 'border-[#92bad0]',
    darkBg: 'dark:bg-[#284255]',
    darkBorder: 'dark:border-[#355770]',
    swatchLight: '#aeccdc',
    swatchDark: '#284255',
  },
  dusk: {
    id: 'dusk',
    name: 'Dusk',
    lightBg: 'bg-[#d3bfdb]',
    lightBorder: 'border-[#bea2c9]',
    darkBg: 'dark:bg-[#472e5b]',
    darkBorder: 'dark:border-[#5c3c75]',
    swatchLight: '#d3bfdb',
    swatchDark: '#472e5b',
  },
  blossom: {
    id: 'blossom',
    name: 'Blossom',
    lightBg: 'bg-[#f6e2dd]',
    lightBorder: 'border-[#f0cbca]',
    darkBg: 'dark:bg-[#6c394f]',
    darkBorder: 'dark:border-[#864863]',
    swatchLight: '#f6e2dd',
    swatchDark: '#6c394f',
  },
  clay: {
    id: 'clay',
    name: 'Clay',
    lightBg: 'bg-[#e9e3d4]',
    lightBorder: 'border-[#dcd2be]',
    darkBg: 'dark:bg-[#4b443a]',
    darkBorder: 'dark:border-[#61584c]',
    swatchLight: '#e9e3d4',
    swatchDark: '#4b443a',
  },
  chalk: {
    id: 'chalk',
    name: 'Chalk',
    lightBg: 'bg-[#efeff1]',
    lightBorder: 'border-[#dddee0]',
    darkBg: 'dark:bg-[#28292c]',
    darkBorder: 'dark:border-[#3c4043]',
    swatchLight: '#efeff1',
    swatchDark: '#28292c',
  },
};

export interface Note {
  id: string;
  title: string;
  content: string;
  isChecklist: boolean;
  checklistItems: ChecklistItem[];
  color: NoteColorId;
  images: string[]; // data URLs or images
  drawings: string[]; // data URLs of drawings
  labels: string[]; // label names
  reminder: string | null; // e.g. "Tomorrow, 8:00 AM" or ISO string
  dismissedLinks?: string[]; // URLs dismissed from rich preview
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Label {
  id: string;
  name: string;
}

export type ViewMode = 'notes' | 'reminders' | 'label' | 'archive' | 'trash';
export type LayoutMode = 'grid' | 'list';

export interface FilterOptions {
  query: string;
  color?: NoteColorId;
  label?: string;
  hasReminder?: boolean;
  hasDrawing?: boolean;
  hasImage?: boolean;
  hasChecklist?: boolean;
}
