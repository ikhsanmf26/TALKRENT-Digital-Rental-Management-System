/**
 * TALKRENT Digital Rental Management System
 * Main Application Component
 */

import React, { useState, useEffect } from 'react';
import { api } from './api';
import {
  Customer,
  EquipmentModel,
  EquipmentUnit,
  Booking,
  Rental,
  Expense,
  Payment,
  MaintenanceRecord,
  AppSettings,
  AuditLog,
  DashboardData
} from './types';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { BookingsView } from './components/BookingsView';
import { RentalsView } from './components/RentalsView';
import { ReturnsView } from './components/ReturnsView';
import { FinanceView } from './components/FinanceView';
import { MaintenanceView } from './components/MaintenanceView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ArchitectureView } from './components/ArchitectureView';
import { PublicAccessModal } from './components/PublicAccessModal';
import { Lock, LogIn, ShieldAlert } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublicAccessModalOpen, setIsPublicAccessModalOpen] = useState(false);

  // Core Data States
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [units, setUnits] = useState<EquipmentUnit[]>([]);
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Selected rental for return processor
  const [returnTargetRental, setReturnTargetRental] = useState<Rental | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Fetch all data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        dashRes,
        unitsRes,
        modelsRes,
        custRes,
        bookRes,
        rentRes,
        payRes,
        expRes,
        maintRes,
        settRes,
        auditRes
      ] = await Promise.all([
        api.getDashboardOverview(),
        api.getUnits(),
        api.getModels(),
        api.getCustomers(),
        api.getBookings(),
        api.getRentals(),
        api.getPayments(),
        api.getExpenses(),
        api.getMaintenance(),
        api.getSettings(),
        api.getAuditLogs()
      ]);

      setDashboardData(dashRes);
      setUnits(unitsRes);
      setModels(modelsRes);
      setCustomers(custRes);
      setBookings(bookRes);
      setRentals(rentRes);
      setPayments(payRes);
      setExpenses(expRes);
      setMaintenance(maintRes);
      setSettings(settRes);
      setAuditLogs(auditRes);
    } catch (err) {
      console.error('Failed to load TALKRENT database records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await api.login(loginUsername, loginPassword);
      setIsAuthenticated(true);
      await loadAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    setIsAuthenticated(false);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'new_rental') {
      setCurrentTab('rentals');
    } else if (action === 'new_booking') {
      setCurrentTab('bookings');
    }
  };

  const handleOpenReturnModal = (rental: Rental) => {
    setReturnTargetRental(rental);
    setCurrentTab('returns');
  };

  // If unauthenticated, show professional Admin Login screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-4 font-sans">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center">
              <img
                src="/talkrent_logo.png"
                alt="TALKRENT Official Logo"
                className="h-28 w-28 object-contain drop-shadow-md"
              />
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
              TALKRENT LOGIN
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Sistem Manajemen Rental Handy Talkie WLN <br />
              <span className="text-[#0B2D5B] font-semibold">Kabupaten Tasikmalaya</span>
            </p>
          </div>

          {loginError && (
            <div className="mt-4 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700">Username Admin</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#0B2D5B] focus:outline-hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loginLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF8C00] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#e67e00] transition-colors disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                <span>{loginLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
            Akses khusus staf internal TALKRENT Tasikmalaya.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] text-slate-900 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'returns') setReturnTargetRental(null);
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar
          currentTab={currentTab}
          onOpenMobile={() => setMobileMenuOpen(true)}
          onQuickAction={handleQuickAction}
          onRefreshData={loadAllData}
          onOpenPublicAccess={() => setIsPublicAccessModalOpen(true)}
          isLoading={isLoading}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === 'dashboard' && (
              <DashboardView
                data={dashboardData}
                units={units}
                onNavigateTab={(tab) => {
                  setCurrentTab(tab);
                  if (tab !== 'returns') setReturnTargetRental(null);
                }}
                onQuickAction={handleQuickAction}
                onOpenPublicAccess={() => setIsPublicAccessModalOpen(true)}
              />
            )}

            {currentTab === 'inventory' && (
              <InventoryView
                units={units}
                models={models}
                onRefresh={loadAllData}
                onCreateUnit={async (data) => {
                  await api.createUnit(data);
                }}
                onUpdateUnit={async (id, data) => {
                  await api.updateUnit(id, data);
                }}
                onDeleteUnit={async (id) => {
                  await api.deleteUnit(id);
                }}
              />
            )}

            {currentTab === 'customers' && (
              <CustomersView
                customers={customers}
                onRefresh={loadAllData}
                onCreateCustomer={async (data) => {
                  await api.createCustomer(data);
                }}
                onUpdateCustomer={async (id, data) => {
                  await api.updateCustomer(id, data);
                }}
              />
            )}

            {currentTab === 'bookings' && (
              <BookingsView
                bookings={bookings}
                customers={customers}
                units={units}
                onRefresh={loadAllData}
                onCreateBooking={async (data) => {
                  await api.createBooking(data);
                }}
                onConvertToRental={async (bookingId, selectedUnitIds, deposit) => {
                  await api.convertToRental(bookingId, selectedUnitIds, deposit);
                }}
              />
            )}

            {currentTab === 'rentals' && (
              <RentalsView
                rentals={rentals}
                customers={customers}
                units={units}
                onRefresh={loadAllData}
                onCreateRental={async (data) => {
                  await api.createRental(data);
                }}
                onOpenReturnModal={handleOpenReturnModal}
              />
            )}

            {currentTab === 'returns' && (
              <ReturnsView
                rentals={rentals}
                units={units}
                onRefresh={loadAllData}
                onProcessReturn={async (data) => {
                  await api.processReturn(data);
                }}
                preselectedRental={returnTargetRental}
              />
            )}

            {currentTab === 'finances' && (
              <FinanceView
                payments={payments}
                expenses={expenses}
                financialSummary={dashboardData?.financialSummary}
                onRefresh={loadAllData}
                onCreateExpense={async (data) => {
                  await api.createExpense(data);
                }}
                onUpdatePayment={async (id, data) => {
                  await api.updatePayment(id, data);
                  await loadAllData();
                }}
                onDeletePayment={async (id) => {
                  await api.deletePayment(id);
                  await loadAllData();
                }}
                onUpdateExpense={async (id, data) => {
                  await api.updateExpense(id, data);
                  await loadAllData();
                }}
                onDeleteExpense={async (id) => {
                  await api.deleteExpense(id);
                  await loadAllData();
                }}
                onResetTrialData={async () => {
                  await api.resetTrialData();
                  await loadAllData();
                }}
                onNavigateTab={(tab) => setCurrentTab(tab as any)}
              />
            )}

            {currentTab === 'maintenance' && (
              <MaintenanceView
                records={maintenance}
                units={units}
                onRefresh={loadAllData}
                onCreateMaintenance={async (data) => {
                  await api.createMaintenance(data);
                }}
                onUpdateStatus={async (id, status, cost, notes) => {
                  await api.updateMaintenanceStatus(id, status, cost, notes);
                }}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                rentals={rentals}
                units={units}
                customers={customers}
                expenses={expenses}
                payments={payments}
                financialSummary={dashboardData?.financialSummary}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                settings={settings}
                auditLogs={auditLogs}
                onUpdateSettings={async (data) => {
                  await api.updateSettings(data);
                }}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'architecture' && <ArchitectureView />}
          </div>
        </main>
      </div>

      {/* Public Access & Deployment Share Modal */}
      <PublicAccessModal
        isOpen={isPublicAccessModalOpen}
        onClose={() => setIsPublicAccessModalOpen(false)}
      />
    </div>
  );
}
