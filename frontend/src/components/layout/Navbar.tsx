import React from 'react';
import { Database } from 'lucide-react';
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

  const isHealthy = health?.status === 'ok' || health?.status === 'healthy';
  const activeProvider = config?.active_provider || health?.default_provider || 'mock';

  return (
    <header className="h-13 bg-white/95 backdrop-blur-md border-b border-[#E5E5E0] flex items-center justify-between px-6 z-30 shrink-0 select-none">
      {/* Brand & Specific Editorial Headline */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-[#171A21] text-white flex items-center justify-center font-serif text-sm font-bold tracking-tight shrink-0 select-none">
          §
        </div>
        <div className="flex items-baseline gap-2.5">
          <h1 className="font-serif text-sm font-semibold tracking-tight text-[#171A21] not-italic">
            THE GROUNDED ANSWER
          </h1>
          <span className="text-[#E5E5E0] font-light">&bull;</span>
          <span className="text-xs text-[#555C68] font-normal hidden sm:inline not-italic">
            Calder County Department of Social Services
          </span>
          <span className="tnum font-mono text-[10px] text-[#555C68] border border-[#E5E5E0] px-1.5 py-0.2 bg-[#F8F8F5]">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Operational Controls & Status */}
      <div className="flex items-center gap-3">
        {/* Active Provider Status */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 border border-[#E5E5E0] bg-[#F8F8F5] text-xs">
          <span className="meta-caps text-[#555C68]">Provider</span>
          <span className="font-mono text-xs font-medium text-[#171A21]">
            {activeProvider === 'groq' ? 'Groq (qwen-27b)' : 'Mock (Deterministic)'}
          </span>
        </div>

        {/* Corpus Count Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EFF8F7] border border-[#B3DFDA] text-[#137C72] text-xs">
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span className="tnum font-mono text-xs font-medium">148 Clauses &bull; 9 Amendments</span>
        </div>

        {/* Operational Health Pulse (Visual pulse to confirm connection) */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#E5E5E0]">
          <span className="relative flex h-2 w-2">
            {isHealthy ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#137C72] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#137C72]"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B77A24]"></span>
            )}
          </span>
          <span className="meta-caps text-[#171A21]">
            {isHealthy ? 'Online' : 'Reconnecting'}
          </span>
        </div>
      </div>
    </header>
  );
};
