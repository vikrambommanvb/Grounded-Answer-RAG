import React from 'react';
import { X, ArrowRight, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {clauseId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#171A21]/40 backdrop-blur-xs"
          />

          {/* Slide-over Drawer with Apple-Style Spring */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className="relative w-full max-w-2xl bg-white border-l border-[#E5E5E0] h-full shadow-floating flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E5E5E0] flex items-start justify-between bg-[#F8F8F5]">
              <div className="space-y-1.5 pr-6">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 bg-white border border-[#E5E5E0] text-[#171A21] font-semibold">
                    {clauseId}
                  </span>
                  {clause?.is_amended && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-[#EFF8F7] border border-[#B3DFDA] text-[#137C72] font-medium">
                      Amended by No. 2026-01
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#171A21] leading-snug">
                  {clause?.title || 'Loading statutory text...'}
                </h2>
                {clause && (
                  <p className="text-xs text-[#777E89]">
                    Part {clause.part_number} &bull; Section {clause.section_number}: {clause.section_title}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#777E89] hover:text-[#171A21] hover:bg-[#E5E5E0]/50 transition-colors active:scale-95"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoading && (
                <div className="p-8 text-center text-xs text-[#777E89] font-mono animate-pulse">
                  Retrieving verbatim text from database...
                </div>
              )}

              {isError && (
                <div className="p-4 bg-[#FDF2F2] border border-[#F6C1C1] text-[#B94040] text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Failed to load clause record</p>
                    <p className="mt-0.5">Could not retrieve clause {clauseId} from the SQLite database.</p>
                  </div>
                </div>
              )}

              {clause && (
                <>
                  {/* Verbatim Statutory Language */}
                  <div className="space-y-2">
                    <span className="meta-caps text-[#777E89] block">
                      Verbatim Statutory Language
                    </span>
                    <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] font-serif text-[15px] leading-relaxed text-[#171A21]">
                      {clause.verbatim_text}
                    </div>
                  </div>

                  {/* Amendment Diff (if amended) */}
                  {clause.is_amended && clause.amended_text && (
                    <div className="space-y-3 pt-3 border-t border-[#E5E5E0]">
                      <div className="flex items-center justify-between">
                        <span className="meta-caps text-[#137C72] flex items-center gap-1.5">
                          <span>Amendment Overlay Comparison</span>
                        </span>
                        <span className="font-mono text-[10px] text-[#777E89]">
                          Effective: {clause.effective_date || '1 March 2026'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Historical Baseline */}
                        <div className="p-3.5 bg-[#FDF2F2]/60 border border-[#F6C1C1] space-y-1.5">
                          <span className="meta-caps text-[#B94040] block">
                            Historical Text (Pre-March 2026)
                          </span>
                          <p className="font-serif text-sm leading-relaxed text-[#252A32] line-through opacity-80">
                            {clause.verbatim_text}
                          </p>
                        </div>

                        {/* Amended Overlay */}
                        <div className="p-3.5 bg-[#EFF8F7] border border-[#B3DFDA] space-y-1.5">
                          <span className="meta-caps text-[#137C72] block">
                            Amended Text (Post-March 2026)
                          </span>
                          <p className="font-serif text-sm leading-relaxed text-[#171A21]">
                            {clause.amended_text}
                          </p>
                        </div>
                      </div>

                      {/* Transitional Provision Note */}
                      {clause.transitional_rule && (
                        <div className="p-3 bg-[#FDF7EE] border border-[#F4DCB7] text-xs text-[#252A32] space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#B77A24]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="meta-caps">Transitional Application Rule</span>
                          </div>
                          <p className="leading-relaxed pl-5 font-sans text-xs">
                            {clause.transitional_rule}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Statutory Cross-References */}
                  {clause.cross_references && clause.cross_references.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-[#E5E5E0]">
                      <span className="meta-caps text-[#777E89] block">
                        Statutory Cross-References ({clause.cross_references.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {clause.cross_references.map((xref) => (
                          <button
                            key={xref}
                            type="button"
                            onClick={() => onSelectClause && onSelectClause(xref)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] hover:text-[#3458DB] transition-all active:scale-95"
                          >
                            <BookOpen className="w-3 h-3 opacity-60" />
                            <span>{xref}</span>
                            <ArrowRight className="w-2.5 h-2.5 opacity-50" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
