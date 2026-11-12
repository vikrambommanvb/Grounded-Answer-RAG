import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Calendar,
  Layers,
  BookOpen,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPolicySummary, fetchClauses, fetchClauseDetail } from '../services/api';
import { StatutoryGraph3D } from '../components/graph/StatutoryGraph3D';

export const ExplorerPage: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [amendedOnly, setAmendedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>('§1.1.1');
  const [showGraph, setShowGraph] = useState<boolean>(true);

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

  const partRoman = [
    'Part I', 'Part II', 'Part III', 'Part IV', 'Part V', 'Part VI',
    'Part VII', 'Part VIII', 'Part IX', 'Part X', 'Part XI', 'Part XII',
  ];

  return (
    <div className="space-y-6">
      {/* Editorial Masthead with Specificity */}
      <div className="border-b border-[#E5E5E0] pb-5 flex flex-wrap items-baseline justify-between gap-4">
        <div className="space-y-1">
          <span className="meta-caps text-[#555C68] block">
            Official Statutory Code &bull; Calder County Household Support Program
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#171A21] tracking-tight not-italic balance-text">
            Consolidated Policy Manual &amp; Amendment Registry
          </h1>
          <p className="text-xs text-[#555C68] font-sans">
            12 Parts &bull; 54 Sections &bull; 148 Numbered Clauses &bull; Baseline as of 31 Dec 2025 with Amendment No. 2026-01
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowGraph(!showGraph)}
            className={`pressable inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono transition-all active:scale-[0.97] ${
              showGraph
                ? 'bg-[#171A21] text-white border-[#171A21]'
                : 'bg-white text-[#171A21] border-[#E5E5E0] hover:bg-[#F8F8F5]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showGraph ? 'Hide 3D Dependency Map' : 'Show 3D Dependency Map'}</span>
          </button>

          <label className="pressable inline-flex items-center gap-2 text-xs font-mono text-[#171A21] cursor-pointer select-none bg-white border border-[#E5E5E0] px-3 py-1.5 hover:bg-[#F8F8F5] active:scale-[0.97]">
            <input
              type="checkbox"
              checked={amendedOnly}
              onChange={(e) => setAmendedOnly(e.target.checked)}
              className="accent-[#3458DB]"
            />
            <span>Amended Only</span>
          </label>
        </div>
      </div>

      {/* Signature Three.js 3D Statutory Dependency Graph */}
      {showGraph && clausesData?.clauses && (
        <StatutoryGraph3D
          clauses={clausesData.clauses}
          selectedClauseId={selectedClauseId}
          onSelectClause={(cid) => setSelectedClauseId(cid)}
        />
      )}

      {/* Split-Screen Legal Research Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Parts Hierarchy & Clause Registry (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Part Selection Grid */}
          <div className="bg-white border border-[#E5E5E0] p-4 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
              <span className="meta-caps text-[#171A21]">
                Statutory Parts Index
              </span>
              {selectedPart !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedPart(null)}
                  className="pressable font-mono text-[11px] text-[#3458DB] hover:underline active:scale-[0.97]"
                >
                  All 12 Parts
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-xs font-mono tnum">
              {summary?.parts.map((p) => {
                const isSelected = selectedPart === p.part_number;
                return (
                  <button
                    key={p.part_number}
                    type="button"
                    onClick={() => setSelectedPart(isSelected ? null : p.part_number)}
                    className={`pressable relative p-2 border text-left transition-all active:scale-[0.97] ${
                      isSelected
                        ? 'bg-[#171A21] text-white border-[#171A21] font-semibold'
                        : 'bg-[#F8F8F5] text-[#252A32] border-[#E5E5E0] hover:bg-white hover:border-[#171A21]'
                    }`}
                    title={p.title}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activePartIndicator"
                        className="absolute inset-0 bg-[#171A21] -z-10"
                        transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                      />
                    )}
                    <div className="text-[10px] uppercase font-bold">{partRoman[p.part_number - 1]}</div>
                    <div className={`text-[9px] truncate ${isSelected ? 'text-white/80' : 'text-[#555C68]'}`}>{p.clause_count} clauses</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#E5E5E0] p-3 space-y-2 shadow-subtle">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#555C68] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by clause ID or keyword (e.g. §6.4.1, student, disregard)..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs text-[#171A21] focus:outline-none focus:border-[#171A21] focus:bg-white transition-colors"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono tnum text-[#555C68]">
              <span>Matching clauses: {filteredClauses.length}</span>
              {selectedPart && <span>Filtered by Part {selectedPart}</span>}
            </div>
          </div>

          {/* Clause List Registry with Staggered 30ms Rows */}
          <div className="bg-white border border-[#E5E5E0] shadow-subtle divide-y divide-[#E5E5E0] max-h-[580px] overflow-y-auto">
            {clausesLoading ? (
              <div className="p-8 text-center text-xs text-[#555C68] font-mono">
                Indexing statutory clauses...
              </div>
            ) : filteredClauses.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#555C68]">
                No clauses match the query.
              </div>
            ) : (
              filteredClauses.map((clause) => {
                const isSelected = selectedClauseId === clause.clause_id;
                return (
                  <div
                    key={clause.clause_id}
                    onClick={() => setSelectedClauseId(clause.clause_id)}
                    className={`pressable p-3 cursor-pointer transition-all space-y-1 active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#F8F8F5] border-l-2 border-[#171A21] -ml-px pl-[11px]'
                        : 'hover:bg-[#F8F8F5]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono tnum text-xs font-semibold text-[#171A21]">
                          {clause.clause_id}
                        </span>
                        {clause.is_amended && (
                          <span className="text-[9px] font-mono px-1 py-0.2 bg-[#EFF8F7] border border-[#B3DFDA] text-[#137C72] font-medium">
                            AMENDED
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#555C68]">
                        Part {clause.part_number}
                      </span>
                    </div>
                    <p className="font-medium text-xs text-[#252A32] truncate">
                      {clause.title}
                    </p>
                    <p className="font-serif text-xs text-[#555C68] line-clamp-1 not-italic">
                      {clause.verbatim_text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Verbatim Statutory Reading Pane & Diff (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {detailLoading ? (
            <div className="bg-white border border-[#E5E5E0] p-8 text-center text-xs text-[#555C68] font-mono shadow-subtle animate-pulse">
              Retrieving legal text from database...
            </div>
          ) : clauseDetail ? (
            <div className="bg-white border border-[#E5E5E0] p-6 space-y-6 shadow-subtle">
              {/* Clause Header */}
              <div className="border-b border-[#E5E5E0] pb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono tnum text-xs px-2 py-0.5 bg-[#F8F8F5] border border-[#E5E5E0] text-[#171A21] font-semibold">
                    {clauseDetail.clause_id}
                  </span>
                  {clauseDetail.is_amended && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#EFF8F7] border border-[#B3DFDA] text-[#137C72] font-medium">
                      Amended by No. 2026-01 (Effective 1 March 2026)
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-semibold text-[#171A21] leading-snug balance-text not-italic">
                  {clauseDetail.title}
                </h2>
                <p className="text-xs text-[#555C68] font-sans">
                  Part {clauseDetail.part_number} &bull; Section {clauseDetail.section_number}: {clauseDetail.section_title}
                </p>
              </div>

              {/* Verbatim Statutory Language */}
              <div className="space-y-2">
                <span className="meta-caps text-[#555C68] block">
                  Verbatim Statutory Language
                </span>
                <div className="p-5 bg-[#F8F8F5] border border-[#E5E5E0] font-serif text-[15px] leading-relaxed text-[#171A21] selection:bg-[#171A21] selection:text-white not-italic">
                  {clauseDetail.verbatim_text}
                </div>
              </div>

              {/* Amendment Overlay Comparison (if amended) */}
              {clauseDetail.is_amended && clauseDetail.amended_text && (
                <div className="space-y-3 pt-3 border-t border-[#E5E5E0]">
                  <div className="flex items-center justify-between">
                    <span className="meta-caps text-[#137C72] flex items-center gap-1.5">
                      <span>Statutory Amendment Overlay</span>
                    </span>
                    <span className="font-mono tnum text-[10px] text-[#555C68]">
                      Effective: {clauseDetail.effective_date || '1 March 2026'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Historical Baseline */}
                    <div className="p-4 bg-[#FDF2F2]/60 border border-[#F6C1C1] space-y-1.5">
                      <span className="meta-caps text-[#B94040] block">
                        Pre-Amendment Baseline (2025)
                      </span>
                      <p className="font-serif text-sm leading-relaxed text-[#252A32] line-through opacity-75 not-italic">
                        {clauseDetail.verbatim_text}
                      </p>
                    </div>

                    {/* Amended Text */}
                    <div className="p-4 bg-[#EFF8F7] border border-[#B3DFDA] space-y-1.5">
                      <span className="meta-caps text-[#137C72] block">
                        Amended Rule (Post-1 March 2026)
                      </span>
                      <p className="font-serif text-sm leading-relaxed text-[#171A21] not-italic">
                        {clauseDetail.amended_text}
                      </p>
                    </div>
                  </div>

                  {/* Transitional Rule */}
                  {clauseDetail.transitional_rule && (
                    <div className="p-3 bg-[#FDF7EE] border border-[#F4DCB7] text-xs text-[#252A32] space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#B77A24]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="meta-caps">Transitional Application Provision</span>
                      </div>
                      <p className="leading-relaxed pl-5 font-sans text-xs">
                        {clauseDetail.transitional_rule}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Statutory Cross-References */}
              {clauseDetail.cross_references && clauseDetail.cross_references.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-[#E5E5E0]">
                  <span className="meta-caps text-[#555C68] block">
                    Statutory Cross-References ({clauseDetail.cross_references.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {clauseDetail.cross_references.map((xref) => (
                      <button
                        key={xref}
                        type="button"
                        onClick={() => setSelectedClauseId(xref)}
                        className="pressable inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tnum bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#171A21] text-[#171A21] transition-all active:scale-[0.97]"
                      >
                        <BookOpen className="w-3 h-3 opacity-60" />
                        <span>{xref}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E5E0] p-12 text-center text-xs text-[#555C68] shadow-subtle">
              Select a clause from the registry or 3D graph to view its verbatim statutory text.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
