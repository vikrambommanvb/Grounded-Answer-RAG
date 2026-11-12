import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDocuments, fetchDocumentDetail } from '../services/api';

export const DocumentsPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('HSP-MANUAL-2025-12');
  const [viewMode, setViewMode] = useState<'typeset' | 'raw'>('typeset');

  const { data: documents } = useQuery({
    queryKey: ['sourceDocuments'],
    queryFn: fetchDocuments,
  });

  React.useEffect(() => {
    if (documents && documents.length > 0) {
      if (!documents.some(d => d.document_id === selectedDocId)) {
        setSelectedDocId(documents[0].document_id);
      }
    }
  }, [documents, selectedDocId]);

  const { data: docDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['documentDetail', selectedDocId],
    queryFn: () => fetchDocumentDetail(selectedDocId),
    enabled: !!selectedDocId,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Editorial Masthead with Specificity */}
      <div className="border-b border-[#E5E5E0] pb-5 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="space-y-1">
            <span className="meta-caps text-[#555C68] block">
              Archival Registry &bull; Cryptographic Integrity
            </span>
            <h1 className="font-serif text-3xl font-semibold text-[#171A21] tracking-tight not-italic balance-text">
              Source Statutory Documents &amp; Checksums
            </h1>
          </div>
          <span className="font-mono text-xs text-[#137C72] bg-[#EFF8F7] border border-[#B3DFDA] px-2.5 py-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SHA-256 Verified Immutable</span>
          </span>
        </div>
        <p className="font-serif text-sm text-[#555C68] max-w-3xl leading-relaxed balance-text not-italic">
          The two official legal texts forming the exclusive and exhaustive Single Source of Truth.
          Cryptographically hashed and ingested into SQLite without modification or loss.
        </p>
      </div>

      {/* Document Selection Cards with Scale 0.97 on press */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents?.map((doc) => {
          const isSelected = selectedDocId === doc.document_id;
          const isAmendment = doc.document_type === 'amendment';

          return (
            <div
              key={doc.document_id}
              onClick={() => setSelectedDocId(doc.document_id)}
              className={`pressable p-5 bg-white border cursor-pointer transition-all space-y-3.5 shadow-subtle active:scale-[0.98] ${
                isSelected
                  ? 'border-[#171A21] ring-1 ring-[#171A21]'
                  : 'border-[#E5E5E0] hover:border-[#171A21]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 border uppercase font-semibold ${
                      isAmendment
                        ? 'bg-[#EFF8F7] text-[#137C72] border-[#B3DFDA]'
                        : 'bg-[#F8F8F5] text-[#171A21] border-[#E5E5E0]'
                    }`}>
                      {doc.document_type}
                    </span>
                    <span className="meta-caps text-[#555C68]">
                      {doc.filename}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[#171A21] not-italic">
                    {doc.title}
                  </h3>
                </div>
                <div className="p-2 bg-[#F8F8F5] border border-[#E5E5E0] text-[#171A21]">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              {/* Metadata Rows */}
              <div className="text-xs font-mono tnum space-y-1.5 pt-2 border-t border-[#E5E5E0] text-[#252A32]">
                <div className="flex items-center justify-between">
                  <span className="text-[#555C68]">Effective Date:</span>
                  <span className="font-medium">{doc.effective_date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#555C68]">Ingested Provisions:</span>
                  <span className="font-medium">{doc.clause_count} clauses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#555C68]">File Size:</span>
                  <span className="font-medium">{(doc.byte_size / 1024).toFixed(1)} KB</span>
                </div>
              </div>

              {/* SHA-256 Checksum */}
              <div className="p-2.5 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#555C68]">
                  <span className="meta-caps">SHA-256 Hash</span>
                  <span className="text-[#137C72] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="font-mono tnum text-[10px] text-[#252A32] truncate select-all">
                  {doc.sha256_hash}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Reader Container */}
      <div className="bg-white border border-[#E5E5E0] shadow-subtle overflow-hidden">
        {/* Reader Header & Tab Switcher with Shared layoutId */}
        <div className="p-4 border-b border-[#E5E5E0] bg-[#F8F8F5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="meta-caps text-[#171A21]">
              Reading: {docDetail?.title || 'Loading document...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative inline-flex border border-[#E5E5E0] bg-white p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('typeset')}
                className={`relative px-2.5 py-0.5 transition-colors z-10 pressable active:scale-[0.97] ${
                  viewMode === 'typeset'
                    ? 'text-white font-medium'
                    : 'text-[#555C68] hover:text-[#171A21]'
                }`}
              >
                {viewMode === 'typeset' && (
                  <motion.div
                    layoutId="docTabActive"
                    className="absolute inset-0 bg-[#171A21] -z-10"
                    transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                  />
                )}
                Typeset Gazette
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw')}
                className={`relative px-2.5 py-0.5 transition-colors z-10 pressable active:scale-[0.97] ${
                  viewMode === 'raw'
                    ? 'text-white font-medium'
                    : 'text-[#555C68] hover:text-[#171A21]'
                }`}
              >
                {viewMode === 'raw' && (
                  <motion.div
                    layoutId="docTabActive"
                    className="absolute inset-0 bg-[#171A21] -z-10"
                    transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                  />
                )}
                Verbatim Source
              </button>
            </div>
          </div>
        </div>

        {/* Reader Content */}
        <div className="p-6 max-h-[640px] overflow-y-auto">
          {detailLoading ? (
            <div className="p-12 text-center text-xs text-[#555C68] font-mono animate-pulse">
              Reading official document bytes from disk...
            </div>
          ) : viewMode === 'typeset' ? (
            <div className="prose max-w-none font-serif text-[15px] leading-relaxed text-[#171A21] space-y-4 not-italic">
              <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#555C68] mb-6">
                Official Gazette Notice &bull; Document ID: {selectedDocId} &bull; Effective: {docDetail?.effective_date}
              </div>
              <div className="whitespace-pre-line leading-relaxed font-serif text-[15px] text-[#252A32] selection:bg-[#171A21] selection:text-white not-italic">
                {docDetail?.raw_content}
              </div>
            </div>
          ) : (
            <pre className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#252A32] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {docDetail?.raw_content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
