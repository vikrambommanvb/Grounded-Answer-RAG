import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send,
  Copy,
  Check,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';
import { askQuestion } from '../services/api';
import { QueryRequest, QueryResponse } from '../types';
import { CitationBadge } from '../components/ui/CitationBadge';
import { ClauseDrawer } from '../components/ui/ClauseDrawer';
import { TemporalControls } from '../components/ui/TemporalControls';
import { RefusalCard } from '../components/ui/RefusalCard';
import { SupervisoryWarning } from '../components/ui/SupervisoryWarning';
import { EvidenceInspector } from '../components/ui/EvidenceInspector';

export const AssistantPage: React.FC = () => {
  const location = useLocation();

  // Input states
  const [question, setQuestion] = useState('');
  const [determinationDate, setDeterminationDate] = useState('');
  const [changeDate, setChangeDate] = useState('');
  const [claimStartDate, setClaimStartDate] = useState('');
  const [claimEndDate, setClaimEndDate] = useState('');
  const [showTemporalControls, setShowTemporalControls] = useState(false);

  // Inspector & modal states
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState('');

  // Handle location state passed from Dashboard scenario cards
  useEffect(() => {
    if (location.state) {
      const { question: q, determinationDate: det, changeDate: chg } = location.state as any;
      if (q) setQuestion(q);
      if (det) setDeterminationDate(det);
      if (chg) setChangeDate(chg);
      if (det || chg) setShowTemporalControls(true);
    }
  }, [location.state]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setLastSubmittedQuestion(question);

    const req: QueryRequest = {
      question: question.trim(),
      determination_date: determinationDate || null,
      change_of_circumstances_date: changeDate || null,
      claim_start_date: claimStartDate || null,
      claim_end_date: claimEndDate || null,
    };

    try {
      const res = await askQuestion(req);
      setResponse(res);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while querying the policy engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    const textToCopy = response.direct_answer
      ? `${response.direct_answer}\n\n${response.policy_explanation || ''}`
      : response.refusal_details?.reason || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setQuestion('');
    setDeterminationDate('');
    setChangeDate('');
    setClaimStartDate('');
    setClaimEndDate('');
    setResponse(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      {/* Clause Slide-over Drawer */}
      <ClauseDrawer
        clauseId={selectedClauseId}
        onClose={() => setSelectedClauseId(null)}
        onSelectClause={(cid) => setSelectedClauseId(cid)}
      />

      {/* Main Workspace Layout (Center Chat + Right Evidence Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Conversation Area (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Query Formulation Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Casework Policy Question
              </span>
              <button
                type="button"
                onClick={() => setShowTemporalControls(!showTemporalControls)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  showTemporalControls || determinationDate || changeDate || claimStartDate
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Temporal Context</span>
                {showTemporalControls ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Collapsible Temporal Controls */}
            {showTemporalControls && (
              <TemporalControls
                determinationDate={determinationDate}
                changeDate={changeDate}
                claimStartDate={claimStartDate}
                claimEndDate={claimEndDate}
                onDeterminationDateChange={setDeterminationDate}
                onChangeDateChange={setChangeDate}
                onClaimStartDateChange={setClaimStartDate}
                onClaimEndDateChange={setClaimEndDate}
                onClear={() => {
                  setDeterminationDate('');
                  setChangeDate('');
                  setClaimStartDate('');
                  setClaimEndDate('');
                }}
              />
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask any policy question (e.g., 'What is the earnings disregard?', 'Can an independent 16-year-old qualify?')..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Shift + Enter for new line</span>
                  {response && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors ml-2"
                    >
                      <RotateCcw className="w-3 h-3" />
                      New Question
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      <span>Reasoning...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              <p className="font-semibold">Query Processing Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 animate-pulse">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded" />
              <div className="h-16 w-full bg-slate-100 rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
              </div>
            </div>
          )}

          {/* Results Area */}
          {response && !loading && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Question Header Card */}
              <div className="p-3.5 rounded-lg bg-slate-100/70 border border-slate-200 flex items-start justify-between text-xs text-slate-700">
                <div>
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block mb-0.5">
                    Casework Inquiry
                  </span>
                  <p className="font-medium text-slate-900">{lastSubmittedQuestion}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {response.latency_ms} ms
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 uppercase font-semibold">
                    {response.provider}
                  </span>
                </div>
              </div>

              {/* Case 1: Refused Query */}
              {response.status === 'REFUSED' && response.refusal_details && (
                <RefusalCard
                  refusal={response.refusal_details}
                  onSelectClause={(cid) => setSelectedClauseId(cid)}
                />
              )}

              {/* Case 2: Answered or Answered with Warning */}
              {(response.status === 'ANSWERED' ||
                response.status === 'ANSWERED_WITH_WARNING') && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                  {/* Status & Copy Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border uppercase ${
                          response.status === 'ANSWERED_WITH_WARNING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {response.status === 'ANSWERED_WITH_WARNING'
                          ? 'Answered with Supervisory Notice'
                          : 'Grounded Answer Verified'}
                      </span>
                      {response.temporal_resolution?.is_amended_applied && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Amendment No. 2026-01 Active
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                      title="Copy Answer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Supervisory Referral & Advisory Warnings */}
                  {response.warnings && response.warnings.length > 0 && (
                    <SupervisoryWarning warnings={response.warnings} />
                  )}

                  {/* Direct Answer Hero Callout */}
                  <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200/80">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 block mb-1">
                      Direct Determination Answer
                    </span>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed font-sans">
                      {response.direct_answer}
                    </p>
                  </div>

                  {/* Policy Explanation */}
                  {response.policy_explanation && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Detailed Statutory Grounding
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {response.policy_explanation}
                      </p>
                    </div>
                  )}

                  {/* Supporting Citation Badges */}
                  {response.supporting_citations && response.supporting_citations.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                        Verified Supporting Citations ({response.supporting_citations.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {response.supporting_citations.map((badge) => (
                          <CitationBadge
                            key={badge.clause_id}
                            badge={badge}
                            onClick={(cid) => setSelectedClauseId(cid)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel / Evidence Envelope (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {response?.retrieved_evidence && response.retrieved_evidence.length > 0 ? (
            <EvidenceInspector
              evidence={response.retrieved_evidence}
              onSelectClause={(cid) => setSelectedClauseId(cid)}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-800 text-xs font-semibold uppercase tracking-wider">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Evidence Verification Workspace</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you submit an inquiry, this panel displays all retrieved clauses, similarity ranking scores,
                and BM25 keyword matching diagnostics.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Grounding Guarantee:</p>
                <p className="text-[11px] leading-relaxed">
                  Only clauses in the official Calder County HSP corpus are used. Click any citation pill to view verbatim statutory text and amendment diffs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
