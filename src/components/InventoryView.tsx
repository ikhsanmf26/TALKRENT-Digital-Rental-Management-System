import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Battery,
  Wrench,
  Radio,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { EquipmentUnit, EquipmentModel, UnitStatus } from '../types';

interface InventoryViewProps {
  units: EquipmentUnit[];
  models: EquipmentModel[];
  onRefresh: () => void;
  onCreateUnit: (data: any) => Promise<void>;
  onUpdateUnit: (id: number, data: any) => Promise<void>;
  onDeleteUnit: (id: number) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  units,
  models,
  onRefresh,
  onCreateUnit,
  onUpdateUnit,
  onDeleteUnit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [modelFilter, setModelFilter] = useState<number | 'Semua'>('Semua');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<EquipmentUnit | null>(null);
  const [detailUnit, setDetailUnit] = useState<EquipmentUnit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formModelId, setFormModelId] = useState(models[0]?.id || 1);
  const [formUnitCode, setFormUnitCode] = useState('');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formCondition, setFormCondition] = useState('Sangat Baik');
  const [formBatteryHealth, setFormBatteryHealth] = useState(100);
  const [formPurchaseDate, setFormPurchaseDate] = useState(new Date().toISOString().substring(0, 10));
  const [formPurchasePrice, setFormPurchasePrice] = useState(135000);
  const [formStatus, setFormStatus] = useState<UnitStatus>('Tersedia');
  const [formNotes, setFormNotes] = useState('');

  // Filtered list
  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.unit_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.notes && u.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.model?.model_name && u.model.model_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'Semua' || u.status === statusFilter;
    const matchesModel = modelFilter === 'Semua' || u.model_id === modelFilter;

    return matchesSearch && matchesStatus && matchesModel;
  });

  const openAddModal = () => {
    // Generate next asset code
    const maxNumber = units.reduce((acc, u) => {
      const match = u.unit_code.match(/TR-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return Math.max(acc, num);
      }
      return acc;
    }, 0);
    const nextCode = `TR-${String(maxNumber + 1).padStart(3, '0')}`;

    setFormModelId(models[0]?.id || 1);
    setFormUnitCode(nextCode);
    setFormSerialNumber(`WLN-${Date.now().toString().slice(-6)}`);
    setFormCondition('Sangat Baik');
    setFormBatteryHealth(100);
    setFormPurchaseDate(new Date().toISOString().substring(0, 10));
    setFormPurchasePrice(135000);
    setFormStatus('Tersedia');
    setFormNotes('Standby armada');
    setErrorMessage('');
    setShowAddModal(true);
  };

  const openEditModal = (unit: EquipmentUnit) => {
    setEditingUnit(unit);
    setFormModelId(unit.model_id);
    setFormUnitCode(unit.unit_code);
    setFormSerialNumber(unit.serial_number);
    setFormCondition(unit.physical_condition);
    setFormBatteryHealth(unit.battery_health);
    setFormPurchaseDate(unit.purchase_date);
    setFormPurchasePrice(unit.purchase_price);
    setFormStatus(unit.status);
    setFormNotes(unit.notes || '');
    setErrorMessage('');
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreateUnit({
        model_id: formModelId,
        unit_code: formUnitCode,
        serial_number: formSerialNumber,
        physical_condition: formCondition,
        battery_health: formBatteryHealth,
        purchase_date: formPurchaseDate,
        purchase_price: formPurchasePrice,
        status: formStatus,
        notes: formNotes
      });
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan unit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onUpdateUnit(editingUnit.id, {
        model_id: formModelId,
        unit_code: formUnitCode,
        serial_number: formSerialNumber,
        physical_condition: formCondition,
        battery_health: formBatteryHealth,
        purchase_date: formPurchaseDate,
        purchase_price: formPurchasePrice,
        status: formStatus,
        notes: formNotes
      });
      setEditingUnit(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui unit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (unit: EquipmentUnit) => {
    if (!confirm(`Hapus unit ${unit.unit_code} (${unit.serial_number}) dari sistem?`)) return;
    try {
      await onDeleteUnit(unit.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus unit.');
    }
  };

  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case 'Tersedia':
        return <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Tersedia</span>;
      case 'Disewa':
        return <span className="text-[#0B2D5B] font-semibold text-xs flex items-center gap-1"><Radio className="h-3 w-3" /> Sedang Disewa</span>;
      case 'Dipesan':
        return <span className="text-[#4DA3FF] font-semibold text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Dipesan</span>;
      case 'Perawatan':
        return <span className="text-amber-700 font-semibold text-xs flex items-center gap-1"><Wrench className="h-3 w-3" /> Perawatan</span>;
      case 'Hilang':
        return <span className="text-rose-700 font-semibold text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Hilang</span>;
      default:
        return <span className="text-slate-500 font-semibold text-xs">Tidak Aktif</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode TR-001, no seri, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0B2D5B] focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-[#0B2D5B] focus:outline-hidden"
          >
            <option value="Semua">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Disewa">Sedang Disewa</option>
            <option value="Dipesan">Dipesan</option>
            <option value="Perawatan">Perawatan</option>
            <option value="Hilang">Hilang</option>
          </select>

          {/* Model Filter */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))}
            className="hidden md:block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-[#0B2D5B] focus:outline-hidden"
          >
            <option value="Semua">Semua Tipe WLN</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.model_name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Unit HT</span>
        </button>
      </div>

      {/* Unit Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Kode Unit</th>
                <th className="py-3 px-4">Tipe & Merek</th>
                <th className="py-3 px-4">Nomor Seri</th>
                <th className="py-3 px-4">Kondisi Fisik</th>
                <th className="py-3 px-4">Kesehatan Baterai</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada unit HT yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#0B2D5B]">{u.unit_code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{u.model?.model_name || 'WLN Series'}</div>
                      <div className="text-[10px] text-slate-400">{u.model?.frequency_range} · {u.model?.power_output}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.serial_number}</td>
                    <td className="py-3 px-4 text-slate-700">{u.physical_condition}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Battery className={`h-3.5 w-3.5 ${u.battery_health >= 90 ? 'text-emerald-600' : u.battery_health >= 75 ? 'text-amber-500' : 'text-rose-600'}`} />
                        <span className="tabular-nums font-semibold text-slate-800">{u.battery_health}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(u.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailUnit(u)}
                          title="Lihat Detail"
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          title="Edit Unit"
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-[#0B2D5B]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          title="Hapus Unit"
                          className="rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500 bg-slate-50/50">
          <span>Menampilkan {filteredUnits.length} dari {units.length} total unit HT WLN</span>
          <span>Kabupaten Tasikmalaya</span>
        </div>
      </div>

      {/* MODAL: ADD / EDIT UNIT */}
      {(showAddModal || editingUnit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingUnit ? `Edit Data Unit ${editingUnit.unit_code}` : 'Tambah Unit HT Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUnit(null);
                }}
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

            <form onSubmit={editingUnit ? handleSubmitEdit : handleSubmitAdd} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Kode Unit Aset</label>
                  <input
                    type="text"
                    required
                    value={formUnitCode}
                    onChange={(e) => setFormUnitCode(e.target.value)}
                    placeholder="TR-019"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Nomor Seri Fisik</label>
                  <input
                    type="text"
                    required
                    value={formSerialNumber}
                    onChange={(e) => setFormSerialNumber(e.target.value)}
                    placeholder="WLN-C1-889119"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Model Handy Talkie</label>
                <select
                  value={formModelId}
                  onChange={(e) => setFormModelId(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model_name} (Tarif: Rp {m.daily_rate.toLocaleString()}/hari)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Kondisi Fisik</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Mulus">Mulus</option>
                    <option value="Lecet Halus">Lecet Halus</option>
                    <option value="Goresan Sedang">Goresan Sedang</option>
                    <option value="Tombol Aus">Tombol Aus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Kesehatan Baterai (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formBatteryHealth}
                    onChange={(e) => setFormBatteryHealth(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tanggal Pembelian</label>
                  <input
                    type="date"
                    required
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Status Operasional Unit</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as UnitStatus)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Disewa">Disewa</option>
                  <option value="Dipesan">Dipesan</option>
                  <option value="Perawatan">Perawatan</option>
                  <option value="Hilang">Hilang</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Catatan Unit / Lokasi Rak</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Rak A1, dilengkapi klip sabuk baru"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUnit(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UNIT DETAIL */}
      {detailUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-sm font-bold text-[#0B2D5B]">{detailUnit.unit_code}</span>
                <h3 className="text-base font-bold text-slate-900">{detailUnit.model?.model_name}</h3>
              </div>
              <button
                onClick={() => setDetailUnit(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Merek & Model</span>
                <span className="font-semibold text-slate-800">{detailUnit.model?.brand} - {detailUnit.model?.model_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nomor Seri</span>
                <span className="font-mono text-slate-800">{detailUnit.serial_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kondisi Fisik</span>
                <span className="font-semibold text-slate-800">{detailUnit.physical_condition}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kesehatan Baterai</span>
                <span className="font-semibold text-slate-800">{detailUnit.battery_health}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Pembelian</span>
                <span className="text-slate-800">{detailUnit.purchase_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Harga Perolehan</span>
                <span className="text-slate-800">Rp {detailUnit.purchase_price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status Saat Ini</span>
                <span>{getStatusBadge(detailUnit.status)}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500">Catatan Rak / Logistik:</span>
                <p className="mt-1 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                  {detailUnit.notes || 'Tidak ada catatan khusus.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-200 pt-3">
              <button
                onClick={() => setDetailUnit(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
