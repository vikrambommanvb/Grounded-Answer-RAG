import React, { useState } from 'react';
import {
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvaluationSummary, runEvaluation } from '../services/api';
import { EvaluationSummary } from '../types';

export const EvaluationDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const { data: summary, isLoading } = useQuery<EvaluationSummary>({
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Editorial Masthead */}
      <div className="border-b border-[#E5E5E0] pb-5 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <span className="meta-caps text-[#777E89] block mb-1">
            Quality Assurance &bull; Statutory Grounding Laboratory
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#171A21] tracking-tight">
            Ten-Question Benchmark Evaluation Suite
          </h1>
          <p className="text-xs text-[#777E89] mt-1 font-serif">
            Empirical audit of factual accuracy, temporal rule resolution, citation provenance, and refusal calibration.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#171A21] hover:bg-[#252A32] disabled:opacity-50 text-white text-xs font-medium transition-all active:scale-95 shadow-subtle shrink-0"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              <span>Executing 10 Benchmark Tests...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              <span>Run Automated Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Scorecards (Editorial Ledger Grid) */}
      {hasResults && (
        <div className="border border-[#E5E5E0] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E0] grid grid-cols-2 lg:grid-cols-4 shadow-subtle">
          <div className="p-4 sm:p-5 space-y-1">
            <span className="meta-caps text-[#777E89] block">Overall Accuracy</span>
            <div className="font-mono text-2xl font-semibold text-[#137C72]">
              {summary.accuracy_percentage.toFixed(1)}%
            </div>
            <p className="text-[11px] text-[#777E89]">
              {summary.passed_tests}/{summary.total_tests} test cases passed
            </p>
          </div>

          <div className="p-4 sm:p-5 space-y-1">
            <span className="meta-caps text-[#777E89] block">Citation Integrity</span>
            <div className="font-mono text-2xl font-semibold text-[#171A21]">
              {summary.citation_validity_percentage.toFixed(1)}%
            </div>
            <p className="text-[11px] text-[#777E89]">
              Zero hallucinated clause identifiers
            </p>
          </div>

          <div className="p-4 sm:p-5 space-y-1">
            <span className="meta-caps text-[#777E89] block">Refusal Correctness</span>
            <div className="font-mono text-2xl font-semibold text-[#137C72]">
              {summary.refusal_correctness_percentage.toFixed(1)}%
            </div>
            <p className="text-[11px] text-[#777E89]">
              Caught gap &amp; contradiction traps
            </p>
          </div>

          <div className="p-4 sm:p-5 space-y-1">
            <span className="meta-caps text-[#777E89] block">Execution Latency</span>
            <div className="font-mono text-2xl font-semibold text-[#3458DB]">
              {summary.average_latency_ms.toFixed(2)} ms
            </div>
            <p className="text-[11px] text-[#777E89]">
              Deterministic in-memory evaluation
            </p>
          </div>
        </div>
      )}

      {/* Benchmark Test Cases Table */}
      <div className="bg-white border border-[#E5E5E0] shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-[#E5E5E0] bg-[#F8F8F5] flex items-center justify-between">
          <h2 className="meta-caps text-[#171A21]">
            Automated Audit Test Registry (10 Statutory Scenarios)
          </h2>
          <span className="font-mono text-[10px] text-[#777E89]">
            Source: data/evaluations/benchmark_results.json
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#777E89] font-mono">
            Loading benchmark test results...
          </div>
        ) : summary?.results ? (
          <div className="divide-y divide-[#E5E5E0]">
            {summary.results.map((tc) => {
              const isExpanded = selectedTestId === tc.test_id;
              return (
                <div key={tc.test_id} className="transition-colors">
                  <div
                    onClick={() => setSelectedTestId(isExpanded ? null : tc.test_id)}
                    className="p-4 hover:bg-[#F8F8F5] cursor-pointer flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.2 border uppercase font-bold ${
                        tc.passed
                          ? 'bg-[#EFF8F7] text-[#137C72] border-[#B3DFDA]'
                          : 'bg-[#FDF2F2] text-[#B94040] border-[#F6C1C1]'
                      }`}>
                        {tc.passed ? 'PASS' : 'FAIL'}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#171A21]">
                        {tc.test_id}
                      </span>
                      <span className="meta-caps text-[#777E89] hidden sm:inline">
                        {tc.category}
                      </span>
                    </div>

                    <div className="flex-1 max-w-xl truncate text-xs text-[#252A32] font-serif">
                      {tc.question}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-[#777E89]">
                      <span>{tc.latency_ms.toFixed(1)}ms</span>
                      <span className="text-[#171A21]">{tc.actual_status}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  {/* Expandable Diagnostic Evidence */}
                  {isExpanded && (
                    <div className="p-4 bg-[#F8F8F5] border-t border-[#E5E5E0] space-y-3 text-xs font-mono">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-white border border-[#E5E5E0] space-y-1">
                          <span className="text-[10px] text-[#777E89] uppercase block">Status Match</span>
                          <span className={tc.status_passed ? 'text-[#137C72]' : 'text-[#B94040]'}>
                            Expected: {tc.expected_status} &bull; Actual: {tc.actual_status}
                          </span>
                        </div>
                        <div className="p-3 bg-white border border-[#E5E5E0] space-y-1">
                          <span className="text-[10px] text-[#777E89] uppercase block">Citation Provenance</span>
                          <span className={tc.citation_passed ? 'text-[#137C72]' : 'text-[#B94040]'}>
                            {tc.citation_passed ? 'Verified Valid Clauses' : 'Citation Discrepancy'}
                          </span>
                        </div>
                        <div className="p-3 bg-white border border-[#E5E5E0] space-y-1">
                          <span className="text-[10px] text-[#777E89] uppercase block">Phrase / Keyword Fidelity</span>
                          <span className={tc.phrases_passed ? 'text-[#137C72]' : 'text-[#B94040]'}>
                            {tc.phrases_passed ? 'All Required Terms Present' : 'Missing Phrases'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-[#E5E5E0] space-y-1">
                        <span className="text-[10px] text-[#777E89] uppercase block">Diagnostic Audit Log</span>
                        <p className="text-[#252A32] leading-relaxed whitespace-pre-wrap">
                          {tc.details}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#777E89]">
            Click &quot;Run Automated Benchmark&quot; to execute the 10 statutory test cases.
          </div>
        )}
      </div>
    </div>
  );
};
