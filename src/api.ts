/**
 * TALKRENT Frontend API Client
 */

import {
  Customer,
  EquipmentModel,
  EquipmentUnit,
  Booking,
  Rental,
  ReturnRecord,
  Payment,
  Expense,
  MaintenanceRecord,
  AppSettings,
  AuditLog,
  DashboardData
} from './types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || 'Terjadi kesalahan sistem.');
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    fetchJson<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  getMe: () => fetchJson<{ user: any }>('/auth/me'),
  logout: () => fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboardOverview: () => fetchJson<DashboardData>('/dashboard/overview'),

  // Customers
  getCustomers: (search?: string) =>
    fetchJson<Customer[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCustomerById: (id: number) => fetchJson<Customer & { total_rentals: number; total_spent: number; history: Rental[] }>(`/customers/${id}`),
  createCustomer: (data: Partial<Customer>) =>
    fetchJson<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: number, data: Partial<Customer>) =>
    fetchJson<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Models & Units
  getModels: () => fetchJson<EquipmentModel[]>('/models'),
  getUnits: (params?: { status?: string; model_id?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.model_id) query.append('model_id', String(params.model_id));
    if (params?.search) query.append('search', params.search);
    return fetchJson<EquipmentUnit[]>(`/units?${query.toString()}`);
  },
  getUnitById: (id: number) => fetchJson<EquipmentUnit & { rental_history: any[]; maintenance_history: any[] }>(`/units/${id}`),
  createUnit: (data: any) => fetchJson<EquipmentUnit>('/units', { method: 'POST', body: JSON.stringify(data) }),
  updateUnit: (id: number, data: any) => fetchJson<EquipmentUnit>(`/units/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUnit: (id: number) => fetchJson<{ success: boolean }>(`/units/${id}`, { method: 'DELETE' }),
  checkAvailability: (startDate: string, endDate: string, modelId?: number) =>
    fetchJson<{ availableUnits: EquipmentUnit[]; busyUnits: { unit: EquipmentUnit; reason: string }[]; totalAvailable: number }>(
      '/units/check-availability',
      { method: 'POST', body: JSON.stringify({ startDate, endDate, modelId }) }
    ),

  // Bookings
  getBookings: (status?: string) =>
    fetchJson<Booking[]>(`/bookings${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  createBooking: (data: any) => fetchJson<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  convertToRental: (bookingId: number, selectedUnitIds: number[], deposit?: number) =>
    fetchJson<Rental>(`/bookings/${bookingId}/convert-to-rental`, {
      method: 'POST',
      body: JSON.stringify({ selectedUnitIds, deposit })
    }),

  // Rentals
  getRentals: (status?: string) =>
    fetchJson<Rental[]>(`/rentals${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  createRental: (data: any) => fetchJson<Rental>('/rentals', { method: 'POST', body: JSON.stringify(data) }),

  // Returns
  processReturn: (data: any) => fetchJson<ReturnRecord>('/returns', { method: 'POST', body: JSON.stringify(data) }),

  // Financials
  getFinancialSummary: () => fetchJson<DashboardData['financialSummary']>('/finances/summary'),
  getPayments: (params?: { type?: string; method?: string; startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.append('type', params.type);
    if (params?.method) q.append('method', params.method);
    if (params?.startDate) q.append('startDate', params.startDate);
    if (params?.endDate) q.append('endDate', params.endDate);
    return fetchJson<Payment[]>(`/payments?${q.toString()}`);
  },
  updatePayment: (id: number, data: any) =>
    fetchJson<Payment>(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePayment: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/payments/${id}`, { method: 'DELETE' }),

  getExpenses: (params?: { category?: string; startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.startDate) q.append('startDate', params.startDate);
    if (params?.endDate) q.append('endDate', params.endDate);
    return fetchJson<Expense[]>(`/expenses?${q.toString()}`);
  },
  createExpense: (data: any) => fetchJson<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: number, data: any) =>
    fetchJson<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/expenses/${id}`, { method: 'DELETE' }),
  resetTrialData: () =>
    fetchJson<{ success: boolean; message: string; unitsReset: number }>('/finances/reset-trial-data', { method: 'POST' }),

  // Maintenance
  getMaintenance: () => fetchJson<MaintenanceRecord[]>('/maintenance'),
  createMaintenance: (data: any) => fetchJson<MaintenanceRecord>('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenanceStatus: (id: number, status: string, cost?: number, notes?: string) =>
    fetchJson<MaintenanceRecord>(`/maintenance/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, cost, notes })
    }),

  // Settings & Audit
  getSettings: () => fetchJson<AppSettings>('/settings'),
  updateSettings: (data: Partial<AppSettings>) => fetchJson<AppSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: () => fetchJson<AuditLog[]>('/audit-logs'),

  // Export
  getExportPhp: () => fetchJson<{ success: boolean; files: Record<string, string> }>('/export/php'),
  getExportAndroid: () => fetchJson<{ success: boolean; files: Record<string, string> }>('/export/android')
};
