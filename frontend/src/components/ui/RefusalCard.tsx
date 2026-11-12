import React from 'react';
import { AlertOctagon, ArrowRight, BookOpen } from 'lucide-react';
import { RefusalDetails } from '../../types';

interface RefusalCardProps {
  refusal: RefusalDetails;
  onSelectClause?: (clauseId: string) => void;
}

export const RefusalCard: React.FC<RefusalCardProps> = ({ refusal, onSelectClause }) => {
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'INTERNAL_CONFLICT':
        return {
          border: 'border-[#F6C1C1]',
          bg: 'bg-[#FDF2F2]',
          badge: 'bg-white text-[#B94040] border-[#F6C1C1]',
          iconColor: 'text-[#B94040]',
          title: 'Policy Contradiction Detected',
          label: 'Internal Conflict',
        };
      case 'APPARENT_GAP':
        return {
          border: 'border-[#F4DCB7]',
          bg: 'bg-[#FDF7EE]',
          badge: 'bg-white text-[#B77A24] border-[#F4DCB7]',
          iconColor: 'text-[#B77A24]',
          title: 'Apparent Statutory Gap Detected',
          label: 'Drafting Omission',
        };
      case 'MISSING_TEMPORAL_DATA':
        return {
          border: 'border-[#C7D4F7]',
          bg: 'bg-[#EFF2FC]',
          badge: 'bg-white text-[#3458DB] border-[#C7D4F7]',
          iconColor: 'text-[#3458DB]',
          title: 'Missing Required Temporal Context',
          label: 'Temporal Ambiguity',
        };
      case 'OUT_OF_SCOPE':
      default:
        return {
          border: 'border-[#E5E5E0]',
          bg: 'bg-[#F8F8F5]',
          badge: 'bg-white text-[#777E89] border-[#E5E5E0]',
          iconColor: 'text-[#777E89]',
          title: 'Query Out of Scope / Insufficient Facts',
          label: 'Scope Limitation',
        };
    }
  };

  const theme = getCategoryTheme(refusal.category);

  return (
    <div className={`border ${theme.border} ${theme.bg} p-5 space-y-4 shadow-subtle`}>
      {/* 1. Header & Category */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E5E5E0]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white border border-[#E5E5E0] shrink-0">
            <AlertOctagon className={`w-4 h-4 ${theme.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-1.5 py-0.2 border uppercase font-semibold ${theme.badge}`}>
                {refusal.category}
              </span>
              <span className="meta-caps text-[#777E89]">
                Strict Refusal Protocol
              </span>
            </div>
            <h3 className="font-serif text-base font-semibold text-[#171A21] mt-0.5">
              {theme.title}
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Structured Reason / Explanation */}
      <div className="space-y-1.5">
        <span className="meta-caps text-[#777E89] block">
          Statutory Justification for Refusal
        </span>
        <div className="p-3.5 bg-white border border-[#E5E5E0] font-serif text-sm leading-relaxed text-[#171A21]">
          {refusal.reason}
        </div>
      </div>

      {/* 3. Missing Information (if present) */}
      {refusal.missing_information && refusal.missing_information.length > 0 && (
        <div className="space-y-1.5">
          <span className="meta-caps text-[#777E89] block">
            Missing Information Required to Answer
          </span>
          <div className="p-3 bg-white border border-[#E5E5E0] space-y-1">
            {refusal.missing_information.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#252A32]">
                <span className="text-[#3458DB] font-mono font-bold">&bull;</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Partial Relevant Clauses (if present) */}
      {refusal.partial_relevant_clauses && refusal.partial_relevant_clauses.length > 0 && (
        <div className="space-y-1.5">
          <span className="meta-caps text-[#777E89] block">
            Partial Relevant Policy Provisions
          </span>
          <div className="flex flex-wrap gap-2">
            {refusal.partial_relevant_clauses.map((clauseId) => (
              <button
                key={clauseId}
                type="button"
                onClick={() => onSelectClause && onSelectClause(clauseId)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-white hover:bg-[#F8F8F5] border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all"
              >
                <BookOpen className="w-3 h-3 opacity-60" />
                <span>{clauseId}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Recommended Next Step */}
      {refusal.recommended_next_step && (
        <div className="p-3 bg-white border border-[#E5E5E0] text-xs text-[#171A21] space-y-1">
          <span className="meta-caps text-[#137C72] flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />
            <span>Actionable Guidance for Caseworker</span>
          </span>
          <p className="leading-relaxed font-sans text-xs text-[#252A32]">
            {refusal.recommended_next_step}
          </p>
        </div>
      )}
    </div>
  );
};
