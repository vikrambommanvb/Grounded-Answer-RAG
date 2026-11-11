import React from 'react';
import { ShieldCheck, Cpu, Database } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealth, fetchSystemConfig } from '../../services/api';

export const Navbar: React.FC = () => {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30000,
  });

  const { data: config } = useQuery({
    queryKey: ['systemConfig'],
    queryFn: fetchSystemConfig,
  });

  const isHealthy = health?.status === 'healthy';
  const activeProvider = config?.active_provider || health?.default_provider || 'mock';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-700">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
              THE GROUNDED ANSWER
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-blue-700 font-medium">
              v1.0.0
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Calder County Household Support Program &bull; Evidence-Grounded Policy Intelligence
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model Provider Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500">Provider:</span>
          <span className="font-mono font-medium text-slate-800">
            {activeProvider === 'groq' ? 'Groq (70B)' : 'Mock (Deterministic)'}
          </span>
        </div>

        {/* Corpus Verified Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>148 Clauses</span>
        </div>

        {/* Operational Status Dot */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <span className="relative flex h-2 w-2">
            {isHealthy ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            )}
          </span>
          <span className="text-xs font-medium text-slate-700">
            {isHealthy ? 'Online' : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};
