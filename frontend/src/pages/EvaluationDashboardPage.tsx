import React, { useState } from 'react';
import {
  FileCheck2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvaluationSummary, runEvaluation } from '../services/api';
import { EvaluationSummary } from '../types';

export const EvaluationDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const { data: summary } = useQuery<EvaluationSummary>({
    queryKey: ['evaluationSummary'],
    queryFn: fetchEvaluationSummary,
  });

  const mutation = useMutation({
    mutationFn: () => runEvaluation('mock'),
    onSuccess: (newSummary) => {
      queryClient.setQueryData(['evaluationSummary'], newSummary);
    },
  });

  const handleRun = () => {
    mutation.mutate();
  };

  const isRunning = mutation.isPending;
  const hasResults = summary && summary.total_tests > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold mb-1">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Automated Casework Quality Benchmark</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ten-Question Statutory Benchmark Suite
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rigorous evaluation of factual correctness, temporal resolution, citation integrity, and refusal fidelity.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              <span>Executing 10 Tests...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run Benchmark Now</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Scorecards */}
      {hasResults ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Overall Accuracy</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {summary.accuracy_percentage.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-500">
              {summary.passed_tests} of {summary.total_tests} test cases passed
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Citation Validity</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {summary.citation_validity_percentage.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-500">
              Verified statutory clause provenance
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Refusal Fidelity</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {summary.refusal_correctness_percentage.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-500">
              Zero hallucination on gaps & contradictions
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Average Latency</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {summary.average_latency_ms.toFixed(1)} ms
            </p>
            <p className="text-[11px] text-slate-500">
              Deterministic offline benchmark timing
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-xs text-center space-y-3">
          <p className="text-sm font-semibold text-slate-800">No benchmark results recorded yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Run Benchmark Now&quot; above to execute the 10-Question suite across the live engine.
          </p>
        </div>
      )}

      {/* Test Matrix Table */}
      {hasResults && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
              Benchmark Test Matrix (10 Test Cases)
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              SQLite Recorded Execution
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {summary.results.map((r) => {
              const isExpanded = selectedTestId === r.test_id;
              return (
                <div key={r.test_id} className="transition-colors hover:bg-slate-50/60">
                  <div
                    onClick={() => setSelectedTestId(isExpanded ? null : r.test_id)}
                    className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {r.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {r.test_id}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {r.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5 line-clamp-1 max-w-xl">
                          {r.question}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-mono text-[11px] text-slate-500">
                        {r.latency_ms.toFixed(1)} ms
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                          r.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Row Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-3 bg-slate-50/80 border-t border-slate-100 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            Expected Status
                          </span>
                          <p className="font-mono text-slate-900">{r.expected_status}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            Actual Status
                          </span>
                          <p className="font-mono text-slate-900">{r.actual_status}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          Execution Diagnostics
                        </span>
                        <p className="font-mono text-slate-700 text-[11px] leading-relaxed">
                          {r.details}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
