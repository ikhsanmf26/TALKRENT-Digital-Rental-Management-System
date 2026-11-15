import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Battery,
  ShieldCheck,
  X,
  Printer,
  Download,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Camera,
  Share2
} from 'lucide-react';
import { Rental, Customer, EquipmentUnit, PaymentMethod, RentalAccessories } from '../types';
import {
  printInvoice,
  openInvoiceInNewTab,
  downloadInvoiceHtml
} from '../utils/printInvoice';
import {
  shareReceiptImageToWhatsApp,
  downloadReceiptImage
} from '../utils/receiptGenerator';

interface RentalsViewProps {
  rentals: Rental[];
  customers: Customer[];
  units: EquipmentUnit[];
  onRefresh: () => void;
  onCreateRental: (data: any) => Promise<void>;
  onOpenReturnModal: (rental: Rental) => void;
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  rentals,
  customers,
  units,
  onRefresh,
  onCreateRental,
  onOpenReturnModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // New Rental Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formCustomerId, setFormCustomerId] = useState<number>(customers[0]?.id || 1);
  const [formOutDate, setFormOutDate] = useState(new Date().toISOString().substring(0, 16));
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 16)
  );
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formDeposit, setFormDeposit] = useState(50000);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('Tunai');
  const [formInitialPayment, setFormInitialPayment] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  // Accessory checklist
  const [accessories, setAccessories] = useState<RentalAccessories>({
    charger: true,
    headset: true,
    belt_clip: true,
    lanyard: true,
    antenna: true
  });

  // Invoice Receipt Preview Modal
  const [invoiceRental, setInvoiceRental] = useState<Rental | null>(null);
  const [invoiceViewMode, setInvoiceViewMode] = useState<'struk' | 'nota'>('struk');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  const handleDirectPrint = async (rental: Rental) => {
    setIsPrinting(true);
    setPrintFeedback('Mempersiapkan dokumen cetak TALKRENT...');
    try {
      await printInvoice(rental);
      setPrintFeedback('Dialog cetak dibuka! Jika belum muncul, klik "Buka Tab Baru" atau "Unduh".');
    } catch (err) {
      console.error('Print error:', err);
      openInvoiceInNewTab(rental);
      setPrintFeedback('Membuka nota di tab browser baru untuk dicetak langsung.');
    } finally {
      setIsPrinting(false);
      setTimeout(() => setPrintFeedback(null), 4000);
    }
  };

  const handleShareReceiptWA = async (rental: Rental) => {
    setIsPrinting(true);
    setPrintFeedback('Sedang memproses foto struk...');
    try {
      const res = await shareReceiptImageToWhatsApp(rental);
      setPrintFeedback(res.message);
    } catch (err) {
      console.error('Error sharing receipt:', err);
      setPrintFeedback('Foto struk diunduh. Silakan lampirkan gambar ke chat WhatsApp.');
      await downloadReceiptImage(rental);
    } finally {
      setIsPrinting(false);
      setTimeout(() => setPrintFeedback(null), 8000);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filtered rentals
  const filteredRentals = rentals.filter((r) => {
    const matchesStatus = statusFilter === 'Semua' || r.rental_status === statusFilter;
    const matchesSearch =
      r.rental_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.customer?.name && r.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const openAddModal = () => {
    setFormCustomerId(customers[0]?.id || 1);
    const nowStr = new Date().toISOString().substring(0, 16);
    const dueStr = new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 16);
    setFormOutDate(nowStr);
    setFormDueDate(dueStr);
    setSelectedUnitIds([]);
    setFormDiscount(0);
    setFormDeposit(50000);
    setFormMethod('Tunai');
    setFormInitialPayment(0);
    setFormNotes('Paket penyewaan HT WLN resmi TALKRENT');
    setAccessories({ charger: true, headset: true, belt_clip: true, lanyard: true, antenna: true });
    setErrorMessage('');
    setShowAddModal(true);
  };

  const toggleSelectUnit = (id: number) => {
    if (selectedUnitIds.includes(id)) {
      setSelectedUnitIds(selectedUnitIds.filter((item) => item !== id));
    } else {
      setSelectedUnitIds([...selectedUnitIds, id]);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUnitIds.length === 0) {
      setErrorMessage('Wajib memilih minimal 1 unit HT yang diserahkan.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreateRental({
        customer_id: formCustomerId,
        out_date: formOutDate,
        due_date: formDueDate,
        unit_ids: selectedUnitIds,
        discount: formDiscount,
        deposit_amount: formDeposit,
        payment_method: formMethod,
        initial_payment: formInitialPayment,
        notes: formNotes,
        accessories
      });
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat transaksi rental.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari no nota RN-..., pelanggan, catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0B2D5B] focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-[#0B2D5B] focus:outline-hidden"
          >
            <option value="Semua">Semua Status</option>
            <option value="Berlangsung">Berlangsung</option>
            <option value="Selesai">Selesai</option>
            <option value="Terlambat">Terlambat</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Sewa Langsung Baru</span>
        </button>
      </div>

      {/* Rentals Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">No Transaksi</th>
                <th className="py-3 px-4">Penyewa</th>
                <th className="py-3 px-4">Tanggal Keluar & Tempo</th>
                <th className="py-3 px-4">Unit Diserahkan</th>
                <th className="py-3 px-4">Total Biaya & DP</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Status Sewa</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data transaksi penyewaan.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2D5B]">{r.rental_code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.customer?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.customer?.whatsapp}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{r.out_date.substring(0, 10)}</div>
                      <div className="text-[10px] text-slate-500">Tempo: {r.due_date.substring(0, 16)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {r.items && r.items.length > 0 ? (
                          r.items.map((it) => (
                            <span
                              key={it.id}
                              className="font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                            >
                              {it.unit?.unit_code || `Unit #${it.unit_id}`}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 tabular-nums">
                        Rp {r.total_cost.toLocaleString('id-ID')}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          r.payment_status === 'Lunas'
                            ? 'text-emerald-700'
                            : r.payment_status === 'DP'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {r.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      Rp {r.deposit_amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold text-xs ${
                          r.rental_status === 'Berlangsung'
                            ? 'text-blue-700'
                            : r.rental_status === 'Selesai'
                            ? 'text-slate-500'
                            : 'text-rose-700 font-bold'
                        }`}
                      >
                        {r.rental_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInvoiceRental(r)}
                          title="Cetak / Nota Digital"
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        {r.rental_status === 'Berlangsung' || r.rental_status === 'Terlambat' ? (
                          <button
                            onClick={() => onOpenReturnModal(r)}
                            className="inline-flex items-center gap-1 rounded bg-[#0B2D5B] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#072042] transition-colors whitespace-nowrap"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Pengembalian</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500 bg-slate-50/50">
          <span>Menampilkan {filteredRentals.length} transaksi sewa</span>
          <span>TALKRENT Tasikmalaya</span>
        </div>
      </div>

      {/* MODAL: NEW DIRECT RENTAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Penerbitan Surat Sewa HT Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitAdd} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Pelanggan</label>
                <select
                  required
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.organization || c.whatsapp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Waktu Penyerahan Unit</label>
                  <input
                    type="datetime-local"
                    required
                    value={formOutDate}
                    onChange={(e) => setFormOutDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Waktu Jatuh Tempo Pengembalian</label>
                  <input
                    type="datetime-local"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Physical Units Picker */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Pilih Unit HT Tersedia ({selectedUnitIds.length} terpilih):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50/50">
                  {units
                    .filter((u) => u.status === 'Tersedia')
                    .map((u) => {
                      const isPicked = selectedUnitIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleSelectUnit(u.id)}
                          className={`p-2 rounded border text-left transition-all ${
                            isPicked
                              ? 'border-[#0B2D5B] bg-[#0B2D5B] text-white'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-mono font-bold text-xs">{u.unit_code}</div>
                          <div className={`text-[10px] truncate ${isPicked ? 'text-slate-200' : 'text-slate-500'}`}>
                            {u.model?.model_name?.replace('Ultra Compact', '')}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Accessories Checklist */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Kelengkapan Aksesori Diserahkan:</label>
                <div className="flex flex-wrap gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessories.antenna}
                      onChange={(e) => setAccessories({ ...accessories, antenna: e.target.checked })}
                      className="rounded text-[#0B2D5B]"
                    />
                    <span>Antena Bawaan</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessories.belt_clip}
                      onChange={(e) => setAccessories({ ...accessories, belt_clip: e.target.checked })}
                      className="rounded text-[#0B2D5B]"
                    />
                    <span>Klip Sabuk (Clip)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessories.charger}
                      onChange={(e) => setAccessories({ ...accessories, charger: e.target.checked })}
                      className="rounded text-[#0B2D5B]"
                    />
                    <span>Desktop Charger / Kabel USB</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessories.headset}
                      onChange={(e) => setAccessories({ ...accessories, headset: e.target.checked })}
                      className="rounded text-[#0B2D5B]"
                    />
                    <span>Earphone / Headset PTT</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessories.lanyard}
                      onChange={(e) => setAccessories({ ...accessories, lanyard: e.target.checked })}
                      className="rounded text-[#0B2D5B]"
                    />
                    <span>Tali Lanyard Gantungan</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Diskon (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Deposit Jaminan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Metode Pembayaran</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="Transfer Bank">Transfer Bank (BCA)</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Pembayaran Diterima Sekarang (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formInitialPayment}
                  onChange={(e) => setFormInitialPayment(Number(e.target.value))}
                  placeholder="0 jika bayar belakangan"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-emerald-800 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Catatan Kegiatan / Penggunaan</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedUnitIds.length === 0}
                  className="rounded-lg bg-[#FF8C00] px-4 py-2 font-semibold text-white hover:bg-[#e67e00] disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Terbitkan Transaksi Sewa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL INVOICE PREVIEW */}
      {invoiceRental && (
        <div className="print-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="print-card w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl my-auto animate-in fade-in duration-200">
            {/* Header & Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center shrink-0">
                  <img
                    src="/talkrent_logo.png"
                    alt="TALKRENT"
                    className="h-10 w-10 object-contain drop-shadow-xs"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2D5B] tracking-tight">TALKRENT TASIKMALAYA</h3>
                  <p className="text-[10px] font-semibold text-[#FF8C00]">Your Communication Partner</p>
                </div>
              </div>

              {/* View Mode Tabs (Struk vs Nota) */}
              <div className="no-print flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInvoiceViewMode('struk')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    invoiceViewMode === 'struk'
                      ? 'bg-white text-[#0B2D5B] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Camera className="h-3 w-3 text-[#FF8C00]" />
                  <span>Foto Struk</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceViewMode('nota')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    invoiceViewMode === 'nota'
                      ? 'bg-white text-[#0B2D5B] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="h-3 w-3 text-slate-500" />
                  <span>Nota A4</span>
                </button>
                <button
                  onClick={() => setInvoiceRental(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors ml-1"
                  title="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Print / WA feedback banner */}
            {printFeedback && (
              <div className="no-print mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900 font-medium flex items-center justify-between shadow-2xs animate-in fade-in">
                <span>{printFeedback}</span>
              </div>
            )}

            {/* VIEW MODE 1: THERMAL RECEIPT / STRUK (Kaya Struk Kasir) */}
            {invoiceViewMode === 'struk' ? (
              <div className="mt-4 relative rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 font-mono text-xs shadow-inner">
                {/* Simulated thermal receipt paper card */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm max-w-sm mx-auto space-y-3">
                  <div className="text-center border-b border-dashed border-slate-300 pb-3">
                    <img
                      src="/talkrent_logo.png"
                      alt="TALKRENT"
                      className="h-10 w-10 mx-auto object-contain mb-1"
                    />
                    <div className="font-bold text-sm text-[#0B2D5B] tracking-tight">TALKRENT TASIKMALAYA</div>
                    <div className="text-[10px] font-bold text-[#FF8C00]">YOUR COMMUNICATION PARTNER</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Rental Handy Talkie WLN Tasikmalaya</div>
                    <div className="text-[10px] text-slate-400">WA: 0878-6160-8958</div>
                  </div>

                  {/* Struk metadata */}
                  <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">No. Nota:</span>
                      <strong className="text-[#0B2D5B]">{invoiceRental.rental_code}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tgl Keluar:</span>
                      <span>{invoiceRental.out_date?.substring(0, 16).replace('T', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kembali:</span>
                      <span className="text-rose-600 font-semibold">{invoiceRental.due_date?.substring(0, 16).replace('T', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Penyewa:</span>
                      <strong className="text-slate-900">{invoiceRental.customer?.name}</strong>
                    </div>
                    {invoiceRental.customer?.organization && (
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Instansi:</span>
                        <span>{invoiceRental.customer.organization}</span>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="text-[11px] space-y-1.5 border-b border-dashed border-slate-300 pb-2.5">
                    <div className="flex justify-between font-bold text-[#0B2D5B] text-[10px]">
                      <span>ITEM DISAMBIL</span>
                      <span>HARGA</span>
                    </div>
                    {invoiceRental.items?.map((it, idx) => (
                      <div key={it.id || idx} className="flex justify-between text-slate-800 text-[10px]">
                        <span className="truncate pr-2">
                          {idx + 1}. {it.unit?.unit_code} ({it.unit?.serial_number || 'WLN'})
                        </span>
                        <span className="font-semibold shrink-0">
                          Rp {it.daily_rate.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="text-[11px] space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Durasi:</span>
                      <span>{invoiceRental.total_days} Hari</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subtotal:</span>
                      <span>Rp {invoiceRental.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {invoiceRental.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Diskon:</span>
                        <span>- Rp {invoiceRental.discount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Deposit:</span>
                      <span>Rp {invoiceRental.deposit_amount.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm font-bold text-slate-900 border-t border-slate-200 pt-2 mt-1">
                      <span>TOTAL BIAYA:</span>
                      <span className="text-[#0B2D5B] text-base">Rp {invoiceRental.total_cost.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Stamp status */}
                  <div className="text-center pt-1">
                    <span className="inline-block px-3 py-0.5 rounded-full border border-emerald-500 text-emerald-700 text-[11px] font-bold tracking-wider">
                      *** {invoiceRental.payment_status?.toUpperCase() || 'LUNAS'} ***
                    </span>
                  </div>

                  {/* Simulated barcode */}
                  <div className="text-center pt-2 border-t border-dashed border-slate-200">
                    <div className="h-7 w-4/5 mx-auto bg-slate-800 rounded-xs flex items-center justify-around px-2 opacity-80">
                      {[...Array(24)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-full ${i % 3 === 0 ? 'w-1 bg-white' : i % 2 === 0 ? 'w-0.5 bg-white' : 'w-1.5 bg-slate-800'}`}
                        />
                      ))}
                    </div>
                    <div className="text-[9px] text-slate-400 tracking-widest mt-1">
                      * {invoiceRental.rental_code} *
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 text-center leading-tight pt-1">
                    Simpan struk ini sebagai bukti resmi TALKRENT<br/>
                    Terima kasih atas kepercayaan Anda!
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW MODE 2: FORMAL A4 NOTA */
              <div className="mt-4 space-y-3.5 text-xs font-mono">
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2.5">
                  <div>
                    <div className="text-slate-400 text-[10px] font-sans">NO. NOTA SEWA</div>
                    <div className="font-bold text-[#0B2D5B] text-sm">{invoiceRental.rental_code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px] font-sans">TANGGAL KELUAR</div>
                    <div className="font-bold text-slate-800">{invoiceRental.out_date?.substring(0, 16)} WIB</div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-sans uppercase font-bold">Penyewa / Penanggung Jawab:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{invoiceRental.customer?.name}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {invoiceRental.customer?.organization ? `${invoiceRental.customer.organization} · ` : ''}
                    WA: {invoiceRental.customer?.whatsapp}
                  </div>
                  {invoiceRental.customer?.address && (
                    <div className="text-[10px] text-slate-500 mt-1">{invoiceRental.customer.address}</div>
                  )}
                </div>

                <div className="border-t border-b border-slate-200 py-2.5">
                  <div className="font-sans font-bold text-slate-800 text-[11px] mb-2 flex items-center justify-between">
                    <span>Rincian Unit Disewa ({invoiceRental.items?.length || 0} Unit):</span>
                    <span className="text-[10px] font-normal text-slate-500">Durasi: {invoiceRental.total_days} Hari</span>
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {invoiceRental.items?.map((it, idx) => (
                      <div key={it.id || idx} className="flex justify-between items-center text-[11px] py-1 px-2 rounded bg-slate-50/80 border border-slate-100">
                        <div>
                          <strong className="text-[#0B2D5B]">{idx + 1}. {it.unit?.unit_code || 'HT'}</strong>
                          <span className="text-slate-500 ml-1.5">({it.unit?.serial_number || it.unit?.model?.model_name || 'WLN'})</span>
                        </div>
                        <span className="font-semibold text-slate-700">Rp {it.daily_rate.toLocaleString('id-ID')} / hr</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-right font-sans">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-mono">Total Durasi:</span>
                    <span className="font-semibold text-slate-700">{invoiceRental.total_days} Hari</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-mono">Subtotal Sewa:</span>
                    <span className="font-semibold text-slate-800">Rp {invoiceRental.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {invoiceRental.discount > 0 && (
                    <div className="flex justify-between text-rose-600 text-xs">
                      <span className="font-mono">Diskon Khusus:</span>
                      <span className="font-semibold">- Rp {invoiceRental.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-bold text-slate-900 text-sm border-t border-slate-200 pt-2">
                    <span className="font-mono">TOTAL BIAYA:</span>
                    <span className="text-base text-[#0B2D5B]">Rp {invoiceRental.total_cost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 mt-1">
                    <span className="font-mono font-medium">Uang Jaminan (Deposit):</span>
                    <span className="font-bold">Rp {invoiceRental.deposit_amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50/80 p-2.5 text-[10px] text-amber-900 border border-amber-200/80 font-sans">
                  <strong>Ketentuan Pengembalian:</strong> Unit wajib kembali selambatnya <strong>{invoiceRental.due_date?.substring(0, 16)} WIB</strong>. Kerusakan fisik, unit kotor, atau keterlambatan dikenakan denda sesuai regulasi TALKRENT Tasikmalaya.
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="no-print mt-5 border-t border-slate-200 pt-4 space-y-2.5">
              {/* PRIMARY ACTION: KIRIM FOTO STRUK KE WHATSAPP */}
              <button
                type="button"
                onClick={() => handleShareReceiptWA(invoiceRental)}
                disabled={isPrinting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-60"
                title="Kirimkan gambar struk asli langsung ke WhatsApp pelanggan tanpa teks kepanjangan"
              >
                <Camera className="h-4 w-4 text-emerald-100" />
                <span>Kirim Foto Struk ke WhatsApp</span>
                <span className="text-emerald-200 text-xs font-normal">· Format Foto Singkat</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => downloadReceiptImage(invoiceRental)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Unduh foto struk PNG ke perangkat"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Unduh Foto Struk (.png)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectPrint(invoiceRental)}
                  disabled={isPrinting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0B2D5B] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#072042] active:scale-[0.98] transition-all disabled:opacity-60"
                  title="Cetak langsung menggunakan printer atau simpan PDF"
                >
                  <Printer className="h-3.5 w-3.5 text-[#FF8C00]" />
                  <span>{isPrinting ? 'Menyiapkan...' : 'Cetak Bukti (Print)'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openInvoiceInNewTab(invoiceRental)}
                    className="text-[11px] font-medium text-slate-500 hover:text-[#0B2D5B] underline transition-colors"
                  >
                    Buka Nota Tab Baru
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => downloadInvoiceHtml(invoiceRental)}
                    className="text-[11px] font-medium text-slate-500 hover:text-[#0B2D5B] underline transition-colors"
                  >
                    Unduh File HTML
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setInvoiceRental(null)}
                  className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Tutup / Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
