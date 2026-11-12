import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03, // Stagger list rows by 30ms
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" as const } },
  };

  return (
    <div className="bg-white border border-[#E5E5E0] p-4 space-y-3 shadow-subtle">
      <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#137C72]" />
          <h4 className="meta-caps text-[#171A21]">
            Evidence Envelope ({evidence.length} Ranked)
          </h4>
        </div>
        <span className="font-mono text-[9px] text-[#555C68]">BM25 + Cosine</span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {evidence.map((item) => (
          <motion.div
            key={item.clause_id}
            variants={itemVariants}
            onClick={() => onSelectClause && onSelectClause(item.clause_id)}
            className="pressable p-3 bg-[#F8F8F5] border border-[#E5E5E0] hover:border-[#171A21] hover:bg-white cursor-pointer transition-all space-y-1.5 group active:scale-[0.97]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="tnum text-[11px] font-mono px-1.5 py-0.2 bg-white border border-[#E5E5E0] text-[#171A21] font-semibold group-hover:border-[#3458DB]">
                  {item.clause_id}
                </span>
                <span className="text-xs font-medium text-[#171A21]">
                  {item.title}
                </span>
                {item.is_amended && (
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-[#EFF8F7] border border-[#B3DFDA] text-[#137C72] font-medium">
                    AMENDED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tnum text-[#555C68]">
                <span className="text-[#137C72] font-semibold">
                  {(item.score * 100).toFixed(1)}%
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#555C68] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <p className="font-serif text-xs text-[#252A32] line-clamp-2 leading-relaxed not-italic">
              {item.snippet}
            </p>

            <div className="flex items-center gap-3 text-[9px] font-mono tnum text-[#555C68] pt-1.5 border-t border-[#E5E5E0]/60">
              <span>BM25: {item.bm25_score.toFixed(2)}</span>
              <span>Vector: {(item.vector_score * 100).toFixed(1)}%</span>
              <span>Part {item.part_number}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
