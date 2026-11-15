import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageCircle,
  Building,
  MapPin,
  Edit2,
  Eye,
  X,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  onRefresh: () => void;
  onCreateCustomer: (data: any) => Promise<void>;
  onUpdateCustomer: (id: number, data: any) => Promise<void>;
  onSelectCustomerDetail?: (id: number) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onRefresh,
  onCreateCustomer,
  onUpdateCustomer,
  onSelectCustomerDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.customer_code.toLowerCase().includes(q) ||
      c.whatsapp.includes(q) ||
      c.organization.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setFormName('');
    setFormWhatsapp('');
    setFormEmail('');
    setFormOrg('');
    setFormAddress('Kabupaten Tasikmalaya');
    setFormNotes('');
    setErrorMessage('');
    setShowAddModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormWhatsapp(c.whatsapp);
    setFormEmail(c.email || '');
    setFormOrg(c.organization || '');
    setFormAddress(c.address || '');
    setFormNotes(c.notes || '');
    setErrorMessage('');
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreateCustomer({
        name: formName,
        whatsapp: formWhatsapp,
        email: formEmail,
        organization: formOrg,
        address: formAddress,
        notes: formNotes
      });
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menambahkan pelanggan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onUpdateCustomer(editingCustomer.id, {
        name: formName,
        whatsapp: formWhatsapp,
        email: formEmail,
        organization: formOrg,
        address: formAddress,
        notes: formNotes
      });
      setEditingCustomer(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, WhatsApp, instansi, alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0B2D5B] focus:outline-hidden"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">WhatsApp / Kontak</th>
                <th className="py-3 px-4">Instansi / Organisasi</th>
                <th className="py-3 px-4">Alamat Domisili</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data pelanggan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2D5B]">{c.customer_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700">{c.whatsapp}</span>
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/^0/, '62').replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(c.name)},%20kami%20dari%20TALKRENT%20Tasikmalaya.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Kirim WhatsApp"
                          className="flex h-5 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {c.organization ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{c.organization}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{c.address || 'Tasikmalaya'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[150px]">
                      {c.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewCustomer(c)}
                          title="Lihat Detail Pelanggan"
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          title="Edit Pelanggan"
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-[#0B2D5B]"
                        >
                          <Edit2 className="h-4 w-4" />
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
          <span>Total {filteredCustomers.length} pelanggan terdaftar</span>
          <span>Database TALKRENT Tasikmalaya</span>
        </div>
      </div>

      {/* MODAL: ADD / EDIT CUSTOMER */}
      {(showAddModal || editingCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomer ? `Edit Pelanggan: ${editingCustomer.name}` : 'Tambah Pelanggan Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCustomer(null);
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

            <form onSubmit={editingCustomer ? handleSubmitEdit : handleSubmitAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Nama Lengkap / Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Asep Saepuloh"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Nomor WhatsApp Aktif</label>
                  <input
                    type="text"
                    required
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email (Opsional)</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Instansi / Event Organizer / Komunitas</label>
                <input
                  type="text"
                  value={formOrg}
                  onChange={(e) => setFormOrg(e.target.value)}
                  placeholder="Contoh: Sanggar Seni Tasikmalaya / WO Sukapura"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Alamat Lengkap di Tasikmalaya</label>
                <textarea
                  rows={2}
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Jl. Raya Singaparna No..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Catatan Khusus</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Langganan event tahunan"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCustomer(null);
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER DETAIL */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#0B2D5B]">{viewCustomer.customer_code}</span>
                <h3 className="text-base font-bold text-slate-900">{viewCustomer.name}</h3>
              </div>
              <button
                onClick={() => setViewCustomer(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nomor WhatsApp</span>
                <span className="font-mono font-semibold text-slate-900">{viewCustomer.whatsapp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-900">{viewCustomer.email || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Instansi / Lembaga</span>
                <span className="font-semibold text-slate-900">{viewCustomer.organization || '-'}</span>
              </div>
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500">Alamat</span>
                <p className="mt-0.5 text-slate-800">{viewCustomer.address}</p>
              </div>
              <div className="py-1">
                <span className="text-slate-500">Catatan Pelanggan:</span>
                <p className="mt-1 text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {viewCustomer.notes || 'Tidak ada catatan khusus.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3">
              <a
                href={`https://wa.me/${viewCustomer.whatsapp.replace(/^0/, '62').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Chat WhatsApp</span>
              </a>
              <button
                onClick={() => setViewCustomer(null)}
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
