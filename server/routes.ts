/**
 * TALKRENT REST API Router
 * Implements complete backend REST API endpoints for Web Admin and Android App.
 */

import { Router, Request, Response } from 'express';
import { db } from './db';
import { generateMySQLDump } from './sql_schema';
import { generatePhpBackendFiles } from './php_generator';
import { generateAndroidKotlinFiles } from './android_generator';

export const apiRouter = Router();

// --- 1. AUTHENTICATION ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  const user = db.verifyAdminCredentials(username, password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Username atau password tidak cocok.' });
  }

  const token = `tr_session_${Buffer.from(`${user.id}_${Date.now()}`).toString('base64')}`;
  return res.json({
    success: true,
    message: 'Login berhasil.',
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    }
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  return res.json({
    success: true,
    user: {
      id: 1,
      username: 'admin',
      full_name: 'Admin Utama TALKRENT',
      email: 'admin@talkrent.id',
      role: 'admin'
    }
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  db.logAudit('AUTH_LOGOUT', 'users', 1, 'Admin logout dari sistem.');
  return res.json({ success: true, message: 'Logout berhasil.' });
});

// --- 2. DASHBOARD ---
apiRouter.get('/dashboard/overview', (req: Request, res: Response) => {
  try {
    const data = db.getDashboardOverview();
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- 3. CUSTOMERS ---
apiRouter.get('/customers', (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const list = db.getCustomers(search);
  return res.json({ success: true, data: list });
});

apiRouter.get('/customers/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const c = db.getCustomerById(id);
  if (!c) return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan.' });
  return res.json({ success: true, data: c });
});

apiRouter.post('/customers', (req: Request, res: Response) => {
  try {
    const { name, whatsapp, email, organization, address, notes } = req.body;
    if (!name || !whatsapp) {
      return res.status(400).json({ success: false, message: 'Nama dan nomor WhatsApp wajib diisi.' });
    }
    const customer = db.createCustomer({
      name,
      whatsapp,
      email: email || '',
      organization: organization || '',
      address: address || '',
      notes: notes || ''
    });
    return res.status(201).json({ success: true, data: customer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/customers/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const updated = db.updateCustomer(id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan.' });
  return res.json({ success: true, data: updated });
});

// --- 4. MODELS & INVENTORY UNITS ---
apiRouter.get('/models', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.getModels() });
});

apiRouter.get('/units', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const model_id = req.query.model_id ? parseInt(req.query.model_id as string, 10) : undefined;
  const search = req.query.search as string | undefined;
  const units = db.getUnits({ status, model_id, search });
  return res.json({ success: true, data: units });
});

apiRouter.get('/units/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const u = db.getUnitById(id);
  if (!u) return res.status(404).json({ success: false, message: 'Unit tidak ditemukan.' });
  return res.json({ success: true, data: u });
});

apiRouter.post('/units', (req: Request, res: Response) => {
  try {
    const { model_id, unit_code, serial_number, physical_condition, battery_health, purchase_date, purchase_price, status, notes } = req.body;
    if (!unit_code || !serial_number || !model_id) {
      return res.status(400).json({ success: false, message: 'Kode unit, nomor seri, dan tipe model wajib diisi.' });
    }
    const unit = db.createUnit({
      model_id: parseInt(model_id, 10),
      unit_code,
      serial_number,
      physical_condition: physical_condition || 'Sangat Baik',
      battery_health: parseInt(battery_health || '100', 10),
      purchase_date: purchase_date || new Date().toISOString().substring(0, 10),
      purchase_price: parseFloat(purchase_price || '0'),
      status: status || 'Tersedia',
      notes: notes || ''
    });
    return res.status(201).json({ success: true, data: unit });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/units/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const updated = db.updateUnit(id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Unit tidak ditemukan.' });
  return res.json({ success: true, data: updated });
});

apiRouter.delete('/units/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = db.deleteUnit(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Unit tidak ditemukan.' });
    return res.json({ success: true, message: 'Unit berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Unit Availability Checker
apiRouter.post('/units/check-availability', (req: Request, res: Response) => {
  const { startDate, endDate, modelId } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Tanggal mulai dan selesai wajib disertakan.' });
  }
  const result = db.checkUnitAvailability(startDate, endDate, modelId ? parseInt(modelId, 10) : undefined);
  return res.json({ success: true, data: result });
});

// --- 5. BOOKINGS ---
apiRouter.get('/bookings', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const list = db.getBookings(status);
  return res.json({ success: true, data: list });
});

apiRouter.post('/bookings', (req: Request, res: Response) => {
  try {
    const { customer_id, event_name, event_location, start_date, end_date, requested_quantity, rate_per_day, down_payment, notes, unit_ids } = req.body;
    if (!customer_id || !event_name || !start_date || !end_date || !requested_quantity) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi semua data wajib booking.' });
    }
    const booking = db.createBooking({
      customer_id: parseInt(customer_id, 10),
      event_name,
      event_location: event_location || 'Kabupaten Tasikmalaya',
      start_date,
      end_date,
      requested_quantity: parseInt(requested_quantity, 10),
      rate_per_day: parseFloat(rate_per_day || '20000'),
      down_payment: parseFloat(down_payment || '0'),
      notes: notes || '',
      unit_ids: unit_ids && Array.isArray(unit_ids) ? unit_ids : []
    });
    return res.status(201).json({ success: true, data: booking });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.post('/bookings/:id/convert-to-rental', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { selectedUnitIds, deposit } = req.body;
    if (!selectedUnitIds || !Array.isArray(selectedUnitIds) || selectedUnitIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Unit HT wajib dipilih untuk penyerahan barang.' });
    }
    const rental = db.convertBookingToRental(id, selectedUnitIds, parseFloat(deposit || '50000'));
    return res.json({ success: true, data: rental, message: 'Booking berhasil dikonversi menjadi rental aktif.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// --- 6. RENTALS ---
apiRouter.get('/rentals', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const list = db.getRentals(status);
  return res.json({ success: true, data: list });
});

apiRouter.post('/rentals', (req: Request, res: Response) => {
  try {
    const { customer_id, out_date, due_date, unit_ids, discount, deposit_amount, payment_method, initial_payment, notes, accessories } = req.body;
    if (!customer_id || !out_date || !due_date || !unit_ids || !Array.isArray(unit_ids) || unit_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Harap tentukan pelanggan, tanggal sewa, dan pilih unit HT.' });
    }
    const rental = db.createRental({
      customer_id: parseInt(customer_id, 10),
      out_date,
      due_date,
      unit_ids: unit_ids.map(Number),
      discount: parseFloat(discount || '0'),
      deposit_amount: parseFloat(deposit_amount || '50000'),
      payment_method: payment_method || 'Tunai',
      initial_payment: parseFloat(initial_payment || '0'),
      notes: notes || '',
      accessories
    });
    return res.status(201).json({ success: true, data: rental });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// --- 7. RETURNS PROCESS ---
apiRouter.post('/returns', (req: Request, res: Response) => {
  try {
    const { rental_id, return_date, items_inspection, late_hours, late_fee, deposit_refund_action, receiver_notes } = req.body;
    if (!rental_id || !return_date || !items_inspection || !Array.isArray(items_inspection)) {
      return res.status(400).json({ success: false, message: 'Data inspeksi pengembalian tidak lengkap.' });
    }
    const result = db.processReturn({
      rental_id: parseInt(rental_id, 10),
      return_date,
      items_inspection,
      late_hours: parseInt(late_hours || '0', 10),
      late_fee: parseFloat(late_fee || '0'),
      deposit_refund_action: deposit_refund_action || 'refund_full',
      receiver_notes: receiver_notes || ''
    });
    return res.json({ success: true, data: result, message: 'Pengembalian unit berhasil diproses ke sistem.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// --- 8. FINANCIALS, PAYMENTS & EXPENSES ---
apiRouter.get('/finances/summary', (req: Request, res: Response) => {
  const summary = db.getFinancialSummary();
  return res.json({ success: true, data: summary });
});

apiRouter.get('/payments', (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  const method = req.query.method as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const list = db.getPayments({ type, method, startDate, endDate });
  return res.json({ success: true, data: list });
});

apiRouter.put('/payments/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = db.updatePayment(id, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.delete('/payments/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    db.deletePayment(id);
    return res.json({ success: true, message: 'Transaksi pembayaran berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.get('/expenses', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const list = db.getExpenses({ category, startDate, endDate });
  return res.json({ success: true, data: list });
});

apiRouter.post('/expenses', (req: Request, res: Response) => {
  try {
    const { category, amount, expense_date, description, payment_method, recipient, notes } = req.body;
    if (!category || !amount || !expense_date || !description) {
      return res.status(400).json({ success: false, message: 'Kategori, jumlah biaya, tanggal, dan deskripsi wajib diisi.' });
    }
    const expense = db.createExpense({
      category,
      amount: parseFloat(amount),
      expense_date,
      description,
      payment_method: payment_method || 'Tunai',
      recipient: recipient || 'Operasional',
      notes: notes || ''
    });
    return res.status(201).json({ success: true, data: expense });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.put('/expenses/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = db.updateExpense(id, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.delete('/expenses/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    db.deleteExpense(id);
    return res.json({ success: true, message: 'Transaksi pengeluaran berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.post('/finances/reset-trial-data', (req: Request, res: Response) => {
  try {
    const result = db.resetTrialData();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- 9. MAINTENANCE RECORDS ---
apiRouter.get('/maintenance', (req: Request, res: Response) => {
  const list = db.getMaintenanceRecords();
  return res.json({ success: true, data: list });
});

apiRouter.post('/maintenance', (req: Request, res: Response) => {
  try {
    const { unit_id, check_date, damage_type, damage_description, cost, status, technician_notes } = req.body;
    if (!unit_id || !damage_type || !damage_description) {
      return res.status(400).json({ success: false, message: 'Unit HT, jenis kerusakan, dan deskripsi wajib disertakan.' });
    }
    const record = db.createMaintenance({
      unit_id: parseInt(unit_id, 10),
      check_date: check_date || new Date().toISOString().substring(0, 10),
      damage_type,
      damage_description,
      cost: parseFloat(cost || '0'),
      status: status || 'Dilaporkan',
      technician_notes: technician_notes || ''
    });
    return res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.put('/maintenance/:id/status', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, cost, notes } = req.body;
    const updated = db.updateMaintenanceStatus(id, status, cost ? parseFloat(cost) : undefined, notes);
    if (!updated) return res.status(404).json({ success: false, message: 'Data perawatan tidak ditemukan.' });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// --- 10. APP SETTINGS ---
apiRouter.get('/settings', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.getSettings() });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    return res.json({ success: true, data: updated, message: 'Pengaturan berhasil disimpan.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// --- 11. AUDIT LOGS ---
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.getAuditLogs(60) });
});

// --- 12. EXPORT ASSETS (SQL DUMP, PHP BACKEND, ANDROID KOTLIN) ---
apiRouter.get('/export/sql', (req: Request, res: Response) => {
  const sql = generateMySQLDump();
  res.setHeader('Content-Type', 'application/sql');
  res.setHeader('Content-Disposition', 'attachment; filename="talkrent_db.sql"');
  return res.send(sql);
});

apiRouter.get('/export/php', (req: Request, res: Response) => {
  const files = generatePhpBackendFiles();
  return res.json({ success: true, files });
});

apiRouter.get('/export/android', (req: Request, res: Response) => {
  const files = generateAndroidKotlinFiles();
  return res.json({ success: true, files });
});
