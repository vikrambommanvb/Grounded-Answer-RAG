import React from 'react';
import { X, BookOpen, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchClauseDetail } from '../../services/api';

interface ClauseDrawerProps {
  clauseId: string | null;
  onClose: () => void;
  onSelectClause?: (clauseId: string) => void;
}

export const ClauseDrawer: React.FC<ClauseDrawerProps> = ({
  clauseId,
  onClose,
  onSelectClause,
}) => {
  const { data: clause, isLoading, isError } = useQuery({
    queryKey: ['clauseDetail', clauseId],
    queryFn: () => fetchClauseDetail(clauseId!),
    enabled: !!clauseId,
  });

  if (!clauseId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 border border-blue-200 text-blue-800 font-semibold">
                {clauseId}
              </span>
              {clause?.is_amended && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-medium">
                  <Sparkles className="w-3 h-3" />
                  Amended by No. 2026-01
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {clause?.title || 'Loading clause...'}
            </h2>
            {clause && (
              <p className="text-xs text-slate-500 mt-0.5">
                Part {clause.part_number} &bull; Section {clause.section_number}: {clause.section_title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
              Loading clause details...
            </div>
          )}

          {isError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium">Failed to load clause</p>
                <p className="text-xs text-red-700 mt-1">
                  Could not retrieve record for {clauseId}. Verify the clause format.
                </p>
              </div>
            </div>
          )}

          {clause && (
            <>
              {/* Amendment Information Callout */}
              {clause.is_amended && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Effective Amendment Overlay</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1 leading-relaxed">
                    <p>
                      <span className="font-semibold text-slate-900">Action:</span>{' '}
                      {clause.amendment_action || 'Substantive Substitution'}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Effective Date:</span>{' '}
                      {clause.effective_date || '1 March 2026'}
                    </p>
                    {clause.transitional_rule && (
                      <p>
                        <span className="font-semibold text-slate-900">Transitional Provision:</span>{' '}
                        {clause.transitional_rule}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Verbatim Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {clause.is_amended ? 'Current Effective Text (Post-1 March 2026)' : 'Verbatim Policy Text'}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">Official Consolidated Text</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
                  {clause.amended_text || clause.verbatim_text}
                </div>
              </div>

              {/* Baseline Text if Amended */}
              {clause.is_amended && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Pre-Amendment Baseline Text (Prior to 1 March 2026)
                    </h3>
                    <span className="text-[11px] font-mono text-amber-700">Historical 2025 Baseline</span>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 font-mono text-xs text-slate-500 leading-relaxed whitespace-pre-wrap select-text line-through">
                    {clause.verbatim_text}
                  </div>
                </div>
              )}

              {/* Cross-References */}
              {clause.cross_references && clause.cross_references.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Statutory Cross-References
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {clause.cross_references.map((cr) => (
                      <button
                        key={cr}
                        type="button"
                        onClick={() => onSelectClause && onSelectClause(cr)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono text-blue-700 transition-colors"
                      >
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        <span>{cr}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Calder County Household Support Program</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
