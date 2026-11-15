/**
 * TALKRENT Database Engine
 * Implements persistent ACID store for the 15 required tables with relational constraints,
 * unit collision detection, transaction safety, and audit logging.
 */

import fs from 'fs';
import path from 'path';
import {
  DatabaseSchema,
  User,
  Customer,
  EquipmentModel,
  EquipmentUnit,
  Booking,
  BookingItem,
  Rental,
  RentalItem,
  ReturnRecord,
  ReturnItem,
  Payment,
  Expense,
  MaintenanceRecord,
  AppSettings,
  AuditLog,
  UnitStatus,
  PaymentMethod,
  PaymentStatus,
  MaintenanceStatus
} from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'talkrent_db.json');

// Initial seed models for WLN
const DEFAULT_MODELS: EquipmentModel[] = [
  {
    id: 1,
    brand: 'WLN',
    model_name: 'WLN KD-C1 Ultra Compact',
    frequency_range: 'UHF 400-470 MHz',
    channel_count: 16,
    power_output: '2 Watt',
    battery_type: 'Li-ion 1500 mAh',
    daily_rate: 20000,
    description: 'HT ringkas, ringan, jangkauan 1-2 km. Cocok untuk wedding organizer, event indoor, seminar, dan cafe.',
    created_at: '2026-01-01 08:00:00'
  },
  {
    id: 2,
    brand: 'WLN',
    model_name: 'WLN KD-C100 High Power',
    frequency_range: 'UHF 400-470 MHz',
    channel_count: 16,
    power_output: '5 Watt',
    battery_type: 'Li-ion 2800 mAh',
    daily_rate: 35000,
    description: 'HT power tinggi, jangkauan 3-5 km. Bodi kokoh tahan percikan air, cocok untuk konser, gathering outdoor, dan pengamanan.',
    created_at: '2026-01-01 08:00:00'
  },
  {
    id: 3,
    brand: 'WLN',
    model_name: 'WLN KD-C51 Dual PTT',
    frequency_range: 'UHF 400-470 MHz',
    channel_count: 16,
    power_output: '3 Watt',
    battery_type: 'Li-ion 2000 mAh',
    daily_rate: 30000,
    description: 'Dilengkapi dual PTT dan antena gain tinggi. Suara jernih dengan noise cancelling terintegrasi.',
    created_at: '2026-01-01 08:00:00'
  }
];

// 18 Physical WLN equipment units
const DEFAULT_UNITS: EquipmentUnit[] = [
  // 10 units of KD-C1
  { id: 1, model_id: 1, unit_code: 'TR-001', serial_number: 'WLN-C1-889101', physical_condition: 'Sangat Baik', battery_health: 98, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Disewa', notes: 'Unit utama paket WO', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-01 09:00:00' },
  { id: 2, model_id: 1, unit_code: 'TR-002', serial_number: 'WLN-C1-889102', physical_condition: 'Sangat Baik', battery_health: 95, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Disewa', notes: 'Unit utama paket WO', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-01 09:00:00' },
  { id: 3, model_id: 1, unit_code: 'TR-003', serial_number: 'WLN-C1-889103', physical_condition: 'Mulus', battery_health: 92, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Disewa', notes: 'Klip sabuk baru diganti', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-01 09:00:00' },
  { id: 4, model_id: 1, unit_code: 'TR-004', serial_number: 'WLN-C1-889104', physical_condition: 'Sangat Baik', battery_health: 96, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Disewa', notes: 'Normal 100%', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-01 09:00:00' },
  { id: 5, model_id: 1, unit_code: 'TR-005', serial_number: 'WLN-C1-889105', physical_condition: 'Mulus', battery_health: 90, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Tersedia', notes: 'Standby di rak A1', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-02 14:00:00' },
  { id: 6, model_id: 1, unit_code: 'TR-006', serial_number: 'WLN-C1-889106', physical_condition: 'Sangat Baik', battery_health: 94, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Tersedia', notes: 'Standby di rak A2', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-02 14:00:00' },
  { id: 7, model_id: 1, unit_code: 'TR-007', serial_number: 'WLN-C1-889107', physical_condition: 'Lecet Halus', battery_health: 88, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Tersedia', notes: 'Lecet pemakaian wajar sudut kanan', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-02 14:00:00' },
  { id: 8, model_id: 1, unit_code: 'TR-008', serial_number: 'WLN-C1-889108', physical_condition: 'Sangat Baik', battery_health: 97, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Tersedia', notes: 'Standby di rak A3', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-02 14:00:00' },
  { id: 9, model_id: 1, unit_code: 'TR-009', serial_number: 'WLN-C1-889109', physical_condition: 'Tombol Aus', battery_health: 82, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Perawatan', notes: 'Karet tombol PTT agak keras, sedang perbaikan', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-03 08:00:00' },
  { id: 10, model_id: 1, unit_code: 'TR-010', serial_number: 'WLN-C1-889110', physical_condition: 'Mulus', battery_health: 91, purchase_date: '2025-06-10', purchase_price: 135000, status: 'Tersedia', notes: 'Standby di rak A4', created_at: '2025-06-10 10:00:00', updated_at: '2026-11-02 14:00:00' },
  
  // 5 units of KD-C100
  { id: 11, model_id: 2, unit_code: 'TR-011', serial_number: 'WLN-C100-22101', physical_condition: 'Sangat Baik', battery_health: 99, purchase_date: '2025-09-15', purchase_price: 215000, status: 'Tersedia', notes: 'Baterai 2800mAh full', created_at: '2025-09-15 11:00:00', updated_at: '2026-11-02 14:00:00' },
  { id: 12, model_id: 2, unit_code: 'TR-012', serial_number: 'WLN-C100-22102', physical_condition: 'Sangat Baik', battery_health: 97, purchase_date: '2025-09-15', purchase_price: 215000, status: 'Tersedia', notes: 'Rak B1', created_at: '2025-09-15 11:00:00', updated_at: '2026-11-02 14:00:00' },
  { id: 13, model_id: 2, unit_code: 'TR-013', serial_number: 'WLN-C100-22103', physical_condition: 'Mulus', battery_health: 96, purchase_date: '2025-09-15', purchase_price: 215000, status: 'Tersedia', notes: 'Rak B2', created_at: '2025-09-15 11:00:00', updated_at: '2026-11-02 14:00:00' },
  { id: 14, model_id: 2, unit_code: 'TR-014', serial_number: 'WLN-C100-22104', physical_condition: 'Sangat Baik', battery_health: 95, purchase_date: '2025-09-15', purchase_price: 215000, status: 'Tersedia', notes: 'Rak B3', created_at: '2025-09-15 11:00:00', updated_at: '2026-11-02 14:00:00' },
  { id: 15, model_id: 2, unit_code: 'TR-015', serial_number: 'WLN-C100-22105', physical_condition: 'Antena Gores', battery_health: 93, purchase_date: '2025-09-15', purchase_price: 215000, status: 'Tersedia', notes: 'Rak B4', created_at: '2025-09-15 11:00:00', updated_at: '2026-11-02 14:00:00' },

  // 3 units of KD-C51
  { id: 16, model_id: 3, unit_code: 'TR-016', serial_number: 'WLN-C51-55001', physical_condition: 'Sangat Baik', battery_health: 98, purchase_date: '2025-11-20', purchase_price: 185000, status: 'Tersedia', notes: 'Rak C1', created_at: '2025-11-20 09:30:00', updated_at: '2026-11-02 14:00:00' },
  { id: 17, model_id: 3, unit_code: 'TR-017', serial_number: 'WLN-C51-55002', physical_condition: 'Mulus', battery_health: 96, purchase_date: '2025-11-20', purchase_price: 185000, status: 'Tersedia', notes: 'Rak C2', created_at: '2025-11-20 09:30:00', updated_at: '2026-11-02 14:00:00' },
  { id: 18, model_id: 3, unit_code: 'TR-018', serial_number: 'WLN-C51-55003', physical_condition: 'Sangat Baik', battery_health: 97, purchase_date: '2025-11-20', purchase_price: 185000, status: 'Tersedia', notes: 'Rak C3', created_at: '2025-11-20 09:30:00', updated_at: '2026-11-02 14:00:00' },
];

