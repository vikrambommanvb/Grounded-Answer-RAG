import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Casework Assistant', path: '/assistant', icon: MessageSquareText },
  { name: 'Policy Explorer', path: '/explorer', icon: BookOpen },
  { name: 'Timeline & Amendments', path: '/timeline', icon: History },
  { name: 'Benchmark Evaluation', path: '/evaluation', icon: FileCheck2 },
  { name: 'Source Documents', path: '/documents', icon: FileText },
  { name: 'Settings & Config', path: '/settings', icon: Sliders },
  { name: 'About & Methodology', path: '/about', icon: Info },
];

interface SidebarProps {
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  const location = useLocation();

  const renderNavContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full">
      <div className="p-3.5 space-y-5 overflow-y-auto">
        {/* Mobile drawer header with close button */}
        {isMobile && (
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#171A21] text-white flex items-center justify-center font-serif text-xs font-bold">
                §
              </div>
              <span className="font-serif text-xs font-semibold tracking-tight text-[#171A21]">
                THE GROUNDED ANSWER
              </span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 text-[#555C68] hover:text-[#171A21] border border-[#E5E5E0] bg-[#F8F8F5] active:scale-[0.97]"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <p className="px-3 meta-caps text-[#555C68] mb-2 not-italic">
            Navigation
          </p>
          <nav className="space-y-0.5 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={isMobile ? onCloseMobile : undefined}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-all active:scale-[0.97] pressable ${
                    isActive
                      ? 'text-[#171A21] font-semibold'
                      : 'text-[#555C68] hover:text-[#171A21] hover:bg-[#F8F8F5]/80'
                  }`}
                >
                  {/* Shared Layout Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId={isMobile ? 'mobileSidebarIndicator' : 'sidebarActiveIndicator'}
                      className="absolute inset-0 bg-[#F8F8F5] border-l-2 border-[#171A21] -z-10"
                      transition={{ type: 'spring', bounce: 0, duration: 0.22 }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0 text-[#555C68]" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Temporal Policy Overlay Ledger */}
        <div className="p-3.5 bg-[#F8F8F5] border border-[#E5E5E0] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171A21]">
            <CalendarDays className="w-3.5 h-3.5 text-[#3458DB]" />
            <span className="font-serif tracking-tight not-italic">Temporal Jurisdiction</span>
          </div>
          <div className="text-[11px] text-[#252A32] space-y-1 font-mono tnum">
            <div className="flex items-center justify-between">
              <span className="text-[#555C68]">Baseline:</span>
              <span className="font-medium">31 Dec 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#555C68]">Amendment:</span>
              <span className="font-medium text-[#137C72]">01 Mar 2026</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#555C68]">Apportionment:</span>
              <span className="font-medium text-[#B77A24]">§7.4.3 Daily</span>
            </div>
          </div>
          <p className="text-[10px] text-[#555C68] pt-2 border-t border-[#E5E5E0] leading-relaxed">
            Para 5.1 (determination), Para 5.2 (occurrence), Para 5.3 (spanning split).
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#E5E5E0] text-[10px] text-[#555C68] flex items-center justify-between bg-white font-mono tnum shrink-0">
        <span>CALDER COUNTY DSS</span>
        <span className="flex items-center gap-1 text-[#137C72] font-semibold">
          <ShieldCheck className="w-3 h-3" />
          VERIFIED
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-[#E5E5E0] flex-col justify-between shrink-0 select-none">
        {renderNavContent(false)}
      </aside>

      {/* Mobile/Tablet Off-Canvas Sliding Drawer (< 1024px) */}
      <AnimatePresence>
        {isOpenOnMobile && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden flex">
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-[#171A21]/50 backdrop-blur-xs"
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                type: 'spring',
                bounce: 0,
                damping: 30,
                stiffness: 300,
              }}
              className="relative w-72 max-w-[85vw] bg-white h-full border-r border-[#E5E5E0] shadow-floating flex flex-col z-10 select-none"
            >
              {renderNavContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
