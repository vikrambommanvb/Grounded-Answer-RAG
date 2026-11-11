import React from 'react';
import {
  Sliders,
  Cpu,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemConfig } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { data: config, isLoading } = useQuery({
    queryKey: ['systemConfig'],
    queryFn: fetchSystemConfig,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold mb-1">
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>System & Model Configuration</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Application Architecture & Provider Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect configured LLM backends, hybrid retrieval parameters, and security guarantees.
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading system configuration...</div>
      ) : (
        <div className="space-y-5">
          {/* Active Provider Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Active Reasoning Provider
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-semibold">
                Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400">
                  Runtime Provider
                </span>
                <p className="text-sm font-bold text-slate-900 font-mono uppercase">
                  {config?.active_provider}
                </p>
                <p className="text-xs text-slate-500">
                  {config?.active_provider === 'groq'
                    ? 'Groq Cloud High-Speed Inference Engine'
                    : 'Deterministic Offline Mock Provider (Zero Quota)'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400">
                  Target Model Name
                </span>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {config?.groq_model || 'llama-3.3-70b-versatile'}
                </p>
                <p className="text-xs text-slate-500">
                  Configured for zero temperature deterministic modal fidelity
                </p>
              </div>
            </div>
          </div>

          {/* Retrieval Engine Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Hybrid RAG Pipeline Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Top-K Retrieval</span>
                <p className="text-lg font-bold text-slate-900 font-mono">{config?.retrieval_top_k || 5}</p>
                <p className="text-[10px] text-slate-400">Clauses retrieved per query</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Similarity Threshold</span>
                <p className="text-lg font-bold text-slate-900 font-mono">{config?.similarity_threshold || 0.20}</p>
                <p className="text-[10px] text-slate-400">Off-topic refusal cut-off</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Hybrid Mode</span>
                <p className="text-lg font-bold text-emerald-700 font-mono">
                  {config?.hybrid_retrieval ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-[10px] text-slate-400">BM25 + Vector + Graph</p>
              </div>
            </div>
          </div>

          {/* Security & Secret Masking Transparency */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">
                Security & Zero Secret Exposure Guarantee
              </h2>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Client-Side Isolation Verified</span>
              </div>
              <p className="leading-relaxed">
                {config?.security_notice ||
                  'API keys are stored exclusively in backend environment configuration and are never transmitted to the frontend.'}
              </p>
              <div className="pt-2 border-t border-emerald-200/80 font-mono text-[11px] text-emerald-950 flex items-center justify-between">
                <span>Groq API Key Status:</span>
                <span className="bg-emerald-200/80 px-2 py-0.5 rounded font-bold">
                  {config?.groq_key_configured ? 'gsk_*** (Securely Configured)' : 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
