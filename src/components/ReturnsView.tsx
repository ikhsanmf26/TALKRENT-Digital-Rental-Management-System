import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  ShieldCheck,
  Check,
  X,
  AlertOctagon
} from 'lucide-react';
import { Rental, EquipmentUnit } from '../types';

interface ReturnsViewProps {
  rentals: Rental[];
  units: EquipmentUnit[];
  onRefresh: () => void;
  onProcessReturn: (data: any) => Promise<void>;
  preselectedRental?: Rental | null;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  rentals,
  units,
  onRefresh,
  onProcessReturn,
  preselectedRental
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRental, setSelectedRental] = useState<Rental | null>(preselectedRental || null);

  // Return process form states
  const [returnDate, setReturnDate] = useState(new Date().toISOString().substring(0, 16));
  const [lateHours, setLateHours] = useState(0);
  const [lateFee, setLateFee] = useState(0);
  const [depositAction, setDepositAction] = useState<'refund_full' | 'deduct_fees' | 'no_refund'>('refund_full');
  const [receiverNotes, setReceiverNotes] = useState('');

  // Per-unit inspection state
  const [inspections, setInspections] = useState<
    Record<
      number,
      {
        physicalCondition: string;
        batteryHealth: number;
        damageNotes: string;
        repairCost: number;
        resultingStatus: 'Tersedia' | 'Perawatan' | 'Hilang';
        missingAccessories: string[];
      }
    >
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Ongoing or overdue rentals ready for return
  const activeRentals = rentals.filter(
    (r) => r.rental_status === 'Berlangsung' || r.rental_status === 'Terlambat'
  );

  const filteredActiveRentals = activeRentals.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.rental_code.toLowerCase().includes(q) ||
      (r.customer?.name && r.customer.name.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  const handleSelectRental = (r: Rental) => {
    setSelectedRental(r);
    setSuccessMessage('');
    setErrorMessage('');
    const now = new Date();
    setReturnDate(now.toISOString().substring(0, 16));

    // Calculate late hours if overdue
    const dueTime = new Date(r.due_date).getTime();
    const nowTime = now.getTime();
    if (nowTime > dueTime) {
      const diffHours = Math.max(0, Math.ceil((nowTime - dueTime) / (1000 * 60 * 60)));
      setLateHours(diffHours);
      // Late fee Rp 5.000 / hour / unit
      const unitCount = r.items?.length || 1;
      setLateFee(diffHours * 5000 * unitCount);
      setDepositAction('deduct_fees');
    } else {
      setLateHours(0);
      setLateFee(0);
      setDepositAction('refund_full');
    }

    // Initialize inspection state for each rental item
    const initInsp: Record<number, any> = {};
    r.items?.forEach((it) => {
      initInsp[it.unit_id] = {
        physicalCondition: it.condition_out || 'Sangat Baik',
        batteryHealth: 95,
        damageNotes: '',
        repairCost: 0,
        resultingStatus: 'Tersedia',
        missingAccessories: []
      };
    });
    setInspections(initInsp);
  };

  const updateInspection = (unitId: number, field: string, value: any) => {
    setInspections((prev) => {
      const cur = prev[unitId] || {
        physicalCondition: 'Sangat Baik',
        batteryHealth: 95,
        damageNotes: '',
        repairCost: 0,
        resultingStatus: 'Tersedia',
        missingAccessories: []
      };
      return {
        ...prev,
        [unitId]: {
          ...cur,
          [field]: value
        }
      };
    });
  };

  const toggleMissingAcc = (unitId: number, accName: string) => {
    setInspections((prev) => {
      const cur = prev[unitId];
      if (!cur) return prev;
      const exists = cur.missingAccessories.includes(accName);
      const updated = exists
        ? cur.missingAccessories.filter((a) => a !== accName)
        : [...cur.missingAccessories, accName];
      return {
        ...prev,
        [unitId]: {
          ...cur,
          missingAccessories: updated
        }
      };
    });
  };

  const calculateTotalDamages = () => {
    let total = 0;
    Object.values(inspections).forEach((insp) => {
      total += insp.repairCost || 0;
    });
    return total;
  };

  const handleSubmitReturn = async () => {
    if (!selectedRental) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const itemsPayload = selectedRental.items?.map((it) => {
        const insp = inspections[it.unit_id] || {
          physicalCondition: 'Sangat Baik',
          batteryHealth: 95,
          damageNotes: '',
          repairCost: 0,
          resultingStatus: 'Tersedia',
          missingAccessories: []
        };
        return {
          rental_item_id: it.id,
          unit_id: it.unit_id,
          physical_condition_returned: insp.physicalCondition,
          battery_condition_returned: insp.batteryHealth,
          accessories_missing: insp.missingAccessories,
          damage_notes: insp.damageNotes,
          repair_cost: insp.repairCost,
          resulting_status: insp.resultingStatus
        };
      }) || [];

      await onProcessReturn({
        rental_id: selectedRental.id,
        return_date: returnDate,
        items_inspection: itemsPayload,
        late_hours: lateHours,
        late_fee: lateFee,
        deposit_refund_action: depositAction,
        receiver_notes: receiverNotes
      });

      setSuccessMessage(`Pengembalian untuk sewa ${selectedRental.rental_code} sukses diproses! Status armada telah diperbarui.`);
      setSelectedRental(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses pengembalian unit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: List of Active/Overdue Rentals to Return */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Pilih Transaksi yang Kembali</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {activeRentals.length} transaksi saat ini sedang aktif di luar
          </p>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi sewa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
            />
          </div>

          <div className="mt-3 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredActiveRentals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada transaksi sewa aktif untuk diproses.
              </div>
            ) : (
              filteredActiveRentals.map((r) => {
                const isSelected = selectedRental?.id === r.id;
                const isOverdue = r.rental_status === 'Terlambat' || new Date(r.due_date).getTime() < Date.now();
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRental(r)}
                    className={`w-full text-left p-3 rounded-lg transition-colors my-1 ${
                      isSelected
                        ? 'border border-[#0B2D5B] bg-[#0B2D5B]/5'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#0B2D5B]">{r.rental_code}</span>
                      {isOverdue && (
                        <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Terlambat
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-semibold text-xs text-slate-900 truncate">
                      {r.customer?.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      Tempo: {r.due_date.substring(0, 16)} · {r.items?.length || 0} Unit
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Columns: Inspection & Return Execution Form */}
        <div className="lg:col-span-2">
          {!selectedRental ? (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-400">
              <RotateCcw className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-600">Pilih Transaksi di Sebelah Kiri</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Pilih nomor transaksi sewa untuk memulai inspeksi fisik unit, pemeriksaan aksesori, hitung denda keterlambatan, dan rekonsiliasi deposit.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#0B2D5B]">{selectedRental.rental_code}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedRental.customer?.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Diserahkan: {selectedRental.out_date.substring(0, 16)} | Tempo: {selectedRental.due_date.substring(0, 16)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Uang Jaminan Tersimpan:</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    Rp {selectedRental.deposit_amount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Time of Return & Late Fee Computation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Waktu Pengembalian Aktual</label>
                  <input
                    type="datetime-local"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Keterlambatan (Jam)</label>
                  <input
                    type="number"
                    min="0"
                    value={lateHours}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setLateHours(h);
                      const unitCount = selectedRental.items?.length || 1;
                      setLateFee(h * 5000 * unitCount);
                    }}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Denda Keterlambatan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={lateFee}
                    onChange={(e) => setLateFee(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-rose-700 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Unit Inspection Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800">
                  Inspeksi Fisik Unit & Aksesori Pasca-Sewa:
                </h3>

                {selectedRental.items?.map((it, idx) => {
                  const insp = inspections[it.unit_id] || {
                    physicalCondition: 'Sangat Baik',
                    batteryHealth: 95,
                    damageNotes: '',
                    repairCost: 0,
                    resultingStatus: 'Tersedia',
                    missingAccessories: []
                  };
                  return (
                    <div
                      key={it.id}
                      className="rounded-lg border border-slate-200 p-3 text-xs space-y-3 bg-white"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#0B2D5B]">
                            {it.unit?.unit_code || `Unit #${it.unit_id}`}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 font-mono text-[11px]">{it.unit?.serial_number}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Kondisi keluar: <strong className="text-slate-700">{it.condition_out}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Kondisi Fisik Saat Ini</label>
                          <select
                            value={insp.physicalCondition}
                            onChange={(e) => updateInspection(it.unit_id, 'physicalCondition', e.target.value)}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-xs"
                          >
                            <option value="Sangat Baik">Sangat Baik / Mulus</option>
                            <option value="Lecet Ringan">Lecet Pemakaian Wajar</option>
                            <option value="Goresan Kasar">Goresan Kasar</option>
                            <option value="Casing Retak">Casing Retak / Pecah</option>
                            <option value="Tombol PTT Rusak">Tombol PTT Macet/Rusak</option>
                            <option value="Antena Patah">Antena Patah</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Status Tindak Lanjut</label>
                          <select
                            value={insp.resultingStatus}
                            onChange={(e) => updateInspection(it.unit_id, 'resultingStatus', e.target.value)}
                            className={`mt-1 w-full rounded border px-2 py-1 text-xs font-semibold ${
                              insp.resultingStatus === 'Perawatan'
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : insp.resultingStatus === 'Hilang'
                                ? 'border-rose-300 bg-rose-50 text-rose-800'
                                : 'border-slate-200 text-emerald-800'
                            }`}
                          >
                            <option value="Tersedia">Tersedia (Siap Disewa Lagi)</option>
                            <option value="Perawatan">Masuk Perawatan / Servis</option>
                            <option value="Hilang">Unit Hilang (Ganti Rugi)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600">Biaya Ganti Rugi / Servis (Rp)</label>
                          <input
                            type="number"
                            min="0"
                            step="5000"
                            value={insp.repairCost}
                            onChange={(e) => updateInspection(it.unit_id, 'repairCost', Number(e.target.value))}
                            placeholder="0"
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-xs font-mono text-rose-700"
                          />
                        </div>
                      </div>

                      {insp.resultingStatus === 'Perawatan' && (
                        <div>
                          <label className="block text-[11px] font-semibold text-amber-800">
                            Catatan Kerusakan untuk Teknisi Servis:
                          </label>
                          <input
                            type="text"
                            value={insp.damageNotes}
                            onChange={(e) => updateInspection(it.unit_id, 'damageNotes', e.target.value)}
                            placeholder="Contoh: PTT tidak transmit, tombol switch perlu diganti"
                            className="mt-1 w-full rounded border border-amber-200 bg-amber-50/50 px-2.5 py-1 text-xs text-amber-900"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Deposit Reconciliation Action */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-900">Penyelesaian Uang Jaminan (Deposit):</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded border cursor-pointer ${
                      depositAction === 'refund_full'
                        ? 'border-[#0B2D5B] bg-[#0B2D5B]/5'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="depositAction"
                      checked={depositAction === 'refund_full'}
                      onChange={() => setDepositAction('refund_full')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Kembalikan Penuh</div>
                      <div className="text-[10px] text-slate-500">Unit lengkap tanpa denda/kerusakan</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2.5 rounded border cursor-pointer ${
                      depositAction === 'deduct_fees'
                        ? 'border-[#0B2D5B] bg-[#0B2D5B]/5'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="depositAction"
                      checked={depositAction === 'deduct_fees'}
                      onChange={() => setDepositAction('deduct_fees')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Potong Denda & Servis</div>
                      <div className="text-[10px] text-slate-500">Sisa deposit dikembalikan ke klien</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2.5 rounded border cursor-pointer ${
                      depositAction === 'no_refund'
                        ? 'border-[#0B2D5B] bg-[#0B2D5B]/5'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="depositAction"
                      checked={depositAction === 'no_refund'}
                      onChange={() => setDepositAction('no_refund')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Deposit Hangus</div>
                      <div className="text-[10px] text-slate-500">Unit hilang / kompensasi total</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Catatan Penerima Pengembalian</label>
                <input
                  type="text"
                  value={receiverNotes}
                  onChange={(e) => setReceiverNotes(e.target.value)}
                  placeholder="Contoh: Unit dicek bersama PIC Pak Asep, baterai 95%"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedRental(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReturn}
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#0B2D5B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#072042] disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses Pengembalian...' : 'Selesaikan Pengembalian Unit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
