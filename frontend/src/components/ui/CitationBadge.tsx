import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { CitationBadge as CitationBadgeType } from '../../types';

interface CitationBadgeProps {
  badge: CitationBadgeType;
  onClick?: (clauseId: string) => void;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({ badge, onClick }) => {
  const isClickable = !!onClick;

  return (
    <button
      type="button"
      onClick={() => isClickable && onClick(badge.clause_id)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
        badge.is_amended
          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400'
          : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
      } ${isClickable ? 'cursor-pointer shadow-xs hover:scale-[1.02]' : 'cursor-default'}`}
      title={badge.title || badge.clause_id}
    >
      <BookOpen className="w-3 h-3 shrink-0" />
      <span className="font-semibold">{badge.clause_id}</span>
      {badge.is_amended && (
        <span className="flex items-center gap-0.5 text-[10px] px-1 py-0.2 rounded bg-emerald-200/70 text-emerald-900 font-medium">
          <Sparkles className="w-2.5 h-2.5" />
          Amended
        </span>
      )}
    </button>
  );
};
