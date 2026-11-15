import { Rental } from '../types';

export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
}

export function generateInvoiceHtml(rental: Rental): string {
  const itemsHtml = rental.items?.map((it, idx) => `
    <tr>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 11px;">${idx + 1}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <strong style="color: #0B2D5B;">${it.unit?.unit_code || 'HT-Unit'}</strong><br/>
        <span style="color: #64748b; font-size: 10px;">Model: ${it.unit?.model?.model_name || 'WLN Series'}</span>
      </td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-family: monospace;">
        ${it.unit?.serial_number || '-'}
      </td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center;">
        ${it.unit?.physical_condition || 'Baik'}
      </td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: right;">
        ${formatRupiah(it.daily_rate)} / hr
      </td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: right; font-weight: 600;">
        ${formatRupiah(it.daily_rate * (rental.total_days || 1))}
      </td>
    </tr>
  `).join('') || '';

  const paymentBadgeColor = rental.payment_status === 'Lunas' ? '#16a34a' : '#d97706';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota Sewa TALKRENT - ${rental.rental_code}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
      padding: 24px;
    }
    .action-bar {
      max-width: 800px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      text-decoration: none;
    }
    .btn-primary {
      background-color: #FF8C00;
      color: #ffffff;
    }
    .btn-primary:hover {
      background-color: #e67e00;
    }
    .btn-secondary {
      background-color: #0B2D5B;
      color: #ffffff;
    }
    .btn-secondary:hover {
      background-color: #072042;
    }
    .btn-outline {
      background-color: #f1f5f9;
      color: #334155;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0B2D5B;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      color: #0B2D5B;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 11px;
      font-weight: 700;
      color: #FF8C00;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-address {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-title {
      font-size: 16px;
      font-weight: 800;
      color: #0B2D5B;
      letter-spacing: 0.5px;
    }
    .doc-code {
      font-size: 14px;
      font-weight: 700;
      color: #FF8C00;
      font-family: monospace;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #ffffff;
      margin-top: 6px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .info-block h4 {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 6px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .info-row span:first-child {
      color: #64748b;
    }
    .info-row span:last-child {
      font-weight: 600;
      color: #1e293b;
      text-align: right;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #0B2D5B;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      text-align: left;
    }
    .calculation-grid {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .calculation-box {
      width: 320px;
      font-size: 12px;
      border-top: 2px solid #0B2D5B;
      padding-top: 8px;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .calc-row.total {
      font-size: 14px;
      font-weight: 800;
      color: #0B2D5B;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
      padding: 6px 0;
      margin: 4px 0;
    }
    .calc-row.deposit {
      color: #059669;
      font-weight: 600;
    }
    .terms-box {
      font-size: 10px;
      color: #475569;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 24px;
    }
    .terms-box ol {
      padding-left: 16px;
      margin-top: 4px;
    }
    .terms-box li {
      margin-bottom: 2px;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      text-align: center;
      font-size: 12px;
      margin-top: 28px;
      padding-top: 12px;
    }
    .sig-space {
      height: 60px;
    }
    .sig-name {
      font-weight: 700;
      text-decoration: underline;
      color: #0B2D5B;
    }
    .footer-note {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }

    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .action-bar {
        display: none !important;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      @page {
        margin: 1.2cm;
        size: A4 portrait;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="font-size: 12px; color: #475569;">
      <strong>Dokumen Resmi TALKRENT</strong> · Nota Sewa & Surat Jalan Unit Handy Talkie
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ Cetak Dokumen Ini (Print)
      </button>
      <button class="btn btn-outline" onclick="window.close()">
        Tutup
      </button>
    </div>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div class="brand-section">
        <img src="/talkrent_logo.png" alt="TALKRENT Logo" class="brand-logo" onerror="this.style.display='none'" />
        <div>
          <div class="brand-name">TALKRENT TASIKMALAYA</div>
          <div class="brand-tagline">Your Communication Partner</div>
          <div class="brand-address">
            Spesialis Rental Handy Talkie WLN · Kab. Tasikmalaya<br/>
            WhatsApp Resmi: 0878-6160-8958
          </div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-title">BUKTI SEWA & SURAT JALAN</div>
        <div class="doc-code">${rental.rental_code}</div>
        <div class="badge" style="background-color: ${paymentBadgeColor};">
          ${rental.payment_status?.toUpperCase() || 'TERCATAT'}
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-block">
        <h4>Identitas Penyewa</h4>
        <div class="info-row">
          <span>Nama Lengkap:</span>
          <span>${rental.customer?.name || '-'}</span>
        </div>
        <div class="info-row">
          <span>Instansi / Acara:</span>
          <span>${rental.customer?.organization || 'Pribadi / Umum'}</span>
        </div>
        <div class="info-row">
          <span>No. WhatsApp:</span>
          <span>${rental.customer?.whatsapp || '-'}</span>
        </div>
        <div class="info-row">
          <span>Alamat:</span>
          <span>${rental.customer?.address || '-'}</span>
        </div>
      </div>

      <div class="info-block">
        <h4>Jadwal & Periode Sewa</h4>
        <div class="info-row">
          <span>Waktu Pengambilan:</span>
          <span>${rental.out_date ? rental.out_date.substring(0, 16) : '-'} WIB</span>
        </div>
        <div class="info-row">
          <span>Batas Waktu Kembali:</span>
          <span style="color: #dc2626;">${rental.due_date ? rental.due_date.substring(0, 16) : '-'} WIB</span>
        </div>
        <div class="info-row">
          <span>Total Durasi:</span>
          <span>${rental.total_days || 1} Hari</span>
        </div>
        <div class="info-row">
          <span>Status Unit:</span>
          <span style="color: #0284c7;">${rental.rental_status || 'Aktif'}</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 35px; text-align: center;">No</th>
          <th>Kode Unit & Model</th>
          <th>Nomor Seri (S/N)</th>
          <th style="text-align: center;">Kondisi Awal</th>
          <th style="text-align: right;">Tarif / Hari</th>
          <th style="text-align: right;">Total Sewa</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="calculation-grid">
      <div class="calculation-box">
        <div class="calc-row">
          <span style="color: #64748b;">Subtotal Sewa (${rental.items ? rental.items.length : 0} Unit × ${rental.total_days} Hari):</span>
          <span>${formatRupiah(rental.subtotal)}</span>
        </div>
        ${rental.discount > 0 ? `
          <div class="calc-row" style="color: #dc2626;">
            <span>Potongan / Diskon:</span>
            <span>- ${formatRupiah(rental.discount)}</span>
          </div>
        ` : ''}
        <div class="calc-row total">
          <span>TOTAL BIAYA SEWA:</span>
          <span>${formatRupiah(rental.total_cost)}</span>
        </div>
        <div class="calc-row deposit">
          <span>Uang Jaminan (Deposit):</span>
          <span>${formatRupiah(rental.deposit_amount)}</span>
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px; text-align: right;">
          *Deposit dikembalikan utuh saat unit kembali dalam kondisi lengkap dan baik.
        </div>
      </div>
    </div>

    <div class="terms-box">
      <strong>SYARAT & KETENTUAN SEWA TALKRENT TASIKMALAYA:</strong>
      <ol>
        <li>Penyewa bertanggung jawab penuh atas keamanan, kebersihan, dan kelengkapan unit HT (unit, baterai, antena, clip, headset, charger).</li>
        <li>Keterlambatan pengembalian unit melebihi jam toleransi dikenakan denda keterlambatan per jam sesuai ketentuan yang berlaku.</li>
        <li>Kerusakan fisik (pecah, terkena air, terbakar) atau kehilangan unit menjadi tanggung jawab penyewa dan wajib mengganti biaya perbaikan/unit baru.</li>
        <li>Unit hanya diperbolehkan digunakan untuk komunikasi legal yang tidak melanggar hukum RI.</li>
      </ol>
    </div>

    <div class="signatures">
      <div>
        <div>Penyewa / Penanggung Jawab,</div>
        <div class="sig-space"></div>
        <div class="sig-name">${rental.customer?.name || '( ................................... )'}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Tanda Tangan & Nama Terang</div>
      </div>
      <div>
        <div>Petugas TALKRENT Tasikmalaya,</div>
        <div class="sig-space"></div>
        <div class="sig-name">Admin Operasional TALKRENT</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Kabupaten Tasikmalaya</div>
      </div>
    </div>

    <div class="footer-note">
      TALKRENT TASIKMALAYA · Your Communication Partner · Layanan Cepat: 0878-6160-8958<br/>
      Dokumen ini dicetak secara otomatis dari TALKRENT Digital Rental Management System
    </div>
  </div>

  <script>
    // Auto print if opened in popup or print mode
    window.addEventListener('load', function() {
      if (window.location.search.includes('autoprint=true')) {
        setTimeout(function() {
          window.print();
        }, 500);
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Robust printing function:
 * 1. Creates a hidden iframe to isolate the print styles and avoid parent page overlays
 * 2. Triggers print directly from the iframe
 * 3. Falls back gracefully to new tab if iframe printing encounters browser sandbox restrictions
 */
export async function printInvoice(rental: Rental): Promise<boolean> {
  const htmlContent = generateInvoiceHtml(rental);

  try {
    // Check if we can use hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'talkrent-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 400));

      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Clean up after 4 seconds
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 4000);
        return true;
      }
    }
  } catch (err) {
    console.warn('Iframe print failed or blocked, falling back to tab/download:', err);
  }

  // Fallback: Open in new window/tab
  return openInvoiceInNewTab(rental);
}

/**
 * Open invoice in a new clean browser window / tab
 */
export function openInvoiceInNewTab(rental: Rental): boolean {
  const htmlContent = generateInvoiceHtml(rental);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const newWin = window.open(url, '_blank');
  if (!newWin) {
    // If popup blocked, download the file instead
    downloadInvoiceHtml(rental);
    return false;
  }
  return true;
}

/**
 * Download the invoice as a standalone HTML file
 */
export function downloadInvoiceHtml(rental: Rental): void {
  const htmlContent = generateInvoiceHtml(rental);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Nota_Sewa_${rental.rental_code || 'TALKRENT'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate formatted text and open WhatsApp to send receipt directly to the customer
 */
export function sendInvoiceToWhatsApp(rental: Rental): void {
  const unitsText = rental.items?.map((it, idx) => 
    `${idx + 1}. ${it.unit?.unit_code || 'HT'} (S/N: ${it.unit?.serial_number || '-'})`
  ).join('\n') || '-';

  const message = `*TALKRENT TASIKMALAYA - NOTA SEWA DIGITAL*
----------------------------------------
*No. Nota:* ${rental.rental_code}
*Tanggal Keluar:* ${rental.out_date?.substring(0, 16)} WIB
*Batas Kembali:* ${rental.due_date?.substring(0, 16)} WIB
*Durasi:* ${rental.total_days} Hari

*Penyewa:* ${rental.customer?.name}
*Instansi:* ${rental.customer?.organization || '-'}

*Daftar Unit Handy Talkie WLN:*
${unitsText}

*Rincian Biaya:*
- Total Biaya Sewa: ${formatRupiah(rental.total_cost)}
- Uang Jaminan (Deposit): ${formatRupiah(rental.deposit_amount)}
- Status Pembayaran: *${rental.payment_status?.toUpperCase()}*

_Terima kasih telah mempercayakan kebutuhan komunikasi Anda kepada TALKRENT Tasikmalaya (Your Communication Partner)._
_WhatsApp Admin: 0878-6160-8958_`;

  let phone = rental.customer?.whatsapp?.replace(/[^0-9]/g, '') || '';
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }
  
  const waUrl = phone 
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  
  window.open(waUrl, '_blank');
}

/**
 * Print any DOM element or report section cleanly in an isolated iframe or new tab
 */
export function printReportElement(elementId: string, title: string): void {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  const content = el.innerHTML;
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title} - TALKRENT Tasikmalaya</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 24px;
      color: #1e293b;
      background: #fff;
    }
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0B2D5B;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #0B2D5B; color: #fff; padding: 8px; font-size: 11px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    .no-print { display: none !important; }
    @media print {
      body { padding: 0; }
      @page { margin: 1cm; size: landscape; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div>
      <h2 style="color: #0B2D5B; margin: 0; font-size: 18px;">TALKRENT TASIKMALAYA</h2>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #FF8C00; font-weight: bold;">Your Communication Partner · Handy Talkie Rental</p>
    </div>
    <div style="text-align: right; font-size: 11px; color: #64748b;">
      Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
    </div>
  </div>
  ${content}
</body>
</html>`;

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 3000);
      }, 350);
      return;
    }
  } catch (e) {
    console.warn('Iframe print failed, falling back:', e);
  }

  // Fallback: new window
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

