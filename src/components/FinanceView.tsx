import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Payment, Expense, ExpenseCategory, PaymentMethod, PaymentType } from '../types';

interface FinanceViewProps {
  payments: Payment[];
  expenses: Expense[];
  financialSummary: any;
  onRefresh: () => void;
  onCreateExpense: (data: any) => Promise<void>;
  onUpdatePayment?: (id: number, data: any) => Promise<void>;
  onDeletePayment?: (id: number) => Promise<void>;
  onUpdateExpense?: (id: number, data: any) => Promise<void>;
  onDeleteExpense?: (id: number) => Promise<void>;
  onResetTrialData?: () => Promise<void>;
  onNavigateTab?: (tab: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  payments,
  expenses,
  financialSummary,
  onRefresh,
  onCreateExpense,
  onUpdatePayment,
  onDeletePayment,
  onUpdateExpense,
  onDeleteExpense,
  onResetTrialData,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'income' | 'expenses'>('summary');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Edit / Delete Payment state
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentEditAmount, setPaymentEditAmount] = useState<number>(0);
  const [paymentEditType, setPaymentEditType] = useState<PaymentType>('Sewa');
  const [paymentEditMethod, setPaymentEditMethod] = useState<PaymentMethod>('Tunai');
  const [paymentEditDate, setPaymentEditDate] = useState<string>('');
  const [paymentEditNotes, setPaymentEditNotes] = useState<string>('');
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);

  // Edit / Delete Expense state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseEditCategory, setExpenseEditCategory] = useState<ExpenseCategory>('Perawatan HT');
  const [expenseEditAmount, setExpenseEditAmount] = useState<number>(0);
  const [expenseEditDate, setExpenseEditDate] = useState<string>('');
  const [expenseEditDescription, setExpenseEditDescription] = useState<string>('');
  const [expenseEditMethod, setExpenseEditMethod] = useState<'Tunai' | 'Transfer Bank'>('Tunai');
  const [expenseEditRecipient, setExpenseEditRecipient] = useState<string>('');
  const [expenseEditNotes, setExpenseEditNotes] = useState<string>('');
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  // Reset Trial Data Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('Semua');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('Semua');

  // New Expense form
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Perawatan HT');
  const [formAmount, setFormAmount] = useState(50000);
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formDescription, setFormDescription] = useState('');
  const [formMethod, setFormMethod] = useState<'Tunai' | 'Transfer Bank'>('Tunai');
  const [formRecipient, setFormRecipient] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesType = paymentTypeFilter === 'Semua' || p.type === paymentTypeFilter;
    const matchesStart = !startDate || p.payment_date.substring(0, 10) >= startDate;
    const matchesEnd = !endDate || p.payment_date.substring(0, 10) <= endDate;
    return matchesType && matchesStart && matchesEnd;
  });

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = expenseCategoryFilter === 'Semua' || e.category === expenseCategoryFilter;
    const matchesStart = !startDate || e.expense_date >= startDate;
    const matchesEnd = !endDate || e.expense_date <= endDate;
    return matchesCat && matchesStart && matchesEnd;
  });

  // Handle Add Expense
  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreateExpense({
        category: formCategory,
        amount: formAmount,
        expense_date: formDate,
        description: formDescription,
        payment_method: formMethod,
        recipient: formRecipient,
        notes: formNotes
      });
      setShowAddExpenseModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pengeluaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Payment Modal
  const handleOpenEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentEditAmount(payment.amount);
    setPaymentEditType(payment.type);
    setPaymentEditMethod(payment.payment_method);
    setPaymentEditDate(payment.payment_date ? payment.payment_date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    setPaymentEditNotes(payment.notes || '');
    setErrorMessage('');
  };

  // Submit Edit Payment
  const handleSubmitEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment || !onUpdatePayment) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onUpdatePayment(editingPayment.id, {
        amount: paymentEditAmount,
        type: paymentEditType,
        payment_method: paymentEditMethod,
        payment_date: paymentEditDate,
        notes: paymentEditNotes
      });
      setEditingPayment(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui transaksi pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Payment
  const handleConfirmDeletePayment = async () => {
    if (!deletingPaymentId || !onDeletePayment) return;
    setIsSubmitting(true);
    try {
      await onDeletePayment(deletingPaymentId);
      setDeletingPaymentId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Expense Modal
  const handleOpenEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseEditCategory(expense.category);
    setExpenseEditAmount(expense.amount);
    setExpenseEditDate(expense.expense_date);
    setExpenseEditDescription(expense.description);
    setExpenseEditMethod(expense.payment_method as any);
    setExpenseEditRecipient(expense.recipient || '');
    setExpenseEditNotes(expense.notes || '');
    setErrorMessage('');
  };

  // Submit Edit Expense
  const handleSubmitEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !onUpdateExpense) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onUpdateExpense(editingExpense.id, {
        category: expenseEditCategory,
        amount: expenseEditAmount,
        expense_date: expenseEditDate,
        description: expenseEditDescription,
        payment_method: expenseEditMethod,
        recipient: expenseEditRecipient,
        notes: expenseEditNotes
      });
      setEditingExpense(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui pengeluaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Expense
  const handleConfirmDeleteExpense = async () => {
    if (!deletingExpenseId || !onDeleteExpense) return;
    setIsSubmitting(true);
    try {
      await onDeleteExpense(deletingExpenseId);
      setDeletingExpenseId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pengeluaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Reset Trial Data
  const handleConfirmResetTrialData = async () => {
    if (!onResetTrialData) return;
    setIsSubmitting(true);
    try {
      await onResetTrialData();
      setShowResetModal(false);
      setResetSuccessMessage('Semua data percobaan telah dikosongkan. Sistem TALKRENT kini bersih dan siap untuk inputan data riil pelanggan.');
      onRefresh();
      setTimeout(() => {
        setResetSuccessMessage('');
      }, 7000);
    } catch (err: any) {
      alert(err.message || 'Gagal mengosongkan data percobaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SUCCESS BANNER UPON RESET */}
      {resetSuccessMessage && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-sm block">Data Percobaan Berhasil Dikosongkan!</span>
            <p className="mt-0.5 text-emerald-800 leading-relaxed">
              {resetSuccessMessage} 18 Unit HT WLN tetap tersimpan di inventaris dengan status 'Tersedia' dan tarif mulai Rp 20.000 / hari.
            </p>
          </div>
          <button
            onClick={() => setResetSuccessMessage('')}
            className="text-emerald-500 hover:text-emerald-800 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1. TOP CARDS: INCOME, EXPENSE, OPERATIONAL PROFIT & DEPOSIT CUSTODY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pemasukan Operasional</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatRupiah(financialSummary?.totalIncome || 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Sewa HT, denda, dan ganti rugi</div>
        </div>

        {/* Total Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Pengeluaran</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
            {formatRupiah(financialSummary?.totalExpenses || 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Servis, baterai, sparepart & operasional</div>
        </div>

        {/* Operational Profit */}
        <div className="rounded-2xl border border-slate-200 bg-[#0B2D5B] text-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>Laba Bersih Usaha</span>
            <ArrowUpRight className="h-4 w-4 text-[#FF8C00]" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-white tabular-nums">
            {formatRupiah(financialSummary?.operationalProfit || 0)}
          </div>
          <div className="mt-1 text-[11px] text-[#4DA3FF]">Surplus Bersih TALKRENT</div>
        </div>

        {/* Deposit Held */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Titipan Deposit (Jaminan)</span>
            <ShieldCheck className="h-4 w-4 text-[#0B2D5B]" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#0B2D5B] tabular-nums">
            {formatRupiah(financialSummary?.activeDepositHeld || 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">*Bukan laba (titipan sementara)</div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS & TOP ACTIONS (EDIT / CLEAR / ADD) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekap & Grafik
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'income' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buku Pemasukan ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buku Pengeluaran ({expenses.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button to clear/reset trial data */}
          {onResetTrialData && (
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs active:scale-95"
              title="Kosongkan data pelanggan & transaksi percobaan untuk mulai input data riil"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
              <span>Kosongkan Data Percobaan (Mulai Nol)</span>
            </button>
          )}

          {/* Button to record new expense */}
          <button
            onClick={() => {
              setFormCategory('Perawatan HT');
              setFormAmount(50000);
              setFormDate(new Date().toISOString().substring(0, 10));
              setFormDescription('');
              setFormMethod('Tunai');
              setFormRecipient('');
              setFormNotes('');
              setErrorMessage('');
              setShowAddExpenseModal(true);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] transition-colors shadow-2xs shrink-0 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Pengeluaran Kas</span>
          </button>
        </div>
      </div>

      {/* 3. TAB: REKAP & GRAFIK */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Monthly Revenue Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Grafik Arus Kas Bulanan (2026)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Dihitung otomatis dari riwayat transaksi nyata</p>
                </div>
                <div className="text-[11px] font-semibold text-[#0B2D5B] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  Kabupaten Tasikmalaya
                </div>
              </div>

              {/* Chart container */}
              <div className="mt-6 flex h-60 items-end gap-3 pt-6 pb-2 border-b border-slate-100">
                {financialSummary?.monthlyStats?.map((m: any, idx: number) => {
                  const maxVal = Math.max(
                    100000,
                    ...(financialSummary.monthlyStats || []).map((x: any) => Math.max(x.income || 0, x.expenses || 0))
                  );
                  const incHeight = m.income > 0 ? Math.min(100, Math.max(6, (m.income / maxVal) * 100)) : 0;
                  const expHeight = m.expenses > 0 ? Math.min(100, Math.max(6, (m.expenses / maxVal) * 100)) : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        {m.profit !== 0 ? `${(m.profit / 1000).toFixed(0)}k` : '-'}
                      </div>
                      <div className="w-full flex items-end justify-center gap-1.5 h-44">
                        {/* Income Bar */}
                        <div
                          style={{ height: `${incHeight}%` }}
                          className={`w-1/2 rounded-t-sm transition-all relative ${
                            incHeight > 0
                              ? 'bg-[#0B2D5B] hover:bg-[#072042]'
                              : 'bg-slate-100'
                          }`}
                          title={`Pemasukan: Rp ${(m.income || 0).toLocaleString('id-ID')}`}
                        />
                        {/* Expense Bar */}
                        <div
                          style={{ height: `${expHeight}%` }}
                          className={`w-1/2 rounded-t-sm transition-all relative ${
                            expHeight > 0
                              ? 'bg-rose-400 hover:bg-rose-500'
                              : 'bg-slate-100'
                          }`}
                          title={`Pengeluaran: Rp ${(m.expenses || 0).toLocaleString('id-ID')}`}
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-2">{m.month}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-xs bg-[#0B2D5B]" />
                  <span className="text-slate-600">Pemasukan Sewa & Denda</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-xs bg-rose-400" />
                  <span className="text-slate-600">Pengeluaran & Perawatan</span>
                </div>
              </div>
            </div>

            {/* Breakdown by Category */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900">Alokasi Beban Usaha</h2>
              <p className="text-xs text-slate-500">Distribusi pengeluaran armada HT WLN</p>

              <div className="space-y-3 pt-2">
                {Object.entries(financialSummary?.expenseByCategory || {}).map(([cat, amount]: any) => (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{cat}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">{formatRupiah(amount)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF8C00] rounded-full"
                        style={{
                          width: `${
                            financialSummary?.totalExpenses > 0
                              ? Math.min(100, (amount / financialSummary.totalExpenses) * 100)
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-200 leading-relaxed">
                Anda dapat mengedit, menghapus, atau mengoreksi setiap pemasukan dan pengeluaran melalui tab <strong>Buku Pemasukan</strong> dan <strong>Buku Pengeluaran</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: BUKU PEMASUKAN */}
      {activeTab === 'income' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="p-3.5 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between text-xs bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Filter Tipe:</span>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-[#0B2D5B] focus:outline-hidden"
              >
                <option value="Semua">Semua Tipe</option>
                <option value="Sewa">Sewa</option>
                <option value="Deposit">Deposit Jaminan</option>
                <option value="Denda">Denda Keterlambatan</option>
                <option value="Kerusakan">Ganti Rugi Kerusakan</option>
                <option value="Pengembalian Deposit">Pengembalian Deposit</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredPayments.length} dari {payments.length} transaksi pemasukan
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredPayments.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Wallet className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Transaksi Pemasukan</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  Data pelanggan dan sewa percobaan telah dikosongkan. Transaksi pembayaran akan otomatis tercatat saat Anda membuat penyewaan untuk pelanggan riil.
                </p>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('rentals')}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0B2D5B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#072042] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Mulai Input Sewa Pelanggan Asli</span>
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Kode Transaksi</th>
                    <th className="py-3 px-4">Tanggal Pembayaran</th>
                    <th className="py-3 px-4">Penyewa / Acara</th>
                    <th className="py-3 px-4">Tipe Transaksi</th>
                    <th className="py-3 px-4">Metode</th>
                    <th className="py-3 px-4 text-right">Jumlah (Rp)</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-center">Aksi / Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0B2D5B]">{p.payment_code}</td>
                      <td className="py-3 px-4 text-slate-600">{p.payment_date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.customer_name || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            p.type === 'Sewa'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.type === 'Deposit'
                              ? 'bg-blue-50 text-[#0B2D5B] border border-blue-200'
                              : p.type === 'Denda'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{p.payment_method}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {p.type === 'Pengembalian Deposit' ? '-' : '+'} Rp {p.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{p.notes || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {onUpdatePayment && (
                            <button
                              onClick={() => handleOpenEditPayment(p)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-[#0B2D5B] hover:text-[#0B2D5B] transition-colors"
                              title="Edit rincian pembayaran ini"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {onDeletePayment && (
                            <button
                              onClick={() => setDeletingPaymentId(p.id)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:border-rose-300 hover:text-rose-600 transition-colors"
                              title="Hapus pembayaran ini"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB: BUKU PENGELUARAN */}
      {activeTab === 'expenses' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="p-3.5 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between text-xs bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Kategori Beban:</span>
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-[#0B2D5B] focus:outline-hidden"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Perawatan HT">Perawatan HT</option>
                <option value="Pembelian Baterai">Pembelian Baterai</option>
                <option value="Pembelian Charger">Pembelian Charger</option>
                <option value="Operasional">Operasional</option>
                <option value="Gaji/Transport">Gaji/Transport</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredExpenses.length} dari {expenses.length} pengeluaran kas
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredExpenses.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Pengeluaran Kas</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  Buku pengeluaran masih bersih. Gunakan tombol di atas untuk mencatat pengeluaran operasional, baterai, kabel, atau servis HT.
                </p>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Catat Pengeluaran Pertama</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">No Beban</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kategori Biaya</th>
                    <th className="py-3 px-4">Deskripsi Pengeluaran</th>
                    <th className="py-3 px-4">Penerima Dana</th>
                    <th className="py-3 px-4">Metode</th>
                    <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-3 px-4 text-center">Aksi / Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-rose-700">{e.expense_code}</td>
                      <td className="py-3 px-4 text-slate-600">{e.expense_date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{e.category}</td>
                      <td className="py-3 px-4 text-slate-800">{e.description}</td>
                      <td className="py-3 px-4 text-slate-600">{e.recipient || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">{e.payment_method}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        - Rp {e.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {onUpdateExpense && (
                            <button
                              onClick={() => handleOpenEditExpense(e)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-[#0B2D5B] hover:text-[#0B2D5B] transition-colors"
                              title="Edit rincian pengeluaran ini"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {onDeleteExpense && (
                            <button
                              onClick={() => setDeletingExpenseId(e.id)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:border-rose-300 hover:text-rose-600 transition-colors"
                              title="Hapus pengeluaran ini"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDIT PAYMENT */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Transaksi Pembayaran</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingPayment.payment_code}</p>
              </div>
              <button
                onClick={() => setEditingPayment(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitEditPayment} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Tipe Pembayaran</label>
                  <select
                    value={paymentEditType}
                    onChange={(e) => setPaymentEditType(e.target.value as PaymentType)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  >
                    <option value="Sewa">Sewa</option>
                    <option value="Deposit">Deposit Jaminan</option>
                    <option value="Denda">Denda Keterlambatan</option>
                    <option value="Kerusakan">Ganti Rugi Kerusakan</option>
                    <option value="Pengembalian Deposit">Pengembalian Deposit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Metode Bayar</label>
                  <select
                    value={paymentEditMethod}
                    onChange={(e) => setPaymentEditMethod(e.target.value as PaymentMethod)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Jumlah Nominal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    required
                    value={paymentEditAmount}
                    onChange={(e) => setPaymentEditAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono font-semibold focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={paymentEditDate}
                    onChange={(e) => setPaymentEditDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={paymentEditNotes}
                  onChange={(e) => setPaymentEditNotes(e.target.value)}
                  placeholder="Keterangan koreksi pembayaran..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#0B2D5B] px-4 py-2 font-semibold text-white hover:bg-[#072042] disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE PAYMENT CONFIRMATION */}
      {deletingPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Transaksi Pembayaran?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan pembayaran ini dari pembukuan kas TALKRENT?
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingPaymentId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeletePayment}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXPENSE */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Catatan Pengeluaran</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingExpense.expense_code}</p>
              </div>
              <button
                onClick={() => setEditingExpense(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitEditExpense} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Kategori Beban Pengeluaran</label>
                <select
                  value={expenseEditCategory}
                  onChange={(e) => setExpenseEditCategory(e.target.value as ExpenseCategory)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                >
                  <option value="Perawatan HT">Perawatan HT / Servis</option>
                  <option value="Pembelian Baterai">Pembelian Baterai WLN</option>
                  <option value="Pembelian Charger">Pembelian Charger / Kabel</option>
                  <option value="Operasional">Operasional Kantor / Pulsa / Transport</option>
                  <option value="Gaji/Transport">Gaji / Honor Kru Lapangan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Nominal Biaya (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={expenseEditAmount}
                    onChange={(e) => setExpenseEditAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono font-semibold focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={expenseEditDate}
                    onChange={(e) => setExpenseEditDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Deskripsi Keperluan</label>
                <input
                  type="text"
                  required
                  value={expenseEditDescription}
                  onChange={(e) => setExpenseEditDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Penerima Dana / Toko</label>
                  <input
                    type="text"
                    value={expenseEditRecipient}
                    onChange={(e) => setExpenseEditRecipient(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Metode Bayar</label>
                  <select
                    value={expenseEditMethod}
                    onChange={(e) => setExpenseEditMethod(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  >
                    <option value="Tunai">Tunai (Kasbon)</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#FF8C00] px-4 py-2 font-semibold text-white hover:bg-[#e67e00] disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE EXPENSE CONFIRMATION */}
      {deletingExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Catatan Pengeluaran?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan biaya operasional ini dari pembukuan TALKRENT?
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingExpenseId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeleteExpense}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET TRIAL DATA (MULAI DARI NOL) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Kosongkan Data Uji Coba & Mulai Fresh</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bersihkan data percobaan agar sistem siap untuk operasional riil pelanggan asli.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Tindakan ini akan melakukan:</div>
              <ul className="space-y-2 list-disc list-inside text-slate-600">
                <li>
                  <strong className="text-slate-800">Menghapus seluruh data pelanggan percobaan</strong>, riwayat sewa uji coba, booking jadwal, dan pengembalian.
                </li>
                <li>
                  <strong className="text-slate-800">Mereset pembukuan keuangan</strong> (pemasukan & pengeluaran kas) menjadi <strong>Rp 0</strong>.
                </li>
                <li>
                  <strong className="text-slate-800">Menjaga 18 Unit HT WLN tetap tersimpan</strong> di inventaris dan mereset status seluruhnya menjadi <span className="text-emerald-700 font-semibold">'Tersedia' (Siap Sewa)</span>.
                </li>
                <li>
                  <strong className="text-slate-800">Memperbarui tarif dasar resmi</strong> mulai dari <span className="text-[#0B2D5B] font-bold">Rp 20.000 / hari</span>.
                </li>
              </ul>
            </div>

            <p className="mt-4 text-xs text-amber-800 bg-amber-50 rounded-xl p-3 border border-amber-200">
              Setelah dikosongkan, Anda dapat langsung menginput data penyewaan asli dari pelanggan sebenarnya tanpa tercampur dengan data coba-coba sebelumnya.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmResetTrialData}
                className="w-full sm:w-auto rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? 'Mengosongkan Data...' : 'Ya, Kosongkan Semua Data Percobaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Catat Pengeluaran Kas</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitExpense} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Kategori Beban Pengeluaran</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                >
                  <option value="Perawatan HT">Perawatan HT / Servis</option>
                  <option value="Pembelian Baterai">Pembelian Baterai WLN</option>
                  <option value="Pembelian Charger">Pembelian Charger / Kabel</option>
                  <option value="Operasional">Operasional Kantor / Pulsa / Transport</option>
                  <option value="Gaji/Transport">Gaji / Honor Kru Lapangan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Nominal Biaya (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono font-semibold focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Deskripsi Keperluan</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Pembelian kabel charger 5 pcs & servis antena"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Penerima Dana / Toko</label>
                  <input
                    type="text"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    placeholder="Contoh: Toko Elektronik Singaparna"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Metode Bayar</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#0B2D5B] focus:outline-hidden"
                  >
                    <option value="Tunai">Tunai (Kasbon)</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#FF8C00] px-4 py-2 font-semibold text-white hover:bg-[#e67e00] disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
