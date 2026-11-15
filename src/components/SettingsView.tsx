import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  QrCode,
  FileText,
  ShieldCheck,
  History
} from 'lucide-react';
import { AppSettings, AuditLog } from '../types';

interface SettingsViewProps {
  settings: AppSettings | null;
  auditLogs: AuditLog[];
  onUpdateSettings: (data: Partial<AppSettings>) => Promise<void>;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  auditLogs,
  onUpdateSettings,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'rates' | 'payment' | 'audit'>('profile');

  // Form states
  const [businessName, setBusinessName] = useState(settings?.business_name || 'TALKRENT');
  const [brandTagline, setBrandTagline] = useState(settings?.brand_tagline || 'Your Communication Partner.');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState(settings?.phone_whatsapp || '087861608958');
  const [email, setEmail] = useState(settings?.email || 'rental@talkrent.id');
  const [address, setAddress] = useState(
    settings?.address || 'Jl. Raya Singaparna KM 9 No. 45, Kabupaten Tasikmalaya, Jawa Barat 46411'
  );

  const [defaultDailyRate, setDefaultDailyRate] = useState(settings?.default_daily_rate || 20000);
  const [lateFeePerHour, setLateFeePerHour] = useState(settings?.late_fee_per_hour || 5000);
  const [lateFeePerDay, setLateFeePerDay] = useState(settings?.late_fee_per_day || 35000);
  const [defaultDepositRate, setDefaultDepositRate] = useState(settings?.default_deposit_rate || 50000);

  const [bankName, setBankName] = useState(settings?.bank_name || 'Bank Central Asia (BCA)');
  const [bankAccountNumber, setBankAccountNumber] = useState(settings?.bank_account_number || '0540-881-921');
  const [bankAccountName, setBankAccountName] = useState(settings?.bank_account_name || 'TALKRENT TASIKMALAYA');
  const [terms, setTerms] = useState(settings?.terms_and_conditions || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await onUpdateSettings({
        business_name: businessName,
        brand_tagline: brandTagline,
        phone_whatsapp: phoneWhatsapp,
        email,
        address,
        default_daily_rate: defaultDailyRate,
        late_fee_per_hour: lateFeePerHour,
        late_fee_per_day: lateFeePerDay,
        default_deposit_rate: defaultDepositRate,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
        terms_and_conditions: terms
      });
      setSuccessMessage('Pengaturan bisnis berhasil diperbarui ke database!');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg self-start">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profil Bisnis
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'rates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tarif & Aturan Denda
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'payment' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rekening & QRIS
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Log Sistem ({auditLogs.length})
        </button>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          {errorMessage}
        </div>
      )}

      {activeTab !== 'audit' ? (
        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Identitas Brand & Kontak Resmi</h3>
                <p className="text-slate-500 text-[11px]">Informasi yang tercetak pada nota rental dan kontak WhatsApp</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                <div className="flex items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center justify-center shrink-0">
                    <img
                      src="/talkrent_logo.png"
                      alt="TALKRENT Official Logo"
                      className="h-14 w-14 object-contain drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Logo Bisnis TALKRENT</div>
                    <div className="text-[11px] text-slate-500">Your Communication Partner</div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center justify-center shrink-0">
                    <img
                      src="/admin_logo.png"
                      alt="Logo Admin Pengelola"
                      className="h-14 w-14 object-contain drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Logo Admin / Pengelola</div>
                    <div className="text-[11px] text-slate-500">Dewan Kerja Cabang Kab. Tasikmalaya</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">Nama Usaha</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Tagline Usaha</label>
                  <input
                    type="text"
                    required
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">Nomor WhatsApp Resmi</label>
                  <input
                    type="text"
                    required
                    value={phoneWhatsapp}
                    onChange={(e) => setPhoneWhatsapp(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Email Bisnis</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Alamat Operasional di Tasikmalaya</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'rates' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Tarif Standar & Regulasi Denda Keterlambatan</h3>
                <p className="text-slate-500 text-[11px]">Digunakan sebagai nilai default kalkulasi otomatis sistem</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">Tarif Sewa Default (Rp / Hari / Unit)</label>
                  <input
                    type="number"
                    min="10000"
                    step="1000"
                    required
                    value={defaultDailyRate}
                    onChange={(e) => setDefaultDailyRate(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">*Khusus unit tipe dasar KD-C1</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Uang Jaminan / Deposit Default (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    required
                    value={defaultDepositRate}
                    onChange={(e) => setDefaultDepositRate(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">Denda Terlambat per Jam (Rp / Unit)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={lateFeePerHour}
                    onChange={(e) => setLateFeePerHour(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Denda Terlambat per Hari Penuh (Rp / Unit)</label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    required
                    value={lateFeePerDay}
                    onChange={(e) => setLateFeePerDay(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Syarat & Ketentuan Penggunaan (S&K)</label>
                <textarea
                  rows={4}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Rekening Bank & QRIS TALKRENT</h3>
                <p className="text-slate-500 text-[11px]">Tercantum pada invoice untuk pembayaran transfer bank & QRIS</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700">Nama Bank</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Atas Nama Pemilik</label>
                  <input
                    type="text"
                    required
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 flex items-center gap-4">
                <div className="h-24 w-24 bg-white p-1 rounded border border-slate-300 shrink-0">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TALKRENT+TASIKMALAYA+QRIS"
                    alt="QRIS Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-900">QRIS Dinamis / Statis TALKRENT</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Menerima pembayaran digital dari BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, dan ShopeePay.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end border-t border-slate-200 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-[#FF8C00] px-5 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* AUDIT LOGS VIEW */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Log Aktivitas & Audit Keamanan Sistem</h2>
            <p className="text-xs text-slate-500 mt-0.5">Merekam setiap aksi pembuatan, edit, sewa, dan pengembalian unit</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Tabel Terkait</th>
                  <th className="py-3 px-4">Deskripsi Aktivitas</th>
                  <th className="py-3 px-4">IP Akses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{log.created_at}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#0B2D5B]">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{log.entity_type}</td>
                    <td className="py-3 px-4 text-slate-800">{log.description}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
