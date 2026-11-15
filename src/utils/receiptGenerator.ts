import { Rental } from '../types';

export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
}

/**
 * Renders a crisp, realistic thermal paper receipt (struk) on an HTML5 canvas.
 * Returns the HTMLCanvasElement.
 */
export async function renderReceiptCanvas(rental: Rental): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const width = 560; // Standard thermal paper aspect
  const items = rental.items || [];
  
  // Calculate dynamic height
  const baseHeight = 580;
  const itemHeight = items.length * 36;
  const height = baseHeight + itemHeight;

  canvas.width = width;
  canvas.height = height;

  // Background - Authentic thermal paper off-white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer paper border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, height);

  let y = 36;

  // Top header brand icon / emblem
  ctx.fillStyle = '#0B2D5B';
  ctx.font = 'bold 24px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TALKRENT', width / 2, y);
  y += 20;

  ctx.fillStyle = '#FF8C00';
  ctx.font = 'bold 13px "Courier New", Courier, monospace';
  ctx.fillText('YOUR COMMUNICATION PARTNER', width / 2, y);
  y += 18;

  ctx.fillStyle = '#475569';
  ctx.font = '11px "Courier New", Courier, monospace';
  ctx.fillText('Rental Handy Talkie WLN - Kab. Tasikmalaya', width / 2, y);
  y += 16;
  ctx.fillText('WhatsApp: 0878-6160-8958', width / 2, y);
  y += 24;

  // Dotted separator line
  const drawDottedLine = (posY: number) => {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, posY);
    ctx.lineTo(width - 30, posY);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  drawDottedLine(y);
  y += 24;

  // Receipt Title
  ctx.fillStyle = '#0B2D5B';
  ctx.font = 'bold 15px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('STRUK BUKTI SEWA DIGITAL', width / 2, y);
  y += 24;

  // Metadata block (left & right aligned)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1e293b';
  ctx.font = '12px "Courier New", Courier, monospace';

  const drawRow = (label: string, value: string, posY: number, isBoldValue = false) => {
    ctx.textAlign = 'left';
    ctx.font = '12px "Courier New", Courier, monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText(label, 32, posY);

    ctx.textAlign = 'right';
    ctx.font = isBoldValue ? 'bold 12px "Courier New", Courier, monospace' : '12px "Courier New", Courier, monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(value, width - 32, posY);
  };

  drawRow('No. Nota', rental.rental_code, y, true);
  y += 20;

  const outDateStr = rental.out_date ? rental.out_date.substring(0, 16).replace('T', ' ') : '-';
  drawRow('Tgl Sewa', `${outDateStr} WIB`, y);
  y += 20;

  const dueDateStr = rental.due_date ? rental.due_date.substring(0, 16).replace('T', ' ') : '-';
  drawRow('Batas Kembali', `${dueDateStr} WIB`, y);
  y += 20;

  drawRow('Penyewa', rental.customer?.name || 'Pelanggan', y, true);
  y += 20;

  if (rental.customer?.organization) {
    drawRow('Instansi', rental.customer.organization, y);
    y += 20;
  }

  drawRow('No. WA', rental.customer?.whatsapp || '-', y);
  y += 24;

  drawDottedLine(y);
  y += 22;

  // Items Header
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px "Courier New", Courier, monospace';
  ctx.fillStyle = '#0B2D5B';
  ctx.fillText('ITEM DISAMBIL', 32, y);
  ctx.textAlign = 'right';
  ctx.fillText('HARGA/HARI', width - 32, y);
  y += 18;

  // Items List
  items.forEach((it, idx) => {
    ctx.textAlign = 'left';
    ctx.font = '11px "Courier New", Courier, monospace';
    ctx.fillStyle = '#1e293b';

    const unitTitle = `${idx + 1}. ${it.unit?.unit_code || 'HT'} (S/N: ${it.unit?.serial_number || '-'})`;
    ctx.fillText(unitTitle, 32, y);

    ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(it.daily_rate), width - 32, y);
    y += 20;
  });

  y += 6;
  drawDottedLine(y);
  y += 22;

  // Cost Summary
  drawRow('Durasi Sewa', `${rental.total_days || 1} Hari`, y);
  y += 20;

  drawRow('Subtotal Sewa', formatRupiah(rental.subtotal), y);
  y += 20;

  if (rental.discount > 0) {
    drawRow('Potongan / Diskon', `- ${formatRupiah(rental.discount)}`, y);
    y += 20;
  }

  drawRow('Deposit Jaminan', formatRupiah(rental.deposit_amount), y);
  y += 24;

  // Total Big Row
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(28, y - 16, width - 56, 36);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(28, y - 16, width - 56, 36);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0B2D5B';
  ctx.font = 'bold 14px "Courier New", Courier, monospace';
  ctx.fillText('TOTAL BIAYA:', 36, y + 7);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FF8C00';
  ctx.font = 'bold 16px "Courier New", Courier, monospace';
  ctx.fillText(formatRupiah(rental.total_cost), width - 36, y + 7);
  y += 42;

  // Payment status stamp box
  const isLunas = rental.payment_status === 'Lunas';
  const stampText = isLunas ? '*** LUNAS ***' : '*** UANG MUKA / AKTIF ***';
  ctx.textAlign = 'center';
  ctx.fillStyle = isLunas ? '#15803d' : '#b45309';
  ctx.font = 'bold 14px "Courier New", Courier, monospace';
  ctx.fillText(stampText, width / 2, y);
  y += 22;

  // Barcode representation
  const barcodeY = y;
  const barcodeWidth = width - 120;
  const barcodeStart = 60;
  ctx.fillStyle = '#1e293b';

  // Draw simulated barcode lines
  const hash = (rental.rental_code || 'TALKRENT').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < barcodeWidth; i += 4) {
    const barW = ((i + hash) % 7 === 0 || (i + hash) % 5 === 0) ? 2.5 : 1;
    ctx.fillRect(barcodeStart + i, barcodeY, barW, 30);
  }
  y += 38;

  ctx.font = '10px "Courier New", Courier, monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText(`* ${rental.rental_code} *`, width / 2, y);
  y += 22;

  // Footer notes
  ctx.font = '10px "Courier New", Courier, monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Simpan struk ini sebagai bukti transaksi resmi', width / 2, y);
  y += 14;
  ctx.fillText('Kerusakan fisik/hilang dikenakan denda penggantian', width / 2, y);
  y += 14;
  ctx.fillText('Terima kasih telah mempercayai TALKRENT!', width / 2, y);

  return canvas;
}

