import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Repeat,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Search,
  MapPin,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Booking, Customer, EquipmentUnit, BookingStatus } from '../types';
import { api } from '../api';

interface BookingsViewProps {
  bookings: Booking[];
  customers: Customer[];
  units: EquipmentUnit[];
  onRefresh: () => void;
  onCreateBooking: (data: any) => Promise<void>;
  onConvertToRental: (bookingId: number, selectedUnitIds: number[], deposit?: number) => Promise<void>;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  customers,
  units,
  onRefresh,
  onCreateBooking,
  onConvertToRental
}) => {
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // New Booking Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formCustomerId, setFormCustomerId] = useState<number>(customers[0]?.id || 1);
  const [formEventName, setFormEventName] = useState('');
  const [formEventLocation, setFormEventLocation] = useState('Kabupaten Tasikmalaya');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [formQty, setFormQty] = useState(4);
  const [formRate, setFormRate] = useState(20000);
  const [formDownPayment, setFormDownPayment] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  // Live availability feedback
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableCount, setAvailableCount] = useState<number | null>(null);

  // Convert to Rental Modal state
  const [convertingBooking, setConvertingBooking] = useState<Booking | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  const [depositAmount, setDepositAmount] = useState(50000);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate days & estimate
  const diffDays = Math.max(
    1,
    Math.ceil(
      Math.abs(new Date(formEndDate).getTime() - new Date(formStartDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
  const estimatedTotal = formQty * formRate * diffDays;

  // Check availability when dates change
  useEffect(() => {
    if (!showAddModal) return;
    const check = async () => {
      setCheckingAvailability(true);
      try {
        const res = await api.checkAvailability(formStartDate, formEndDate);
        setAvailableCount(res.totalAvailable);
      } catch (err) {
        console.error('Error checking availability:', err);
      } finally {
        setCheckingAvailability(false);
      }
    };
    check();
  }, [formStartDate, formEndDate, showAddModal]);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'Semua' || b.status === statusFilter;
    const matchesSearch =
      b.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.event_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customer?.name && b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const openAddModal = () => {
    setFormCustomerId(customers[0]?.id || 1);
    setFormEventName('');
    setFormEventLocation('Singaparna, Kabupaten Tasikmalaya');
    const today = new Date().toISOString().substring(0, 10);
    setFormStartDate(today);
    setFormEndDate(today);
    setFormQty(4);
    setFormRate(20000);
    setFormDownPayment(0);
    setFormNotes('Paket HT WLN + Headset');
    setErrorMessage('');
    setShowAddModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreateBooking({
        customer_id: formCustomerId,
        event_name: formEventName,
        event_location: formEventLocation,
        start_date: formStartDate,
        end_date: formEndDate,
        requested_quantity: formQty,
        rate_per_day: formRate,
        down_payment: formDownPayment,
        notes: formNotes
      });
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConvertModal = (b: Booking) => {
    setConvertingBooking(b);
    setDepositAmount(50000);
    // Pre-select first available units up to requested quantity
    const freeUnits = units.filter((u) => u.status === 'Tersedia');
    const autoPicked = freeUnits.slice(0, b.requested_quantity).map((u) => u.id);
    setSelectedUnitIds(autoPicked);
    setErrorMessage('');
  };

  const handleExecuteConvert = async () => {
    if (!convertingBooking) return;
    if (selectedUnitIds.length !== convertingBooking.requested_quantity) {
      setErrorMessage(
        `Wajib memilih tepat ${convertingBooking.requested_quantity} unit HT (saat ini terpilih: ${selectedUnitIds.length} unit).`
      );
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConvertToRental(convertingBooking.id, selectedUnitIds, depositAmount);
      setConvertingBooking(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengonversi booking ke rental.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectUnit = (id: number) => {
    if (selectedUnitIds.includes(id)) {
      setSelectedUnitIds(selectedUnitIds.filter((item) => item !== id));
    } else {
      if (convertingBooking && selectedUnitIds.length >= convertingBooking.requested_quantity) {
        // Replace or notify
        return;
      }
      setSelectedUnitIds([...selectedUnitIds, id]);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Dikonfirmasi':
        return <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Dikonfirmasi (DP OK)</span>;
      case 'Menunggu':
        return <span className="text-amber-700 font-semibold text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Menunggu Konfirmasi</span>;
      case 'Menjadi Penyewaan':
        return <span className="text-[#0B2D5B] font-semibold text-xs flex items-center gap-1"><Repeat className="h-3 w-3" /> Sudah Disewakan</span>;
      default:
        return <span className="text-rose-600 font-semibold text-xs">Dibatalkan</span>;
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
              placeholder="Cari kode booking, nama acara, klien..."
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
            <option value="Menunggu">Menunggu</option>
            <option value="Dikonfirmasi">Dikonfirmasi</option>
            <option value="Menjadi Penyewaan">Menjadi Penyewaan</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Booking Baru</span>
        </button>
      </div>

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Nama Acara / Lokasi</th>
                <th className="py-3 px-4">Rentang Tanggal</th>
                <th className="py-3 px-4">Jumlah HT</th>
                <th className="py-3 px-4">Estimasi Biaya</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data booking yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2D5B]">{b.booking_code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.customer?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.customer?.whatsapp}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{b.event_name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <MapPin className="h-2.5 w-2.5" />
                        <span className="truncate max-w-[180px]">{b.event_location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {b.start_date} <span className="text-slate-400">s/d</span> {b.end_date}
                      </div>
                      <div className="text-[10px] text-slate-500">{b.total_days} Hari Kalender</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 tabular-nums">{b.requested_quantity} Unit</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 tabular-nums">
                        Rp {b.estimated_cost.toLocaleString('id-ID')}
                      </div>
                      {b.down_payment > 0 && (
                        <div className="text-[10px] text-emerald-700">DP: Rp {b.down_payment.toLocaleString('id-ID')}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {b.status === 'Menunggu' || b.status === 'Dikonfirmasi' ? (
                        <button
                          onClick={() => openConvertModal(b)}
                          className="inline-flex items-center gap-1 rounded bg-[#0B2D5B] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#072042] transition-colors whitespace-nowrap"
                        >
                          <Repeat className="h-3 w-3" />
                          <span>Serahkan / Sewa</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500 bg-slate-50/50">
          <span>Menampilkan {filteredBookings.length} booking</span>
          <span>Sistem TALKRENT Tasikmalaya</span>
        </div>
      </div>

      {/* MODAL: NEW BOOKING */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Reservasi Booking HT WLN</h3>
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

            <form onSubmit={handleSubmitAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Pilih Pelanggan</label>
                <select
                  required
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.organization || c.whatsapp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Nama Acara / Event</label>
                  <input
                    type="text"
                    required
                    value={formEventName}
                    onChange={(e) => setFormEventName(e.target.value)}
                    placeholder="Contoh: Resepsi Pernikahan"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Lokasi Acara</label>
                  <input
                    type="text"
                    required
                    value={formEventLocation}
                    onChange={(e) => setFormEventLocation(e.target.value)}
                    placeholder="Contoh: Gedung Dakwah Singaparna"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tanggal Mulai Acara</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tanggal Selesai Acara</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Real-time Availability Alert */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Ketersediaan Armada Periode Terpilih:</span>
                  {checkingAvailability ? (
                    <span className="text-slate-400">Memeriksa ketersediaan...</span>
                  ) : availableCount !== null ? (
                    <span
                      className={`font-bold ${
                        availableCount >= formQty ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {availableCount} Unit Bebas Jadwal
                    </span>
                  ) : null}
                </div>
                {availableCount !== null && availableCount < formQty && (
                  <p className="mt-1 text-rose-600 font-medium text-[11px]">
                    Perhatian: Permintaan ({formQty} unit) melebihi kapasitas bebas ({availableCount} unit).
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Jumlah Unit</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formQty}
                    onChange={(e) => setFormQty(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tarif / Hari (Rp)</label>
                  <input
                    type="number"
                    min="10000"
                    step="1000"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Uang Muka (DP)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formDownPayment}
                    onChange={(e) => setFormDownPayment(Number(e.target.value))}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-emerald-800 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cost Calculation Preview */}
              <div className="rounded-lg bg-[#0B2D5B]/5 border border-[#0B2D5B]/15 p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Estimasi Biaya ({diffDays} Hari · {formQty} Unit):</span>
                  <div className="text-base font-extrabold text-[#0B2D5B] tabular-nums">
                    Rp {estimatedTotal.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  Status Otomatis: <br />
                  <span className="font-semibold text-slate-800">
                    {formDownPayment > 0 ? 'Dikonfirmasi (DP Diterima)' : 'Menunggu DP'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Catatan Khusus</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Minta charger docking 2 pcs, tes baterai sebelum kirim"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (availableCount !== null && availableCount < formQty)}
                  className="rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONVERT BOOKING TO ACTIVE RENTAL */}
      {convertingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#0B2D5B]">{convertingBooking.booking_code}</span>
                <h3 className="text-base font-bold text-slate-900">Penyerahan Unit & Mulai Sewa</h3>
              </div>
              <button
                onClick={() => setConvertingBooking(null)}
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

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <div className="font-semibold text-slate-800">{convertingBooking.event_name}</div>
                <div className="text-slate-500 mt-0.5">
                  Pelanggan: {convertingBooking.customer?.name} ({convertingBooking.customer?.whatsapp})
                </div>
                <div className="mt-2 text-slate-700 font-medium">
                  Permintaan Unit: <span className="font-bold text-[#0B2D5B]">{convertingBooking.requested_quantity} Unit WLN</span>
                </div>
              </div>

              {/* Physical Unit Multi-Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Pilih Unit Fisik yang Diserahkan ({selectedUnitIds.length} / {convertingBooking.requested_quantity} terpilih):
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50/50">
                  {units
                    .filter((u) => u.status === 'Tersedia' || selectedUnitIds.includes(u.id))
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
                          <div className={`text-[10px] ${isPicked ? 'text-white' : 'text-slate-400'}`}>
                            Bat: {u.battery_health}%
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Uang Jaminan / Deposit Fisik (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">*Dititipkan sementara dan dikembalikan penuh saat unit kembali.</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setConvertingBooking(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteConvert}
                disabled={isSubmitting || selectedUnitIds.length !== convertingBooking.requested_quantity}
                className="rounded-lg bg-[#0B2D5B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#072042] disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Serahkan & Terbitkan Sewa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
