import React from 'react';
import { BookOpen } from 'lucide-react';
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-all border active:scale-[0.97] ${
        badge.is_amended
          ? 'bg-[#EFF8F7] border-[#B3DFDA] text-[#137C72] hover:border-[#137C72] hover:bg-[#E5F5F3]'
          : 'bg-[#F8F8F5] border-[#E5E5E0] text-[#171A21] hover:border-[#3458DB] hover:text-[#3458DB] hover:bg-white'
      } ${isClickable ? 'cursor-pointer shadow-subtle' : 'cursor-default'}`}
      title={badge.title ? `${badge.clause_id}: ${badge.title}` : badge.clause_id}
    >
      <BookOpen className="w-3 h-3 shrink-0 opacity-70" />
      <span className="font-semibold">{badge.clause_id}</span>
      {badge.is_amended && (
        <span className="text-[9px] font-mono px-1 py-0.2 bg-[#137C72]/10 text-[#137C72] border border-[#137C72]/20 font-medium">
          AMENDED
        </span>
      )}
    </button>
  );
};
