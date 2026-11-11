import React from 'react';
import { Layers, ChevronRight, Sparkles } from 'lucide-react';
import { RetrievedEvidence } from '../../types';

interface EvidenceInspectorProps {
  evidence: RetrievedEvidence[];
  onSelectClause?: (clauseId: string) => void;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  evidence,
  onSelectClause,
}) => {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
            Retrieved Evidence Envelope ({evidence.length} Clauses Ranked)
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Hybrid BM25 + Vector Retrieval</span>
      </div>

      <div className="space-y-2">
        {evidence.map((item) => (
          <div
            key={item.clause_id}
            onClick={() => onSelectClause && onSelectClause(item.clause_id)}
            className="p-3 rounded-lg bg-slate-50 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/60 cursor-pointer transition-colors space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold group-hover:border-blue-400">
                  {item.clause_id}
                </span>
                <span className="text-xs font-medium text-slate-900">
                  {item.title}
                </span>
                {item.is_amended && (
                  <span className="flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    Amended
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <span className="text-blue-700 font-semibold">
                  {(item.score * 100).toFixed(1)}%
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
              {item.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
