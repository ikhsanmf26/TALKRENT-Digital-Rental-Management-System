import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Radio,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { MaintenanceRecord, EquipmentUnit, MaintenanceStatus } from '../types';

interface MaintenanceViewProps {
  records: MaintenanceRecord[];
  units: EquipmentUnit[];
  onRefresh: () => void;
  onCreateMaintenance: (data: any) => Promise<void>;
  onUpdateStatus: (id: number, status: string, cost?: number, notes?: string) => Promise<void>;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  records,
  units,
  onRefresh,
  onCreateMaintenance,
  onUpdateStatus
}) => {
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [completingRecord, setCompletingRecord] = useState<MaintenanceRecord | null>(null);

  // Form add ticket
  const [formUnitId, setFormUnitId] = useState<number>(units[0]?.id || 1);
  const [formCheckDate, setFormCheckDate] = useState(new Date().toISOString().substring(0, 10));
  const [formDamageType, setFormDamageType] = useState('Tombol PTT Rusak');
  const [formDescription, setFormDescription] = useState('');
  const [formCost, setFormCost] = useState(35000);
  const [formNotes, setFormNotes] = useState('');

  // Form complete ticket
  const [actualCost, setActualCost] = useState(0);
  const [technicianNotes, setTechnicianNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const filteredRecords = records.filter((r) => {
    return statusFilter === 'Semua' || r.status === statusFilter;
  });

  const openAddModal = () => {
    setFormUnitId(units[0]?.id || 1);
    setFormCheckDate(new Date().toISOString().substring(0, 10));
    setFormDamageType('Tombol PTT Rusak');
    setFormDescription('');
    setFormCost(35000);
    setFormNotes('Dicek teknisi radio Tasikmalaya');
    setErrorMessage('');
    setShowAddModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreateMaintenance({
        unit_id: formUnitId,
        check_date: formCheckDate,
        damage_type: formDamageType,
        damage_description: formDescription,
        cost: formCost,
        status: 'Dilaporkan',
        technician_notes: formNotes
      });
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat tiket perawatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteComplete = async () => {
    if (!completingRecord) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onUpdateStatus(completingRecord.id, 'Selesai', actualCost, technicianNotes);
      setCompletingRecord(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyelesaikan tiket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'Selesai':
        return <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Selesai Diservis</span>;
      case 'Dalam Proses':
        return <span className="text-amber-700 font-semibold text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Sedang Dikerjakan</span>;
      case 'Dilaporkan':
        return <span className="text-[#0B2D5B] font-semibold text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Dilaporkan</span>;
      default:
        return <span className="text-slate-500 font-semibold text-xs">Dibatalkan</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-[#0B2D5B] focus:outline-hidden"
          >
            <option value="Semua">Semua Tiket</option>
            <option value="Dilaporkan">Dilaporkan</option>
            <option value="Dalam Proses">Dalam Proses</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Tiket Perawatan</span>
        </button>
      </div>

      {/* Maintenance Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">No Tiket</th>
                <th className="py-3 px-4">Unit HT</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4">Jenis Masalah</th>
                <th className="py-3 px-4">Rincian Kerusakan</th>
                <th className="py-3 px-4">Biaya Servis</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada riwayat tiket perawatan armada.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2D5B]">{m.maintenance_code}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-900">{m.unit?.unit_code || `Unit #${m.unit_id}`}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.unit?.serial_number}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.check_date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{m.damage_type}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{m.damage_description}</td>
                    <td className="py-3 px-4 font-mono text-slate-800 tabular-nums">
                      Rp {m.cost.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(m.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {m.status !== 'Selesai' && m.status !== 'Dibatalkan' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {m.status === 'Dilaporkan' && (
                            <button
                              onClick={() => onUpdateStatus(m.id, 'Dalam Proses')}
                              className="rounded bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 whitespace-nowrap"
                            >
                              Mulai Servis
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setCompletingRecord(m);
                              setActualCost(m.cost);
                              setTechnicianNotes(m.technician_notes || 'Perbaikan selesai, unit normal 100%');
                              setErrorMessage('');
                            }}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 whitespace-nowrap"
                          >
                            Tandai Selesai
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {m.completion_date ? `Selesai: ${m.completion_date}` : 'Closed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500 bg-slate-50/50">
          <span>Menampilkan {filteredRecords.length} tiket perawatan</span>
          <span>Armada TALKRENT Tasikmalaya</span>
        </div>
      </div>

      {/* MODAL: ADD TICKET */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Buat Tiket Perawatan Unit HT</h3>
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
                <label className="block font-semibold text-slate-700">Pilih Unit HT</label>
                <select
                  required
                  value={formUnitId}
                  onChange={(e) => setFormUnitId(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit_code} - {u.model?.model_name} (Status: {u.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Tanggal Pemeriksaan</label>
                  <input
                    type="date"
                    required
                    value={formCheckDate}
                    onChange={(e) => setFormCheckDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Estimasi Biaya Servis (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Jenis Kerusakan / Masalah</label>
                <select
                  value={formDamageType}
                  onChange={(e) => setFormDamageType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                >
                  <option value="Tombol PTT Rusak">Tombol PTT Macet / Aus</option>
                  <option value="Antena Patah">Antena Patah / Drat Longgar</option>
                  <option value="Baterai Drop">Baterai Drop / Tidak Menyimpan Daya</option>
                  <option value="Speaker Rusak">Speaker / Suara Kresek-kresek</option>
                  <option value="Casing Retak">Casing Retak / Klip Patah</option>
                  <option value="Pemeliharaan Rutin">Pemeliharaan & Pembersihan Rutin</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Deskripsi Gejala Kerusakan</label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan kendala modulasi, fisik, atau baterai..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Catatan Teknisi / Mitra</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Dibawa ke teknisi radio Jl. HZ Mustofa"
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
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#FF8C00] px-4 py-2 font-semibold text-white hover:bg-[#e67e00] disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Kirim Tiket Perawatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE TICKET */}
      {completingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#0B2D5B]">{completingRecord.maintenance_code}</span>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Servis Selesai</h3>
              </div>
              <button
                onClick={() => setCompletingRecord(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Menandai tiket ini selesai akan secara otomatis mengembalikan unit{' '}
                <strong>{completingRecord.unit?.unit_code}</strong> ke status <strong>Tersedia</strong> dan mencatat biaya perbaikan ke laporan keuangan.
              </p>

              <div>
                <label className="block font-semibold text-slate-700">Biaya Riil Perbaikan (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={actualCost}
                  onChange={(e) => setActualCost(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-slate-900 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Laporan Akhir Teknisi</label>
                <textarea
                  rows={2}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setCompletingRecord(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteComplete}
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Pulihkan Unit ke Tersedia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
