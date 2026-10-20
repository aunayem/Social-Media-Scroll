import React, { useState } from 'react';
import { ExternalLink, Globe, X } from 'lucide-react';
import { getLinkMetadata } from '../utils/linkPreview';

interface LinkPreviewCardProps {
  url: string;
  onRemove?: () => void;
  compact?: boolean;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
  url,
  onRemove,
  compact = false,
}) => {
  const meta = getLinkMetadata(url);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
      }}
      className={`group/link relative flex items-center gap-3 p-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-black/3 dark:bg-white/4 hover:bg-black/6 dark:hover:bg-white/8 transition-all cursor-pointer select-none ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      {/* Favicon or Globe */}
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
        {!imgError && meta.faviconUrl ? (
          <img
            src={meta.faviconUrl}
            alt=""
            onError={() => setImgError(true)}
            className="w-4 h-4 object-contain"
          />
        ) : (
          <Globe className="w-4 h-4 text-stone-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="font-semibold text-stone-800 dark:text-stone-200 truncate leading-snug">
          {meta.title}
        </div>
        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate flex items-center gap-1 mt-0.5">
          <span>{meta.domain}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60 inline" />
        </div>
      </div>

      {/* Dismiss Preview Button */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover/link:opacity-100 transition-opacity"
          title="Remove preview"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
