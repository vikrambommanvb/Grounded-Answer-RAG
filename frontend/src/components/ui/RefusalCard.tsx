import React from 'react';
import { AlertOctagon, HelpCircle, ArrowRight, ShieldAlert, BookOpen } from 'lucide-react';
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
          border: 'border-red-300',
          bg: 'bg-red-50/80',
          badge: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-600',
          title: 'Policy Contradiction Detected',
        };
      case 'APPARENT_GAP':
        return {
          border: 'border-amber-300',
          bg: 'bg-amber-50/80',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600',
          title: 'Apparent Statutory Gap Detected',
        };
      case 'MISSING_TEMPORAL_DATA':
        return {
          border: 'border-blue-300',
          bg: 'bg-blue-50/80',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          iconColor: 'text-blue-600',
          title: 'Missing Required Temporal Context',
        };
      case 'OUT_OF_SCOPE':
      default:
        return {
          border: 'border-slate-300',
          bg: 'bg-slate-50',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          iconColor: 'text-slate-600',
          title: 'Query Out of Scope / Insufficient Facts',
        };
    }
  };

  const theme = getCategoryTheme(refusal.category);

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.bg} p-5 space-y-4 shadow-xs animate-in fade-in duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-xs">
            <AlertOctagon className={`w-5 h-5 ${theme.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${theme.badge}`}>
                {refusal.category}
              </span>
              <span className="text-xs text-slate-500">Strict Refusal Protocol</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
              {theme.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Formal Reason */}
      <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans shadow-xs">
        {refusal.reason}
      </div>

      {/* Missing Information Checklist */}
      {refusal.missing_information && refusal.missing_information.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Missing Information Required to Answer</span>
          </h4>
          <ul className="space-y-1 pl-1">
            {refusal.missing_information.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Partial Relevant Clauses */}
      {refusal.partial_relevant_clauses && refusal.partial_relevant_clauses.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Partial Relevant Policy Provisions</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {refusal.partial_relevant_clauses.map((clauseId) => (
              <button
                key={clauseId}
                type="button"
                onClick={() => onSelectClause && onSelectClause(clauseId)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-xs font-mono text-blue-700 transition-colors shadow-xs"
              >
                <span>{clauseId}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Next Step for Caseworker */}
      {refusal.recommended_next_step && (
        <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
            <span>Actionable Guidance for Caseworker</span>
          </div>
          <p className="text-xs text-blue-950 leading-relaxed">
            {refusal.recommended_next_step}
          </p>
        </div>
      )}
    </div>
  );
};
