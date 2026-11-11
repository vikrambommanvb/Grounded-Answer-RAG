import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';

interface TemporalControlsProps {
  determinationDate: string;
  changeDate: string;
  claimStartDate: string;
  claimEndDate: string;
  onDeterminationDateChange: (date: string) => void;
  onChangeDateChange: (date: string) => void;
  onClaimStartDateChange: (date: string) => void;
  onClaimEndDateChange: (date: string) => void;
  onClear: () => void;
}

export const TemporalControls: React.FC<TemporalControlsProps> = ({
  determinationDate,
  changeDate,
  claimStartDate,
  claimEndDate,
  onDeterminationDateChange,
  onChangeDateChange,
  onClaimStartDateChange,
  onClaimEndDateChange,
  onClear,
}) => {
  const hasActiveDates =
    !!determinationDate || !!changeDate || !!claimStartDate || !!claimEndDate;

  const setPreset = (
    det: string = '',
    chg: string = '',
    start: string = '',
    end: string = ''
  ) => {
    onDeterminationDateChange(det);
    onChangeDateChange(chg);
    onClaimStartDateChange(start);
    onClaimEndDateChange(end);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
            Casework Temporal Context Parameters
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            Guards Against Date Assumption
          </span>
        </div>
        {hasActiveDates && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 hover:underline transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear Dates
          </button>
        )}
      </div>

      {/* Date Pickers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Determination Date
          </label>
          <input
            type="date"
            value={determinationDate}
            onChange={(e) => onDeterminationDateChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <span className="block text-[10px] text-slate-500 mt-1">
            Governs Part 6 rates & sanctions (Para 5.1)
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Change Occurrence Date
          </label>
          <input
            type="date"
            value={changeDate}
            onChange={(e) => onChangeDateChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <span className="block text-[10px] text-slate-500 mt-1">
            Governs §4.3.2 reporting period (Para 5.2)
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Claim Start Date
          </label>
          <input
            type="date"
            value={claimStartDate}
            onChange={(e) => onClaimStartDateChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <span className="block text-[10px] text-slate-500 mt-1">
            For spanning periods (Para 5.3)
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Claim End Date
          </label>
          <input
            type="date"
            value={claimEndDate}
            onChange={(e) => onClaimEndDateChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <span className="block text-[10px] text-slate-500 mt-1">
            Triggers §7.4.3 daily apportionment
          </span>
        </div>
      </div>

      {/* Preset Scenario Buttons */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-500 font-medium mr-1">Casework Scenarios:</span>
        <button
          type="button"
          onClick={() => setPreset('2026-02-15')}
          className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors"
        >
          Pre-Amendment (15 Feb 2026)
        </button>
        <button
          type="button"
          onClick={() => setPreset('2026-03-15')}
          className="text-xs px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-colors"
        >
          Post-Amendment (15 Mar 2026)
        </button>
        <button
          type="button"
          onClick={() => setPreset('2026-03-20', '2026-02-10')}
          className="text-xs px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 transition-colors"
        >
          Transitional Split (Para 5.1 vs 5.2)
        </button>
        <button
          type="button"
          onClick={() => setPreset('', '', '2026-02-15', '2026-03-15')}
          className="text-xs px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 transition-colors"
        >
          Spanning Claim Apportionment (Para 5.3)
        </button>
      </div>
    </div>
  );
};
