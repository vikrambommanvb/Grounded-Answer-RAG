import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareText,
  BookOpen,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  CalendarDays,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPolicySummary, fetchHealth } from '../services/api';

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
      desc: 'Age eligibility exception with mandatory supervisory referral gate.',
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
      desc: 'Erronenous §7.1.3 reference to care allowances in §5.4 with missing student rules; requires refusal.',
      category: 'Apparent Gap Refusal',
    },
    {
      id: 'conflict',
      title: 'Pre-Amendment Reporting Deadline (Challenge Trap)',
      clause: '§4.3.2 vs §9.1.4',
      question: 'Under the pre-amendment policy, what is the deadline to report a change of circumstances to prevent an overpayment from being established?',
      changeDate: '2026-01-15',
      desc: 'Pre-amendment statutory conflict (10 days vs 30 days safe harbor); requires refusal.',
      category: 'Internal Inconsistency',
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

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Calder County Household Support Program</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Evidence-Grounded Policy Intelligence Assistant
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to the official decision-support system for Calder County HSP caseworkers.
            This application enforces strict evidence grounding against the consolidated Policy Manual
            and Amendment No. 2026-01. It answers only what policy explicitly establishes, provides
            verbatim citations, enforces supervisory referral gates, and refuses ambiguous or contradictory claims.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/assistant')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Launch Casework Assistant</span>
            </button>
            <button
              onClick={() => navigate('/explorer')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse 12 Policy Parts</span>
            </button>
            <button
              onClick={() => navigate('/evaluation')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Run Benchmark Suite (10 Tests)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Corpus Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Policy Corpus</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {summary?.total_clauses || 148}
          </p>
          <p className="text-[11px] text-slate-500">
            Ingested numbered clauses across 12 Parts
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sections & Hierarchy</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {summary?.total_sections || 54}
          </p>
          <p className="text-[11px] text-slate-500">
            54 statutory sections + definitions §1.4.1–§1.4.11
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Overlay</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-700 font-mono mt-1">
            No. 2026-01
          </p>
          <p className="text-[11px] text-slate-500">
            Effective 1 March 2026 (Paras 5.1, 5.2, 5.3)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Runtime Provider</span>
            <CalendarDays className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-slate-800 font-mono mt-1">
            {health?.default_provider === 'groq' ? 'Groq (70B)' : 'Mock (Deterministic)'}
          </p>
          <p className="text-[11px] text-slate-500">
            Zero-hallucination grounded synthesis
          </p>
        </div>
      </div>

      {/* Casework Quick-Start Scenarios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
              Interactive Casework Scenarios
            </h2>
            <p className="text-xs text-slate-500">
              Select any benchmark scenario to test grounded answering, temporal resolution, or strict refusal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((s) => (
            <div
              key={s.id}
              onClick={() => handleLaunchScenario(s)}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all space-y-2 group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {s.category}
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 font-semibold">
                    {s.clause}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {s.question}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{s.desc}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
