import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Radio,
  TrendingUp,
  Award,
  Users,
  FileSpreadsheet
} from 'lucide-react';
import { Rental, EquipmentUnit, Customer, Expense, Payment } from '../types';
import { printReportElement } from '../utils/printInvoice';

interface ReportsViewProps {
  rentals: Rental[];
  units: EquipmentUnit[];
  customers: Customer[];
  expenses: Expense[];
  payments: Payment[];
  financialSummary: any;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  rentals,
  units,
  customers,
  expenses,
  payments,
  financialSummary
}) => {
  const [reportType, setReportType] = useState<'overview' | 'units' | 'customers' | 'ledger'>('overview');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Unit popularity calculation
  const unitRentalCounts: Record<number, number> = {};
  rentals.forEach((r) => {
    r.items?.forEach((it) => {
      unitRentalCounts[it.unit_id] = (unitRentalCounts[it.unit_id] || 0) + 1;
    });
  });

  const unitsRanked = [...units].sort((a, b) => {
    return (unitRentalCounts[b.id] || 0) - (unitRentalCounts[a.id] || 0);
  });

  // Customer spend ranking
  const customerSpend: Record<number, { count: number; spend: number }> = {};
  rentals.forEach((r) => {
    const prev = customerSpend[r.customer_id] || { count: 0, spend: 0 };
    customerSpend[r.customer_id] = {
      count: prev.count + 1,
      spend: prev.spend + r.total_cost
    };
  });

  const customersRanked = [...customers].sort((a, b) => {
    const spendA = customerSpend[a.id]?.spend || 0;
    const spendB = customerSpend[b.id]?.spend || 0;
    return spendB - spendA;
  });

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'units') {
      csvContent += 'Kode Unit,Nomor Seri,Model,Kondisi,Baterai,Status,Total Disewa\n';
      unitsRanked.forEach((u) => {
        csvContent += `"${u.unit_code}","${u.serial_number}","${u.model?.model_name}","${u.physical_condition}",${u.battery_health}%,${u.status},${unitRentalCounts[u.id] || 0}\n`;
      });
    } else if (reportType === 'customers') {
      csvContent += 'Kode Pelanggan,Nama,WhatsApp,Organisasi,Total Transaksi,Total Pengeluaran (Rp)\n';
      customersRanked.forEach((c) => {
        const cs = customerSpend[c.id] || { count: 0, spend: 0 };
        csvContent += `"${c.customer_code}","${c.name}","${c.whatsapp}","${c.organization}",${cs.count},${cs.spend}\n`;
      });
    } else {
      csvContent += 'No Transaksi,Tanggal,Penyewa,Total Biaya (Rp),Status Sewa,Status Bayar\n';
      rentals.forEach((r) => {
        csvContent += `"${r.rental_code}","${r.out_date}","${r.customer?.name}",${r.total_cost},"${r.rental_status}","${r.payment_status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `talkrent_laporan_${reportType}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Controls */}
      <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setReportType('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              reportType === 'overview' ? 'bg-[#0B2D5B] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ringkasan Eksekutif
          </button>
          <button
            onClick={() => setReportType('units')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              reportType === 'units' ? 'bg-[#0B2D5B] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unit Terpopuler
          </button>
          <button
            onClick={() => setReportType('customers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              reportType === 'customers' ? 'bg-[#0B2D5B] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Performa Pelanggan
          </button>
          <button
            onClick={() => setReportType('ledger')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              reportType === 'ledger' ? 'bg-[#0B2D5B] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Buku Transaksi Lengkap
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            onClick={() => printReportElement('report-printable-area', `Laporan TALKRENT - ${reportType.toUpperCase()}`)}
            className="flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#072042] transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-[#FF8C00]" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      <div id="report-printable-area" className="space-y-6">

      {/* VIEW: EXECUTIVE OVERVIEW */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="text-xs font-bold uppercase text-[#FF8C00]">TALKRENT LAPORAN OPERASIONAL</div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Laporan Performa Bisnis Rental Handy Talkie WLN
              </h2>
              <p className="text-xs text-slate-500">
                Kabupaten Tasikmalaya, Jawa Barat · Periode Berjalan 2026
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-500">Total Transaksi Selesai</span>
                <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                  {rentals.filter((r) => r.rental_status === 'Selesai').length} Transaksi
                </div>
              </div>
              <div>
                <span className="text-slate-500">Akumulasi Pemasukan Sewa</span>
                <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                  {formatRupiah(financialSummary?.totalIncome || 0)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Total Biaya & Perawatan</span>
                <div className="text-xl font-bold text-rose-600 mt-1 tabular-nums">
                  {formatRupiah(financialSummary?.totalExpenses || 0)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Laba Bersih Operasional</span>
                <div className="text-xl font-bold text-[#0B2D5B] mt-1 tabular-nums">
                  {formatRupiah(financialSummary?.operationalProfit || 0)}
                </div>
              </div>
            </div>

            <div className="pt-4 text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                <strong>Kesimpulan Manajemen:</strong> Sistem TALKRENT beroperasi dengan tingkat ketersediaan armada yang stabil. Mayoritas pelanggan berasal dari sektor Wedding Organizer dan penyelenggara acara di kawasan Singaparna, Rajapolah, dan Manonjaya.
              </p>
              <p>
                Dana jaminan penyewa (deposit) yang tersimpan saat ini tercatat sebesar <strong>{formatRupiah(financialSummary?.activeDepositHeld || 0)}</strong> dan terpisah dari pos pemasukan operasional.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TOP RENTED UNITS */}
      {reportType === 'units' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Peringkat Frekuensi Penyewaan Unit Armada HT</h2>
            <p className="text-xs text-slate-500 mt-0.5">Memantau unit yang paling sering disewa dan waktu aus baterai</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">Kode Unit</th>
                  <th className="py-3 px-4">Model & Tipe</th>
                  <th className="py-3 px-4">No. Seri</th>
                  <th className="py-3 px-4">Kesehatan Baterai</th>
                  <th className="py-3 px-4">Frekuensi Disewa</th>
                  <th className="py-3 px-4">Status Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unitsRanked.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-400 font-mono">#{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2D5B]">{u.unit_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{u.model?.model_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.serial_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{u.battery_health}%</td>
                    <td className="py-3 px-4 font-bold text-[#0B2D5B] font-mono tabular-nums">
                      {unitRentalCounts[u.id] || 0} Kali Sewa
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-slate-700">{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: TOP CUSTOMERS */}
      {reportType === 'customers' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Performa & Riwayat Nilai Pelanggan</h2>
            <p className="text-xs text-slate-500 mt-0.5">Analisis pelanggan paling aktif di Kabupaten Tasikmalaya</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Pelanggan</th>
                  <th className="py-3 px-4">Kontak WhatsApp</th>
                  <th className="py-3 px-4">Instansi</th>
                  <th className="py-3 px-4">Jumlah Sewa</th>
                  <th className="py-3 px-4 text-right">Total Transaksi (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersRanked.map((c) => {
                  const cs = customerSpend[c.id] || { count: 0, spend: 0 };
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-[#0B2D5B]">{c.customer_code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{c.whatsapp}</td>
                      <td className="py-3 px-4 text-slate-700">{c.organization || '-'}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{cs.count} Transaksi</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        Rp {cs.spend.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: FULL TRANSACTION LEDGER */}
      {reportType === 'ledger' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Seluruh Transaksi Rental & Pengembalian</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">No Transaksi</th>
                  <th className="py-3 px-4">Penyewa</th>
                  <th className="py-3 px-4">Tanggal Keluar</th>
                  <th className="py-3 px-4">Tanggal Tempo</th>
                  <th className="py-3 px-4">Biaya Total</th>
                  <th className="py-3 px-4">Status Sewa</th>
                  <th className="py-3 px-4">Status Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2D5B]">{r.rental_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.customer?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{r.out_date.substring(0, 16)}</td>
                    <td className="py-3 px-4 text-slate-600">{r.due_date.substring(0, 16)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      Rp {r.total_cost.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.rental_status}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
