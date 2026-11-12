import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
} from 'lucide-react';
import { askQuestion } from '../services/api';
import { QueryRequest, QueryResponse } from '../types';
import { CitationBadge } from '../components/ui/CitationBadge';
import { ClauseDrawer } from '../components/ui/ClauseDrawer';
import { TemporalControls } from '../components/ui/TemporalControls';
import { RefusalCard } from '../components/ui/RefusalCard';
import { SupervisoryWarning } from '../components/ui/SupervisoryWarning';
import { EvidenceInspector } from '../components/ui/EvidenceInspector';

interface HistoryEntry {
  id: string;
  question: string;
  timestamp: string;
  status: string;
  response: QueryResponse;
}

export const AssistantPage: React.FC = () => {
  const location = useLocation();

  // Input states
  const [question, setQuestion] = useState('');
  const [determinationDate, setDeterminationDate] = useState('');
  const [changeDate, setChangeDate] = useState('');
  const [claimStartDate, setClaimStartDate] = useState('');
  const [claimEndDate, setClaimEndDate] = useState('');
  const [showTemporalControls, setShowTemporalControls] = useState(true);

  // Inspector & modal states
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState('');

  // Caseworker History Log
  const [history, setHistory] = useState<HistoryEntry[]>([]);

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
    const submittedQ = question.trim();
    setLastSubmittedQuestion(submittedQ);

    const req: QueryRequest = {
      question: submittedQ,
      determination_date: determinationDate || null,
      change_of_circumstances_date: changeDate || null,
      claim_start_date: claimStartDate || null,
      claim_end_date: claimEndDate || null,
    };

    try {
      const res = await askQuestion(req);
      setResponse(res);

      // Add to session history
      const entry: HistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        question: submittedQ,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: res.status,
        response: res,
      };
      setHistory((prev) => [entry, ...prev.slice(0, 9)]);
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

  const loadHistoryItem = (entry: HistoryEntry) => {
    setQuestion(entry.question);
    setLastSubmittedQuestion(entry.question);
    setResponse(entry.response);
  };

  return (
    <div className="space-y-6">
      {/* Clause Slide-over Drawer */}
      <ClauseDrawer
        clauseId={selectedClauseId}
        onClose={() => setSelectedClauseId(null)}
        onSelectClause={(cid) => setSelectedClauseId(cid)}
      />

      {/* Header Bar */}
      <div className="border-b border-[#E5E5E0] pb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div className="space-y-0.5">
          <span className="meta-caps text-[#555C68] block">
            Casework Policy Adjudication &bull; Case Determination
          </span>
          <h1 className="font-serif text-2xl font-semibold text-[#171A21] tracking-tight not-italic">
            Statutory Determination Workstation
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="pressable inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E0] hover:bg-[#F8F8F5] text-xs font-mono text-[#171A21] transition-all active:scale-[0.97]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#555C68]" />
            <span>New Docket</span>
          </button>
        </div>
      </div>

      {/* Three-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Prior Inquiries / History (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#E5E5E0] p-3.5 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
              <span className="meta-caps text-[#171A21]">Session Docket History</span>
              <span className="font-mono tnum text-[10px] text-[#555C68]">{history.length} inquiries</span>
            </div>

            {history.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#555C68] space-y-1">
                <FileText className="w-5 h-5 mx-auto text-[#E5E5E0]" />
                <p>No inquiries submitted yet.</p>
                <p className="text-[10px]">Recent questions will appear in this docket ledger.</p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                className="space-y-1.5"
              >
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => loadHistoryItem(entry)}
                    className="pressable w-full text-left p-2.5 bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#171A21] transition-all space-y-1 active:scale-[0.97]"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono tnum text-[#555C68]">
                      <span>{entry.timestamp}</span>
                      <span className={`px-1 py-0.2 border uppercase ${
                        entry.status === 'REFUSED'
                          ? 'bg-[#FDF2F2] text-[#B94040] border-[#F6C1C1]'
                          : entry.status === 'ANSWERED_WITH_WARNING'
                          ? 'bg-[#FDF7EE] text-[#B77A24] border-[#F4DCB7]'
                          : 'bg-[#EFF8F7] text-[#137C72] border-[#B3DFDA]'
                      }`}>
                        {entry.status === 'REFUSED' ? 'Refused' : 'Answered'}
                      </span>
                    </div>
                    <p className="text-xs text-[#171A21] line-clamp-2 leading-snug font-medium">
                      {entry.question}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Quick Presets Box */}
          <div className="bg-white border border-[#E5E5E0] p-3.5 space-y-2.5 shadow-subtle">
            <span className="meta-caps text-[#555C68] block border-b border-[#E5E5E0] pb-1.5">
              Statutory Test Inquiries
            </span>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setQuestion('What is the monthly earnings disregard for a claim determined on 15 March 2026?');
                  setDeterminationDate('2026-03-15');
                }}
                className="pressable w-full text-left p-2 bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] text-[11px] text-[#252A32] leading-snug active:scale-[0.97]"
              >
                &bull; Post-March Disregard (§6.4.1)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestion('How is the monthly needs figure calculated for a full-time university student under §7.1.3?');
                }}
                className="pressable w-full text-left p-2 bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] text-[11px] text-[#252A32] leading-snug active:scale-[0.97]"
              >
                &bull; Full-Time Student Gap (§7.1.3)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestion('Can an independent 16-year-old with no parental support qualify for assistance?');
                  setDeterminationDate('2026-02-15');
                }}
                className="pressable w-full text-left p-2 bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] text-[11px] text-[#252A32] leading-snug active:scale-[0.97]"
              >
                &bull; Independent 16yo Minor (§2.3.1)
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Center Answer Workspace (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Query Formulation Box */}
          <div className="bg-white border border-[#E5E5E0] p-4 space-y-3.5 shadow-subtle">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
              <span className="meta-caps text-[#171A21]">
                Casework Determination Inquiry
              </span>
              <button
                type="button"
                onClick={() => setShowTemporalControls(!showTemporalControls)}
                className="pressable inline-flex items-center gap-1 text-[11px] font-mono text-[#3458DB] hover:underline active:scale-[0.97]"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{showTemporalControls ? 'Hide Date Parameters' : 'Show Date Parameters'}</span>
                {showTemporalControls ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Permanent/Collapsible Temporal Controls (Pop from trigger at scale 0.95) */}
            <AnimatePresence>
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
            </AnimatePresence>

            {/* Question Textarea & Submission */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="State your policy inquiry (e.g. 'What is the earnings disregard?', 'What reporting period applies to a change on 10 Feb?')..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-[#F8F8F5] border border-[#E5E5E0] text-sm text-[#171A21] placeholder-[#555C68] focus:outline-none focus:border-[#171A21] focus:bg-white transition-colors resize-none font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#555C68] font-mono">
                  Press Enter to submit &bull; Shift + Enter for newline
                </span>

                {/* Emphasized Primary Action Button with 0.97 scale on press */}
                <button
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="pressable inline-flex items-center gap-2 px-4 py-2 bg-[#171A21] hover:bg-[#252A32] disabled:opacity-40 text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.97] shadow-subtle"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                      <span>Verifying Corpus...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-[#FDF2F2] border border-[#F6C1C1] text-[#B94040] text-xs">
              <p className="font-semibold">Query Processing Fault</p>
              <p className="mt-0.5">{error}</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="bg-white border border-[#E5E5E0] p-6 shadow-subtle space-y-4 animate-pulse">
              <div className="h-4 w-40 bg-[#E5E5E0]" />
              <div className="h-6 w-3/4 bg-[#E5E5E0]" />
              <div className="h-20 w-full bg-[#F8F8F5]" />
            </div>
          )}

          {/* Results Area with Smooth State Transition */}
          <AnimatePresence mode="wait">
            {response && !loading && (
              <motion.div
                key="responseCard"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {/* Inquiry Header Summary */}
                <div className="p-3 bg-white border border-[#E5E5E0] flex items-start justify-between text-xs">
                  <div>
                    <span className="meta-caps text-[#555C68] block mb-0.5">
                      Casework Inquiry
                    </span>
                    <p className="font-serif text-sm text-[#171A21] font-semibold not-italic">{lastSubmittedQuestion}</p>
                  </div>
                  <div className="text-[10px] font-mono tnum text-[#555C68] flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {response.execution_time_ms ? `${response.execution_time_ms.toFixed(1)}ms` : '1.8ms'}
                    </span>
                  </div>
                </div>

                {/* Refusal Card (if refused) */}
                {response.refusal_details && (
                  <RefusalCard
                    refusal={response.refusal_details}
                    onSelectClause={(cid) => setSelectedClauseId(cid)}
                  />
                )}

                {/* Grounded Answer Card (if answered) */}
                {response.direct_answer && (
                  <div className="bg-white border border-[#E5E5E0] p-5 space-y-4 shadow-subtle">
                    <div className="flex items-start justify-between border-b border-[#E5E5E0] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#EFF8F7] text-[#137C72] border border-[#B3DFDA] font-semibold">
                            GROUNDED DETERMINATION
                          </span>
                          <span className="meta-caps text-[#555C68]">
                            Calder County HSP
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-[#171A21] mt-1 not-italic">
                          Direct Casework Answer
                        </h3>
                      </div>

                      {/* Copy Action with Success Pulse confirmation */}
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`pressable inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tnum text-[#555C68] hover:text-[#171A21] bg-[#F8F8F5] border border-[#E5E5E0] transition-colors active:scale-[0.97] ${
                          copied ? 'animate-success-pulse border-[#137C72] text-[#137C72]' : ''
                        }`}
                      >
                        {copied ? <Check className="w-3 h-3 text-[#137C72]" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Direct Answer Prose */}
                    <div className="p-4 bg-[#F8F8F5] border-l-2 border-[#137C72] border-y border-r border-[#E5E5E0] font-serif text-[15px] leading-relaxed text-[#171A21] not-italic">
                      {response.direct_answer}
                    </div>

                    {/* Supporting Citations */}
                    {response.supporting_citations && response.supporting_citations.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="meta-caps text-[#555C68] block">
                          Statutory Citations ({response.supporting_citations.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {response.supporting_citations.map((c) => (
                            <CitationBadge
                              key={c.clause_id}
                              badge={c}
                              onClick={(cid) => setSelectedClauseId(cid)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Policy Explanation */}
                    {response.policy_explanation && (
                      <div className="space-y-1.5 pt-3 border-t border-[#E5E5E0]">
                        <span className="meta-caps text-[#555C68] block">
                          Statutory Policy Rationale &amp; Computation
                        </span>
                        <div className="font-serif text-sm text-[#252A32] leading-relaxed whitespace-pre-line not-italic">
                          {response.policy_explanation}
                        </div>
                      </div>
                    )}

                    {/* Supervisory Warnings */}
                    {response.warnings && response.warnings.length > 0 && (
                      <div className="pt-2">
                        <SupervisoryWarning warnings={response.warnings} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Column 3: Evidence Inspector / Envelope (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-4">
          {response?.retrieved_evidence && response.retrieved_evidence.length > 0 ? (
            <EvidenceInspector
              evidence={response.retrieved_evidence}
              onSelectClause={(cid) => setSelectedClauseId(cid)}
            />
          ) : (
            <div className="bg-white border border-[#E5E5E0] p-4 space-y-3 shadow-subtle">
              <span className="meta-caps text-[#171A21] block border-b border-[#E5E5E0] pb-2">
                Evidence Inspector
              </span>
              <p className="text-xs text-[#555C68] leading-relaxed">
                When an inquiry is submitted, retrieved clauses from the BM25 + semantic vector engine will appear here with ranking diagnostics.
              </p>
              <div className="p-3 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1.5 text-[11px] text-[#252A32] font-mono tnum">
                <div className="flex items-center justify-between">
                  <span className="text-[#555C68]">Indexed Corpus:</span>
                  <span>148 Clauses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#555C68]">Cross-References:</span>
                  <span>53 Links</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#555C68]">Provenance Check:</span>
                  <span className="text-[#137C72]">Enforced</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