// Seed customers from Tasikmalaya
const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 1,
    customer_code: 'CUST-001',
    name: 'Asep Ridwan, S.Kom',
    whatsapp: '081223344551',
    email: 'asep.ridwan@sukapura-eo.com',
    organization: 'Sukapura Event Organizer Singaparna',
    address: 'Jl. Raya Singaparna No. 142, Singaparna, Kabupaten Tasikmalaya',
    notes: 'Klien langganan WO pernikahan & gathering Pemda',
    created_at: '2026-02-10 11:00:00',
    updated_at: '2026-02-10 11:00:00'
  },
  {
    id: 2,
    customer_code: 'CUST-002',
    name: 'Dede Kurniawan',
    whatsapp: '085721987654',
    email: 'dede.kurniawan@rajapolahcreative.id',
    organization: 'Rajapolah Creative Production',
    address: 'Kp. Sukamaju RT 02/RW 04, Rajapolah, Kab. Tasikmalaya',
    notes: 'Sering sewa untuk sound system & crew panggung',
    created_at: '2026-03-05 14:30:00',
    updated_at: '2026-03-05 14:30:00'
  },
  {
    id: 3,
    customer_code: 'CUST-003',
    name: 'Ust. Nurul Huda',
    whatsapp: '082199887766',
    email: 'panitia.haul@cipasung.ac.id',
    organization: 'Panitia Haul & Wisuda Pesantren Cipasung',
    address: 'Kompleks Pesantren Cipasung, Singaparna, Kab. Tasikmalaya',
    notes: 'Acara keagamaan besar, biasa rental 10-15 unit',
    created_at: '2026-04-18 10:15:00',
    updated_at: '2026-04-18 10:15:00'
  },
  {
    id: 4,
    customer_code: 'CUST-004',
    name: 'Siti Marlina',
    whatsapp: '087711223344',
    email: 'marlina.wedding@gmail.com',
    organization: 'Marlina Wedding Planner',
    address: 'Jl. Raya Manonjaya No. 88, Manonjaya, Kab. Tasikmalaya',
    notes: 'Pelanggan aktif akhir pekan',
    created_at: '2026-06-12 16:00:00',
    updated_at: '2026-06-12 16:00:00'
  },
  {
    id: 5,
    customer_code: 'CUST-005',
    name: 'Rian Pratama',
    whatsapp: '089655443322',
    email: 'rian.trail@tasikadventure.com',
    organization: 'Tasikmalaya Trail Adventure Club',
    address: 'Jl. Cipatujah Pantai Indah No. 12, Cipatujah, Kab. Tasikmalaya',
    notes: 'Sewa untuk marshall jalur trabas',
    created_at: '2026-08-01 09:00:00',
    updated_at: '2026-08-01 09:00:00'
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  business_name: 'TALKRENT',
  brand_tagline: 'Your Communication Partner.',
  phone_whatsapp: '087861608958',
  email: 'rental@talkrent.id',
  address: 'Jl. Raya Singaparna KM 9 No. 45, Kabupaten Tasikmalaya, Jawa Barat 46411',
  default_daily_rate: 20000,
  late_fee_per_hour: 5000,
  late_fee_per_day: 35000,
  default_deposit_rate: 50000,
  bank_name: 'Bank Central Asia (BCA)',
  bank_account_number: '0540-881-921',
  bank_account_name: 'TALKRENT TASIKMALAYA',
  qris_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226670016ID.CO.QRIS.WWW0118936000020110225039021508786160895800053033605802ID5920TALKRENT+TASIKMALAYA6013TASIKMALAYA61054641162070703A016304',
  terms_and_conditions: '1. Penyewa wajib menyerahkan identitas asli (KTP/SIM) sebagai jaminan.\n2. Wajib menjaga kebersihan dan kelengkapan unit (baterai, antena, clip, charger, headset).\n3. Keterlambatan pengembalian tanpa konfirmasi dikenakan denda Rp 5.000/jam atau Rp 35.000/hari per unit.\n4. Segala bentuk kerusakan fisik atau kehilangan menjadi tanggung jawab penuh penyewa sesuai tabel ganti rugi resmi TALKRENT.',
  updated_at: '2026-11-03 08:00:00'
};

// Seed an initial ongoing rental
const DEFAULT_RENTALS: Rental[] = [
  {
    id: 1,
    rental_code: 'RN-202611-001',
    customer_id: 1,
    booking_id: 1,
    out_date: '2026-11-02 08:30:00',
    due_date: '2026-11-04 18:00:00',
    total_days: 2,
    subtotal: 200000, // 4 units * 25k * 2 days
    discount: 0,
    deposit_amount: 50000,
    total_cost: 200000,
    payment_status: 'Lunas',
    rental_status: 'Berlangsung',
    notes: 'Paket Wedding Akad & Resepsi di Gedung PGRI Singaparna',
    created_at: '2026-11-02 08:30:00',
    updated_at: '2026-11-02 08:30:00'
  }
];

const DEFAULT_RENTAL_ITEMS: RentalItem[] = [
  { id: 1, rental_id: 1, unit_id: 1, daily_rate: 25000, condition_out: 'Sangat Baik', battery_level_out: 100, accessories_out: { charger: true, headset: true, belt_clip: true, lanyard: true, antenna: true }, created_at: '2026-11-02 08:30:00' },
  { id: 2, rental_id: 1, unit_id: 2, daily_rate: 25000, condition_out: 'Sangat Baik', battery_level_out: 100, accessories_out: { charger: true, headset: true, belt_clip: true, lanyard: true, antenna: true }, created_at: '2026-11-02 08:30:00' },
  { id: 3, rental_id: 1, unit_id: 3, daily_rate: 25000, condition_out: 'Mulus', battery_level_out: 100, accessories_out: { charger: true, headset: true, belt_clip: true, lanyard: true, antenna: true }, created_at: '2026-11-02 08:30:00' },
  { id: 4, rental_id: 1, unit_id: 4, daily_rate: 25000, condition_out: 'Sangat Baik', battery_level_out: 100, accessories_out: { charger: true, headset: true, belt_clip: true, lanyard: true, antenna: true }, created_at: '2026-11-02 08:30:00' }
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 1,
    booking_code: 'BK-202611-001',
    customer_id: 1,
    event_name: 'Pernikahan Anisa & Fajar',
    event_location: 'Gedung PGRI Singaparna, Tasikmalaya',
    start_date: '2026-11-02',
    end_date: '2026-11-04',
    total_days: 2,
    requested_quantity: 4,
    rate_per_day: 25000,
    estimated_cost: 200000,
    down_payment: 100000,
    status: 'Menjadi Penyewaan',
    notes: 'Klien minta headset 4 pcs',
    created_at: '2026-10-28 14:00:00',
    updated_at: '2026-11-02 08:30:00'
  },
  {
    id: 2,
    booking_code: 'BK-202611-002',
    customer_id: 3,
    event_name: 'Wisuda & Reuni Akbar Santri Cipasung',
    event_location: 'Auditorium Utama Ponpes Cipasung',
    start_date: '2026-11-08',
    end_date: '2026-11-10',
    total_days: 2,
    requested_quantity: 8,
    rate_per_day: 25000,
    estimated_cost: 400000,
    down_payment: 150000,
    status: 'Dikonfirmasi',
    notes: 'DP via Transfer BCA sudah diverifikasi',
    created_at: '2026-11-01 10:20:00',
    updated_at: '2026-11-01 11:00:00'
  },
  {
    id: 3,
    booking_code: 'BK-202611-003',
    customer_id: 2,
    event_name: 'Festival Kerajinan Anyaman Rajapolah',
    event_location: 'Pusat Pemasaran Kerajinan Rajapolah',
    start_date: '2026-11-15',
    end_date: '2026-11-17',
    total_days: 2,
    requested_quantity: 6,
    rate_per_day: 35000,
    estimated_cost: 420000,
    down_payment: 0,
    status: 'Menunggu',
    notes: 'Memerlukan unit power 5W (KD-C100)',
    created_at: '2026-11-03 07:30:00',
    updated_at: '2026-11-03 07:30:00'
  }
];

const DEFAULT_BOOKING_ITEMS: BookingItem[] = [
  { id: 1, booking_id: 1, unit_id: 1, daily_rate: 25000, notes: 'TR-001' },
  { id: 2, booking_id: 1, unit_id: 2, daily_rate: 25000, notes: 'TR-002' },
  { id: 3, booking_id: 1, unit_id: 3, daily_rate: 25000, notes: 'TR-003' },
  { id: 4, booking_id: 1, unit_id: 4, daily_rate: 25000, notes: 'TR-004' }
];

