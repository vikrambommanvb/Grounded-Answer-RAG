import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: 'top center' }}
      className="bg-white border border-[#E5E5E0] p-4 space-y-4 shadow-subtle"
    >
      {/* Header & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E0] pb-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#3458DB]" />
          <h3 className="meta-caps text-[#171A21]">
            Temporal Context Parameters
          </h3>
          <span className="font-mono text-[9px] text-[#555C68] bg-[#F8F8F5] border border-[#E5E5E0] px-1.5 py-0.2">
            No Date Assumption
          </span>
        </div>
        {hasActiveDates && (
          <button
            type="button"
            onClick={onClear}
            className="pressable inline-flex items-center gap-1 text-[11px] text-[#555C68] hover:text-[#171A21] transition-colors active:scale-[0.97]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Dates</span>
          </button>
        )}
      </div>

      {/* Date Input Fields Grid (Grouped with spacing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Determination Date */}
        <div className="space-y-1.5">
          <label className="meta-caps text-[#555C68] block">
            Determination Date
          </label>
          <input
            type="date"
            value={determinationDate}
            onChange={(e) => onDeterminationDateChange(e.target.value)}
            className="tnum w-full px-2.5 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#171A21] focus:outline-none focus:border-[#171A21] focus:bg-white transition-colors"
          />
          <span className="text-[10px] text-[#555C68] block font-mono">Part 6 rates (Para 5.1)</span>
        </div>

        {/* Change of Circumstances Date */}
        <div className="space-y-1.5">
          <label className="meta-caps text-[#555C68] block">
            Occurrence Date
          </label>
          <input
            type="date"
            value={changeDate}
            onChange={(e) => onChangeDateChange(e.target.value)}
            className="tnum w-full px-2.5 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#171A21] focus:outline-none focus:border-[#171A21] focus:bg-white transition-colors"
          />
          <span className="text-[10px] text-[#555C68] block font-mono">Reporting window (Para 5.2)</span>
        </div>

        {/* Claim Start Date */}
        <div className="space-y-1.5">
          <label className="meta-caps text-[#555C68] block">
            Claim Start Date
          </label>
          <input
            type="date"
            value={claimStartDate}
            onChange={(e) => onClaimStartDateChange(e.target.value)}
            className="tnum w-full px-2.5 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#171A21] focus:outline-none focus:border-[#171A21] focus:bg-white transition-colors"
          />
          <span className="text-[10px] text-[#555C68] block font-mono">Spanning start point</span>
        </div>

        {/* Claim End Date */}
        <div className="space-y-1.5">
          <label className="meta-caps text-[#555C68] block">
            Claim End Date
          </label>
          <input
            type="date"
            value={claimEndDate}
            onChange={(e) => onClaimEndDateChange(e.target.value)}
            className="tnum w-full px-2.5 py-1.5 bg-[#F8F8F5] border border-[#E5E5E0] text-xs font-mono text-[#171A21] focus:outline-none focus:border-[#171A21] focus:bg-white transition-colors"
          />
          <span className="text-[10px] text-[#555C68] block font-mono">§7.4.3 Apportionment split</span>
        </div>
      </div>

      {/* Date Presets with Scale 0.97 on Press */}
      <div className="pt-2.5 border-t border-[#E5E5E0] flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-[#555C68] font-medium mr-1 font-mono uppercase">Case Presets:</span>
        <button
          type="button"
          onClick={() => setPreset('2026-02-15')}
          className="pressable px-2.5 py-1 text-[11px] font-mono tnum bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all active:scale-[0.97]"
        >
          Pre-Amendment (15 Feb 2026)
        </button>
        <button
          type="button"
          onClick={() => setPreset('2026-03-15')}
          className="pressable px-2.5 py-1 text-[11px] font-mono tnum bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all active:scale-[0.97]"
        >
          Post-Amendment (15 Mar 2026)
        </button>
        <button
          type="button"
          onClick={() => setPreset('2026-03-20', '2026-02-10')}
          className="pressable px-2.5 py-1 text-[11px] font-mono tnum bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all active:scale-[0.97]"
        >
          Transitional Split (10 Feb chg / 20 Mar det)
        </button>
        <button
          type="button"
          onClick={() => setPreset('', '', '2026-02-15', '2026-03-15')}
          className="pressable px-2.5 py-1 text-[11px] font-mono tnum bg-[#F8F8F5] hover:bg-white border border-[#E5E5E0] hover:border-[#3458DB] text-[#171A21] transition-all active:scale-[0.97]"
        >
          Spanning Claim (15 Feb – 15 Mar)
        </button>
      </div>
    </motion.div>
  );
};
