import React, { useState } from 'react';
import {
  History,
  Clock,
  Play,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeline, askQuestion } from '../services/api';
import { QueryResponse } from '../types';

export const TimelinePage: React.FC = () => {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['policyTimeline'],
    queryFn: fetchTimeline,
  });

  // Simulator state
  const [simQuestion, setSimQuestion] = useState(
    'What earnings disregard and reporting deadline apply to this case?'
  );
  const [determinationDate, setDeterminationDate] = useState('2026-03-20');
  const [changeDate, setChangeDate] = useState('2026-02-10');
  const [claimStartDate, setClaimStartDate] = useState('');
  const [claimEndDate, setClaimEndDate] = useState('');

  const [simLoading, setSimLoading] = useState(false);
  const [simResponse, setSimResponse] = useState<QueryResponse | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    setSimLoading(true);
    setSimError(null);
    setSimResponse(null);

    try {
      const res = await askQuestion({
        question: simQuestion,
        determination_date: determinationDate || null,
        change_of_circumstances_date: changeDate || null,
        claim_start_date: claimStartDate || null,
        claim_end_date: claimEndDate || null,
      });
      setSimResponse(res);
    } catch (err: any) {
      setSimError(err.message || 'Simulation query failed.');
    } finally {
      setSimLoading(false);
    }
  };

  const setPreset = (
    det: string,
    chg: string,
    start: string,
    end: string,
    q: string
  ) => {
    setDeterminationDate(det);
    setChangeDate(chg);
    setClaimStartDate(start);
    setClaimEndDate(end);
    setSimQuestion(q);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold mb-1">
          <History className="w-3.5 h-3.5 text-blue-600" />
          <span>Statutory Timeline & Transitional Overlay</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Amendment No. 2026-01 Effective Dates & Transitional Rules
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enacted 12 February 2026 &bull; Effective 1 March 2026 &bull; Governed strictly by Paragraphs 5.1, 5.2, and 5.3
        </p>
      </div>

      {/* Visual Timeline Events */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
          Statutory Enactment & Effective Milestones
        </h2>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading timeline data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {timelineData?.timeline_events?.map((ev, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-2 relative ${
                  ev.event_type === 'effective_date'
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : ev.event_type === 'enactment'
                    ? 'bg-blue-50/60 border-blue-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {ev.date}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      ev.event_type === 'effective_date'
                        ? 'bg-emerald-200 text-emerald-900'
                        : ev.event_type === 'enactment'
                        ? 'bg-blue-200 text-blue-900'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {ev.event_type}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{ev.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3 Core Transitional Provisions Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
          Authoritative Transitional Provisions (Amendment No. 2026-01)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Paragraph 5.1 Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Paragraph 5.1
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Determination Date Rule</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Rates, Thresholds & Sanctions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applies to determinations made on or after 1 March 2026, including determinations concerning earlier periods:
            </p>
            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
              <li>§6.4.1(a) earnings disregard: $120 &rarr; <strong>$175</strong></li>
              <li>§6.6.1 revised household income limits</li>
              <li>§10.5.2 sanction rate: 20% &rarr; <strong>15%</strong></li>
              <li>§10.5.3A newly created hardship protection</li>
            </ul>
          </div>

          {/* Paragraph 5.2 Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Paragraph 5.2
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Occurrence Date Rule</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Change Reporting Deadlines
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applies strictly to changes of circumstances occurring on or after 1 March 2026:
            </p>
            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
              <li>§4.3.2 reporting window: 10 days &rarr; <strong>14 calendar days</strong></li>
              <li>§9.1.4 overpayment safe harbor: 30 days &rarr; <strong>14 calendar days</strong></li>
              <li>Earlier changes retain the earlier reporting period regardless of determination date.</li>
            </ul>
          </div>

          {/* Paragraph 5.3 Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Paragraph 5.3
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Spanning Claim Apportionment</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Claims Spanning 1 March 2026
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Where a claim spans 1 March 2026, the award is apportioned on a daily basis under §7.4.3:
            </p>
            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
              <li>Days prior to 1 March 2026 calculated at 2025 baseline rates</li>
              <li>Days on or after 1 March 2026 calculated at amended rates</li>
              <li>Never uses flat approximation; enforces statutory apportionment formula</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backend Temporal Policy Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Transitional Policy Rule Simulator</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Execute live date combinations through the backend temporal policy engine.
            </p>
          </div>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Scenarios:</span>
          <button
            type="button"
            onClick={() =>
              setPreset(
                '2026-03-20',
                '2026-02-10',
                '',
                '',
                'A change occurred on 10 Feb 2026, determination is 20 Mar 2026. What reporting deadline and earnings disregard apply?'
              )
            }
            className="text-xs px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 transition-colors"
          >
            Transitional Split (Para 5.1 & 5.2)
          </button>
          <button
            type="button"
            onClick={() =>
              setPreset(
                '',
                '',
                '2026-02-15',
                '2026-03-15',
                'How is an award calculated for a claim spanning from 15 February 2026 to 15 March 2026?'
              )
            }
            className="text-xs px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 transition-colors"
          >
            Spanning Claim (Para 5.3)
          </button>
          <button
            type="button"
            onClick={() =>
              setPreset(
                '2026-02-15',
                '',
                '',
                '',
                'What is the monthly earnings disregard for a claim determined on 15 February 2026?'
              )
            }
            className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors"
          >
            Pre-Amendment (Feb 2026)
          </button>
        </div>

        {/* Date Inputs Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Determination Date
            </label>
            <input
              type="date"
              value={determinationDate}
              onChange={(e) => setDeterminationDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Change Occurrence Date
            </label>
            <input
              type="date"
              value={changeDate}
              onChange={(e) => setChangeDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Claim Start Date
            </label>
            <input
              type="date"
              value={claimStartDate}
              onChange={(e) => setClaimStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Claim End Date
            </label>
            <input
              type="date"
              value={claimEndDate}
              onChange={(e) => setClaimEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800"
            />
          </div>
        </div>

        {/* Query Input & Run Button */}
        <div className="flex gap-2">
          <input
            type="text"
            value={simQuestion}
            onChange={(e) => setSimQuestion(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            placeholder="Simulation query string..."
          />
          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={simLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{simLoading ? 'Running...' : 'Run Simulation'}</span>
          </button>
        </div>

        {/* Simulation Output Area */}
        {simError && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
            {simError}
          </div>
        )}

        {simResponse && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                Backend Temporal Policy Resolution Result
              </span>
              <span className="font-mono text-blue-700">
                Overlay Active: {simResponse.temporal_resolution?.is_amended_applied ? 'YES' : 'NO'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 leading-relaxed">
              {simResponse.direct_answer}
            </div>

            {simResponse.warnings && simResponse.warnings.length > 0 && (
              <div className="space-y-1">
                {simResponse.warnings.map((w, idx) => (
                  <p key={idx} className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