/**
 * Returns a PNG Blob of the thermal receipt.
 */
export async function getReceiptImageBlob(rental: Rental): Promise<Blob> {
  const canvas = await renderReceiptCanvas(rental);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}

/**
 * Downloads the receipt image as a PNG file.
 */
export async function downloadReceiptImage(rental: Rental): Promise<void> {
  const blob = await getReceiptImageBlob(rental);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Struk_TALKRENT_${rental.rental_code || 'Nota'}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ShareReceiptResult {
  method: 'web-share' | 'clipboard' | 'download';
  message: string;
}

/**
 * Shares the receipt image to WhatsApp:
 * 1. Uses Web Share API if supported (attaches actual image file directly into WhatsApp).
 * 2. If Web Share is not supported, copies the image to clipboard (Ctrl+V ready) and opens WhatsApp with a SHORT message.
 */
export async function shareReceiptImageToWhatsApp(rental: Rental): Promise<ShareReceiptResult> {
  const blob = await getReceiptImageBlob(rental);
  const fileName = `Struk_TALKRENT_${rental.rental_code}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  // Short, neat caption as requested ("jangan kata katanya terlalu panjang")
  const shortText = `🧾 *Struk TALKRENT Tasikmalaya*
No: ${rental.rental_code}
Penyewa: ${rental.customer?.name}
Total: ${formatRupiah(rental.total_cost)} (${rental.payment_status?.toUpperCase() || 'LUNAS'})`;

  // 1. Try Web Share API (native mobile / supported desktop)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Struk TALKRENT - ${rental.rental_code}`,
        text: shortText,
        files: [file]
      });
      return {
        method: 'web-share',
        message: 'Foto struk berhasil dibagikan!'
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { method: 'web-share', message: 'Berbagi dibatalkan.' };
      }
      console.warn('Web Share API error, falling back to clipboard:', err);
    }
  }

  // 2. Clipboard API Fallback (Desktop / Web)
  let copiedToClipboard = false;
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      copiedToClipboard = true;
    }
  } catch (clipErr) {
    console.warn('Clipboard write image failed:', clipErr);
  }

  // Clean phone number for WhatsApp
  let phone = rental.customer?.whatsapp?.replace(/[^0-9]/g, '') || '';
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }

  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(shortText)}`
    : `https://wa.me/?text=${encodeURIComponent(shortText)}`;

  // Also auto-download image if clipboard wasn't available
  if (!copiedToClipboard) {
    downloadReceiptImage(rental);
  }

  window.open(waUrl, '_blank');

  return {
    method: copiedToClipboard ? 'clipboard' : 'download',
    message: copiedToClipboard
      ? '📸 Foto struk telah DISALIN ke clipboard! Silakan tekan Ctrl+V di chat WhatsApp untuk mengirim foto struk.'
      : '📸 Foto struk telah diunduh! Silakan lampirkan gambar ke chat WhatsApp.'
  };
}
