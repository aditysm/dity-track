import { Order, ParsedOrderData } from './types';

/**
 * Parses the raw ORDER_DATA string stored in the Google Sheets database.
 * Format: "Kampus: Universitas Diponegoro | Fakultas: Teknik | Prodi: Sistem Komputer | SMA: SMAN 1 Semarang | Jalur: SNBP | Jenis Univ: Reguler | Jenis Fak: Premium | IG: @adityptra"
 */
export function parseOrderData(raw: string): ParsedOrderData {
  const result: ParsedOrderData = {
    kampus: '-',
    fakultas: '-',
    prodi: '-',
    sma: '-',
    jalur: '-',
    jenisUniv: '-',
    jenisFak: '-',
    ig: '-',
  };

  if (!raw || raw.trim() === '') {
    return result;
  }

  const parts = raw.split('|');
  parts.forEach((part) => {
    const colonIndex = part.indexOf(':');
    if (colonIndex !== -1) {
      const key = part.substring(0, colonIndex).trim().toLowerCase();
      const value = part.substring(colonIndex + 1).trim();

      if (key.includes('kampus')) {
        result.kampus = value;
      } else if (key.includes('fakultas')) {
        result.fakultas = value;
      } else if (key.includes('prodi')) {
        result.prodi = value;
      } else if (key.includes('sma')) {
        result.sma = value;
      } else if (key.includes('jalur')) {
        result.jalur = value;
      } else if (key.includes('jenis univ')) {
        result.jenisUniv = value;
      } else if (key.includes('jenis fak')) {
        result.jenisFak = value;
      } else if (key.includes('ig') || key.includes('instagram')) {
        result.ig = value;
      }
    }
  });

  return result;
}

/**
 * Formats a string or number into Indonesian Rupiah (IDR).
 */
export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/\D/g, '')) : amount;
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Extracts a neat display name from an email address.
 * E.g., adityptra212@gmail.com -> Adityptra212
 */
export function getEmailDisplayName(email: string): string {
  if (!email || email.indexOf('@') === -1) return 'Pelanggan';
  const prefix = email.split('@')[0];
  return prefix
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats standard spreadsheet datetime string or Date(...) syntax to Indonesian format.
 * E.g., Date(2025,7,25,12,50,0) -> 25 Agustus 2025, 12.50 WITA
 */
export function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr || dateTimeStr === '-') return '-';
  try {
    let year: number;
    let monthIndex: number;
    let day: number;
    let hours: number = 0;
    let minutes: number = 0;

    const dateMatch = dateTimeStr.match(/Date\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+))?(?:\s*,\s*(\d+))?(?:\s*,\s*(\d+))?\s*\)/i);
    if (dateMatch) {
      year = parseInt(dateMatch[1], 10);
      monthIndex = parseInt(dateMatch[2], 10); // 0-indexed month from Google Visualization
      day = parseInt(dateMatch[3], 10);
      hours = dateMatch[4] ? parseInt(dateMatch[4], 10) : 0;
      minutes = dateMatch[5] ? parseInt(dateMatch[5], 10) : 0;
    } else {
      const date = new Date(dateTimeStr.replace(' ', 'T'));
      if (isNaN(date.getTime())) {
        return dateTimeStr;
      }
      year = date.getFullYear();
      monthIndex = date.getMonth();
      day = date.getDate();
      hours = date.getHours();
      minutes = date.getMinutes();
    }

    const monthsIndonesian = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const monthName = monthsIndonesian[monthIndex] || monthsIndonesian[0];
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    return `${day} ${monthName} ${year}, ${pad(hours)}.${pad(minutes)} WITA`;
  } catch (e) {
    return dateTimeStr;
  }
}
