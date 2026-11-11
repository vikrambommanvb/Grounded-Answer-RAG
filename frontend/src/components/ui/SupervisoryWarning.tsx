import React from 'react';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

interface SupervisoryWarningProps {
  warnings: string[];
}

export const SupervisoryWarning: React.FC<SupervisoryWarningProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((warn, index) => {
        const isSupervisoryGate =
          warn.toLowerCase().includes('supervisor') || warn.includes('§2.3.2');
        const isTransitional =
          warn.toLowerCase().includes('transitional') ||
          warn.toLowerCase().includes('spanning') ||
          warn.toLowerCase().includes('paragraph 5');

        return (
          <div
            key={index}
            className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 shadow-xs ${
              isSupervisoryGate
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : isTransitional
                ? 'bg-blue-50 border-blue-200 text-blue-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {isSupervisoryGate ? (
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : isTransitional ? (
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 flex-1">
              <span className="font-semibold uppercase tracking-wider text-[10px] block opacity-90">
                {isSupervisoryGate
                  ? 'Mandatory Supervisory Referral Gate (§2.3.2)'
                  : isTransitional
                  ? 'Transitional Rule Notice'
                  : 'Casework Advisory Warning'}
              </span>
              <p className="leading-relaxed text-xs">{warn}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
