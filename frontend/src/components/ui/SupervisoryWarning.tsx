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
            className={`p-3.5 border text-xs flex items-start gap-3 shadow-subtle ${
              isSupervisoryGate
                ? 'bg-[#FDF7EE] border-[#F4DCB7] text-[#171A21]'
                : isTransitional
                ? 'bg-[#EFF2FC] border-[#C7D4F7] text-[#171A21]'
                : 'bg-[#F8F8F5] border-[#E5E5E0] text-[#171A21]'
            }`}
          >
            {isSupervisoryGate ? (
              <ShieldAlert className="w-4 h-4 text-[#B77A24] shrink-0 mt-0.5" />
            ) : isTransitional ? (
              <Clock className="w-4 h-4 text-[#3458DB] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#777E89] shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 flex-1">
              <span className={`meta-caps block ${
                isSupervisoryGate
                  ? 'text-[#B77A24]'
                  : isTransitional
                  ? 'text-[#3458DB]'
                  : 'text-[#777E89]'
              }`}>
                {isSupervisoryGate
                  ? 'Mandatory Supervisory Referral Gate (§2.3.2)'
                  : isTransitional
                  ? 'Transitional Rule Notice'
                  : 'Casework Advisory Warning'}
              </span>
              <p className="leading-relaxed text-xs text-[#252A32]">{warn}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