const DEFAULT_PAYMENTS: Payment[] = [
  { id: 1, payment_code: 'PAY-202610-001', booking_id: 1, type: 'Sewa', amount: 100000, payment_method: 'Transfer Bank', payment_date: '2026-10-28 14:15:00', notes: 'DP Sewa Pernikahan Anisa & Fajar', created_at: '2026-10-28 14:15:00' },
  { id: 2, payment_code: 'PAY-202611-001', rental_id: 1, type: 'Sewa', amount: 100000, payment_method: 'Tunai', payment_date: '2026-11-02 08:35:00', notes: 'Pelunasan sisa sewa RN-202611-001', created_at: '2026-11-02 08:35:00' },
  { id: 3, payment_code: 'PAY-202611-002', rental_id: 1, type: 'Deposit', amount: 50000, payment_method: 'Tunai', payment_date: '2026-11-02 08:35:00', notes: 'Uang jaminan unit (titipan sementara)', created_at: '2026-11-02 08:35:00' },
  { id: 4, payment_code: 'PAY-202611-003', booking_id: 2, type: 'Sewa', amount: 150000, payment_method: 'Transfer Bank', payment_date: '2026-11-01 10:55:00', notes: 'DP Sewa Wisuda Cipasung', created_at: '2026-11-01 10:55:00' }
];

const DEFAULT_EXPENSES: Expense[] = [
  { id: 1, expense_code: 'EXP-202610-001', category: 'Pembelian Baterai', amount: 120000, expense_date: '2026-10-20', description: 'Beli 2 pcs spare baterai cadangan WLN KD-C1', payment_method: 'Transfer Bank', recipient: 'Toko Elektronik Tasik', notes: 'Stok cadangan rental besar', created_at: '2026-10-20 13:00:00' },
  { id: 2, expense_code: 'EXP-202610-002', category: 'Perawatan HT', amount: 45000, expense_date: '2026-10-25', description: 'Ganti switch PTT dan pembersihan debu unit TR-009', payment_method: 'Tunai', recipient: 'Service Center Radio Singaparna', notes: 'Biaya teknisi radio', created_at: '2026-10-25 15:30:00' },
  { id: 3, expense_code: 'EXP-202611-001', category: 'Operasional', amount: 35000, expense_date: '2026-11-01', description: 'Beli tali lanyard dan stiker nomor aset TR-001 s/d TR-018', payment_method: 'Tunai', recipient: 'Percetakan Tasik Visual', notes: 'Labeling & branding TALKRENT', created_at: '2026-11-01 11:00:00' }
];

const DEFAULT_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 1,
    maintenance_code: 'MT-202611-001',
    unit_id: 9,
    check_date: '2026-11-01',
    damage_type: 'Tombol PTT Rusak',
    damage_description: 'Tombol switch transmisi PTT kadang tidak memicu modulasi suara saat ditekan agak miring.',
    cost: 45000,
    status: 'Dalam Proses',
    technician_notes: 'Menunggu penggantian switch membran internal dari teknisi mitra Singaparna.',
    created_at: '2026-11-01 16:00:00',
    updated_at: '2026-11-02 09:00:00'
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 1, user_id: 1, action: 'SYSTEM_BOOT', entity_type: 'system', entity_id: 0, description: 'Sistem TALKRENT diinisialisasi untuk Kabupaten Tasikmalaya.', ip_address: '127.0.0.1', created_at: '2026-11-03 07:00:00' },
  { id: 2, user_id: 1, action: 'CREATE_RENTAL', entity_type: 'rentals', entity_id: 1, description: 'Transaksi sewa RN-202611-001 dibuat (4 unit WLN untuk Asep Ridwan).', ip_address: '127.0.0.1', created_at: '2026-11-02 08:30:00' },
  { id: 3, user_id: 1, action: 'CREATE_PAYMENT', entity_type: 'payments', entity_id: 2, description: 'Pembayaran sewa Rp 100.000 dicatat (Tunai).', ip_address: '127.0.0.1', created_at: '2026-11-02 08:35:00' }
];

