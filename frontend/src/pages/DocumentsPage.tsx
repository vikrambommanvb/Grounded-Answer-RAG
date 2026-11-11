import React, { useState } from 'react';
import {
  FileText,
  Hash,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDocuments, fetchDocumentDetail } from '../services/api';

export const DocumentsPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('policy-manual');

  const { data: documents } = useQuery({
    queryKey: ['sourceDocuments'],
    queryFn: fetchDocuments,
  });

  const { data: docDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['documentDetail', selectedDocId],
    queryFn: () => fetchDocumentDetail(selectedDocId),
    enabled: !!selectedDocId,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold mb-1">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Immutable Document Vault</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Source Policy Documents & Cryptographic Hashes
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          These official files form the single authoritative source of truth. Integrity is verified via SHA-256 checksums.
        </p>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents?.map((doc) => {
          const isSelected = selectedDocId === doc.document_id;
          const isAmendment = doc.document_type === 'amendment';

          return (
            <div
              key={doc.document_id}
              onClick={() => setSelectedDocId(doc.document_id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all space-y-3 ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isAmendment ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        isAmendment
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {doc.document_type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                {isSelected && (
                  <span className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Viewing
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Filename:</span>
                  <span className="font-mono text-slate-700">{doc.filename}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Effective Date:</span>
                  <span className="font-mono text-slate-700">{doc.effective_date}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Size & Clauses:</span>
                  <span className="font-mono text-slate-700">
                    {(doc.byte_size / 1024).toFixed(1)} KB &bull; {doc.clause_count} items
                  </span>
                </p>
              </div>

              {/* SHA-256 Checksum Display */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  <span>SHA-256 Cryptographic Checksum</span>
                </span>
                <p className="font-mono text-[10px] text-slate-700 break-all select-all">
                  {doc.sha256_hash}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw Verbatim Content Viewer */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
              Verbatim Markdown Document Viewer: {docDetail?.title || 'Loading...'}
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Read-Only Immutable Source</span>
        </div>

        {detailLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading document content...</div>
        ) : (
          <div className="p-6 max-h-[700px] overflow-y-auto bg-slate-50/50">
            <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
              {docDetail?.raw_content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
