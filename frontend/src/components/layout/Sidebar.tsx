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
  { name: 'Casework Assistant', path: '/assistant', icon: MessageSquareText, badge: 'Core', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Policy Explorer', path: '/explorer', icon: BookOpen, badge: '12 Parts' },
  { name: 'Timeline & Amendments', path: '/timeline', icon: History, badge: 'No. 2026-01', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Benchmark Evaluation', path: '/evaluation', icon: FileCheck2, badge: '10 Tests' },
  { name: 'Source Documents', path: '/documents', icon: FileText },
  { name: 'Settings & Config', path: '/settings', icon: Sliders },
  { name: 'About & Methodology', path: '/about', icon: Info },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-50/80 border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Casework Platform
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-700 border border-blue-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
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

        {/* Temporal Quick Status Notice */}
        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <span>Temporal Policy Rules</span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
            <p className="flex items-center justify-between">
              <span className="text-slate-500">Baseline Manual:</span>
              <span className="font-mono font-medium text-slate-800">31 Dec 2025</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="text-slate-500">Amendment:</span>
              <span className="font-mono font-medium text-emerald-700">01 Mar 2026</span>
            </p>
            <p className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
              Paras 5.1 (rates), 5.2 (reporting), 5.3 (spanning claim apportionment).
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between bg-white">
        <span>Calder County DSS</span>
        <span className="flex items-center gap-1 font-mono text-[10px] text-blue-600 font-semibold">
          <ShieldCheck className="w-3 h-3" />
          Verified
        </span>
      </div>
    </aside>
  );
};