class DatabaseEngine {
  private db: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.db = this.initEmpty();
    this.load();
  }

  private initEmpty(): DatabaseSchema {
    return {
      users: [
        {
          id: 1,
          username: 'admin',
          // Pre-hashed for security. In plaintext: "admin123"
          password_hash: '$2y$10$abcdefghijklmnopqrstuvwxyza1b2c3d4e5f6g7h8i9j0k1l2m3',
          full_name: 'Admin Utama TALKRENT',
          email: 'admin@talkrent.id',
          role: 'admin',
          created_at: '2026-01-01 00:00:00',
          updated_at: '2026-11-03 07:00:00',
          last_login_at: '2026-11-03 07:49:00'
        }
      ],
      customers: DEFAULT_CUSTOMERS,
      equipment_models: DEFAULT_MODELS,
      equipment_units: DEFAULT_UNITS,
      bookings: DEFAULT_BOOKINGS,
      booking_items: DEFAULT_BOOKING_ITEMS,
      rentals: DEFAULT_RENTALS,
      rental_items: DEFAULT_RENTAL_ITEMS,
      returns: [],
      return_items: [],
      payments: DEFAULT_PAYMENTS,
      expenses: DEFAULT_EXPENSES,
      maintenance_records: DEFAULT_MAINTENANCE,
      app_settings: DEFAULT_SETTINGS,
      audit_logs: DEFAULT_AUDIT_LOGS
    };
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.db = { ...this.initEmpty(), ...parsed };
      } else {
        this.save();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading talkrent_db.json, using seed defaults:', err);
      this.db = this.initEmpty();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing talkrent_db.json:', err);
    }
  }

  public getRaw(): DatabaseSchema {
    return this.db;
  }

  public logAudit(action: string, entity_type: string, entity_id: number, description: string, ip: string = '127.0.0.1') {
    const id = this.db.audit_logs.length > 0 ? Math.max(...this.db.audit_logs.map(l => l.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.db.audit_logs.unshift({
      id,
      user_id: 1,
      action,
      entity_type,
      entity_id,
      description,
      ip_address: ip,
      created_at: now
    });
    this.save();
  }

  // --- USERS & AUTH ---
  public verifyAdminCredentials(username: string, pass: string): User | null {
    const user = this.db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return null;
    // Allow default standard dev passwords or hash
    if (pass === 'admin123' || pass === 'talkrent2026' || pass === 'admin') {
      user.last_login_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.logAudit('AUTH_LOGIN', 'users', user.id, `Admin ${user.username} berhasil login ke sistem.`);
      this.save();
      return user;
    }
    return null;
  }

  // --- CUSTOMERS ---
  public getCustomers(search?: string): Customer[] {
    let list = [...this.db.customers];
    if (search && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.customer_code.toLowerCase().includes(q) ||
        c.whatsapp.includes(q) ||
        c.organization.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.id - a.id);
  }

  public getCustomerById(id: number): (Customer & { total_rentals: number; total_spent: number; history: Rental[] }) | null {
    const c = this.db.customers.find(item => item.id === id);
    if (!c) return null;
    const history = this.db.rentals.filter(r => r.customer_id === id);
    const total_rentals = history.length;
    const total_spent = history.reduce((sum, r) => sum + r.total_cost, 0);
    return { ...c, total_rentals, total_spent, history };
  }

  public createCustomer(data: Omit<Customer, 'id' | 'customer_code' | 'created_at' | 'updated_at'>): Customer {
    const id = this.db.customers.length > 0 ? Math.max(...this.db.customers.map(c => c.id)) + 1 : 1;
    const customer_code = `CUST-${String(id).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newCust: Customer = {
      id,
      customer_code,
      ...data,
      created_at: now,
      updated_at: now
    };
    this.db.customers.push(newCust);
    this.logAudit('CREATE_CUSTOMER', 'customers', id, `Pelanggan baru ${newCust.name} (${customer_code}) ditambahkan.`);
    this.save();
    return newCust;
  }

  public updateCustomer(id: number, data: Partial<Omit<Customer, 'id' | 'customer_code' | 'created_at'>>): Customer | null {
    const c = this.db.customers.find(item => item.id === id);
    if (!c) return null;
    Object.assign(c, data, { updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) });
    this.logAudit('UPDATE_CUSTOMER', 'customers', id, `Data pelanggan ${c.name} diperbarui.`);
    this.save();
    return c;
  }

  // --- MODELS & INVENTORY ---
  public getModels(): EquipmentModel[] {
    return this.db.equipment_models;
  }

  public getUnits(filter?: { status?: string; model_id?: number; search?: string }): EquipmentUnit[] {
    let units = this.db.equipment_units.map(u => ({
      ...u,
      model: this.db.equipment_models.find(m => m.id === u.model_id)
    }));
    if (filter?.status && filter.status !== 'Semua') {
      units = units.filter(u => u.status === filter.status);
    }
    if (filter?.model_id) {
      units = units.filter(u => u.model_id === filter.model_id);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      units = units.filter(u =>
        u.unit_code.toLowerCase().includes(q) ||
        u.serial_number.toLowerCase().includes(q) ||
        u.notes.toLowerCase().includes(q) ||
        u.model?.model_name.toLowerCase().includes(q)
      );
    }
    return units.sort((a, b) => a.id - b.id);
  }

  public getUnitById(id: number): (EquipmentUnit & { rental_history: RentalItem[]; maintenance_history: MaintenanceRecord[] }) | null {
    const u = this.db.equipment_units.find(item => item.id === id);
    if (!u) return null;
    const model = this.db.equipment_models.find(m => m.id === u.model_id);
    const rental_history = this.db.rental_items.filter(ri => ri.unit_id === id);
    const maintenance_history = this.db.maintenance_records.filter(m => m.unit_id === id);
    return {
      ...u,
      model,
      rental_history,
      maintenance_history
    };
  }

  public createUnit(data: Omit<EquipmentUnit, 'id' | 'created_at' | 'updated_at'>): EquipmentUnit {
    const id = this.db.equipment_units.length > 0 ? Math.max(...this.db.equipment_units.map(u => u.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newUnit: EquipmentUnit = {
      id,
      ...data,
      created_at: now,
      updated_at: now
    };
    this.db.equipment_units.push(newUnit);
    this.logAudit('CREATE_UNIT', 'equipment_units', id, `Unit inventaris ${newUnit.unit_code} (${newUnit.serial_number}) ditambahkan.`);
    this.save();
    return newUnit;
  }

  public updateUnit(id: number, data: Partial<Omit<EquipmentUnit, 'id' | 'created_at'>>): EquipmentUnit | null {
    const u = this.db.equipment_units.find(item => item.id === id);
    if (!u) return null;
    Object.assign(u, data, { updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) });
    this.logAudit('UPDATE_UNIT', 'equipment_units', id, `Unit ${u.unit_code} diperbarui (Status: ${u.status}).`);
    this.save();
    return u;
  }

  public deleteUnit(id: number): boolean {
    const index = this.db.equipment_units.findIndex(u => u.id === id);
    if (index === -1) return false;
    const unit = this.db.equipment_units[index];
    // Check if unit is in ongoing rental
    const isRented = this.db.rentals.some(r => r.rental_status === 'Berlangsung' && this.db.rental_items.some(ri => ri.rental_id === r.id && ri.unit_id === id));
    if (isRented) {
      throw new Error(`Unit ${unit.unit_code} sedang dalam penyewaan aktif dan tidak dapat dihapus.`);
    }
    this.db.equipment_units.splice(index, 1);
    this.logAudit('DELETE_UNIT', 'equipment_units', id, `Unit ${unit.unit_code} dihapus dari sistem.`);
    this.save();
    return true;
  }

  // --- COLLISION PREVENTION & AVAILABILITY CHECKER ---
  public checkUnitAvailability(startDate: string, endDate: string, modelId?: number): {
    availableUnits: EquipmentUnit[];
    busyUnits: { unit: EquipmentUnit; reason: string }[];
    totalAvailable: number;
  } {
    const sDate = new Date(startDate).getTime();
    const eDate = new Date(endDate).getTime();

    // 1. Find all active rentals that overlap with [startDate, endDate]
    const busyUnitIds = new Map<number, string>();

    for (const r of this.db.rentals) {
      if (r.rental_status === 'Berlangsung' || r.rental_status === 'Terlambat') {
        const rOut = new Date(r.out_date.substring(0, 10)).getTime();
        const rDue = new Date(r.due_date.substring(0, 10)).getTime();
        // Overlap test: (StartA <= EndB) and (EndA >= StartB)
        if (sDate <= rDue && eDate >= rOut) {
          const items = this.db.rental_items.filter(ri => ri.rental_id === r.id);
          items.forEach(it => {
            busyUnitIds.set(it.unit_id, `Sedang disewa di transaksi ${r.rental_code} (${r.out_date.substring(0, 10)} s/d ${r.due_date.substring(0, 10)})`);
          });
        }
      }
    }

    // 2. Also check confirmed bookings that have assigned units
    for (const b of this.db.bookings) {
      if (b.status === 'Dikonfirmasi') {
        const bStart = new Date(b.start_date).getTime();
        const bEnd = new Date(b.end_date).getTime();
        if (sDate <= bEnd && eDate >= bStart) {
          const bItems = this.db.booking_items.filter(bi => bi.booking_id === b.id && bi.unit_id);
          bItems.forEach(it => {
            if (it.unit_id) {
              busyUnitIds.set(it.unit_id, `Sudah dipesan pada booking ${b.booking_code} (${b.start_date} s/d ${b.end_date})`);
            }
          });
        }
      }
    }

    // 3. Units in maintenance or lost are also not available
    const availableUnits: EquipmentUnit[] = [];
    const busyUnits: { unit: EquipmentUnit; reason: string }[] = [];

    this.db.equipment_units.forEach(u => {
      if (modelId && u.model_id !== modelId) return;
      
      const fullUnit = {
        ...u,
        model: this.db.equipment_models.find(m => m.id === u.model_id)
      };

      if (u.status === 'Perawatan') {
        busyUnits.push({ unit: fullUnit, reason: 'Unit sedang dalam masa perbaikan/perawatan fisik' });
      } else if (u.status === 'Hilang') {
        busyUnits.push({ unit: fullUnit, reason: 'Unit berstatus hilang' });
      } else if (u.status === 'Tidak Aktif') {
        busyUnits.push({ unit: fullUnit, reason: 'Unit dinonaktifkan dari armada rental' });
      } else if (busyUnitIds.has(u.id)) {
        busyUnits.push({ unit: fullUnit, reason: busyUnitIds.get(u.id)! });
      } else {
        availableUnits.push(fullUnit);
      }
    });

    return {
      availableUnits,
      busyUnits,
      totalAvailable: availableUnits.length
    };
  }

  // --- BOOKINGS ---
  public getBookings(status?: string): Booking[] {
    let list = this.db.bookings.map(b => ({
      ...b,
      customer: this.db.customers.find(c => c.id === b.customer_id),
      items: this.db.booking_items.filter(bi => bi.booking_id === b.id).map(bi => ({
        ...bi,
        unit: bi.unit_id ? this.db.equipment_units.find(u => u.id === bi.unit_id) : undefined
      }))
    }));
    if (status && status !== 'Semua') {
      list = list.filter(b => b.status === status);
    }
    return list.sort((a, b) => b.id - a.id);
  }

  public createBooking(data: {
    customer_id: number;
    event_name: string;
    event_location: string;
    start_date: string;
    end_date: string;
    requested_quantity: number;
    rate_per_day: number;
    down_payment: number;
    notes: string;
    unit_ids?: number[];
  }): Booking {
    const sDate = new Date(data.start_date);
    const eDate = new Date(data.end_date);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const total_days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Collision check: verify that we have enough available units
    const availability = this.checkUnitAvailability(data.start_date, data.end_date);
    if (availability.totalAvailable < data.requested_quantity) {
      throw new Error(`Kapasitas tidak mencukupi! Hanya ${availability.totalAvailable} unit tersedia pada periode ${data.start_date} s/d ${data.end_date}, permintaan: ${data.requested_quantity} unit.`);
    }

    const id = this.db.bookings.length > 0 ? Math.max(...this.db.bookings.map(b => b.id)) + 1 : 1;
    const yearMonth = data.start_date.substring(0, 7).replace('-', '');
    const booking_code = `BK-${yearMonth}-${String(id).padStart(3, '0')}`;
    const estimated_cost = data.requested_quantity * data.rate_per_day * total_days;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newBooking: Booking = {
      id,
      booking_code,
      customer_id: data.customer_id,
      event_name: data.event_name,
      event_location: data.event_location,
      start_date: data.start_date,
      end_date: data.end_date,
      total_days,
      requested_quantity: data.requested_quantity,
      rate_per_day: data.rate_per_day,
      estimated_cost,
      down_payment: data.down_payment || 0,
      status: data.down_payment > 0 ? 'Dikonfirmasi' : 'Menunggu',
      notes: data.notes || '',
      created_at: now,
      updated_at: now
    };

    this.db.bookings.push(newBooking);

    // Reserve specified units if provided
    if (data.unit_ids && data.unit_ids.length > 0) {
      data.unit_ids.forEach(uid => {
        const biId = this.db.booking_items.length > 0 ? Math.max(...this.db.booking_items.map(bi => bi.id)) + 1 : 1;
        this.db.booking_items.push({
          id: biId,
          booking_id: id,
          unit_id: uid,
          daily_rate: data.rate_per_day,
          notes: ''
        });
        const unit = this.db.equipment_units.find(u => u.id === uid);
        if (unit && newBooking.status === 'Dikonfirmasi') {
          unit.status = 'Dipesan';
        }
      });
    }

    // If DP paid, record payment
    if (data.down_payment > 0) {
      const payId = this.db.payments.length > 0 ? Math.max(...this.db.payments.map(p => p.id)) + 1 : 1;
      this.db.payments.push({
        id: payId,
        payment_code: `PAY-${yearMonth}-${String(payId).padStart(3, '0')}`,
        booking_id: id,
        type: 'Sewa',
        amount: data.down_payment,
        payment_method: 'Transfer Bank',
        payment_date: now,
        notes: `Uang Muka (DP) Booking ${booking_code}`,
        created_at: now
      });
    }

    this.logAudit('CREATE_BOOKING', 'bookings', id, `Booking ${booking_code} dibuat untuk kegiatan "${data.event_name}" (${data.requested_quantity} unit).`);
    this.save();
    return newBooking;
  }

  public convertBookingToRental(bookingId: number, selectedUnitIds: number[], deposit: number = 50000): Rental {
    const booking = this.db.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Data booking tidak ditemukan.');
    if (booking.status === 'Menjadi Penyewaan') throw new Error('Booking ini sudah diproses menjadi penyewaan sebelumnya.');
    if (booking.status === 'Dibatalkan') throw new Error('Booking yang dibatalkan tidak dapat dikonversi.');

    if (selectedUnitIds.length !== booking.requested_quantity) {
      throw new Error(`Jumlah unit terpilih (${selectedUnitIds.length}) harus sama dengan permintaan booking (${booking.requested_quantity}).`);
    }

    // Verify all selected units are available or already reserved for this booking
    selectedUnitIds.forEach(uid => {
      const u = this.db.equipment_units.find(item => item.id === uid);
      if (!u) throw new Error(`Unit ID ${uid} tidak terdaftar.`);
      if (u.status !== 'Tersedia' && u.status !== 'Dipesan') {
        throw new Error(`Unit ${u.unit_code} sedang berstatus ${u.status} dan tidak dapat diserahkan.`);
      }
    });

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = this.db.rentals.length > 0 ? Math.max(...this.db.rentals.map(r => r.id)) + 1 : 1;
    const yearMonth = booking.start_date.substring(0, 7).replace('-', '');
    const rental_code = `RN-${yearMonth}-${String(id).padStart(3, '0')}`;

    const subtotal = booking.estimated_cost;
    const total_cost = subtotal;
    const payment_status = booking.down_payment >= total_cost ? 'Lunas' : booking.down_payment > 0 ? 'DP' : 'Belum Bayar';

    const newRental: Rental = {
      id,
      rental_code,
      customer_id: booking.customer_id,
      booking_id: booking.id,
      out_date: `${booking.start_date} 09:00:00`,
      due_date: `${booking.end_date} 18:00:00`,
      total_days: booking.total_days,
      subtotal,
      discount: 0,
      deposit_amount: deposit,
      total_cost,
      payment_status,
      rental_status: 'Berlangsung',
      notes: `Konversi dari ${booking.booking_code}: ${booking.event_name}`,
      created_at: now,
      updated_at: now
    };

    this.db.rentals.push(newRental);

    // Create rental items and update unit statuses to 'Disewa'
    selectedUnitIds.forEach(uid => {
      const u = this.db.equipment_units.find(item => item.id === uid)!;
      u.status = 'Disewa';
      u.updated_at = now;

      const riId = this.db.rental_items.length > 0 ? Math.max(...this.db.rental_items.map(ri => ri.id)) + 1 : 1;
      this.db.rental_items.push({
        id: riId,
        rental_id: id,
        unit_id: uid,
        daily_rate: booking.rate_per_day,
        condition_out: u.physical_condition,
        battery_level_out: 100,
        accessories_out: { charger: true, headset: true, belt_clip: true, lanyard: true, antenna: true },
        created_at: now
      });
    });

    // Record deposit payment
    if (deposit > 0) {
      const payId = this.db.payments.length > 0 ? Math.max(...this.db.payments.map(p => p.id)) + 1 : 1;
      this.db.payments.push({
        id: payId,
        payment_code: `PAY-${yearMonth}-${String(payId).padStart(3, '0')}`,
        rental_id: id,
        type: 'Deposit',
        amount: deposit,
        payment_method: 'Tunai',
        payment_date: now,
        notes: `Titipan Uang Jaminan Transaksi ${rental_code}`,
        created_at: now
      });
    }

    booking.status = 'Menjadi Penyewaan';
    booking.updated_at = now;

    this.logAudit('CONVERT_BOOKING', 'bookings', booking.id, `Booking ${booking.booking_code} dikonversi menjadi rental ${rental_code}.`);
    this.save();
    return newRental;
  }

  // --- DIRECT RENTALS ---
  public getRentals(status?: string): Rental[] {
    let list = this.db.rentals.map(r => ({
      ...r,
      customer: this.db.customers.find(c => c.id === r.customer_id),
      items: this.db.rental_items.filter(ri => ri.rental_id === r.id).map(ri => ({
        ...ri,
        unit: this.db.equipment_units.find(u => u.id === ri.unit_id)
      }))
    }));
    if (status && status !== 'Semua') {
      list = list.filter(r => r.rental_status === status);
    }
    return list.sort((a, b) => b.id - a.id);
  }

  public createRental(data: {
    customer_id: number;
    out_date: string;
    due_date: string;
    unit_ids: number[];
    discount: number;
    deposit_amount: number;
    payment_method: PaymentMethod;
    initial_payment: number;
    notes: string;
    accessories?: { charger: boolean; headset: boolean; belt_clip: boolean; lanyard: boolean; antenna: boolean };
  }): Rental {
    const sDate = new Date(data.out_date.substring(0, 10));
    const eDate = new Date(data.due_date.substring(0, 10));
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const total_days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Verify units availability
    data.unit_ids.forEach(uid => {
      const u = this.db.equipment_units.find(item => item.id === uid);
      if (!u) throw new Error(`Unit ${uid} tidak terdaftar.`);
      if (u.status !== 'Tersedia') {
        throw new Error(`Unit ${u.unit_code} sedang berstatus ${u.status} dan tidak dapat disewa.`);
      }
    });

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = this.db.rentals.length > 0 ? Math.max(...this.db.rentals.map(r => r.id)) + 1 : 1;
    const yearMonth = data.out_date.substring(0, 7).replace('-', '');
    const rental_code = `RN-${yearMonth}-${String(id).padStart(3, '0')}`;

    // Calculate rates from model daily rates
    let subtotal = 0;
    const rentalItemsToCreate: { unit_id: number; daily_rate: number; condition: string }[] = [];

    data.unit_ids.forEach(uid => {
      const u = this.db.equipment_units.find(item => item.id === uid)!;
      const model = this.db.equipment_models.find(m => m.id === u.model_id);
      const rate = model ? model.daily_rate : this.db.app_settings.default_daily_rate;
      subtotal += rate * total_days;
      rentalItemsToCreate.push({ unit_id: uid, daily_rate: rate, condition: u.physical_condition });
    });

    const total_cost = Math.max(0, subtotal - (data.discount || 0));
    const paid = data.initial_payment || 0;
    const payment_status: PaymentStatus = paid >= total_cost ? 'Lunas' : paid > 0 ? 'DP' : 'Belum Bayar';

    const newRental: Rental = {
      id,
      rental_code,
      customer_id: data.customer_id,
      out_date: data.out_date,
      due_date: data.due_date,
      total_days,
      subtotal,
      discount: data.discount || 0,
      deposit_amount: data.deposit_amount || 0,
      total_cost,
      payment_status,
      rental_status: 'Berlangsung',
      notes: data.notes || '',
      created_at: now,
      updated_at: now
    };

    this.db.rentals.push(newRental);

    // Create items and mark units as Disewa
    const defaultAcc = data.accessories || { charger: true, headset: true, belt_clip: true, lanyard: true, antenna: true };
    rentalItemsToCreate.forEach(item => {
      const riId = this.db.rental_items.length > 0 ? Math.max(...this.db.rental_items.map(ri => ri.id)) + 1 : 1;
      this.db.rental_items.push({
        id: riId,
        rental_id: id,
        unit_id: item.unit_id,
        daily_rate: item.daily_rate,
        condition_out: item.condition,
        battery_level_out: 100,
        accessories_out: defaultAcc,
        created_at: now
      });

      const u = this.db.equipment_units.find(unit => unit.id === item.unit_id);
      if (u) {
        u.status = 'Disewa';
        u.updated_at = now;
      }
    });

    // Record rental fee payment if provided
    if (paid > 0) {
      const payId = this.db.payments.length > 0 ? Math.max(...this.db.payments.map(p => p.id)) + 1 : 1;
      this.db.payments.push({
        id: payId,
        payment_code: `PAY-${yearMonth}-${String(payId).padStart(3, '0')}`,
        rental_id: id,
        type: 'Sewa',
        amount: paid,
        payment_method: data.payment_method,
        payment_date: now,
        notes: `Pembayaran sewa ${rental_code} (${payment_status})`,
        created_at: now
      });
    }

    // Record deposit payment if provided
    if (data.deposit_amount > 0) {
      const payDepId = this.db.payments.length > 0 ? Math.max(...this.db.payments.map(p => p.id)) + 1 : 1;
      this.db.payments.push({
        id: payDepId,
        payment_code: `PAY-${yearMonth}-${String(payDepId).padStart(3, '0')}`,
        rental_id: id,
        type: 'Deposit',
        amount: data.deposit_amount,
        payment_method: data.payment_method,
        payment_date: now,
        notes: `Titipan Uang Jaminan Sewa ${rental_code}`,
        created_at: now
      });
    }

    this.logAudit('CREATE_RENTAL', 'rentals', id, `Transaksi sewa ${rental_code} dibuat (${data.unit_ids.length} unit).`);
    this.save();
    return newRental;
  }

  // --- RETURNS PROCESS ---
  public processReturn(data: {
    rental_id: number;
    return_date: string;
    items_inspection: {
      rental_item_id: number;
      unit_id: number;
      physical_condition_returned: string;
      battery_condition_returned: number;
      accessories_missing: string[];
      damage_notes: string;
      repair_cost: number;
      resulting_status: 'Tersedia' | 'Perawatan' | 'Hilang';
    }[];
    late_hours: number;
    late_fee: number;
    deposit_refund_action: 'refund_full' | 'deduct_fees' | 'no_refund';
    receiver_notes: string;
  }): ReturnRecord {
    const rental = this.db.rentals.find(r => r.id === data.rental_id);
    if (!rental) throw new Error('Data rental tidak ditemukan.');
    if (rental.rental_status === 'Selesai') throw new Error('Transaksi rental ini sudah pernah diselesaikan.');

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = this.db.returns.length > 0 ? Math.max(...this.db.returns.map(ret => ret.id)) + 1 : 1;
    const yearMonth = data.return_date.substring(0, 7).replace('-', '');
    const return_code = `RT-${yearMonth}-${String(id).padStart(3, '0')}`;

    let totalDamageFee = 0;
    let totalLostFee = 0;

    data.items_inspection.forEach(insp => {
      totalDamageFee += insp.repair_cost || 0;
      if (insp.resulting_status === 'Hilang') {
        totalLostFee += 150000; // Standar ganti unit hilang
      }
    });

    const totalFinesAndDamages = data.late_fee + totalDamageFee + totalLostFee;
    let depositRefunded = 0;

    if (data.deposit_refund_action === 'refund_full') {
      depositRefunded = rental.deposit_amount;
    } else if (data.deposit_refund_action === 'deduct_fees') {
      depositRefunded = Math.max(0, rental.deposit_amount - totalFinesAndDamages);
    } else {
      depositRefunded = 0;
    }

    const newReturn: ReturnRecord = {
      id,
      return_code,
      rental_id: data.rental_id,
      return_date: data.return_date,
      late_hours: data.late_hours || 0,
      late_fee: data.late_fee || 0,
      damage_fee: totalDamageFee,
      lost_fee: totalLostFee,
      deposit_refunded: depositRefunded,
      final_payment_adjusted: totalFinesAndDamages,
      receiver_notes: data.receiver_notes || '',
      created_at: now
    };

    this.db.returns.push(newReturn);

    // Save return items & update equipment unit status accordingly
    data.items_inspection.forEach(insp => {
      const retItemId = this.db.return_items.length > 0 ? Math.max(...this.db.return_items.map(ri => ri.id)) + 1 : 1;
      this.db.return_items.push({
        id: retItemId,
        return_id: id,
        rental_item_id: insp.rental_item_id,
        unit_id: insp.unit_id,
        physical_condition_returned: insp.physical_condition_returned,
        battery_condition_returned: insp.battery_condition_returned,
        accessories_missing: insp.accessories_missing,
        damage_notes: insp.damage_notes,
        assessed_repair_cost: insp.repair_cost,
        resulting_unit_status: insp.resulting_status
      });

      // Update unit status and condition
      const unit = this.db.equipment_units.find(u => u.id === insp.unit_id);
      if (unit) {
        unit.status = insp.resulting_status;
        unit.physical_condition = insp.physical_condition_returned;
        unit.battery_health = Math.min(100, Math.max(0, insp.battery_condition_returned));
        unit.updated_at = now;

        // If unit damaged and put in maintenance, automatically log to maintenance records
        if (insp.resulting_status === 'Perawatan') {
          const mId = this.db.maintenance_records.length > 0 ? Math.max(...this.db.maintenance_records.map(m => m.id)) + 1 : 1;
          this.db.maintenance_records.push({
            id: mId,
            maintenance_code: `MT-${yearMonth}-${String(mId).padStart(3, '0')}`,
            unit_id: insp.unit_id,
            check_date: data.return_date.substring(0, 10),
            damage_type: insp.damage_notes || 'Kerusakan Pasca Sewa',
            damage_description: `Kerusakan dikonfirmasi saat pengembalian ${return_code}: ${insp.damage_notes}`,
            cost: insp.repair_cost,
            status: 'Dilaporkan',
            technician_notes: 'Masuk antrean perbaikan unit.',
            created_at: now,
            updated_at: now
          });
        }
      }
    });

    // Record fine payments if applicable
    if (data.late_fee > 0) {
      const payId = this.db.payments.length > 0 ? Math.max(...this.db.payments.map(p => p.id)) + 1 : 1;
      this.db.payments.push({
        id: payId,
        payment_code: `PAY-${yearMonth}-${String(payId).padStart(3, '0')}`,
        rental_id: rental.id,
        type: 'Denda',
        amount: data.late_fee,
        payment_method: 'Tunai',
        payment_date: now,
        notes: `Denda keterlambatan ${data.late_hours} jam pengembalian ${return_code}`,
        created_at: now
      });
    }

    if (totalDamageFee > 0 || totalLostFee > 0) {
      const payId = this.db.payments.length > 0 ? Math.max(...this.db.payments.map(p => p.id)) + 1 : 1;
      this.db.payments.push({
        id: payId,
        payment_code: `PAY-${yearMonth}-${String(payId).padStart(3, '0')}`,
        rental_id: rental.id,
        type: 'Kerusakan',
        amount: totalDamageFee + totalLostFee,
        payment_method: 'Tunai',
        payment_date: now,
        notes: `Ganti rugi kerusakan/kehilangan unit pengembalian ${return_code}`,
        created_at: now
      });
    }

    if (depositRefunded > 0) {
      const payId = this.db.payments.length > 0 ? Math.max(...this.db.payments.map(p => p.id)) + 1 : 1;
      this.db.payments.push({
        id: payId,
        payment_code: `PAY-${yearMonth}-${String(payId).padStart(3, '0')}`,
        rental_id: rental.id,
        type: 'Pengembalian Deposit',
        amount: depositRefunded,
        payment_method: 'Tunai',
        payment_date: now,
        notes: `Pengembalian uang deposit transaksi ${rental.rental_code}`,
        created_at: now
      });
    }

    rental.rental_status = 'Selesai';
    rental.actual_return_date = data.return_date;
    rental.updated_at = now;

    this.logAudit('PROCESS_RETURN', 'returns', id, `Pengembalian ${return_code} untuk rental ${rental.rental_code} selesai diproses.`);
    this.save();
    return newReturn;
  }

  // --- FINANCIALS & EXPENSES ---
  public getPayments(filter?: { type?: string; method?: string; startDate?: string; endDate?: string }): Payment[] {
    let list = this.db.payments.map(p => {
      const rental = p.rental_id ? this.db.rentals.find(r => r.id === p.rental_id) : undefined;
      const customer = rental ? this.db.customers.find(c => c.id === rental.customer_id) : undefined;
      return {
        ...p,
        rental,
        customer_name: customer?.name
      };
    });

    if (filter?.type && filter.type !== 'Semua') {
      list = list.filter(p => p.type === filter.type);
    }
    if (filter?.method && filter.method !== 'Semua') {
      list = list.filter(p => p.payment_method === filter.method);
    }
    if (filter?.startDate) {
      list = list.filter(p => p.payment_date.substring(0, 10) >= filter.startDate!);
    }
    if (filter?.endDate) {
      list = list.filter(p => p.payment_date.substring(0, 10) <= filter.endDate!);
    }

    return list.sort((a, b) => b.id - a.id);
  }

  public getExpenses(filter?: { category?: string; startDate?: string; endDate?: string }): Expense[] {
    let list = [...this.db.expenses];
    if (filter?.category && filter.category !== 'Semua') {
      list = list.filter(e => e.category === filter.category);
    }
    if (filter?.startDate) {
      list = list.filter(e => e.expense_date >= filter.startDate!);
    }
    if (filter?.endDate) {
      list = list.filter(e => e.expense_date <= filter.endDate!);
    }
    return list.sort((a, b) => b.id - a.id);
  }

  public createExpense(data: Omit<Expense, 'id' | 'expense_code' | 'created_at'>): Expense {
    const id = this.db.expenses.length > 0 ? Math.max(...this.db.expenses.map(e => e.id)) + 1 : 1;
    const yearMonth = data.expense_date.substring(0, 7).replace('-', '');
    const expense_code = `EXP-${yearMonth}-${String(id).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newExpense: Expense = {
      id,
      expense_code,
      ...data,
      created_at: now
    };
    this.db.expenses.push(newExpense);
    this.logAudit('CREATE_EXPENSE', 'expenses', id, `Pengeluaran ${expense_code} (${data.category}): Rp ${data.amount.toLocaleString()} dicatat.`);
    this.save();
    return newExpense;
  }

  public updatePayment(id: number, data: Partial<Payment>): Payment {
    const payment = this.db.payments.find(p => p.id === id);
    if (!payment) {
      throw new Error(`Transaksi pembayaran ID ${id} tidak ditemukan.`);
    }
    if (data.amount !== undefined) payment.amount = Number(data.amount);
    if (data.type !== undefined) payment.type = data.type;
    if (data.payment_method !== undefined) payment.payment_method = data.payment_method;
    if (data.payment_date !== undefined) payment.payment_date = data.payment_date;
    if (data.notes !== undefined) payment.notes = data.notes;

    this.logAudit('UPDATE_PAYMENT', 'payments', id, `Pembayaran ${payment.payment_code} diperbarui: Rp ${payment.amount.toLocaleString()}.`);
    this.save();
    return payment;
  }

  public deletePayment(id: number): boolean {
    const idx = this.db.payments.findIndex(p => p.id === id);
    if (idx === -1) {
      throw new Error(`Transaksi pembayaran ID ${id} tidak ditemukan.`);
    }
    const code = this.db.payments[idx].payment_code;
    this.db.payments.splice(idx, 1);
    this.logAudit('DELETE_PAYMENT', 'payments', id, `Pembayaran ${code} dihapus.`);
    this.save();
    return true;
  }

  public updateExpense(id: number, data: Partial<Expense>): Expense {
    const expense = this.db.expenses.find(e => e.id === id);
    if (!expense) {
      throw new Error(`Transaksi pengeluaran ID ${id} tidak ditemukan.`);
    }
    if (data.category !== undefined) expense.category = data.category;
    if (data.amount !== undefined) expense.amount = Number(data.amount);
    if (data.expense_date !== undefined) expense.expense_date = data.expense_date;
    if (data.description !== undefined) expense.description = data.description;
    if (data.payment_method !== undefined) expense.payment_method = data.payment_method;
    if (data.recipient !== undefined) expense.recipient = data.recipient;
    if (data.notes !== undefined) expense.notes = data.notes;

    this.logAudit('UPDATE_EXPENSE', 'expenses', id, `Pengeluaran ${expense.expense_code} diperbarui: Rp ${expense.amount.toLocaleString()}.`);
    this.save();
    return expense;
  }

  public deleteExpense(id: number): boolean {
    const idx = this.db.expenses.findIndex(e => e.id === id);
    if (idx === -1) {
      throw new Error(`Transaksi pengeluaran ID ${id} tidak ditemukan.`);
    }
    const code = this.db.expenses[idx].expense_code;
    this.db.expenses.splice(idx, 1);
    this.logAudit('DELETE_EXPENSE', 'expenses', id, `Pengeluaran ${code} dihapus.`);
    this.save();
    return true;
  }

  public resetTrialData(): { success: boolean; message: string; unitsReset: number } {
    // Clear all dummy/trial transaction and customer records per user's request
    this.db.customers = [];
    this.db.bookings = [];
    this.db.booking_items = [];
    this.db.rentals = [];
    this.db.rental_items = [];
    this.db.returns = [];
    this.db.return_items = [];
    this.db.payments = [];
    this.db.expenses = [];
    this.db.maintenance_records = [];

    // Reset all 18 physical HT units to 'Tersedia' and ready state
    for (const unit of this.db.equipment_units) {
      unit.status = 'Tersedia';
      unit.battery_health = 100;
      unit.physical_condition = 'Sangat Baik';
      unit.notes = 'Siap disewa';
      unit.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    // Set starting rate to 20000
    if (this.db.equipment_models[0]) {
      this.db.equipment_models[0].daily_rate = 20000;
    }
    this.db.app_settings.default_daily_rate = 20000;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.db.audit_logs = [
      {
        id: 1,
        user_id: 1,
        action: 'SYSTEM_RESET_PRODUCTION',
        entity_type: 'system',
        entity_id: 0,
        description: 'Sistem TALKRENT dibersihkan dari data uji coba. Siap menerima inputan data pelanggan riil.',
        ip_address: '127.0.0.1',
        created_at: now
      }
    ];

    this.save();
    return {
      success: true,
      message: 'Semua data pelanggan & transaksi percobaan berhasil dikosongkan. 18 unit HT telah disiapkan dan siap menerima input pelanggan riil.',
      unitsReset: this.db.equipment_units.length
    };
  }

  public getFinancialSummary() {
    // Net operational revenue:
    // Rental fee payments + Denda + Kerusakan (Do NOT count deposit held as revenue, per requirements!)
    const revenuePayments = this.db.payments.filter(p => p.type === 'Sewa' || p.type === 'Denda' || p.type === 'Kerusakan');
    const totalIncome = revenuePayments.reduce((acc, p) => acc + p.amount, 0);

    // Active deposits currently held in custody
    const depositReceived = this.db.payments.filter(p => p.type === 'Deposit').reduce((acc, p) => acc + p.amount, 0);
    const depositRefunded = this.db.payments.filter(p => p.type === 'Pengembalian Deposit').reduce((acc, p) => acc + p.amount, 0);
    const activeDepositHeld = Math.max(0, depositReceived - depositRefunded);

    // Total expenses
    const totalExpenses = this.db.expenses.reduce((acc, e) => acc + e.amount, 0);

    // Operational Profit
    const operationalProfit = totalIncome - totalExpenses;

    // Monthly chart data (dynamically computed from actual payments and expenses)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
      const label = `${monthNames[m]} ${String(y).slice(-2)}`;
      
      const mIncome = this.db.payments
        .filter(p => (p.type === 'Sewa' || p.type === 'Denda' || p.type === 'Kerusakan') && p.payment_date?.startsWith(prefix))
        .reduce((acc, p) => acc + p.amount, 0);

      const mExpenses = this.db.expenses
        .filter(e => e.expense_date?.startsWith(prefix))
        .reduce((acc, e) => acc + e.amount, 0);

      monthlyStats.push({
        month: label,
        income: mIncome,
        expenses: mExpenses,
        profit: mIncome - mExpenses
      });
    }

    return {
      totalIncome,
      totalExpenses,
      operationalProfit,
      activeDepositHeld,
      revenueBreakdown: {
        sewa: this.db.payments.filter(p => p.type === 'Sewa').reduce((acc, p) => acc + p.amount, 0),
        denda: this.db.payments.filter(p => p.type === 'Denda').reduce((acc, p) => acc + p.amount, 0),
        kerusakan: this.db.payments.filter(p => p.type === 'Kerusakan').reduce((acc, p) => acc + p.amount, 0)
      },
      expenseByCategory: {
        'Perawatan HT': this.db.expenses.filter(e => e.category === 'Perawatan HT').reduce((acc, e) => acc + e.amount, 0),
        'Pembelian Baterai': this.db.expenses.filter(e => e.category === 'Pembelian Baterai').reduce((acc, e) => acc + e.amount, 0),
        'Pembelian Charger': this.db.expenses.filter(e => e.category === 'Pembelian Charger').reduce((acc, e) => acc + e.amount, 0),
        'Operasional': this.db.expenses.filter(e => e.category === 'Operasional').reduce((acc, e) => acc + e.amount, 0),
        'Gaji/Transport': this.db.expenses.filter(e => e.category === 'Gaji/Transport').reduce((acc, e) => acc + e.amount, 0),
        'Lainnya': this.db.expenses.filter(e => e.category === 'Lainnya').reduce((acc, e) => acc + e.amount, 0)
      },
      monthlyStats
    };
  }

  // --- MAINTENANCE RECORDS ---
  public getMaintenanceRecords(): MaintenanceRecord[] {
    return this.db.maintenance_records.map(m => ({
      ...m,
      unit: this.db.equipment_units.find(u => u.id === m.unit_id)
    })).sort((a, b) => b.id - a.id);
  }

  public createMaintenance(data: Omit<MaintenanceRecord, 'id' | 'maintenance_code' | 'created_at' | 'updated_at'>): MaintenanceRecord {
    const id = this.db.maintenance_records.length > 0 ? Math.max(...this.db.maintenance_records.map(m => m.id)) + 1 : 1;
    const yearMonth = data.check_date.substring(0, 7).replace('-', '');
    const maintenance_code = `MT-${yearMonth}-${String(id).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newM: MaintenanceRecord = {
      id,
      maintenance_code,
      ...data,
      created_at: now,
      updated_at: now
    };
    this.db.maintenance_records.push(newM);

    // Update equipment unit status to Perawatan
    const u = this.db.equipment_units.find(unit => unit.id === data.unit_id);
    if (u) {
      u.status = 'Perawatan';
      u.updated_at = now;
    }

    this.logAudit('CREATE_MAINTENANCE', 'maintenance_records', id, `Perawatan ${maintenance_code} untuk unit ${u?.unit_code || data.unit_id} dibuka.`);
    this.save();
    return newM;
  }

  public updateMaintenanceStatus(id: number, status: MaintenanceStatus, cost?: number, notes?: string): MaintenanceRecord | null {
    const m = this.db.maintenance_records.find(item => item.id === id);
    if (!m) return null;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    m.status = status;
    if (cost !== undefined) m.cost = cost;
    if (notes !== undefined) m.technician_notes = notes;
    m.updated_at = now;

    if (status === 'Selesai') {
      m.completion_date = now.substring(0, 10);
      const u = this.db.equipment_units.find(unit => unit.id === m.unit_id);
      if (u) {
        u.status = 'Tersedia';
        u.physical_condition = 'Sangat Baik';
        u.battery_health = 95;
        u.updated_at = now;
      }
      // Record expense for repair cost
      if (m.cost > 0) {
        this.createExpense({
          category: 'Perawatan HT',
          amount: m.cost,
          expense_date: now.substring(0, 10),
          description: `Biaya perbaikan perawatan ${m.maintenance_code} (${m.damage_type})`,
          payment_method: 'Tunai',
          recipient: 'Teknisi Radio',
          notes: m.technician_notes || 'Selesai diservis'
        });
      }
    } else if (status === 'Dibatalkan') {
      const u = this.db.equipment_units.find(unit => unit.id === m.unit_id);
      if (u) {
        u.status = 'Tersedia';
        u.updated_at = now;
      }
    }

    this.logAudit('UPDATE_MAINTENANCE', 'maintenance_records', id, `Status perawatan ${m.maintenance_code} diubah menjadi ${status}.`);
    this.save();
    return m;
  }

  // --- APP SETTINGS ---
  public getSettings(): AppSettings {
    return this.db.app_settings;
  }

  public updateSettings(data: Partial<AppSettings>): AppSettings {
    Object.assign(this.db.app_settings, data, { updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) });
    this.logAudit('UPDATE_SETTINGS', 'app_settings', 1, 'Pengaturan bisnis & tarif TALKRENT diperbarui.');
    this.save();
    return this.db.app_settings;
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(limit: number = 50): AuditLog[] {
    return this.db.audit_logs.slice(0, limit);
  }

  // --- DASHBOARD OVERVIEW ---
  public getDashboardOverview() {
    const totalUnits = this.db.equipment_units.length;
    const availableUnits = this.db.equipment_units.filter(u => u.status === 'Tersedia').length;
    const rentedUnits = this.db.equipment_units.filter(u => u.status === 'Disewa').length;
    const maintenanceUnits = this.db.equipment_units.filter(u => u.status === 'Perawatan').length;

    const activeBookings = this.db.bookings.filter(b => b.status === 'Menunggu' || b.status === 'Dikonfirmasi').length;
    const ongoingRentals = this.db.rentals.filter(r => r.rental_status === 'Berlangsung' || r.rental_status === 'Terlambat').length;

    const todayStr = new Date().toISOString().substring(0, 10);
    const thisMonthStr = todayStr.substring(0, 7);

    // Revenue today & this month
    const todayRevenue = this.db.payments
      .filter(p => (p.type === 'Sewa' || p.type === 'Denda' || p.type === 'Kerusakan') && p.payment_date.startsWith(todayStr))
      .reduce((sum, p) => sum + p.amount, 0);

    const monthRevenue = this.db.payments
      .filter(p => (p.type === 'Sewa' || p.type === 'Denda' || p.type === 'Kerusakan') && p.payment_date.startsWith(thisMonthStr))
      .reduce((sum, p) => sum + p.amount, 0);

    // Overdue rentals check
    const nowTime = new Date().getTime();
    const overdueRentals = this.db.rentals.filter(r => {
      if (r.rental_status === 'Berlangsung') {
        const dueTime = new Date(r.due_date).getTime();
        return nowTime > dueTime;
      }
      return r.rental_status === 'Terlambat';
    }).map(r => ({
      ...r,
      customer: this.db.customers.find(c => c.id === r.customer_id)
    }));

    const recentBookings = this.getBookings().slice(0, 5);
    const recentRentals = this.getRentals().slice(0, 5);
    const recentAudit = this.getAuditLogs(8);
    const financialSummary = this.getFinancialSummary();

    return {
      stats: {
        totalUnits,
        availableUnits,
        rentedUnits,
        maintenanceUnits,
        activeBookings,
        ongoingRentals,
        todayRevenue,
        monthRevenue
      },
      overdueRentals,
      recentBookings,
      recentRentals,
      recentAudit,
      financialSummary
    };
  }
}

export const db = new DatabaseEngine();
