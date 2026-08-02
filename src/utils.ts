import { Order, ParsedOrderData } from './types';

/**
 * Cleans and extracts the Instagram username from raw text or URL.
 * Examples:
 * - "@fhmi.dputra" -> "fhmi.dputra"
 * - "https://www.instagram.com/fhmi.dputra?igsh=MW02N28xaGxkZnJidA%3D%3D&utm_source=qr" -> "fhmi.dputra"
 * - "fhmi.dputra" -> "fhmi.dputra"
 */
export function cleanIgUsername(val: string): string {
  if (!val || val.trim() === '' || val.trim() === '-') return '-';
  let cleaned = val.trim();

  // If it contains instagram.com URL
  if (cleaned.toLowerCase().includes('instagram.com/')) {
    try {
      const parts = cleaned.split(/instagram\.com\//i);
      if (parts[1]) {
        const path = parts[1].split('/')[0].split('?')[0].split('#')[0].trim();
        if (path) {
          cleaned = path;
        }
      }
    } catch (e) {
      // fallback
    }
  }

  // Remove leading @ symbols
  cleaned = cleaned.replace(/^@+/, '').trim();

  return cleaned || '-';
}

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
    warnaBendera: '-',
    warnaTali: '-',
    warnaBenderaUniv: '',
    warnaBenderaFak: '',
    warnaTaliUniv: '',
    warnaTaliFak: '',
    ukuranCaseUniv: '',
    ukuranCaseFak: '',
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
        result.ig = cleanIgUsername(value);
      } else if (key.includes('bendera univ') || key.includes('bendera universitas')) {
        result.warnaBenderaUniv = value;
      } else if (key.includes('bendera fak') || key.includes('bendera fakultas')) {
        result.warnaBenderaFak = value;
      } else if (key.includes('tali univ') || key.includes('tali universitas')) {
        result.warnaTaliUniv = value;
      } else if (key.includes('tali fak') || key.includes('tali fakultas')) {
        result.warnaTaliFak = value;
      } else if (key.includes('ukuran case univ') || key.includes('case univ') || key.includes('ukuran holder univ')) {
        result.ukuranCaseUniv = value;
      } else if (key.includes('ukuran case fak') || key.includes('case fak') || key.includes('ukuran holder fak')) {
        result.ukuranCaseFak = value;
      } else if (key.includes('warna bendera') || key.includes('bendera')) {
        result.warnaBendera = value;
      } else if (key.includes('warna tali') || key.includes('tali')) {
        result.warnaTali = value;
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

/**
 * Formats date string (e.g. "2026-08-04" or "04/08/2026") into Indonesian date format.
 * If includeDayName is true: "Selasa, 04 Agustus 2026"
 * If includeDayName is false: "04 Agustus 2026"
 */
export function formatPickupDate(dateStr?: string, includeDayName = false): string {
  if (!dateStr || String(dateStr).trim() === '' || String(dateStr).trim() === '-') {
    dateStr = '2026-08-04';
  }

  const cleanStr = String(dateStr).trim();
  let year = 2026;
  let monthIdx = 7; // August (0-indexed: 0=Jan, 7=Aug)
  let day = 4;
  let parsedSuccess = false;

  // Pattern 1: Google Sheets gviz format "Date(2026,7,4)" or "Date(2026, 7, 4)"
  const gvizMatch = cleanStr.match(/Date\s*\(\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)/i);
  if (gvizMatch) {
    year = parseInt(gvizMatch[1], 10);
    monthIdx = parseInt(gvizMatch[2], 10); // In gviz, 7 is August (0-indexed month)
    day = parseInt(gvizMatch[3], 10);
    parsedSuccess = true;
  } else {
    // Pattern 2: YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = cleanStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      monthIdx = parseInt(isoMatch[2], 10) - 1; // 1-indexed to 0-indexed
      day = parseInt(isoMatch[3], 10);
      parsedSuccess = true;
    } else {
      // Pattern 3: DD-MM-YYYY or DD/MM/YYYY
      const ddmmyyyyMatch = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (ddmmyyyyMatch) {
        day = parseInt(ddmmyyyyMatch[1], 10);
        monthIdx = parseInt(ddmmyyyyMatch[2], 10) - 1;
        year = parseInt(ddmmyyyyMatch[3], 10);
        parsedSuccess = true;
      } else {
        const d = new Date(cleanStr);
        if (!isNaN(d.getTime())) {
          year = d.getFullYear();
          monthIdx = d.getMonth();
          day = d.getDate();
          parsedSuccess = true;
        }
      }
    }
  }

  const d = parsedSuccess ? new Date(year, monthIdx, day) : new Date(2026, 7, 4);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[d.getDay()];
  const dateNum = String(d.getDate()).padStart(2, '0');
  const monthName = months[d.getMonth()];
  const yr = d.getFullYear();

  if (includeDayName) {
    return `${dayName}, ${dateNum} ${monthName} ${yr}`;
  }
  return `${dateNum} ${monthName} ${yr}`;
}

