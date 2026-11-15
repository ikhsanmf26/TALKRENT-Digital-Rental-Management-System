import React from 'react';
import { Menu, Plus, MessageCircle, ExternalLink, RefreshCw, Globe } from 'lucide-react';

interface TopbarProps {
  currentTab: string;
  onOpenMobile: () => void;
  onQuickAction?: (action: string) => void;
  onRefreshData?: () => void;
  onOpenPublicAccess?: () => void;
  isLoading?: boolean;
}

const tabTitles: Record<string, string> = {
  dashboard: 'Dashboard Operasional',
  inventory: 'Inventaris Handy Talkie',
  customers: 'Data Pelanggan',
  bookings: 'Jadwal & Booking',
  rentals: 'Transaksi Penyewaan',
  returns: 'Penerimaan Pengembalian',
  finances: 'Manajemen Keuangan',
  maintenance: 'Perawatan & Servis',
  reports: 'Laporan Bisnis & Analitik',
  settings: 'Pengaturan Bisnis',
  architecture: 'Integrasi Database & Android',
};

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onOpenMobile,
  onQuickAction,
  onRefreshData,
  onOpenPublicAccess,
  isLoading
}) => {
  const pageTitle = tabTitles[currentTab] || 'TALKRENT';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 relative">
      {/* Top brand accent border matching logo colors */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0B2D5B] via-[#FF8C00] to-[#4DA3FF]" />

      {/* Left: Mobile hamburger & clean single-line title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Live Radio Signal Status matching logo radio wave theme */}
      <div className="hidden xl:flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-3.5 py-1.5 shadow-2xs">
        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF8C00] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF8C00]" />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="font-bold text-[#0B2D5B]">UHF 400-470 MHz</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">16 CH WLN ACTIVE</span>
        </div>
        {/* Signal strength indicator */}
        <div className="flex items-end gap-0.5 h-3 ml-1" title="Sinyal Radio: High Power 100%">
          <span className="w-1 h-1 bg-[#FF8C00] rounded-2xs" />
          <span className="w-1 h-1.5 bg-[#FF8C00] rounded-2xs" />
          <span className="w-1 h-2 bg-[#FF8C00] rounded-2xs" />
          <span className="w-1 h-2.5 bg-[#0B2D5B] rounded-2xs" />
          <span className="w-1 h-3 bg-[#0B2D5B] rounded-2xs" />
        </div>
      </div>

      {/* Right: Quick actions & status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isLoading}
            title="Muat Ulang Data"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#FF8C00]' : ''}`} />
          </button>
        )}

        <a
          href="https://wa.me/6287861608958?text=Halo%20Admin%20TALKRENT%20Tasikmalaya"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors whitespace-nowrap"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>WA: 0878-6160-8958</span>
          <ExternalLink className="h-3 w-3 text-emerald-500" />
        </a>

        {onOpenPublicAccess && (
          <button
            onClick={onOpenPublicAccess}
            className="flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#0B2D5B] hover:bg-sky-100 transition-colors whitespace-nowrap shadow-2xs"
            title="Lihat Link Publik dan QR Code untuk dibagikan ke orang lain"
          >
            <Globe className="h-3.5 w-3.5 text-[#FF8C00] animate-pulse" />
            <span className="hidden sm:inline">Akses Publik</span>
            <span className="sm:hidden">Share</span>
          </button>
        )}

        {onQuickAction && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickAction('new_rental')}
              className="flex items-center gap-1.5 rounded-lg bg-[#FF8C00] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#e67e00] transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Sewa Baru</span>
            </button>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src="/admin_logo.png"
            alt="Logo Admin DKC"
            className="h-8 w-8 rounded-full object-contain bg-white p-0.5 border border-slate-200 shadow-xs"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
