import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Users,
  CalendarCheck,
  Repeat,
  RotateCcw,
  Wallet,
  Wrench,
  FileText,
  Settings,
  Database,
  LogOut,
  X,
  PhoneCall
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventaris HT', icon: Radio },
  { id: 'customers', label: 'Pelanggan', icon: Users },
  { id: 'bookings', label: 'Booking', icon: CalendarCheck },
  { id: 'rentals', label: 'Penyewaan', icon: Repeat },
  { id: 'returns', label: 'Pengembalian', icon: RotateCcw },
  { id: 'finances', label: 'Keuangan', icon: Wallet },
  { id: 'maintenance', label: 'Perawatan', icon: Wrench },
  { id: 'reports', label: 'Laporan', icon: FileText },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
  { id: 'architecture', label: 'Database & Android', icon: Database },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  onLogout
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0B2D5B] text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center">
              <img
                src="/talkrent_logo.png"
                alt="TALKRENT Official Logo"
                className="h-12 w-12 object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white leading-tight">
                TALKRENT
              </div>
              <div className="text-[11px] text-[#4DA3FF] font-medium leading-tight">
                Your Communication Partner
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Business Subtitle */}
        <div className="border-b border-white/5 bg-black/15 px-5 py-2 text-[11px] text-slate-300">
          Kabupaten Tasikmalaya · Rental HT WLN
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF8C00] text-white shadow-sm'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Radio Transceiver Telemetry matching TALKRENT Logo */}
        <div className="mx-3 my-2 rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-black/25 p-3 text-xs relative overflow-hidden shadow-xs">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-[#FF8C00]/15 pointer-events-none blur-xs" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#FF8C00] font-bold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8C00] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF8C00]" />
              </span>
              <span>RADIO TRANSCEIVER</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#4DA3FF]">WLN UHF</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>Kanal Siar:</span>
            <span className="font-bold text-white">16 Saluran</span>
          </div>
          <div className="mt-0.5 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>Jangkauan:</span>
            <span className="font-bold text-white">1 - 5 KM</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <PhoneCall className="h-3 w-3 text-emerald-400" />
              <span>0878-6160-8958</span>
            </span>
            <span className="text-[#FF8C00] font-semibold">Tasikmalaya</span>
          </div>
        </div>

        {/* Admin Profile & Logout */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-black/20 p-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/admin_logo.png"
                alt="Logo Admin"
                className="h-9 w-9 shrink-0 rounded-full object-contain bg-white p-0.5 border border-white/20 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <div className="truncate text-xs font-semibold text-white">Admin TALKRENT</div>
                <div className="text-[10px] text-emerald-400">Online · Session Aktif</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout Sistem"
              className="rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
