import React from 'react';
import {
  Info,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  History,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold mb-1">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Policy Doctrine & Methodology</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          About The Grounded Answer
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Design doctrine, statutory gap handling, amendment architecture, and refusal standards.
        </p>
      </div>

      {/* Core Doctrine */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">
            1. The Single Source of Truth Doctrine
          </h2>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          The Grounded Answer is engineered exclusively for Calder County Household Support Program caseworkers.
          Unlike conversational AI models that guess or extrapolate from generic social welfare concepts, this system
          treats the consolidated Policy Manual and Amendment No. 2026-01 as the sole and exhaustive authority.
          If a rule or figure is not written in the official text, the system is architected to refuse to provide an answer.
        </p>
      </div>

      {/* Doctrine of Refusal */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-bold text-slate-900">
            2. The Doctrine of Responsible Refusal
          </h2>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          In public assistance administration, an incorrect benefit figure or fabricated deadline directly harms applicants
          and creates catastrophic audit liability. The Grounded Answer implements an automated Refusal Engine that actively
          screens every query before generating text. Queries are refused under five strict categories:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-red-700">APPARENT_GAP</span>
            <p className="text-slate-600">Surfaces drafting omissions where the manual points to a section that does not contain the rule.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-red-700">INTERNAL_CONFLICT</span>
            <p className="text-slate-600">Surfaces irreconcilable statutory rules within the manual (e.g. §4.3.2 vs §9.1.4).</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-blue-700">MISSING_TEMPORAL_DATA</span>
            <p className="text-slate-600">Refuses rate queries where dates are missing, preventing the assistant from assuming today&apos;s date.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono font-bold text-slate-700">OUT_OF_SCOPE</span>
            <p className="text-slate-600">Refuses commercial grants, immigration, or unrelated federal programs.</p>
          </div>
        </div>
      </div>

      {/* Challenge Traps Analysis */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">
            3. Specific Challenge Traps Surfaced & Handled
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1.5">
            <h3 className="font-bold text-amber-950">
              The Full-Time Student Gap Trap (§7.1.3 &rarr; §5.4)
            </h3>
            <p>
              In §7.1.3, the manual states: <em>&ldquo;except in the case of full-time students (see §5.4)&rdquo;</em>. However,
              upon inspecting §5.4, that section exclusively governs Care Allowances. No student calculation rules exist anywhere
              in the Policy Manual. Generic LLMs fabricate formulas; The Grounded Answer refuses with <code>APPARENT_GAP</code> and
              instructs the caseworker to refer the case to County Policy Leadership.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-red-50/60 border border-red-200 space-y-1.5">
            <h3 className="font-bold text-red-950">
              The Pre-Amendment Reporting Deadline Inconsistency (§4.3.2 vs §9.1.4)
            </h3>
            <p>
              In the pre-amendment consolidated manual, §4.3.2 mandates that recipients report changes within 10 calendar days.
              However, §9.1.4 states that no overpayment shall be established if reported within the <em>&ldquo;30 calendar days required under §4.3&rdquo;</em>.
              This direct statutory contradiction is refused with <code>INTERNAL_CONFLICT</code> for pre-March 2026 events.
            </p>
          </div>
        </div>
      </div>

      {/* Effective-Dated Overlay Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            4. Effective-Dated Amendment Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Amendment No. 2026-01 is implemented as an effective-dated overlay, never as a destructive replacement for the original text.
          Transitional provisions are strictly enforced:
        </p>
        <ul className="text-xs text-slate-700 space-y-2 list-disc pl-5">
          <li>
            <strong>Paragraph 5.1:</strong> Earnings disregard ($175), income thresholds, and sanction rates (15%) apply to determinations made on or after 1 March 2026, including claims for prior periods.
          </li>
          <li>
            <strong>Paragraph 5.2:</strong> 14-day reporting period applies only to changes occurring on or after 1 March 2026. Pre-March changes retain the earlier reporting rule regardless of determination date.
          </li>
          <li>
            <strong>Paragraph 5.3:</strong> Claims spanning 1 March 2026 are apportioned on a daily basis by reference to days under §7.4.3.
          </li>
        </ul>
      </div>
    </div>
  );
};
