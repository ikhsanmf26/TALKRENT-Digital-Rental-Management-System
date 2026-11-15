import React, { useState } from 'react';
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Smartphone,
  Server,
  X,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublicAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicAccessModal: React.FC<PublicAccessModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  // In AI Studio Cloud Run preview, this is the canonical production/shared URL
  const publicUrl = window.location.origin.includes('localhost')
    ? 'https://ais-pre-475heagrzmws73zwbu32s7-780419192527.asia-northeast1.run.app'
    : window.location.origin;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TALKRENT - Digital Rental Management System',
          text: 'Sistem Manajemen Rental Handy Talkie WLN Kabupaten Tasikmalaya - Your Communication Partner.',
          url: publicUrl,
        });
      } catch (err) {
        console.warn(err);
      }
    } else {
      handleCopy();
    }
  };

  // QR Code generator URL using public high-reliability QR API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}&color=0B2D5B&bgcolor=FFFFFF`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10 overflow-hidden"
          >
            {/* Top decorative gradient matching logo */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B2D5B] via-[#FF8C00] to-[#4DA3FF]" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2D5B] text-white shadow-xs">
                  <Globe className="h-6 w-6 text-[#FF8C00] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Akses Publik & Deployment TALKRENT
                  </h3>
                  <p className="text-xs text-slate-500">
                    Web aktif dan dapat diakses dari mana saja oleh Anda dan pengguna lain
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-5 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span>Status: Ter-Deploy & Live di Cloud Run</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  PORT 3000 ACTIVE
                </span>
              </div>

              {/* URL Display & Copy Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tautan / URL Publik Aplikasi:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 truncate select-all">
                    {publicUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-xl bg-[#0B2D5B] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#072042] active:scale-[0.98] transition-all shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-[#FF8C00]" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code Scan via Smartphone */}
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="flex shrink-0 items-center justify-center p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <img
                    src={qrApiUrl}
                    alt="Scan QR TALKRENT"
                    className="h-28 w-28 object-contain"
                    onError={(e) => {
                      // Fallback if network blocked
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#0B2D5B]">
                    <Smartphone className="h-4 w-4 text-[#FF8C00]" />
                    <span>Buka Lewat HP / Smartphone</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Arahkan kamera HP Anda atau orang lain ke kode QR ini untuk langsung membuka dan mengelola rental HT TALKRENT tanpa perlu download aplikasi tambahan.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B2D5B] hover:text-[#FF8C00] transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Bagikan ke WhatsApp</span>
                    </button>
                    <span className="text-slate-300">·</span>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#0B2D5B] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka di Tab Baru</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Multi-Device Features */}
              <div className="grid grid-cols-2 gap-2.5 text-[11px] text-slate-600">
                <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Akses Multi-Device</strong>
                    Bisa diakses di HP, laptop, dan tablet secara bersamaan.
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <Server className="h-4 w-4 text-[#0B2D5B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Sinkronisasi Database</strong>
                    Setiap transaksi baru langsung tersimpan dan terupdate live.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 border-t border-slate-100 pt-3 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
