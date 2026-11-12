import React from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  History,
  Scale,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Editorial Masthead */}
      <div className="border-b border-[#E5E5E0] pb-5 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="meta-caps text-[#777E89] block mb-1">
              Casework Doctrine &bull; Policy Jurisprudence
            </span>
            <h1 className="font-serif text-3xl font-semibold text-[#171A21] tracking-tight">
              About The Grounded Answer
            </h1>
          </div>
          <span className="font-mono text-xs text-[#137C72] bg-[#EFF8F7] border border-[#B3DFDA] px-2.5 py-1">
            System Methodology &amp; Doctrine
          </span>
        </div>
        <p className="font-serif text-sm text-[#777E89] max-w-3xl leading-relaxed">
          The Grounded Answer is an evidence-grounded policy intelligence assistant built for Calder County Household Support Program caseworkers.
          Here we articulate the core doctrines governing statutory fidelity, responsible refusal, and temporal resolution.
        </p>
      </div>

      <div className="space-y-6">
        {/* Doctrine 1: Single Source of Truth */}
        <div className="bg-white border border-[#E5E5E0] p-6 space-y-3.5 shadow-subtle">
          <div className="flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
            <ShieldCheck className="w-5 h-5 text-[#137C72]" />
            <h2 className="font-serif text-lg font-semibold text-[#171A21]">
              1. The Single Source of Truth Doctrine
            </h2>
          </div>
          <div className="font-serif text-sm text-[#252A32] leading-relaxed space-y-2">
            <p>
              In public assistance administration, generic LLM extrapolation or guessing leads directly to erroneous benefit awards and audit disallowances.
              The Grounded Answer treats the official Calder County Household Support Program Policy Manual (31 December 2025) and Amendment No. 2026-01 (1 March 2026) as the <strong>exclusive, exhaustive authority</strong>.
            </p>
            <p className="text-[#777E89] text-xs font-sans">
              If an operational rule, disregard figure, or deadline is not codified in verbatim statutory text, the engine refuses to answer rather than speculating.
            </p>
          </div>
        </div>

        {/* Doctrine 2: The Doctrine of Responsible Refusal */}
        <div className="bg-white border border-[#E5E5E0] p-6 space-y-4 shadow-subtle">
          <div className="flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
            <AlertOctagon className="w-5 h-5 text-[#B94040]" />
            <h2 className="font-serif text-lg font-semibold text-[#171A21]">
              2. The Doctrine of Responsible Refusal
            </h2>
          </div>
          <p className="font-serif text-sm text-[#252A32] leading-relaxed">
            A refusal is not a system failure. In legal and regulatory casework, a calibrated refusal is the highest standard of correctness when statutory text is insufficient, ambiguous, or contradictory.
            The engine implements five structured refusal categories:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-[#FDF2F2] border border-[#F6C1C1] space-y-1">
              <span className="font-mono font-bold text-[#B94040]">APPARENT_GAP</span>
              <p className="text-[#252A32] leading-relaxed">
                Triggered when the manual contains a drafting omission (e.g. cross-referencing a section that does not exist or does not provide the referenced rule).
              </p>
            </div>

            <div className="p-4 bg-[#FDF2F2] border border-[#F6C1C1] space-y-1">
              <span className="font-mono font-bold text-[#B94040]">INTERNAL_CONFLICT</span>
              <p className="text-[#252A32] leading-relaxed">
                Triggered when two sections of the governing text establish contradictory requirements that cannot be harmonized without administrative discretion.
              </p>
            </div>

            <div className="p-4 bg-[#EFF2FC] border border-[#C7D4F7] space-y-1">
              <span className="font-mono font-bold text-[#3458DB]">MISSING_TEMPORAL_DATA</span>
              <p className="text-[#252A32] leading-relaxed">
                Triggered when a rate or deadline query lacks determination or occurrence dates, preventing the assistant from assuming today&apos;s date.
              </p>
            </div>

            <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-1">
              <span className="font-mono font-bold text-[#171A21]">OUT_OF_SCOPE</span>
              <p className="text-[#252A32] leading-relaxed">
                Triggered when an inquiry concerns commercial grants, foreign programs, or non-welfare matters outside Calder County DSS authority.
              </p>
            </div>
          </div>
        </div>

        {/* Doctrine 3: Challenge Traps Jurisprudence */}
        <div className="bg-white border border-[#E5E5E0] p-6 space-y-4 shadow-subtle">
          <div className="flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
            <Scale className="w-5 h-5 text-[#B77A24]" />
            <h2 className="font-serif text-lg font-semibold text-[#171A21]">
              3. Challenge Traps Resolution
            </h2>
          </div>

          <div className="space-y-4 text-xs text-[#252A32]">
            {/* Trap 1 */}
            <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#B94040]">
                  Trap 1: Full-Time Student Gap (§7.1.3 &rarr; §5.4)
                </span>
                <span className="meta-caps text-[#B94040] bg-[#FDF2F2] border border-[#F6C1C1] px-1.5 py-0.2">
                  Apparent Gap
                </span>
              </div>
              <p className="text-[#777E89] leading-relaxed">
                Section 7.1.3 states: <em>&quot;except in the case of full-time students (see §5.4)&quot;</em>. However, Section 5.4 exclusively governs Care Allowances and contains zero rules for students. A generic LLM hallucinates an answer; The Grounded Answer executes a deterministic refusal instructing referral to Policy Leadership.
              </p>
            </div>

            {/* Trap 2 */}
            <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#B94040]">
                  Trap 2: Pre-Amendment Reporting Contradiction (§4.3.2 vs §9.1.4)
                </span>
                <span className="meta-caps text-[#B94040] bg-[#FDF2F2] border border-[#F6C1C1] px-1.5 py-0.2">
                  Internal Conflict
                </span>
              </div>
              <p className="text-[#777E89] leading-relaxed">
                Prior to Amendment No. 2026-01, §4.3.2 required change reporting within 10 days, while §9.1.4 created a 30-day safe harbor. For pre-March 2026 changes, the engine refuses with INTERNAL_CONFLICT and alerts the caseworker to consult supervisory leadership.
              </p>
            </div>

            {/* Trap 3 */}
            <div className="p-4 bg-[#F8F8F5] border border-[#E5E5E0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#B77A24]">
                  Trap 3: Under-18 Supervisory Referral Gate (§2.3.1 &amp; §2.3.2)
                </span>
                <span className="meta-caps text-[#B77A24] bg-[#FDF7EE] border border-[#F4DCB7] px-1.5 py-0.2">
                  Supervisory Warning Gate
                </span>
              </div>
              <p className="text-[#777E89] leading-relaxed">
                An independent 16-year-old can qualify under §2.3.1, but §2.3.2 mandates immediate supervisory review. The system answers affirmatively while generating a prominent amber supervisory referral warning.
              </p>
            </div>
          </div>
        </div>

        {/* Doctrine 4: Effective-Dated Temporal Architecture */}
        <div className="bg-white border border-[#E5E5E0] p-6 space-y-3.5 shadow-subtle">
          <div className="flex items-center gap-2 border-b border-[#E5E5E0] pb-3">
            <History className="w-5 h-5 text-[#3458DB]" />
            <h2 className="font-serif text-lg font-semibold text-[#171A21]">
              4. Effective-Dated Temporal Architecture
            </h2>
          </div>
          <div className="font-serif text-sm text-[#252A32] leading-relaxed space-y-2">
            <p>
              Amendment No. 2026-01 is implemented as an effective-dated overlay. Historical text is never erased, ensuring retroactive audits and historical appeals can be adjudicated with 100% legal fidelity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono font-normal">
              <div className="p-3 bg-[#F8F8F5] border border-[#E5E5E0]">
                <strong className="text-[#171A21] block mb-1">Para 5.1: Rates</strong>
                Determination date &ge; 1 Mar 2026 gets $175 disregard.
              </div>
              <div className="p-3 bg-[#F8F8F5] border border-[#E5E5E0]">
                <strong className="text-[#171A21] block mb-1">Para 5.2: Reporting</strong>
                Occurrence date &ge; 1 Mar 2026 gets 14-day reporting window.
              </div>
              <div className="p-3 bg-[#F8F8F5] border border-[#E5E5E0]">
                <strong className="text-[#171A21] block mb-1">Para 5.3: Spanning</strong>
                §7.4.3 Daily rate apportionment for periods crossing 1 Mar 2026.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
