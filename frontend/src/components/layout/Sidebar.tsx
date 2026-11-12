import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  BookOpen,
  History,
  FileCheck2,
  FileText,
  Sliders,
  Info,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Casework Assistant', path: '/assistant', icon: MessageSquareText, badge: 'Core', badgeColor: 'bg-[#EFF2FC] text-[#3458DB] border-[#C7D4F7]' },
  { name: 'Policy Explorer', path: '/explorer', icon: BookOpen, badge: '12 Parts' },
  { name: 'Timeline & Amendments', path: '/timeline', icon: History, badge: 'No. 2026-01', badgeColor: 'bg-[#EFF8F7] text-[#137C72] border-[#B3DFDA]' },
  { name: 'Benchmark Evaluation', path: '/evaluation', icon: FileCheck2, badge: '10 Tests' },
  { name: 'Source Documents', path: '/documents', icon: FileText },
  { name: 'Settings & Config', path: '/settings', icon: Sliders },
  { name: 'About & Methodology', path: '/about', icon: Info },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-60 bg-white border-r border-[#E5E5E0] flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-5">
        <div>
          <p className="px-3 meta-caps text-[#777E89] mb-2">
            Navigation
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#F8F8F5] text-[#171A21] font-semibold border-l-2 border-[#171A21] -ml-px pl-[11px]'
                        : 'text-[#777E89] hover:text-[#171A21] hover:bg-[#F8F8F5]/80 border-l-2 border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 text-[#777E89]" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 border ${
                        item.badgeColor || 'bg-[#F8F8F5] text-[#777E89] border-[#E5E5E0]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Temporal Policy Overlay Ledger */}
        <div className="p-3 bg-[#F8F8F5] border border-[#E5E5E0] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171A21]">
            <CalendarDays className="w-3.5 h-3.5 text-[#3458DB]" />
            <span className="font-serif tracking-tight">Temporal Rules</span>
          </div>
          <div className="text-[11px] text-[#252A32] space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#777E89]">Baseline:</span>
              <span className="font-medium">31 Dec 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#777E89]">Amendment:</span>
              <span className="font-medium text-[#137C72]">01 Mar 2026</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#777E89]">Apportion:</span>
              <span className="font-medium text-[#B77A24]">§7.4.3 Daily</span>
            </div>
          </div>
          <p className="text-[10px] text-[#777E89] pt-1.5 border-t border-[#E5E5E0] leading-tight">
            Para 5.1 (determination), Para 5.2 (occurrence), Para 5.3 (split awards).
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#E5E5E0] text-[10px] text-[#777E89] flex items-center justify-between bg-white font-mono">
        <span>CALDER COUNTY DSS</span>
        <span className="flex items-center gap-1 text-[#137C72] font-semibold">
          <ShieldCheck className="w-3 h-3" />
          VERIFIED
        </span>
      </div>
    </aside>
  );
};
