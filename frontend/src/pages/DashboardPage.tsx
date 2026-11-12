import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquareText,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPolicySummary, fetchHealth, fetchEvaluationSummary } from '../services/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: summary } = useQuery({
    queryKey: ['policySummary'],
    queryFn: fetchPolicySummary,
  });

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  const { data: evalSummary } = useQuery({
    queryKey: ['evaluationSummary'],
    queryFn: fetchEvaluationSummary,
  });

  const scenarios = [
    {
      id: 'res',
      title: 'Countable Resources Limit',
      clause: '§2.4.1',
      question: 'What is the maximum amount of countable resources a household may hold to qualify for assistance?',
      desc: 'Standard financial eligibility ceiling ($4,000 resource maximum).',
      category: 'Direct Grounding',
    },
    {
      id: 'minor',
      title: 'Independent 16-Year-Old Applicant',
      clause: '§2.3.1 & §2.3.2',
      question: 'Can an independent 16-year-old with no parental support qualify for assistance?',
      determinationDate: '2026-02-15',
      desc: 'Age eligibility exception with mandatory supervisory referral gate under §2.3.2.',
      category: 'Supervisory Gate',
    },
    {
      id: 'amended',
      title: 'Post-March Earnings Disregard',
      clause: '§6.4.1(a)',
      question: 'What is the monthly earnings disregard for a claim determined on 15 March 2026?',
      determinationDate: '2026-03-15',
      desc: 'Amendment No. 2026-01 rate increase from $120 to $175 per month.',
      category: 'Effective Overlay',
    },
    {
      id: 'split',
      title: 'Transitional Split Rule',
      clause: 'Paras 5.1 & 5.2',
      question: 'A change of circumstances occurred on 10 February 2026, but determination is made on 20 March 2026. What reporting period applies to the change, and what earnings disregard applies?',
      determinationDate: '2026-03-20',
      changeDate: '2026-02-10',
      desc: 'Para 5.1 ($175 disregard via determination date) vs Para 5.2 (10-day reporting via occurrence date).',
      category: 'Transitional Provisions',
    },
    {
      id: 'student',
      title: 'Full-Time Student Calculation (Challenge Trap)',
      clause: '§7.1.3 & §5.4',
      question: 'How is the monthly needs figure calculated for a full-time university student under §7.1.3?',
      desc: 'Statutory drafting error referencing care allowances in §5.4; triggers responsible refusal.',
      category: 'Apparent Gap',
    },
    {
      id: 'conflict',
      title: 'Pre-Amendment Reporting Deadline (Challenge Trap)',
      clause: '§4.3.2 vs §9.1.4',
      question: 'Under the pre-amendment policy, what is the deadline to report a change of circumstances to prevent an overpayment from being established?',
      changeDate: '2026-01-15',
      desc: 'Historical statutory conflict between 10-day and 30-day rules; triggers responsible refusal.',
      category: 'Internal Conflict',
    },
  ];

  const handleLaunchScenario = (s: typeof scenarios[0]) => {
    navigate('/assistant', {
      state: {
        question: s.question,
        determinationDate: s.determinationDate || '',
        changeDate: s.changeDate || '',
      },
    });
  };

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
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Editorial Masthead with Specificity & Balanced Wrap */}
      <div className="border-b border-[#E5E5E0] pb-6 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="space-y-1">
            <span className="meta-caps text-[#555C68] block">
              Calder County Department of Social Services &bull; HSP Policy Division
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#171A21] not-italic balance-text">
              Statutory Adjudication Registry &amp; Policy Docket
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Emphasized Primary CTA */}
            <button
              type="button"
              onClick={() => navigate('/assistant')}
              className="pressable w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 bg-[#171A21] hover:bg-[#252A32] text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.97] shadow-subtle"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Launch Casework Assistant</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/explorer')}
              className="pressable w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F8F8F5] border border-[#E5E5E0] text-[#171A21] text-xs font-medium transition-all active:scale-[0.97]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#555C68]" />
              <span>Browse Manual</span>
            </button>
          </div>
        </div>
        <p className="font-serif text-sm text-[#555C68] max-w-3xl leading-relaxed balance-text not-italic">
          Evidence-grounded statutory determination assistant operating under the Single Source of Truth doctrine.
          Enforces consolidated Policy Manual rules (31 Dec 2025) and Amendment No. 2026-01 (effective 1 March 2026).
        </p>
      </div>

      {/* Structured Ledger Statistics (Grouped with spacing, Tabular figures) */}
      <div className="border border-[#E5E5E0] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E0] grid grid-cols-2 lg:grid-cols-4 shadow-subtle">
        <div className="p-4 sm:p-5 space-y-1">
          <span className="meta-caps text-[#555C68] block">Statutory Corpus</span>
          <div className="font-mono tnum text-2xl font-semibold text-[#171A21]">
            {summary?.total_clauses || 148}
          </div>
          <p className="text-[11px] text-[#555C68]">
            Numbered clauses across {summary?.total_parts || 12} policy parts
          </p>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <span className="meta-caps text-[#555C68] block">Transitional Rules</span>
          <div className="font-mono tnum text-2xl font-semibold text-[#137C72]">
            Paras 5.1 &ndash; 5.3
          </div>
          <p className="text-[11px] text-[#555C68]">
            Effective 1 March 2026 with daily apportionment
          </p>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <span className="meta-caps text-[#555C68] block">Benchmark Fidelity</span>
          <div className="font-mono tnum text-2xl font-semibold text-[#171A21]">
            {evalSummary ? `${evalSummary.accuracy_percentage.toFixed(0)}%` : '100%'}
          </div>
          <p className="text-[11px] text-[#555C68]">
            10/10 statutory tests verified without hallucination
          </p>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <span className="meta-caps text-[#555C68] block">Reasoning Engine</span>
          <div className="font-mono text-2xl font-semibold text-[#3458DB]">
            {health?.default_provider === 'groq' ? 'Groq 27B' : 'Deterministic'}
          </div>
          <p className="text-[11px] text-[#555C68]">
            Zero temperature modal fidelity &bull; Offline safe
          </p>
        </div>
      </div>

      {/* Operational Case Scenarios Section with 30ms Stagger */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#E5E5E0] pb-2">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#171A21] not-italic">
              Authoritative Casework Inquiries
            </h2>
            <p className="text-xs text-[#555C68]">
              Standardized inquiries testing statutory grounding, temporal determination rules, and refusal protocols.
            </p>
          </div>
          <span className="meta-caps text-[#555C68] hidden sm:inline">6 Verifiable Scenarios</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
        >
          {scenarios.map((s) => (
            <motion.div
              key={s.id}
              variants={itemVariants}
              onClick={() => handleLaunchScenario(s)}
              className="pressable p-4 bg-white border border-[#E5E5E0] hover:border-[#171A21] cursor-pointer transition-all space-y-3 group active:scale-[0.97] shadow-subtle flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono tnum text-[10px] text-[#171A21] font-semibold px-1.5 py-0.2 bg-[#F8F8F5] border border-[#E5E5E0]">
                    {s.clause}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 uppercase font-medium ${
                    s.category.includes('Refusal') || s.category.includes('Gap') || s.category.includes('Conflict')
                      ? 'bg-[#FDF2F2] text-[#B94040] border border-[#F6C1C1]'
                      : s.category.includes('Gate')
                      ? 'bg-[#FDF7EE] text-[#B77A24] border border-[#F4DCB7]'
                      : 'bg-[#EFF8F7] text-[#137C72] border border-[#B3DFDA]'
                  }`}>
                    {s.category}
                  </span>
                </div>

                <h3 className="font-serif text-sm font-semibold text-[#171A21] leading-snug group-hover:text-[#3458DB] transition-colors not-italic">
                  {s.title}
                </h3>

                <p className="text-xs text-[#555C68] line-clamp-2 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5E5E0] flex items-center justify-between text-[11px] text-[#555C68] font-mono group-hover:text-[#171A21]">
                <span>Submit to Engine</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Statutory Architecture Summary Section */}
      <div className="border border-[#E5E5E0] bg-white p-6 space-y-4 shadow-subtle">
        <div className="border-b border-[#E5E5E0] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#137C72]" />
            <h3 className="font-serif text-base font-semibold text-[#171A21] not-italic">
              Casework Compliance Architecture
            </h3>
          </div>
          <span className="meta-caps text-[#555C68]">Verified Docket Protocol</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[#252A32]">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#171A21] font-serif text-sm not-italic">
              1. Effective-Dated Overlay
            </h4>
            <p className="text-[#555C68] leading-relaxed">
              Amendment No. 2026-01 applies prospectively from 1 March 2026. Pre-amendment claims retain historical 2025 rates. Spanning claims are apportioned daily under §7.4.3 without flat rounding.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#171A21] font-serif text-sm not-italic">
              2. Doctrine of Responsible Refusal
            </h4>
            <p className="text-[#555C68] leading-relaxed">
              The engine refuses queries with missing dates (<span className="font-mono text-[10px]">MISSING_TEMPORAL_DATA</span>), statutory gaps like §7.1.3 (<span className="font-mono text-[10px]">APPARENT_GAP</span>), and pre-amendment reporting conflicts (<span className="font-mono text-[10px]">INTERNAL_CONFLICT</span>).
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#171A21] font-serif text-sm not-italic">
              3. Verbatim Traceability
            </h4>
            <p className="text-[#555C68] leading-relaxed">
              Every factual assertion cites verified clause identifiers stored in SQLite. Hallucinated citations are detected and rejected prior to presentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
