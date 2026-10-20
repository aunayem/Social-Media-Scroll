import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  Undo2,
  Redo2,
  Trash2,
  Check,
  PenTool,
  Paintbrush,
  Highlighter,
  Eraser,
} from 'lucide-react';

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrawing: (dataUrl: string) => void;
  initialDrawing?: string | null;
}

type ToolType = 'pen' | 'marker' | 'highlighter' | 'eraser';

const COLOR_PALETTE = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

const STROKE_SIZES: Record<ToolType, { min: number; def: number; max: number }> = {
  pen: { min: 2, def: 3, max: 8 },
  marker: { min: 6, def: 10, max: 20 },
  highlighter: { min: 14, def: 24, max: 40 },
  eraser: { min: 10, def: 20, max: 50 },
};

export const DrawingModal: React.FC<DrawingModalProps> = ({
  isOpen,
  onClose,
  onSaveDrawing,
  initialDrawing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<ToolType>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [strokeSize, setStrokeSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set dimensions based on parent container
    const rect = canvas.parentElement?.getBoundingClientRect();
    const width = rect ? Math.floor(rect.width) : 800;
    const height = rect ? Math.floor(rect.height) : 600;

    canvas.width = width;
    canvas.height = height;

    // Fill with clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        const initialState = ctx.getImageData(0, 0, width, height);
        setHistory([initialState]);
        setHistoryIndex(0);
      };
      img.src = initialDrawing;
    } else {
      const initialState = ctx.getImageData(0, 0, width, height);
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, [isOpen, initialDrawing]);

  // Adjust stroke default when tool changes
  useEffect(() => {
    setStrokeSize(STROKE_SIZES[selectedTool].def);
  }, [selectedTool]);

  const saveHistoryStep = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(currentData);
    if (updatedHistory.length > 20) {
      updatedHistory.shift();
    }
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevIndex = historyIndex - 1;
    ctx.putImageData(history[prevIndex], 0, 0);
    setHistoryIndex(prevIndex);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextIndex = historyIndex + 1;
    ctx.putImageData(history[nextIndex], 0, 0);
    setHistoryIndex(nextIndex);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryStep();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (selectedTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = strokeSize;
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (selectedTool === 'highlighter') {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeSize;
      ctx.globalAlpha = 0.35;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeSize;
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    ctx.globalAlpha = 1.0;
    setIsDrawing(false);
    saveHistoryStep();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-between items-center p-2 sm:p-6 animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#202124] border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm sm:text-base text-stone-800 dark:text-stone-100">
            Drawing Pad
          </span>
        </div>

        {/* Undo, Redo, Clear */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            title="Undo"
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            title="Redo"
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            title="Clear canvas"
            className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-stone-600 dark:text-stone-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Action Done */}
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium text-xs sm:text-sm shadow-sm transition-colors"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Save &amp; Insert</span>
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="w-full max-w-4xl flex-1 my-3 bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-stone-300 dark:border-stone-700 touch-none flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair w-full h-full block"
        />
      </div>

      {/* Bottom Tool & Color Selector */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#202124] border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-stone-700 dark:text-stone-200">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedTool('pen')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              selectedTool === 'pen'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Pen"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Pen</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool('marker')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              selectedTool === 'marker'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Marker"
          >
            <Paintbrush className="w-4 h-4" />
            <span className="hidden sm:inline">Marker</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool('highlighter')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              selectedTool === 'highlighter'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline">Highlighter</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool('eraser')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              selectedTool === 'eraser'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Color Palette (disabled for eraser) */}
        {selectedTool !== 'eraser' && (
          <div className="flex items-center gap-1.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border transition-transform ${
                  c === '#ffffff' ? 'border-stone-300' : 'border-transparent'
                } ${
                  selectedColor === c
                    ? 'scale-125 ring-2 ring-offset-2 ring-amber-500'
                    : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        )}

        {/* Thickness Slider */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400">Size</span>
          <input
            type="range"
            min={STROKE_SIZES[selectedTool].min}
            max={STROKE_SIZES[selectedTool].max}
            value={strokeSize}
            onChange={(e) => setStrokeSize(Number(e.target.value))}
            className="w-20 sm:w-28 accent-amber-500"
          />
          <span className="font-mono text-stone-500 w-4">{strokeSize}</span>
        </div>
      </div>
    </div>
  );
};
