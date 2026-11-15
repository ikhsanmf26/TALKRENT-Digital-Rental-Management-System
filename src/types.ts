/**
 * TALKRENT Frontend Types
 */

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'admin';
}

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  whatsapp: string;
  email: string;
  organization: string;
  address: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentModel {
  id: number;
  brand: 'WLN';
  model_name: string;
  frequency_range: string;
  channel_count: number;
  power_output: string;
  battery_type: string;
  daily_rate: number;
  description: string;
  created_at: string;
}

export type UnitStatus = 'Tersedia' | 'Dipesan' | 'Disewa' | 'Perawatan' | 'Hilang' | 'Tidak Aktif';

export interface EquipmentUnit {
  id: number;
  model_id: number;
  unit_code: string;
  serial_number: string;
  physical_condition: string;
  battery_health: number;
  purchase_date: string;
  purchase_price: number;
  status: UnitStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  model?: EquipmentModel;
}

export type BookingStatus = 'Menunggu' | 'Dikonfirmasi' | 'Menjadi Penyewaan' | 'Dibatalkan';

export interface BookingItem {
  id: number;
  booking_id: number;
  unit_id?: number;
  daily_rate: number;
  notes: string;
  unit?: EquipmentUnit;
}

export interface Booking {
  id: number;
  booking_code: string;
  customer_id: number;
  event_name: string;
  event_location: string;
  start_date: string;
  end_date: string;
  total_days: number;
  requested_quantity: number;
  rate_per_day: number;
  estimated_cost: number;
  down_payment: number;
  status: BookingStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: BookingItem[];
}

export type RentalStatus = 'Berlangsung' | 'Selesai' | 'Terlambat' | 'Dibatalkan';
export type PaymentStatus = 'Lunas' | 'DP' | 'Belum Bayar';

export interface RentalAccessories {
  charger: boolean;
  headset: boolean;
  belt_clip: boolean;
  lanyard: boolean;
  antenna: boolean;
}

export interface RentalItem {
  id: number;
  rental_id: number;
  unit_id: number;
  daily_rate: number;
  condition_out: string;
  battery_level_out: number;
  accessories_out: RentalAccessories;
  condition_in?: string;
  battery_level_in?: number;
  accessories_in?: RentalAccessories;
  created_at: string;
  unit?: EquipmentUnit;
}

export interface Rental {
  id: number;
  rental_code: string;
  customer_id: number;
  booking_id?: number;
  out_date: string;
  due_date: string;
  actual_return_date?: string;
  total_days: number;
  subtotal: number;
  discount: number;
  deposit_amount: number;
  total_cost: number;
  payment_status: PaymentStatus;
  rental_status: RentalStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: RentalItem[];
}

export interface ReturnRecord {
  id: number;
  return_code: string;
  rental_id: number;
  return_date: string;
  late_hours: number;
  late_fee: number;
  damage_fee: number;
  lost_fee: number;
  deposit_refunded: number;
  final_payment_adjusted: number;
  receiver_notes: string;
  created_at: string;
}

export type PaymentType = 'Sewa' | 'Deposit' | 'Denda' | 'Kerusakan' | 'Pengembalian Deposit';
export type PaymentMethod = 'Tunai' | 'Transfer Bank' | 'QRIS';

export interface Payment {
  id: number;
  payment_code: string;
  rental_id?: number;
  booking_id?: number;
  type: PaymentType;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  notes: string;
  created_at: string;
  customer_name?: string;
}

export type ExpenseCategory =
  | 'Perawatan HT'
  | 'Pembelian Baterai'
  | 'Pembelian Charger'
  | 'Operasional'
  | 'Gaji/Transport'
  | 'Lainnya';

export interface Expense {
  id: number;
  expense_code: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description: string;
  payment_method: 'Tunai' | 'Transfer Bank';
  recipient: string;
  notes: string;
  created_at: string;
}

export type MaintenanceStatus = 'Dilaporkan' | 'Dalam Proses' | 'Selesai' | 'Dibatalkan';

export interface MaintenanceRecord {
  id: number;
  maintenance_code: string;
  unit_id: number;
  check_date: string;
  damage_type: string;
  damage_description: string;
  cost: number;
  status: MaintenanceStatus;
  completion_date?: string;
  technician_notes: string;
  created_at: string;
  updated_at: string;
  unit?: EquipmentUnit;
}

export interface AppSettings {
  id: number;
  business_name: string;
  brand_tagline: string;
  phone_whatsapp: string;
  email: string;
  address: string;
  default_daily_rate: number;
  late_fee_per_hour: number;
  late_fee_per_day: number;
  default_deposit_rate: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  qris_image_url: string;
  terms_and_conditions: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface DashboardData {
  stats: {
    totalUnits: number;
    availableUnits: number;
    rentedUnits: number;
    maintenanceUnits: number;
    activeBookings: number;
    ongoingRentals: number;
    todayRevenue: number;
    monthRevenue: number;
  };
  overdueRentals: Rental[];
  recentBookings: Booking[];
  recentRentals: Rental[];
  recentAudit: AuditLog[];
  financialSummary: {
    totalIncome: number;
    totalExpenses: number;
    operationalProfit: number;
    activeDepositHeld: number;
    revenueBreakdown: {
      sewa: number;
      denda: number;
      kerusakan: number;
    };
    expenseByCategory: Record<string, number>;
    monthlyStats: { month: string; income: number; expenses: number; profit: number }[];
  };
}
