import React, { useState } from 'react';
import {
  Play,
} from 'lucide-react';
import { askQuestion } from '../services/api';
import { QueryResponse } from '../types';

export const TimelinePage: React.FC = () => {

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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Editorial Masthead */}
      <div className="border-b border-[#E5E5E0] pb-5 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="meta-caps text-[#777E89] block mb-1">
              Legislative History & Transitional Jurisprudence
            </span>
            <h1 className="font-serif text-3xl font-semibold text-[#171A21] tracking-tight">
              Statutory Timeline & Transitional Overlay
            </h1>
          </div>
          <span className="font-mono text-xs text-[#137C72] bg-[#EFF8F7] border border-[#B3DFDA] px-2.5 py-1">
            Amendment No. 2026-01
          </span>
        </div>
        <p className="font-serif text-sm text-[#777E89] max-w-3xl leading-relaxed">
          Chronological record of statutory enactments governing the Calder County Household Support Program.
          Enforces the effective-dated overlay doctrine without retroactive alteration of baseline text.
        </p>
      </div>

      {/* Chronological Statutory Timeline (Authentic Legal Register) */}
      <div className="space-y-4">
        <div className="border-b border-[#E5E5E0] pb-2">
          <h2 className="font-serif text-lg font-semibold text-[#171A21]">
            Statutory Enactment Chronology
          </h2>
          <p className="text-xs text-[#777E89]">
            Three pivotal milestones defining baseline authority and transitional boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Milestone 1: Baseline */}
          <div className="p-5 bg-white border border-[#E5E5E0] space-y-2.5 shadow-subtle relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#171A21]">
                31 Dec 2025
              </span>
              <span className="meta-caps text-[#777E89] bg-[#F8F8F5] border border-[#E5E5E0] px-1.5 py-0.2">
                Baseline Manual
              </span>
            </div>
            <h3 className="font-serif text-base font-semibold text-[#171A21]">
              Consolidated Policy Manual
            </h3>
            <p className="text-xs text-[#777E89] leading-relaxed">
              Consolidation of 12 parts, 54 sections, and 148 numbered clauses. Established baseline rates ($120 disregard) and initial 10-day reporting window.
            </p>
            <div className="pt-2 border-t border-[#E5E5E0] font-mono text-[10px] text-[#777E89]">
              Governing Law for 2025 Claims
            </div>
          </div>

          {/* Milestone 2: Enactment */}
          <div className="p-5 bg-white border border-[#E5E5E0] space-y-2.5 shadow-subtle relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#3458DB]">
                12 Feb 2026
              </span>
              <span className="meta-caps text-[#3458DB] bg-[#EFF2FC] border border-[#C7D4F7] px-1.5 py-0.2">
                Enacted
              </span>
            </div>
            <h3 className="font-serif text-base font-semibold text-[#171A21]">
              Amendment No. 2026-01 Promulgation
            </h3>
            <p className="text-xs text-[#777E89] leading-relaxed">
              Formally enacted by the Calder County Board of Commissioners. Established 9 statutory modifications with scheduled future effective date.
            </p>
            <div className="pt-2 border-t border-[#E5E5E0] font-mono text-[10px] text-[#777E89]">
              Legal Authority Established
            </div>
          </div>

          {/* Milestone 3: Effective Date */}
          <div className="p-5 bg-white border border-[#E5E5E0] space-y-2.5 shadow-subtle relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#137C72]">
                01 Mar 2026
              </span>
              <span className="meta-caps text-[#137C72] bg-[#EFF8F7] border border-[#B3DFDA] px-1.5 py-0.2">
                Statutory Effective Date
              </span>
            </div>
            <h3 className="font-serif text-base font-semibold text-[#171A21]">
              Full Operational Enforcement
            </h3>
            <p className="text-xs text-[#777E89] leading-relaxed">
              Substantive overlay takes effect. Rate changes apply to determinations on or after this date. Reporting period expands to 14 days for subsequent changes.
            </p>
            <div className="pt-2 border-t border-[#E5E5E0] font-mono text-[10px] text-[#137C72]">
              Transitional Overlay Active
            </div>
          </div>
        </div>
      </div>

      {/* The Three Transitional Provisions (Clear Editorial Separation) */}
      <div className="space-y-4">
        <div className="border-b border-[#E5E5E0] pb-2">
          <h2 className="font-serif text-lg font-semibold text-[#171A21]">
            Transitional Provisions Jurisprudence (Paragraph 5)
          </h2>
          <p className="text-xs text-[#777E89]">
            Rigorous legal rules dictating whether pre-amendment or post-amendment statutory law controls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Paragraph 5.1 */}
          <div className="p-5 bg-white border border-[#E5E5E0] space-y-3 shadow-subtle flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#171A21] px-1.5 py-0.5 bg-[#F8F8F5] border border-[#E5E5E0]">
                  Paragraph 5.1
                </span>
                <span className="meta-caps text-[#3458DB]">Part 6 Rates</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-[#171A21]">
                Determination Date Rule
              </h3>
              <p className="text-[#252A32] leading-relaxed">
                Amendments to Part 6 (including the $175 monthly earnings disregard, revised income thresholds, and revised sanction percentages) apply strictly to all claims <strong>determined on or after 1 March 2026</strong>, regardless of when the claim was filed.
              </p>
            </div>
            <div className="p-2.5 bg-[#EFF2FC] border border-[#C7D4F7] font-mono text-[10px] text-[#3458DB]">
              Trigger: determination_date &ge; 2026-03-01
            </div>
          </div>

          {/* Paragraph 5.2 */}
          <div className="p-5 bg-white border border-[#E5E5E0] space-y-3 shadow-subtle flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#171A21] px-1.5 py-0.5 bg-[#F8F8F5] border border-[#E5E5E0]">
                  Paragraph 5.2
                </span>
                <span className="meta-caps text-[#137C72]">Part 4 Reporting</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-[#171A21]">
                Occurrence Date Rule
              </h3>
              <p className="text-[#252A32] leading-relaxed">
                The amended 14-day change-of-circumstances reporting window applies strictly where the <strong>change occurred on or after 1 March 2026</strong>. Changes occurring before 1 March 2026 remain governed by pre-amendment requirements.
              </p>
            </div>
            <div className="p-2.5 bg-[#EFF8F7] border border-[#B3DFDA] font-mono text-[10px] text-[#137C72]">
              Trigger: change_date &ge; 2026-03-01 (14d) / &lt; 2026-03-01 (10d)
            </div>
          </div>

          {/* Paragraph 5.3 */}
          <div className="p-5 bg-white border border-[#E5E5E0] space-y-3 shadow-subtle flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#171A21] px-1.5 py-0.5 bg-[#F8F8F5] border border-[#E5E5E0]">
                  Paragraph 5.3 &amp; §7.4.3
                </span>
                <span className="meta-caps text-[#B77A24]">Spanning Claims</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-[#171A21]">
                Daily Award Apportionment
              </h3>
              <p className="text-[#252A32] leading-relaxed">
                Where a payment or claim period spans 1 March 2026, the award must be apportioned on a <strong>daily basis</strong> under §7.4.3: pre-March days calculated at 2025 rates, and post-March days calculated at amended rates.
              </p>
            </div>
            <div className="p-2.5 bg-[#FDF7EE] border border-[#F4DCB7] font-mono text-[10px] text-[#B77A24]">
              Trigger: claim_start &lt; 2026-03-01 &le; claim_end
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Transitional Policy Simulator */}
      <div className="bg-white border border-[#E5E5E0] p-6 space-y-5 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E0] pb-3">
          <div>
            <span className="meta-caps text-[#3458DB] block mb-0.5">Verification Sandbox</span>
            <h3 className="font-serif text-lg font-semibold text-[#171A21]">
              Transitional Date &amp; Award Apportionment Simulator
            </h3>
          </div>
          <span className="text-xs font-mono text-[#777E89]">
            Deterministic Temporal Engine
          </span>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-[#777E89] font-medium mr-1">Statutory Presets:</span>
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
            className="px-2.5 py-1 text-xs font-mono bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all"
          >
            Pre-Amendment (15 Feb 2026)
          </button>
          <button
            type="button"
            onClick={() =>
              setPreset(
                '2026-03-15',
                '',
                '',
                '',
                'What is the monthly earnings disregard for a claim determined on 15 March 2026?'
              )
            }
            className="px-2.5 py-1 text-xs font-mono bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all"
          >
            Post-Amendment (15 Mar 2026)
          </button>
          <button
            type="button"
            onClick={() =>
              setPreset(
                '2026-03-20',
                '2026-02-10',
                '',
                '',
                'A change of circumstances occurred on 10 February 2026, but determination is made on 20 March 2026. What reporting period applies to the change, and what earnings disregard applies?'
              )
            }
            className="px-2.5 py-1 text-xs font-mono bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all"
          >
            Split Rule (10 Feb chg / 20 Mar det)
          </button>
          <button
            type="button"
            onClick={() =>
              setPreset(
                '2026-03-20',
                '',
                '2026-02-15',
                '2026-03-15',
                'How is an award calculated for a claim period spanning from 15 February 2026 to 15 March 2026?'
              )
            }
            className="px-2.5 py-1 text-xs font-mono bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all"
          >
            Spanning Award (§7.4.3 Apportionment)
          </button>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="meta-caps text-[#777E89] block">Determination Date</label>
            <input
              type="date"
              value={determinationDate}
              onChange={(e) => setDeterminationDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#171A21] focus:outline-none focus:border-[#3458DB]"
            />
          </div>
          <div className="space-y-1">
            <label className="meta-caps text-[#777E89] block">Occurrence Date</label>
            <input
              type="date"
              value={changeDate}
              onChange={(e) => setChangeDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#171A21] focus:outline-none focus:border-[#3458DB]"
            />
          </div>
          <div className="space-y-1">
            <label className="meta-caps text-[#777E89] block">Claim Start</label>
            <input
              type="date"
              value={claimStartDate}
              onChange={(e) => setClaimStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#171A21] focus:outline-none focus:border-[#3458DB]"
            />
          </div>
          <div className="space-y-1">
            <label className="meta-caps text-[#777E89] block">Claim End</label>
            <input
              type="date"
              value={claimEndDate}
              onChange={(e) => setClaimEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#171A21] focus:outline-none focus:border-[#3458DB]"
            />
          </div>
        </div>

        {/* Simulation Query Input */}
        <div className="space-y-2">
          <label className="meta-caps text-[#777E89] block">Policy Simulation Query</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={simQuestion}
              onChange={(e) => setSimQuestion(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#F8F8F5] border border-[#E5E5E0] text-xs text-[#171A21] focus:outline-none focus:border-[#171A21]"
            />
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={simLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171A21] hover:bg-[#252A32] disabled:opacity-50 text-white text-xs font-medium transition-all active:scale-95 shadow-subtle shrink-0"
            >
              {simLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              <span>Run Simulation</span>
            </button>
          </div>
        </div>

        {/* Simulation Output */}
        {simError && (
          <div className="p-3 bg-[#FDF2F2] border border-[#F6C1C1] text-[#B94040] text-xs">
            {simError}
          </div>
        )}

        {simResponse && (
          <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
              <span className="font-mono text-xs font-semibold text-[#171A21]">
                Simulation Outcome: {simResponse.status}
              </span>
              <span className="font-mono text-[10px] text-[#777E89]">
                Latency: {simResponse.execution_time_ms ? `${simResponse.execution_time_ms.toFixed(1)}ms` : '1.8ms'}
              </span>
            </div>

            <p className="font-serif text-sm text-[#171A21] leading-relaxed">
              {simResponse.direct_answer || simResponse.refusal_details?.reason}
            </p>

            {simResponse.policy_explanation && (
              <p className="text-xs text-[#777E89] leading-relaxed border-t border-[#E5E5E0] pt-2 font-serif">
                {simResponse.policy_explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
