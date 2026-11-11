import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPolicySummary, fetchClauses, fetchClauseDetail } from '../services/api';

export const ExplorerPage: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [amendedOnly, setAmendedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);

  // Summary for 12 parts
  const { data: summary } = useQuery({
    queryKey: ['policySummary'],
    queryFn: fetchPolicySummary,
  });

  // Clause list query
  const { data: clausesData, isLoading: clausesLoading } = useQuery({
    queryKey: ['clauses', selectedPart, amendedOnly],
    queryFn: () => fetchClauses(selectedPart || undefined, amendedOnly),
  });

  // Selected clause detail query
  const { data: clauseDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['clauseDetail', selectedClauseId],
    queryFn: () => fetchClauseDetail(selectedClauseId!),
    enabled: !!selectedClauseId,
  });

  // Client-side text filter on the retrieved clauses
  const filteredClauses = (clausesData?.clauses || []).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.clause_id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.verbatim_text.toLowerCase().includes(q) ||
      (c.amended_text && c.amended_text.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Policy Manual Hierarchy Explorer</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Calder County Household Support Program Manual
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            12 Parts &bull; 54 Sections &bull; 148 Numbered Clauses &bull; Consolidated as of 31 Dec 2025 with Amendment No. 2026-01
          </p>
        </div>

        {/* Amended Filter Toggle */}
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={amendedOnly}
              onChange={(e) => setAmendedOnly(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Show Amended Clauses Only</span>
            </span>
          </label>
        </div>
      </div>

      {/* Main Split-Screen Explorer (Left: Parts Tree & Clause List, Right: Clause Reader & Diff) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Navigation & Clause List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Part Selection Pills */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Filter by Part (1–12)
              </span>
              {selectedPart !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedPart(null)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Show All Parts
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedPart(null)}
                className={`px-2 py-1 rounded text-xs font-medium border text-center transition-colors ${
                  selectedPart === null
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Parts
              </button>
              {summary?.parts?.map((p) => (
                <button
                  key={p.part_number}
                  type="button"
                  onClick={() => setSelectedPart(p.part_number)}
                  className={`px-2 py-1 rounded text-xs font-medium border text-center transition-colors truncate ${
                    selectedPart === p.part_number
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={`Part ${p.part_number}: ${p.title} (${p.clause_count} clauses)`}
                >
                  Part {p.part_number}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clauses (e.g., '§6.4.1', 'earnings', 'resources')..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* Clause List Items */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            <div className="p-3 bg-slate-50/70 text-xs font-medium text-slate-600 flex items-center justify-between border-b border-slate-100">
              <span>Matching Clauses ({filteredClauses.length})</span>
              {selectedPart && <span className="font-mono text-[10px]">Part {selectedPart}</span>}
            </div>

            {clausesLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading clauses...</div>
            ) : filteredClauses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <p className="font-medium">No matching clauses found</p>
                <p className="text-[11px] text-slate-400">Try adjusting your search query or filters.</p>
              </div>
            ) : (
              filteredClauses.map((c) => (
                <div
                  key={c.clause_id}
                  onClick={() => setSelectedClauseId(c.clause_id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedClauseId === c.clause_id
                      ? 'bg-blue-50/80 border-l-4 border-l-blue-600 text-blue-950'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-700">
                        {c.clause_id}
                      </span>
                      {c.is_amended && (
                        <span className="flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                          <Sparkles className="w-2.5 h-2.5" />
                          Amended
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Part {c.part_number}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 mt-0.5 line-clamp-1">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {c.verbatim_text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Verbatim Statutory Reader & Side-by-Side Diff (7 cols on lg) */}
        <div className="lg:col-span-7">
          {detailLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center text-slate-400 text-xs">
              Loading clause details...
            </div>
          ) : !selectedClauseId || !clauseDetail ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Select a Clause to Inspect Verbatim Text
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Choose any numbered clause from the policy list on the left to view official statutory language,
                historical baseline comparisons, and cross-references.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              {/* Clause Header */}
              <div className="border-b border-slate-100 pb-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 border border-blue-200 text-blue-800 font-semibold">
                    {clauseDetail.clause_id}
                  </span>
                  {clauseDetail.is_amended && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-medium">
                      <Sparkles className="w-3 h-3" />
                      Amended by No. 2026-01
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">
                    Part {clauseDetail.part_number} &bull; Section {clauseDetail.section_number}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {clauseDetail.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Section: {clauseDetail.section_title}
                </p>
              </div>

              {/* Effective Amendment Alert */}
              {clauseDetail.is_amended && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Effective Amendment Overlay Details</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1 leading-relaxed">
                    <p>
                      <span className="font-semibold text-slate-900">Action:</span>{' '}
                      {clauseDetail.amendment_action || 'Substantive Substitution'}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Effective Date:</span>{' '}
                      {clauseDetail.effective_date || '1 March 2026'}
                    </p>
                    {clauseDetail.transitional_rule && (
                      <p>
                        <span className="font-semibold text-slate-900">Transitional Provision:</span>{' '}
                        {clauseDetail.transitional_rule}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Verbatim Effective Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {clauseDetail.is_amended
                      ? 'Current Effective Policy Text (Post-1 March 2026)'
                      : 'Verbatim Statutory Policy Text'}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Official Consolidated Text</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 leading-relaxed whitespace-pre-wrap select-text">
                  {clauseDetail.amended_text || clauseDetail.verbatim_text}
                </div>
              </div>

              {/* Pre-Amendment Historical Baseline Text */}
              {clauseDetail.is_amended && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Pre-Amendment Baseline Text (Historical 2025 Wording)
                    </h3>
                    <span className="text-[10px] font-mono text-amber-700">Pre-1 March 2026 Determinations</span>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 font-mono text-xs text-slate-500 leading-relaxed whitespace-pre-wrap select-text line-through">
                    {clauseDetail.verbatim_text}
                  </div>
                </div>
              )}

              {/* Cross-References */}
              {clauseDetail.cross_references && clauseDetail.cross_references.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Statutory Cross-References
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {clauseDetail.cross_references.map((cr) => (
                      <button
                        key={cr}
                        type="button"
                        onClick={() => setSelectedClauseId(cr)}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
