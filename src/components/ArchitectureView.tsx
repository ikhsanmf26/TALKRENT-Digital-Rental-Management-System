import React, { useState } from 'react';
import {
  Database,
  Smartphone,
  Server,
  Download,
  Copy,
  Check,
  Code,
  ExternalLink,
  Layers,
  Terminal,
  Play
} from 'lucide-react';
import { api } from '../api';

export const ArchitectureView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'sql' | 'php' | 'android' | 'api_test'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API Tester state
  const [testEndpoint, setTestEndpoint] = useState('/api/dashboard/overview');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSQL = () => {
    window.open('/api/export/sql', '_blank');
  };

  const runApiTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch(testEndpoint);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Arsitektur Sistem
        </button>
        <button
          onClick={() => setActiveSection('sql')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          MySQL Dump (talkrent_db.sql)
        </button>
        <button
          onClick={() => setActiveSection('php')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'php' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Backend PHP 8+ PDO (XAMPP)
        </button>
        <button
          onClick={() => setActiveSection('android')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'android' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Aplikasi Android (Kotlin)
        </button>
        <button
          onClick={() => setActiveSection('api_test')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'api_test' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Uji Coba REST API
        </button>
      </div>

      {/* 1. ARCHITECTURE OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">Arsitektur Terintegrasi TALKRENT</h2>
            <p className="mt-1 text-xs text-slate-500">
              Satu basis data terpusat (MySQL <code>talkrent_db</code>) melayani Web Dashboard Admin dan Aplikasi Android Admin secara simultan.
            </p>

            {/* Architecture Visual Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client Layer */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Smartphone className="h-4 w-4 text-[#0B2D5B]" />
                  <span>1. Klien Pengguna (Admin)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <div className="font-semibold text-slate-900">Web Admin Portal</div>
                    <div className="text-[11px] text-slate-500">React + Tailwind UI (Desktop & Tablet)</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <div className="font-semibold text-slate-900">Aplikasi Android</div>
                    <div className="text-[11px] text-slate-500">Kotlin + Retrofit (Smartphone Lapangan)</div>
                  </div>
                </div>
              </div>

              {/* API Layer */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Server className="h-4 w-4 text-[#FF8C00]" />
                  <span>2. Backend REST API</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <div className="font-semibold text-slate-900">Express / PHP 8+ PDO</div>
                    <div className="text-[11px] text-slate-500">Prepared Statements, CSRF Guard & Token Auth</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <div className="font-semibold text-slate-900">JSON Endpoints</div>
                    <div className="text-[11px] text-slate-500">/api/units, /api/rentals, /api/bookings</div>
                  </div>
                </div>
              </div>

              {/* Database Layer */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Database className="h-4 w-4 text-emerald-600" />
                  <span>3. Database Terpusat</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <div className="font-semibold text-slate-900">MySQL / MariaDB</div>
                    <div className="text-[11px] text-slate-500">Database: <code>talkrent_db</code> (InnoDB Engine)</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <div className="font-semibold text-slate-900">15 Tabel Berelasi</div>
                    <div className="text-[11px] text-slate-500">Foreign Keys, Cascade Rules & Audit Logging</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Deployment Instructions */}
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Langkah Deployment ke XAMPP & Android Studio:
              </h3>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-xs text-slate-700 leading-relaxed">
                <li>
                  <strong>Import Database MySQL:</strong> Buka phpMyAdmin di <code>http://localhost/phpmyadmin</code>, buat database bernama <code>talkrent_db</code>, lalu import file <code>talkrent_db.sql</code> yang telah disediakan di tab berikut.
                </li>
                <li>
                  <strong>Pasang Backend PHP:</strong> Salin berkas PHP (<code>config.php</code>, <code>db.php</code>, <code>api.php</code>) ke folder <code>C:/xampp/htdocs/talkrent/</code>.
                </li>
                <li>
                  <strong>Buka Proyek Android di Android Studio:</strong> Buka folder proyek Android, masukkan IP komputer host XAMPP pada <code>ApiClient.kt</code> (contoh: <code>http://192.168.1.5/talkrent/api.php?action=</code> atau <code>http://10.0.2.2/talkrent/</code> untuk emulator).
                </li>
                <li>
                  <strong>Jalankan Aplikasi:</strong> Kedua klien (Web dan Android) akan membaca data unit, booking, dan transaksi yang sama secara real-time.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 2. SQL DUMP */}
      {activeSection === 'sql' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">MySQL Schema & Seed Data (talkrent_db.sql)</h2>
              <p className="text-xs text-slate-500">Mencakup 15 tabel berelasi, foreign key constraints, indexes, dan seed armada WLN.</p>
            </div>
            <button
              onClick={handleDownloadSQL}
              className="flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#072042] transition-colors shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Unduh talkrent_db.sql</span>
            </button>
          </div>

          <div className="relative rounded-lg bg-slate-900 p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-96">
            <pre>
{`-- TALKRENT Database Schema
-- Database: talkrent_db
-- 15 Required Tables:
-- 1. users
-- 2. customers
-- 3. equipment_models
-- 4. equipment_units
-- 5. bookings
-- 6. booking_items
-- 7. rentals
-- 8. rental_items
-- 9. returns
-- 10. return_items
-- 11. payments
-- 12. expenses
-- 13. maintenance_records
-- 14. app_settings
-- 15. audit_logs

CREATE DATABASE IF NOT EXISTS \`talkrent_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`talkrent_db\`;

-- Klik tombol "Unduh talkrent_db.sql" di atas untuk mendapatkan berkas lengkap siap import ke phpMyAdmin.`}
            </pre>
          </div>
        </div>
      )}

      {/* 3. PHP BACKEND */}
      {activeSection === 'php' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">Backend PHP 8+ PDO REST API</h2>
            <p className="text-xs text-slate-500">Struktur berkas PHP native berorientasi objek dengan prepared statements untuk XAMPP.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <div className="font-mono font-bold text-[#0B2D5B]">config.php</div>
              <div className="mt-1 text-slate-600">Konfigurasi host MySQL, kredensial root XAMPP, dan parameter JWT/Session.</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <div className="font-mono font-bold text-[#0B2D5B]">db.php</div>
              <div className="mt-1 text-slate-600">Koneksi PDO singleton dengan penanganan error aman tanpa bocor ke klien.</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <div className="font-mono font-bold text-[#0B2D5B]">api.php</div>
              <div className="mt-1 text-slate-600">Router JSON REST API melayani request dari Website dan Android secara identik.</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ANDROID BLUEPRINT */}
      {activeSection === 'android' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">Blueprint Proyek Android Kotlin (Android Studio)</h2>
            <p className="text-xs text-slate-500">Arsitektur MVVM dengan Retrofit 2 dan Coroutines untuk koneksi ke REST API TALKRENT.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Code className="h-4 w-4 text-[#0B2D5B]" />
                <span>Retrofit API Service (Kotlin)</span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                Interface <code>TalkRentApiService.kt</code> menyediakan suspend function untuk <code>login</code>, <code>getUnits</code>, <code>getBookings</code>, dan <code>getDashboardOverview</code>.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#FF8C00]" />
                <span>Sinkronisasi Data Real-time</span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                Aplikasi Android dan Website Admin membaca tabel database yang sama sehingga unit yang disewa melalui HP langsung berstatus 'Disewa' di web.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. LIVE API TESTER */}
      {activeSection === 'api_test' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">Uji Coba Endpoint REST API Langsung</h2>
            <p className="text-xs text-slate-500">Verifikasi bahwa sistem backend merespon dalam format JSON standar RFC.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:border-[#0B2D5B] focus:outline-hidden"
            >
              <option value="/api/dashboard/overview">GET /api/dashboard/overview (Ringkasan KPI)</option>
              <option value="/api/units">GET /api/units (Daftar Armada WLN)</option>
              <option value="/api/customers">GET /api/customers (Direktori Pelanggan)</option>
              <option value="/api/bookings">GET /api/bookings (Reservasi Jadwal)</option>
              <option value="/api/rentals">GET /api/rentals (Penyewaan Aktif)</option>
              <option value="/api/finances/summary">GET /api/finances/summary (Laba Rugi)</option>
              <option value="/api/settings">GET /api/settings (Pengaturan Bisnis)</option>
            </select>
            <button
              onClick={runApiTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e67e00] transition-colors shrink-0 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isTesting ? 'Menguji...' : 'Kirim Request'}</span>
            </button>
          </div>

          {testResponse && (
            <div className="rounded-lg bg-slate-900 p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-72">
              <pre>{testResponse}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
