import React from 'react';
import {
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemConfig } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { data: config, isLoading } = useQuery({
    queryKey: ['systemConfig'],
    queryFn: fetchSystemConfig,
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Editorial Masthead */}
      <div className="border-b border-[#E5E5E0] pb-5 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="meta-caps text-[#777E89] block mb-1">
              System Telemetry &bull; Verification Registry
            </span>
            <h1 className="font-serif text-3xl font-semibold text-[#171A21] tracking-tight">
              Application Architecture &amp; Runtime Config
            </h1>
          </div>
          <span className="font-mono text-xs text-[#137C72] bg-[#EFF8F7] border border-[#B3DFDA] px-2.5 py-1">
            Production Spec v1.0.0
          </span>
        </div>
        <p className="font-serif text-sm text-[#777E89] max-w-3xl leading-relaxed">
          Technical specifications, inference runtime providers, hybrid retrieval thresholds, and cryptographic data guarantees.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#777E89] font-mono">
          Loading system telemetry...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Active Reasoning Provider */}
          <div className="bg-white border border-[#E5E5E0] p-6 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#3458DB]" />
                <h2 className="meta-caps text-[#171A21]">
                  Active Reasoning Provider
                </h2>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 bg-[#EFF8F7] text-[#137C72] border border-[#B3DFDA] uppercase font-semibold">
                Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <span className="meta-caps text-[#777E89] block">Selected Provider</span>
                <p className="font-mono text-base font-semibold text-[#171A21] uppercase">
                  {config?.active_provider}
                </p>
                <p className="text-[#777E89]">
                  {config?.active_provider === 'groq'
                    ? 'Groq Cloud High-Speed Inference Engine'
                    : 'Deterministic Offline Mock Provider (Zero Quota / 1.7ms Latency)'}
                </p>
              </div>

              <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <span className="meta-caps text-[#777E89] block">Model Identifier</span>
                <p className="font-mono text-base font-semibold text-[#171A21]">
                  {config?.groq_model || 'llama-3.3-70b-versatile'}
                </p>
                <p className="text-[#777E89]">
                  Configured for zero temperature deterministic modal fidelity
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Retrieval Engine Parameters */}
          <div className="bg-white border border-[#E5E5E0] p-6 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#137C72]" />
                <h2 className="meta-caps text-[#171A21]">
                  Hybrid RAG Pipeline Parameters
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#777E89]">
                BM25 + Semantic Cosine Embeddings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <span className="meta-caps text-[#777E89] block font-sans">Top-K Candidate Retrieval</span>
                <p className="text-xl font-semibold text-[#171A21]">
                  {config?.retrieval_top_k || 5} Clauses
                </p>
                <p className="text-[11px] text-[#777E89] font-sans">
                  Retrieved for statutory context synthesis
                </p>
              </div>

              <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <span className="meta-caps text-[#777E89] block font-sans">Similarity Cutoff Threshold</span>
                <p className="text-xl font-semibold text-[#171A21]">
                  {config?.similarity_threshold || 0.15}
                </p>
                <p className="text-[11px] text-[#777E89] font-sans">
                  Queries below cutoff trigger OUT_OF_SCOPE
                </p>
              </div>

              <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <span className="meta-caps text-[#777E89] block font-sans">Cross-Reference Expansion</span>
                <p className="text-xl font-semibold text-[#137C72]">
                  Enabled
                </p>
                <p className="text-[11px] text-[#777E89] font-sans">
                  Expands retrieved nodes via graph edges
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Security & Statutory Integrity Guarantees */}
          <div className="bg-white border border-[#E5E5E0] p-6 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#171A21]" />
                <h2 className="meta-caps text-[#171A21]">
                  Security &amp; Statutory Integrity Guarantees
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#137C72] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Audited
              </span>
            </div>

            <div className="space-y-3 text-xs text-[#252A32]">
              <div className="p-3.5 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <span className="font-semibold text-[#171A21] font-mono block">
                  1. Zero Credential Exposure
                </span>
                <p className="text-[#777E89] leading-relaxed">
                  {config?.security_notice || 'All secrets are stored in root .env (git-ignored). API responses mask all keys.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <span className="font-semibold text-[#171A21] font-mono block">
                  2. Read-Only Policy Corpus
                </span>
                <p className="text-[#777E89] leading-relaxed">
                  The SQLite database indexes official policy documents without permitting runtime modifications to statutory provisions.
                </p>
              </div>

              <div className="p-3.5 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
                <span className="font-semibold text-[#171A21] font-mono block">
                  3. Deterministic Refusal Gates
                </span>
                <p className="text-[#777E89] leading-relaxed">
                  Refusals for missing dates and drafting gaps execute deterministically in Python before any LLM inference call, eliminating hallucination risks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
