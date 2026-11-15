import React, { useState, useEffect } from 'react';
import {
  Radio,
  CheckCircle2,
  Repeat,
  Wrench,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  ChevronRight,
  Plus,
  Battery,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Activity,
  Zap,
  MapPin,
  Globe,
  Mic,
  Volume2,
  Share2,
  Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardData, EquipmentUnit } from '../types';

interface DashboardViewProps {
  data: DashboardData | null;
  units?: EquipmentUnit[];
  onNavigateTab: (tab: string) => void;
  onQuickAction: (action: string) => void;
  onOpenPublicAccess?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  units = [],
  onNavigateTab,
  onQuickAction,
  onOpenPublicAccess
}) => {
  const [fleetFilter, setFleetFilter] = useState<'Semua' | 'Tersedia' | 'Disewa' | 'Perawatan'>('Semua');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState(1);
  const [isPttActive, setIsPttActive] = useState(false);
  const [pttMessage, setPttMessage] = useState('Standby · Siap Transmisi');

  // Interactive PTT Audio Simulation
  const handlePttTest = () => {
    setIsPttActive(true);
    setPttMessage(`TRANSMITTING PTT · CH-${activeChannel < 10 ? '0' + activeChannel : activeChannel} MODULASI 100%`);
    
    // Play gentle tactical radio beep using Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      // Audio context policy
    }

    // Auto reset after 3.5 seconds
    setTimeout(() => {
      setIsPttActive(false);
      setPttMessage('Standby · Kanal Bersih & Stabil');
    }, 3500);
  };

  if (!data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-[#0B2D5B] border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-slate-600">Menghubungkan ke basis data talkrent_db...</p>
        </div>
      </div>
    );
  }

  const { stats, overdueRentals, recentBookings, recentRentals, financialSummary } = data;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Fleet utilization percentage math
  const totalFleet = stats.totalUnits || 18;
  const availablePct = Math.round((stats.availableUnits / totalFleet) * 100);
  const rentedPct = Math.round((stats.rentedUnits / totalFleet) * 100);
  const maintPct = Math.round((stats.maintenanceUnits / totalFleet) * 100);

  // Filtered unit radar list
  const filteredFleet = units.filter((u) => {
    if (fleetFilter === 'Semua') return true;
    return u.status === fleetFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. OVERDUE RENTALS CRITICAL ALERT (If Any) */}
      {overdueRentals && overdueRentals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/95 p-4 text-rose-900 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-950">
                Peringatan: {overdueRentals.length} Transaksi Melewati Batas Waktu Pengembalian!
              </h2>
              <p className="text-xs text-rose-700">
                Unit sewa belum dikembalikan sesuai jadwal. Segera hubungi penyewa untuk proses pengembalian atau perpanjangan.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('returns')}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-all shrink-0 shadow-xs active:scale-95"
          >
            <span>Buka Pengembalian</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* 2. COMMAND HEADER & QUICK ACTIONS WITH DYNAMIC MOVING ELEMENTS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-r from-white via-slate-50 to-white p-5 sm:p-6 shadow-xs"
      >
        {/* Subtle Brand Logo Watermark in background matching shield */}
        <div className="absolute -right-6 -bottom-6 w-52 h-52 pointer-events-none opacity-8 select-none">
          <img
            src="/talkrent_logo.png"
            alt="TALKRENT Watermark"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Dynamic glowing brand horizon arc */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B2D5B] via-[#FF8C00] to-[#4DA3FF]" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Operasional Live</span>
              <span className="text-slate-300">·</span>
              <MapPin className="h-3.5 w-3.5 text-[#0B2D5B]" />
              <span className="text-[#0B2D5B] font-bold">Kabupaten Tasikmalaya, Jawa Barat</span>
              <span className="text-slate-300">·</span>
              <span className="rounded-full bg-[#FF8C00]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#FF8C00] uppercase tracking-wide">
                Your Communication Partner
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Pusat Kendali Rental Handy Talkie WLN
              </h1>
              {/* Radio beacon animation from logo */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00] text-[11px] font-bold font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8C00] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF8C00]" />
                </span>
                <span>UHF LIVE</span>
              </div>
            </div>

            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Monitoring real-time kesiapan 18 unit armada fisik, pemantauan transaksi sewa lapangan, reservasi booking acara, dan pembukuan laba operasional.
            </p>

            {/* Dynamic brand swoosh accent */}
            <div className="mt-2.5 h-0.5 w-40 bg-gradient-to-r from-[#FF8C00] via-[#4DA3FF] to-transparent rounded-full" />
          </div>

          {/* Quick Command & Public Share Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenPublicAccess && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenPublicAccess}
                className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2.5 text-xs font-bold text-[#0B2D5B] shadow-2xs hover:bg-sky-100 transition-all whitespace-nowrap"
                title="Buka Link Publik dan QR Code agar bisa diakses oleh orang lain"
              >
                <Globe className="h-4 w-4 text-[#FF8C00] animate-pulse" />
                <span>Akses Publik / Share Web</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onQuickAction('new_rental')}
              className="flex items-center gap-1.5 rounded-xl bg-[#FF8C00] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#e67e00] transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Sewa Baru</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onQuickAction('new_booking')}
              className="flex items-center gap-1.5 rounded-xl bg-[#0B2D5B] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#072042] transition-colors whitespace-nowrap"
            >
              <CalendarCheck className="h-4 w-4 text-[#4DA3FF]" />
              <span>Buat Booking</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateTab('returns')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-2xs"
            >
              <Repeat className="h-4 w-4 text-slate-500" />
              <span>Pengembalian</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 3. HERO METRICS TIERS (Animated Grid Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Pendapatan Bulan Ini (Hero Navy Gradient) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => onNavigateTab('finances')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B2D5B] to-[#071d3d] p-5 text-white shadow-xs hover:shadow-md transition-all border border-white/10"
        >
          <div className="flex items-center justify-between text-xs text-white/80">
            <span className="font-medium">Pendapatan Bulan Ini</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[#FF8C00] group-hover:rotate-12 transition-transform">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-white">
            {formatRupiah(stats.monthRevenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#4DA3FF] border-t border-white/10 pt-2.5">
            <span>Kas Masuk Hari Ini:</span>
            <span className="font-mono font-bold text-white">{formatRupiah(stats.todayRevenue)}</span>
          </div>
        </motion.div>

        {/* Metric 2: Kesiapan Armada HT (Utilization Rate Progress) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => onNavigateTab('inventory')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-[#0B2D5B]/30 transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Kesiapan Armada HT</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700 tabular-nums">
              {stats.availableUnits}
            </span>
            <span className="text-xs text-slate-500">dari {stats.totalUnits} unit siap sewa</span>
          </div>

          {/* Multi-segmented Utilization Bar */}
          <div className="mt-3 space-y-1.5">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${availablePct}%` }}
                transition={{ duration: 0.8 }}
                className="bg-emerald-500 transition-all"
                title={`Tersedia: ${stats.availableUnits} unit (${availablePct}%)`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rentedPct}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-[#0B2D5B] transition-all"
                title={`Disewa: ${stats.rentedUnits} unit (${rentedPct}%)`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${maintPct}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-amber-400 transition-all"
                title={`Perawatan: ${stats.maintenanceUnits} unit (${maintPct}%)`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span className="text-emerald-700 font-semibold">{stats.availableUnits} Tersedia</span>
              <span className="text-[#0B2D5B] font-semibold">{stats.rentedUnits} Disewa</span>
              <span className="text-amber-700 font-semibold">{stats.maintenanceUnits} Servis</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 3: Jadwal & Reservasi Aktif */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => onNavigateTab('bookings')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-[#0B2D5B]/30 transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Jadwal & Reservasi</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
              {stats.activeBookings}
            </span>
            <span className="text-xs text-slate-500">booking acara terverifikasi</span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
            <span className="text-slate-500">Sewa Berlangsung:</span>
            <span className="font-mono font-bold text-[#0B2D5B]">{stats.ongoingRentals} Transaksi</span>
          </div>
        </motion.div>

        {/* Metric 4: Laba Bersih Operasional */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => onNavigateTab('finances')}
          className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Laba Bersih Berjalan</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {formatRupiah(financialSummary?.operationalProfit || 0)}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
            <span className="text-slate-500">Titipan Jaminan:</span>
            <span className="font-mono font-semibold text-slate-700">
              {formatRupiah(financialSummary?.activeDepositHeld || 0)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* 4. RADAR ARMADA HT WLN (Real-Time Interactive 18 Unit Matrix with Animated Sweep) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
        {/* Animated Radar Sweep Overlay */}
        <div className="pointer-events-none absolute -inset-full opacity-10 flex items-center justify-center">
          <div className="animate-radar-sweep h-[800px] w-[800px] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,#4DA3FF_360deg)]" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Radar Kesiapan 18 Unit Fisik WLN (Live Fleet)</h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Status baterai dan lokasi rak aset Handy Talkie Kabupaten Tasikmalaya
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {(['Semua', 'Tersedia', 'Disewa', 'Perawatan'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFleetFilter(tab)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  fleetFilter === tab
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === 'Semua' && ` (${units.length})`}
                {tab === 'Tersedia' && ` (${stats.availableUnits})`}
                {tab === 'Disewa' && ` (${stats.rentedUnits})`}
                {tab === 'Perawatan' && ` (${stats.maintenanceUnits})`}
              </button>
            ))}
          </div>
        </div>

        {/* 18 Unit Visual Grid with Hover Animations */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 relative z-10">
          {filteredFleet.map((u) => {
            const isAvail = u.status === 'Tersedia';
            const isRented = u.status === 'Disewa';
            const isMaint = u.status === 'Perawatan';
            return (
              <motion.div
                key={u.id}
                whileHover={{ y: -3, scale: 1.02 }}
                onClick={() => onNavigateTab('inventory')}
                className={`group cursor-pointer rounded-2xl border p-3 transition-all ${
                  isAvail
                    ? 'border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-50/80 shadow-2xs hover:shadow-xs'
                    : isRented
                    ? 'border-[#0B2D5B]/20 bg-[#0B2D5B]/5 hover:bg-[#0B2D5B]/10'
                    : isMaint
                    ? 'border-amber-200 bg-amber-50/60 hover:bg-amber-100/50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-[#0B2D5B]">{u.unit_code}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isAvail
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse'
                        : isRented
                        ? 'bg-[#0B2D5B]'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-800 truncate">
                  {u.model?.model_name?.replace('Ultra Compact', 'C1')?.replace('High Power', 'C100')}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Battery className={`h-3 w-3 ${u.battery_health >= 90 ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <span>{u.battery_health}%</span>
                  </div>
                  <span className="font-semibold text-slate-700">{u.status}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 16-Channel UHF Communication Bar with Live Modulation & PTT Test */}
        <div className="mt-5 pt-4 border-t border-slate-100 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-[#0B2D5B] text-white shadow-xs">
                <Radio className="h-4 w-4 text-[#FF8C00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Pemancar Frekuensi WLN (16 Saluran UHF)</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {pttMessage}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">UHF 400.000 - 470.000 MHz · Modulasi Suara Jernih</span>
              </div>
            </div>

            {/* Audio Modulation Equalizer & PTT Button */}
            <div className="flex items-center gap-3">
              {/* Animated Voice Equalizer Spectrum */}
              <div className="flex items-end gap-1 h-7 px-2.5 py-1 bg-slate-900 rounded-lg shadow-inner" title="Live Voice Audio Modulation">
                {[...Array(12)].map((_, i) => {
                  const animHeights = isPttActive
                    ? [8, 22, 14, 26, 18, 28, 12, 24, 16, 26, 10, 20]
                    : [3, 8, 4, 10, 5, 12, 4, 9, 3, 11, 4, 7];
                  return (
                    <motion.div
                      key={i}
                      animate={{
                        height: isPttActive ? [8, 26, 12, 24, 6] : [3, 12, 4, 8, 3]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6 + (i % 3) * 0.2,
                        ease: 'easeInOut'
                      }}
                      style={{ height: `${animHeights[i % animHeights.length]}px` }}
                      className={`w-1 rounded-full transition-all ${
                        isPttActive ? 'bg-[#FF8C00]' : 'bg-[#4DA3FF]'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Uji PTT Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePttTest}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isPttActive
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-[#FF8C00] text-white hover:bg-[#e67e00]'
                }`}
                title="Tekan untuk uji transmisi audio radio HT"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>{isPttActive ? 'PTT On Air...' : 'Uji PTT Suara'}</span>
              </motion.button>
            </div>
          </div>

          {/* 16 Channel Buttons Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-1.5">
            {[...Array(16)].map((_, i) => {
              const chNum = i + 1;
              const isSelected = activeChannel === chNum;
              return (
                <button
                  key={chNum}
                  type="button"
                  onClick={() => {
                    setActiveChannel(chNum);
                    handlePttTest();
                  }}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition-all ${
                    isSelected
                      ? 'bg-[#0B2D5B] text-white shadow-md scale-105 border-b-2 border-[#FF8C00]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                  }`}
                  title={`Klik untuk uji kanal ${chNum} - UHF ${(400 + chNum * 4.375).toFixed(3)} MHz`}
                >
                  <span className="text-[10px] font-bold font-mono">CH{chNum < 10 ? `0${chNum}` : chNum}</span>
                  <span className={`text-[8px] font-mono ${isSelected ? 'text-[#4DA3FF] font-semibold' : 'text-slate-400'}`}>
                    {(400 + chNum * 4.375).toFixed(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE CASHFLOW GRAPH & HARDWARE SHOWCASE */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Analytics Graph */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tren Pendapatan & Pengeluaran Bulanan (2026)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Analisis arus kas sewa HT vs biaya pemeliharaan unit</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#0B2D5B]" />
                <span className="text-slate-600 font-medium">Pemasukan Sewa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-rose-400" />
                <span className="text-slate-600 font-medium">Beban Operasional</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart with Hover State */}
          <div className="pt-2">
            <div className="flex h-56 items-end gap-2 sm:gap-4 pb-2 border-b border-slate-100">
              {financialSummary?.monthlyStats?.map((m: any, idx: number) => {
                const maxVal = 4000000;
                const incHeight = Math.min(100, Math.max(12, (m.income / maxVal) * 100));
                const expHeight = Math.min(100, Math.max(6, (m.expenses / maxVal) * 100));
                const isSelected = selectedMonthIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setSelectedMonthIndex(idx)}
                    onMouseLeave={() => setSelectedMonthIndex(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    {/* Tooltip value */}
                    <div
                      className={`text-[10px] font-mono font-bold transition-all ${
                        isSelected ? 'text-[#0B2D5B] opacity-100 -translate-y-1' : 'opacity-0 text-slate-400'
                      }`}
                    >
                      {(m.profit / 1000).toFixed(0)}k
                    </div>

                    {/* Dual Bars with Motion */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-44">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${incHeight}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className={`w-1/2 rounded-t-md transition-all ${
                          isSelected ? 'bg-[#FF8C00] shadow-xs' : 'bg-[#0B2D5B] group-hover:bg-[#072042]'
                        }`}
                        title={`${m.month} - Pemasukan: ${formatRupiah(m.income)}`}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${expHeight}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 + 0.1 }}
                        className="w-1/2 rounded-t-md bg-rose-300 group-hover:bg-rose-400 transition-all"
                        title={`${m.month} - Pengeluaran: ${formatRupiah(m.expenses)}`}
                      />
                    </div>

                    <div className="mt-2 text-[11px] font-semibold text-slate-600 group-hover:text-slate-900">
                      {m.month}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Rata-rata Margin Laba: <strong className="text-emerald-700">46.5%</strong></span>
              <button
                onClick={() => onNavigateTab('finances')}
                className="font-semibold text-[#0B2D5B] hover:underline flex items-center gap-1"
              >
                <span>Buka Buku Keuangan Lengkap</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Hardware Feature Spotlight Card with Radio Wave Effect */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8C00]">
                Armada Spesialis Radio
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                100% WLN Original
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-bold text-slate-900">
              Handy Talkie WLN Series
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Daya jangkau 1-5 KM dengan modulasi jernih UHF 400-470 MHz dan baterai Li-ion berdaya tahan tinggi.
            </p>

            <div className="mt-3.5 overflow-hidden rounded-2xl border border-slate-200 shadow-inner group bg-slate-900 relative">
              <img
                src="/wln_ht_showcase.jpg"
                alt="WLN Walkie Talkie Spesialis Radio TALKRENT"
                className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback if ever missing
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/talkrent_logo.png') {
                    target.src = '/public/assets/aistudio/image_fd459883.png';
                  }
                }}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Frekuensi</span>
                <span className="font-semibold text-slate-800">UHF 16 Channel</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Power Transmisi</span>
                <span className="font-semibold text-slate-800">2W - 5W High Gain</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2D5B]">Mulai Rp 20.000 / hari</span>
            <button
              onClick={() => onQuickAction('new_rental')}
              className="rounded-xl bg-[#0B2D5B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#072042] transition-colors shadow-xs active:scale-95"
            >
              Sewa Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* 6. OPERATIONAL QUEUES (Recent Bookings & Active Rentals) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings Queue */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#0B2D5B]" />
                <h2 className="text-sm font-bold text-slate-900">Reservasi Booking Mendatang</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Jadwal acara event organizer & panitia Tasikmalaya</p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs text-[#0B2D5B] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden">
            {recentBookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Belum ada booking aktif saat ini.</div>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B2D5B]">{b.booking_code}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold text-slate-900 truncate">{b.event_name}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {b.customer?.name} ({b.customer?.organization || b.customer?.whatsapp})
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      Jadwal: {b.start_date} s/d {b.end_date} · {b.requested_quantity} Unit HT
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {formatRupiah(b.estimated_cost)}
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        b.status === 'Dikonfirmasi'
                          ? 'text-emerald-700'
                          : b.status === 'Menjadi Penyewaan'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ongoing Rentals Queue */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FF8C00]" />
                <h2 className="text-sm font-bold text-slate-900">Unit di Lapangan (Sewa Berjalan)</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Pantau waktu jatuh tempo dan pengembalian unit</p>
            </div>
            <button
              onClick={() => onNavigateTab('rentals')}
              className="text-xs text-[#0B2D5B] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden">
            {recentRentals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Tidak ada transaksi sewa aktif di luar.</div>
            ) : (
              recentRentals.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B2D5B]">{r.rental_code}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {r.customer?.name}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      Batas Kembali: <strong className="text-slate-800">{r.due_date.substring(0, 16)}</strong>
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      Jumlah: {r.items?.length || 0} Unit Diserahkan · Deposit: Rp {r.deposit_amount.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {formatRupiah(r.total_cost)}
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        r.rental_status === 'Berlangsung'
                          ? 'text-blue-700'
                          : r.rental_status === 'Terlambat'
                          ? 'text-rose-700 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      {r.rental_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
