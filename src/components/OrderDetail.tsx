import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, Calendar, CreditCard, School, Copy, Check, User, Hash, 
  MessageCircle, ExternalLink, ShieldAlert, CheckCircle2, Circle, AlertTriangle, Instagram, BookOpen, GraduationCap, X, Loader2, Contact, IdCard, RotateCcw, Undo2, QrCode, Users, Clock, MapPin, Star
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency, formatDateTime, getEmailDisplayName, cleanIgUsername, formatPickupDate, isPickupDatePassed } from '../utils';

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onConfirm?: (orderId: string, type: 'qr' | 'project', status: string) => Promise<boolean> | boolean;
  onShowToast?: (message: string) => void;
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyz2irrGBi5tCo0cmot-OWIOxkTU0B66c5K1f9Y0jWVtCBENJJjNtvtzIoPXYcFSwpw/exec";

const cleanNoKelompokStr = (val: string | undefined): string => {
  if (!val) return '';
  return String(val).replace(/[^0-9]/g, '').trim();
};

const getPickupLocationInfo = (tanggalStr?: string) => {
  const s = String(tanggalStr || '').toLowerCase();
  if (s.includes('5 agustus') || s.includes('05-08') || s.includes('2026-08-05') || s.includes('05/08') || s.includes(' 5 ')) {
    return {
      name: 'Auditorium M. Yusuf Abubakar UNRAM',
      url: 'https://maps.app.goo.gl/2B4SrHnHrF78sGEn8',
      dateLabel: '5 Agustus 2026'
    };
  }
  return {
    name: 'Depan GMB Gym Fitness',
    url: 'https://maps.app.goo.gl/GPNj5SG3BBbiYc6i8',
    dateLabel: '4 Agustus 2026'
  };
};

// Custom inline WhatsApp SVG icon
const WhatsAppIcon = () => (
  <svg 
    className="w-4 h-4 fill-current" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function OrderDetail({ order, onBack, onConfirm, onShowToast }: OrderDetailProps) {
  const [copied, setCopied] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [showPickupQrPopup, setShowPickupQrPopup] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(true);

  const handleOpenPickupQrModal = () => {
    setIsQrLoading(true);
    setShowPickupQrPopup(true);
  };

  const [savedPickupTime, setSavedPickupTime] = useState<string>(() => {
    return order.jamPengambilan || localStorage.getItem(`pickup_time_${order.id}`) || '';
  });
  const [isPickupTimeLocked, setIsPickupTimeLocked] = useState<boolean>(() => {
    const localVal = localStorage.getItem(`pickup_time_${order.id}`);
    const isLockedLocal = localStorage.getItem(`pickup_time_locked_${order.id}`) === 'true';
    return !!(order.jamPengambilan || (localVal && isLockedLocal));
  });

  const [showPickupTimeModal, setShowPickupTimeModal] = useState(false);
  const [selectedPickupTime, setSelectedPickupTime] = useState('');
  const [pickupTimeError, setPickupTimeError] = useState('');
  const [isSavingPickupTime, setIsSavingPickupTime] = useState(false);

  useEffect(() => {
    const localVal = localStorage.getItem(`pickup_time_${order.id}`);
    const isLockedLocal = localStorage.getItem(`pickup_time_locked_${order.id}`) === 'true';
    const val = order.jamPengambilan || localVal || '';
    setSavedPickupTime(val);
    setIsPickupTimeLocked(!!(order.jamPengambilan || (localVal && isLockedLocal)));
  }, [order.jamPengambilan, order.id]);

  const locationInfo = getPickupLocationInfo(order.tanggalPengambilan);

  const getMinPickupTime = (): { hour: number; minute: number; timeStr: string } => {
    const defaultMinH = 10;
    const defaultMinM = 0;
    
    const existingStr = order.jamPengambilan || savedPickupTime;
    if (!existingStr || !existingStr.trim()) {
      return { hour: defaultMinH, minute: defaultMinM, timeStr: '10:00' };
    }
    
    const match = existingStr.trim().match(/(\d{1,2})[:.](\d{2})/);
    if (match) {
      const exH = parseInt(match[1], 10);
      const exM = parseInt(match[2], 10);
      if (!isNaN(exH) && !isNaN(exM)) {
        if (exH > defaultMinH || (exH === defaultMinH && exM > defaultMinM)) {
          const hh = String(exH).padStart(2, '0');
          const mm = String(exM).padStart(2, '0');
          return { hour: exH, minute: exM, timeStr: `${hh}:${mm}` };
        }
      }
    }
    return { hour: defaultMinH, minute: defaultMinM, timeStr: '10:00' };
  };

  const validatePickupTime = (timeStr: string): { isValid: boolean; errorMsg: string } => {
    if (!timeStr || !timeStr.trim()) {
      return { isValid: false, errorMsg: 'Silahkan pilih jam pengambilan (minimal 10.00 WITA).' };
    }
    const match = timeStr.trim().match(/(\d{1,2})[:.](\d{2})/);
    if (!match) {
      return { isValid: false, errorMsg: 'Format jam tidak valid.' };
    }
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (isNaN(h) || isNaN(m)) {
      return { isValid: false, errorMsg: 'Format jam tidak valid.' };
    }

    const minLimit = getMinPickupTime();
    if (h < minLimit.hour || (h === minLimit.hour && m < minLimit.minute)) {
      const formattedMin = minLimit.timeStr.replace(':', '.');
      return { 
        isValid: false, 
        errorMsg: `Jam pengambilan tidak boleh kurang dari pukul ${formattedMin} WITA.` 
      };
    }

    if (h > 18 || (h === 18 && m > 0)) {
      return { isValid: false, errorMsg: 'Jam pengambilan tidak boleh lebih dari jam 18:00 sore WITA.' };
    }

    return { isValid: true, errorMsg: '' };
  };

  const handleOpenPickupModal = () => {
    const minLimit = getMinPickupTime();
    const initialTime = savedPickupTime || order.jamPengambilan || minLimit.timeStr;
    setSelectedPickupTime(initialTime);
    setPickupTimeError('');
    setShowPickupTimeModal(true);
  };

  const handleSavePickupTime = async () => {
    const v = validatePickupTime(selectedPickupTime);
    if (!v.isValid) {
      setPickupTimeError(v.errorMsg);
      return;
    }

    const match = selectedPickupTime.trim().match(/(\d{1,2})[:.](\d{2})/);
    if (!match) return;
    const hh = ("0" + match[1]).slice(-2);
    const mm = ("0" + match[2]).slice(-2);
    const formattedJam = `${hh}:${mm}`;

    setIsSavingPickupTime(true);

    localStorage.setItem(`pickup_time_${order.id}`, formattedJam);
    localStorage.setItem(`pickup_time_locked_${order.id}`, 'true');
    setSavedPickupTime(formattedJam);
    setIsPickupTimeLocked(true);

    // Silent background sync
    fetch('/api/update-jam-pengambilan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: order.id,
        jamPengambilan: formattedJam
      })
    }).catch(err => console.warn('[OrderDetail] Background jam update silent sync error:', err));

    const dateFormattedStr = formatPickupDate(order.tanggalPengambilan, true);
    const clientNameStr = order.clientName || getEmailDisplayName(order.clientId);
    const itemsOrderedStr = itemDescription || 'ID Card';
    const timeFormattedStr = formattedJam.replace(':', '.');

    const waMsg = `Halo Admin Dity Store, saya mengonfirmasi jam pengambilan pesanan:\n\n*ID Order:* ${order.id}\n*Nama Pemesan:* ${clientNameStr}\n*Detail Pesanan:* ${itemsOrderedStr}\n*Tanggal Pengambilan:* ${dateFormattedStr}\n*Estimasi Jam:* ${timeFormattedStr} WITA\n*Lokasi Pengambilan:* ${locationInfo.name}\n\nMohon bantuannya untuk persiapan barang. Terima kasih!`;

    const waUrl = `https://wa.me/62895634048237?text=${encodeURIComponent(waMsg)}`;

    setTimeout(() => {
      setIsSavingPickupTime(false);
      setShowPickupTimeModal(false);
      onShowToast?.(`Jam ${timeFormattedStr} WITA disimpan & membuka WhatsApp Admin...`);
      window.open(waUrl, '_blank');
      if (typeof window !== 'undefined' && (window as any).refreshOrders) {
        (window as any).refreshOrders();
      }
    }, 400);
  };

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTermsAccepted, setRefundTermsAccepted] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const [showGroupPopup, setShowGroupPopup] = useState(false);
  const [groupInput, setGroupInput] = useState('');
  const [isConfirmingGroup, setIsConfirmingGroup] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [savedGroup, setSavedGroup] = useState<string>(() => {
    return cleanNoKelompokStr(order.noKelompok) || localStorage.getItem(`group_${order.id}`) || '';
  });

  useEffect(() => {
    setSavedGroup(cleanNoKelompokStr(order.noKelompok) || localStorage.getItem(`group_${order.id}`) || '');
  }, [order.noKelompok, order.id]);

  const formatIndonesianTakenTimestamp = (rawStr: string): string | null => {
    if (!rawStr) return null;
    const timeMatch = rawStr.match(/\(([^)]+)\)/);
    const targetStr = timeMatch ? timeMatch[1].trim() : rawStr.replace(/^(SUDAH\s+)?DIAMBIL\s*:?\s*/i, '').trim();
    
    if (!targetStr || targetStr.toUpperCase() === 'DIAMBIL' || targetStr.toUpperCase() === 'SUDAH DIAMBIL' || targetStr.toUpperCase() === 'SELESAI' || targetStr === '-') {
      return null;
    }

    const dateMatch = targetStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (dateMatch) {
      const [_, yStr, mStr, dStr, hrStr, minStr, secStr] = dateMatch;
      const year = parseInt(yStr, 10);
      const month = parseInt(mStr, 10) - 1;
      const day = parseInt(dStr, 10);
      const hours = hrStr ? parseInt(hrStr, 10) : 0;
      const minutes = minStr ? parseInt(minStr, 10) : 0;
      const seconds = secStr ? parseInt(secStr, 10) : 0;

      const dateObj = new Date(year, month, day, hours, minutes, seconds);
      const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const monthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      const dayName = daysIndo[dateObj.getDay()];
      const dayNum = String(day).padStart(2, '0');
      const monthName = monthsIndo[month];
      
      if (hrStr && minStr) {
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = secStr ? `:${String(seconds).padStart(2, '0')}` : '';
        return `Diambil pada ${dayName}, ${dayNum} ${monthName} ${year}, pukul ${hh}:${mm}${ss} WITA`;
      } else {
        return `Diambil pada ${dayName}, ${dayNum} ${monthName} ${year}`;
      }
    }

    if (targetStr.toLowerCase().includes('pada')) {
      return targetStr;
    }

    return `Diambil pada ${targetStr}`;
  };

  const parseSubCardStatus = (statusStr?: string, defaultFallback?: string): { 
    type: 'DIPROSES' | 'DIKERJAKAN' | 'DIBUAT' | 'SIAP_DIAMBIL' | 'SUDAH_DIAMBIL' | 'DIBATALKAN'; 
    label: string;
    takenAtText?: string | null;
  } => {
    const raw = (statusStr && statusStr.trim() !== '' && statusStr.trim() !== '-') 
      ? statusStr.trim() 
      : (defaultFallback && defaultFallback.trim() !== '' && defaultFallback.trim() !== '-' ? defaultFallback.trim() : 'DIKERJAKAN');
    
    const s = raw.toUpperCase();
    if (s.includes('SIAP DIAMBIL')) {
      return { type: 'SIAP_DIAMBIL', label: 'SIAP DIAMBIL' };
    }
    if (s.includes('DIAMBIL') || s.includes('SELESAI')) {
      const takenAtText = formatIndonesianTakenTimestamp(raw);
      return { type: 'SUDAH_DIAMBIL', label: 'SUDAH DIAMBIL', takenAtText };
    }
    if (s.includes('BATAL')) {
      return { type: 'DIBATALKAN', label: 'DIBATALKAN' };
    }
    if (s.includes('DIBUAT')) {
      return { type: 'DIBUAT', label: 'DIBUAT' };
    }
    if (s.includes('DIKERJAKAN')) {
      return { type: 'DIKERJAKAN', label: 'DIKERJAKAN' };
    }
    return { type: 'DIPROSES', label: 'DIPROSES' };
  };

  const renderStatusBadgeFromParsed = (parsed: { type: string; label: string } | null) => {
    if (!parsed) return null;
    const { type } = parsed;
    if (type === 'SUDAH_DIAMBIL') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
          SUDAH DIAMBIL
        </span>
      );
    }
    if (type === 'SIAP_DIAMBIL') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">SIAP DIAMBIL</span>;
    }
    if (type === 'DIBATALKAN') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">DIBATALKAN</span>;
    }
    if (type === 'DIBUAT') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs">DIBUAT</span>;
    }
    if (type === 'DIKERJAKAN') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">DIKERJAKAN</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">DIPROSES</span>;
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    onShowToast?.("Berhasil disalin ke papan klip!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse Google Drive URLs for direct rendering
  const getGoogleDrivePreviewUrl = (url: string) => {
    if (!url) return "";
    const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const id = (m1 && m1[1]) || (m2 && m2[1]);
    if (id) {
      return `https://docs.google.com/uc?export=view&id=${id}`;
    }
    return url;
  };

  // Univ Card Specs
  const benderaUnivVal = order.warnaBenderaUniv || order.parsedData?.warnaBenderaUniv || '';
  const taliUnivVal = order.warnaTaliUniv || order.parsedData?.warnaTaliUniv || '';
  const caseUnivVal = (order.ukuranCaseUniv && order.ukuranCaseUniv !== '-') 
    ? order.ukuranCaseUniv 
    : (order.parsedData?.ukuranCaseUniv && order.parsedData.ukuranCaseUniv !== '-')
      ? order.parsedData.ukuranCaseUniv 
      : 'B4';
  const showUnivCard = (benderaUnivVal.trim() !== '' && benderaUnivVal.trim() !== '-') || 
                       (taliUnivVal.trim() !== '' && taliUnivVal.trim() !== '-');

  // Fak Card Specs
  const benderaFakVal = order.warnaBenderaFak || order.parsedData?.warnaBenderaFak || '';
  const taliFakVal = order.warnaTaliFak || order.parsedData?.warnaTaliFak || '';
  const caseFakVal = (order.ukuranCaseFak && order.ukuranCaseFak !== '-') 
    ? order.ukuranCaseFak 
    : (order.parsedData?.ukuranCaseFak && order.parsedData.ukuranCaseFak !== '-')
      ? order.parsedData.ukuranCaseFak 
      : 'B2';
  const showFakCard = (benderaFakVal.trim() !== '' && benderaFakVal.trim() !== '-') || 
                      (taliFakVal.trim() !== '' && taliFakVal.trim() !== '-');

  const hasBothCards = showUnivCard && showFakCard;

  const univParsed = showUnivCard
    ? parseSubCardStatus(order.statusUniv, 'DIKERJAKAN')
    : null;

  const fakParsed = showFakCard
    ? parseSubCardStatus(order.statusFak, 'DIKERJAKAN')
    : null;

  const legacyParsed = (!showUnivCard && !showFakCard)
    ? parseSubCardStatus(order.status, 'DIKERJAKAN')
    : null;

  const getStatusStepIndex = (status: Order['status']): number => {
    switch (status) {
      case 'DIPROSES': return 0;
      case 'DIKERJAKAN': return 1;
      case 'DIBUAT': return 2;
      case 'SIAP DIAMBIL': return 3;
      case 'SELESAI': return 4;
      default: return -1;
    }
  };

  // Status utama (order.status) HANYA mempengaruhi Tahapan Progres Pesanan (Stepper timeline)
  const currentStepIndex = getStatusStepIndex(order.status);
  const isCancelled = order.status === 'DIBATALKAN';
  const isSiapDiambil = order.status === 'SIAP DIAMBIL';

  // Status per ID Card (Univ / Fak) mempengaruhi Sticky Bottom Bar & Pratinjau Desain & Spesifikasi
  const isUnivReady = showUnivCard && (univParsed?.type === 'SIAP_DIAMBIL');
  const isFakReady = showFakCard && (fakParsed?.type === 'SIAP_DIAMBIL');
  const isLegacyReady = (!showUnivCard && !showFakCard) && (legacyParsed?.type === 'SIAP_DIAMBIL');

  const isAnyCardReadyForPickup = isUnivReady || isFakReady || isLegacyReady;
  const isAllCardsReadyForPickup = isAnyCardReadyForPickup;
  const showStickyBottom = !isCancelled;

  const isDatePassed = isPickupDatePassed(order.tanggalPengambilan);

  const clientFullName = order.clientName || getEmailDisplayName(order.clientId) || '';
  const surveyUrl = `https://docs.google.com/forms/d/e/1FAIpQLSepQJcIuCNbAy0JfBQjC8OKZ7lGflPnIO9Zj6wrBeofjBx8ww/viewform?usp=pp_url&entry.1085399697=${encodeURIComponent(order.id)}&entry.1554158534=${encodeURIComponent(clientFullName)}`;

  const hasGroup = !!(savedGroup && savedGroup.trim() !== '');

  // Support WhatsApp message
  const supportWaNumber = "62895634048237"; // Can be dynamic or default
  const whatsappSupportUrl = `https://wa.me/${supportWaNumber}?text=Halo%20Admin%20Dity%20Store,%20saya%20ingin%20bertanya%20mengenai%20status%20pesanan%20saya%20dengan%20invoice%20*${order.id}*`;

  // Buyer WhatsApp group url from user's Apps Script
  const buyerGroupUrl = "https://chat.whatsapp.com/KVn0MFS6IDnEptBa8hZZSs";

  const timelineSteps = [
    {
      title: 'Verifikasi Pembayaran',
      desc: 'Pesanan telah diterima dan pembayaran berhasil diverifikasi oleh Dity Store.',
      statusKey: 'DIPROSES'
    },
    {
      title: 'Proses Pengerjaan',
      desc: 'Berkas desain digital/project sedang dikerjakan. Terpotong biaya administrasi & desain.',
      statusKey: 'DIKERJAKAN'
    },
    {
      title: 'Proses Pembuatan',
      desc: 'Pesanan sudah masuk tahap antrean pencetakan fisik/persiapan bahan baku.',
      statusKey: 'DIBUAT'
    },
    {
      title: 'Siap Diambil',
      desc: isSiapDiambil 
        ? `Silahkan mengambil pesanan pada: ${formatPickupDate(order.tanggalPengambilan, true)}, hubungi admin untuk jam pastinya.`
        : 'Produksi cetak ID Card selesai dilakukan. Pesanan siap diambil atau dikirim.',
      statusKey: 'SIAP DIAMBIL'
    },
    {
      title: 'Selesai',
      desc: 'Barang sudah diterima oleh Klien secara lengkap dan dalam kondisi baik.',
      statusKey: 'SELESAI'
    }
  ];

  const hasIg = !!(order.parsedData?.ig && order.parsedData.ig !== '-');

  // Legacy fallback
  const legacyBendera = (order.warnaBendera && order.warnaBendera !== '-')
    ? order.warnaBendera
    : (order.parsedData?.warnaBendera && order.parsedData.warnaBendera !== '-')
      ? order.parsedData.warnaBendera
      : '-';

  const legacyTali = (order.warnaTali && order.warnaTali !== '-')
    ? order.warnaTali
    : (order.parsedData?.warnaTali && order.parsedData.warnaTali !== '-')
      ? order.parsedData.warnaTali
      : '-';

  const isProjectReady = !!order.linkProject;
  const isQrReady = !!order.linkQr;
  const isAllReady = isProjectReady && (!hasIg || isQrReady);

  const itemDescription = (() => {
    if (showUnivCard && showFakCard) return '2x ID Card (Universitas & Fakultas)';
    if (showUnivCard) return '1x ID Card Universitas';
    if (showFakCard) return '1x ID Card Fakultas';
    return '1x ID Card Fakultas';
  })();

  const getVerificationHelpText = () => {
    if (isAllReady) {
      return hasIg
        ? 'Silahkan periksa QR Instagram dan Hasil ID Card Anda, laporkan jika terdapat kesalahan.'
        : 'Silahkan periksa Hasil ID Card Anda, laporkan jika terdapat kesalahan.';
    }

    if (hasIg) {
      if (isQrReady && !isProjectReady) {
        return 'Desainer sedang membuat & menyiapkan ID Card Anda. Tombol lihat ID card akan aktif begitu file selesai dibuat.';
      }
      if (!isQrReady && isProjectReady) {
        return 'Hasil ID Card sudah siap, sedangkan QR Instagram Anda sedang diproses oleh desainer.';
      }
      return 'Desainer sedang membuat & menyiapkan QR & ID Card Anda. Tombol akan aktif begitu file selesai dibuat.';
    } else {
      return 'Desainer sedang membuat & menyiapkan ID Card Anda. Tombol akan aktif begitu file selesai dibuat';
    }
  };

  return (
    <div
      className={`w-full max-w-4xl mx-auto px-4 py-6 space-y-8 ${showStickyBottom ? 'pb-8 sm:pb-28' : ''}`}
      id="detail-container"
    >
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap" id="detail-nav-header">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"
          id="btn-back-results"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Hasil Pencarian</span>
        </button>
      </div>

      {/* Profile Header */}
      <div 
        className="bg-white border border-blue-100/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-blue-900/5"
        id="detail-profile-header"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold font-mono px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100/60">
              ID: {order.id}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-600 border border-slate-100 transition-all cursor-pointer"
              title="Salin No. Invoice"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-slate-800">
            {order.clientName || getEmailDisplayName(order.clientId)}
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-sans">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Dibuat: {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full md:w-auto">
          <a
            href={buyerGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
            id="btn-join-group"
          >
            <WhatsAppIcon />
            <span>Gabung Grup WhatsApp</span>
          </a>
          <a
            href={whatsappSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold border border-blue-100 text-xs rounded-xl transition-all cursor-pointer"
            id="btn-contact-admin"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Hubungi Admin Toko</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Status Tracker (Left) and specifications / billing (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="detail-grid">
        {/* Left Column: Visual Stepper / Timeline Tracker */}
        <div className="lg:col-span-2 space-y-6" id="detail-tracker-col">
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">
              TAHAPAN PROGRES PESANAN
            </h3>

            {isCancelled ? (
              <div 
                className="p-5 bg-rose-50 border border-rose-100/80 rounded-xl text-rose-700 space-y-3 flex items-start gap-3"
                id="cancelled-banner"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-rose-800">Pesanan Dibatalkan</h4>
                  <p className="text-xs text-rose-600/90 leading-relaxed">
                    Mohon maaf, pesanan ini telah ditandai sebagai dibatalkan oleh tim Dity Store. Silakan hubungi admin toko jika Anda merasa ini merupakan kekeliruan atau ingin melakukan pengajuan ulang.
                  </p>
                  {order.finishedAt !== '-' && (
                    <p className="text-[10px] font-mono font-medium text-rose-500 pt-1">
                      Waktu Pembatalan: {formatDateTime(order.finishedAt)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative pl-6 space-y-8" id="stepper-timeline">
                {/* Visual Connector Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-blue-50" />

                {timelineSteps.map((step, idx) => {
                  const isCompleted = currentStepIndex >= idx;
                  const isActive = currentStepIndex === idx;

                  return (
                    <div key={idx} className="relative flex items-start gap-4 group" id={`step-${idx}`}>
                      {/* Circle Node indicator */}
                      <div className="absolute -left-[20px] top-1 z-10">
                        {isCompleted ? (
                          <div className="w-[24px] h-[24px] rounded-full bg-blue-500 border border-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-[24px] h-[24px] rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-300">
                            <Circle className="w-3 h-3 fill-slate-100 stroke-none" />
                          </div>
                        )}
                      </div>

                      {/* Text content block */}
                      <div className="space-y-1 pl-3">
                        <h4 className={`text-sm font-bold transition-colors ${
                          isActive 
                            ? 'text-blue-600 font-display' 
                            : isCompleted 
                              ? 'text-slate-800 font-display' 
                              : 'text-slate-400 font-display'
                        }`}>
                          {step.title}
                          {isActive && (
                            <span className="ml-2 inline-block px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-[9px] font-bold uppercase text-blue-600 tracking-wider">
                              Saat Ini
                            </span>
                          )}
                        </h4>
                        <p className={`text-xs leading-relaxed ${
                          isActive || isCompleted ? 'text-slate-500 font-sans' : 'text-slate-400/80 font-sans'
                        }`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Verifikasi Desain & Spesifikasi Card */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-5 shadow-xl shadow-blue-900/5 space-y-4" id="verification-status-card">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2.5">
              PRATINJAU DESAIN & SPESIFIKASI
            </h3>

            <div className="space-y-3 text-xs">
              {/* QR Instagram */}
              {hasIg && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-slate-400" />
                    <span>QR Instagram</span>
                  </span>
                  <button
                    onClick={() => order.linkQr && setShowQrPopup(true)}
                    disabled={!order.linkQr}
                    title={!order.linkQr ? "QR Instagram sedang diproses oleh desainer" : "Lihat QR Saya"}
                    className={`w-38 justify-center font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors flex items-center gap-1.5 ${
                      order.linkQr 
                        ? 'text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 cursor-pointer active:scale-95' 
                        : 'text-slate-400 bg-slate-50 border border-slate-100 opacity-60 cursor-not-allowed disabled:cursor-not-allowed'
                    }`}
                  >
                    <Instagram className="w-3 h-3" />
                    <span>Lihat QR Saya</span>
                  </button>
                </div>
              )}

              {/* Hasil ID Card & Sub-Spesifikasi */}
              <div className={`space-y-3 ${hasIg ? 'border-t border-slate-50 pt-3' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hasil ID Card</span>
                  </span>
                  <button
                    onClick={() => order.linkProject && setShowProjectPopup(true)}
                    disabled={!order.linkProject}
                    title={!order.linkProject ? "Desainer sedang membuat & menyiapkan ID Card Anda" : "Lihat ID Card Saya"}
                    className={`w-38 justify-center font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors flex items-center gap-1.5 ${
                      order.linkProject 
                        ? 'text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 cursor-pointer active:scale-95' 
                        : 'text-slate-400 bg-slate-50 border border-slate-100 opacity-60 cursor-not-allowed disabled:cursor-not-allowed'
                    }`}
                  >
                    <IdCard className="w-3 h-3" />
                    <span>Lihat ID Card Saya</span>
                  </button>
                </div>

                {/* Sub Spesifikasi Per Card */}
                <div className="space-y-3 text-[11px]">
                  {/* Jadwal & Lokasi Pengambilan Card - Hanya tampil jika status SIAP DIAMBIL */}
                  {isAnyCardReadyForPickup && (
                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100/90 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Jadwal & Lokasi Pengambilan</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Tanggal:</span>
                          <span className="font-bold text-slate-800">{formatPickupDate(order.tanggalPengambilan, true)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Jam Pengambilan:</span>
                          <span className="font-bold text-emerald-700">
                            {savedPickupTime ? `${savedPickupTime.replace(':', '.')} WITA` : 'Belum diatur (Minimal 10.00 WITA)'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between flex-wrap gap-2">
                        <a
                          href={locationInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-200 text-emerald-800 font-bold text-[11px] shadow-2xs transition-all cursor-pointer active:scale-95"
                          id="btn-location-gmaps-spec"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Lokasi: {locationInfo.name}</span>
                          <ExternalLink className="w-3 h-3 text-emerald-500 shrink-0" />
                        </a>

                        {!isDatePassed && (
                          <button
                            type="button"
                            onClick={handleOpenPickupModal}
                            title="Konfirmasi atau Ubah Jam Pengambilan"
                            className="px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs cursor-pointer"
                            id="btn-spec-set-pickup-time"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{savedPickupTime ? 'Konfirmasi / Ubah Jam' : 'Atur Jam'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 1. ID Card Universitas */}
                  {showUnivCard && (
                    <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/60 space-y-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                            <span className={`w-2 h-2 rounded-full ${univParsed?.type === 'SUDAH_DIAMBIL' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                            <span>{hasBothCards ? "1. ID Card Universitas" : "ID Card Universitas"}</span>
                          </div>
                          {renderStatusBadgeFromParsed(univParsed)}
                        </div>
                        {univParsed?.takenAtText && (
                          <p className="text-[10.5px] text-emerald-700 font-semibold pl-3.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{univParsed.takenAtText}</span>
                          </p>
                        )}
                      </div>

                      <div className="pl-3.5 space-y-1 text-slate-600 border-l-2 border-blue-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Warna Bendera:</span>
                          <span className="font-bold text-slate-700">{benderaUnivVal || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Warna Tali:</span>
                          <span className="font-bold text-slate-700">{taliUnivVal || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Ukuran Holder:</span>
                          <span className="font-bold text-slate-700">{caseUnivVal}</span>
                        </div>
                      </div>

                      {/* Tombol aksi khusus jika status UNIV SIAP DIAMBIL */}
                      {univParsed?.type === 'SIAP_DIAMBIL' && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/50">
                          <button
                            type="button"
                            onClick={handleOpenPickupQrModal}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                            id="btn-univ-pickup-qr"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Lihat QR Pengambilan</span>
                          </button>
                          {!isDatePassed && (
                            <button
                              type="button"
                              onClick={handleOpenPickupModal}
                              title="Konfirmasi Jam Pengambilan"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs"
                              id="btn-univ-confirm-time"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Konfirmasi Jam ke Admin</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Tombol Beri Rating & Survey jika status UNIV SUDAH DIAMBIL */}
                      {univParsed?.type === 'SUDAH_DIAMBIL' && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/50">
                          <a
                            href={surveyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                            id="btn-univ-rating-survey"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>Beri Rating & Survey</span>
                            <ExternalLink className="w-3 h-3 text-amber-100" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Kelompok Saya (Di bawah ID Card Universitas) */}
                  {(showUnivCard || (!showUnivCard && !showFakCard)) && (
                    <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Kelompok Saya</span>
                        </div>
                        <p className="text-[11px] text-indigo-700/80 font-medium">
                          {savedGroup ? `Kelompok ${savedGroup}` : 'Belum diatur'}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={hasGroup}
                        onClick={() => {
                          if (hasGroup) return;
                          setGroupInput(savedGroup);
                          setIsConfirmingGroup(false);
                          setShowGroupPopup(true);
                        }}
                        title={hasGroup ? "Kelompok sudah diatur (hanya bisa diisi sekali)" : "Atur Kelompok Saya"}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shrink-0 ${
                          hasGroup
                            ? 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed opacity-75'
                            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-xs shadow-indigo-500/20 cursor-pointer'
                        }`}
                        id="btn-spec-set-group"
                      >
                        {hasGroup ? 'Kelompok Diatur' : 'Atur Kelompok Saya'}
                      </button>
                    </div>
                  )}

                  {/* 2. ID Card Fakultas */}
                  {showFakCard && (
                    <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/60 space-y-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                            <span className={`w-2 h-2 rounded-full ${fakParsed?.type === 'SUDAH_DIAMBIL' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                            <span>{hasBothCards ? "2. ID Card Fakultas" : "ID Card Fakultas"}</span>
                          </div>
                          {renderStatusBadgeFromParsed(fakParsed)}
                        </div>
                        {fakParsed?.takenAtText && (
                          <p className="text-[10.5px] text-emerald-700 font-semibold pl-3.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{fakParsed.takenAtText}</span>
                          </p>
                        )}
                      </div>

                      <div className="pl-3.5 space-y-1 text-slate-600 border-l-2 border-indigo-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Warna Bendera:</span>
                          <span className="font-bold text-slate-700">{benderaFakVal || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Warna Tali:</span>
                          <span className="font-bold text-slate-700">{taliFakVal || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Ukuran Holder:</span>
                          <span className="font-bold text-slate-700">{caseFakVal}</span>
                        </div>
                      </div>

                      {/* Tombol aksi khusus jika status FAK SIAP DIAMBIL */}
                      {fakParsed?.type === 'SIAP_DIAMBIL' && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/50">
                          <button
                            type="button"
                            onClick={handleOpenPickupQrModal}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                            id="btn-fak-pickup-qr"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Lihat QR Pengambilan</span>
                          </button>
                          {!isDatePassed && (
                            <button
                              type="button"
                              onClick={handleOpenPickupModal}
                              title="Konfirmasi Jam Pengambilan"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs"
                              id="btn-fak-confirm-time"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Konfirmasi Jam ke Admin</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Tombol Beri Rating & Survey jika status FAK SUDAH DIAMBIL */}
                      {fakParsed?.type === 'SUDAH_DIAMBIL' && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/50">
                          <a
                            href={surveyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                            id="btn-fak-rating-survey"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>Beri Rating & Survey</span>
                            <ExternalLink className="w-3 h-3 text-amber-100" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback jika legacy single card */}
                  {!showUnivCard && !showFakCard && (
                    <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/60 space-y-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                            <span className={`w-2 h-2 rounded-full ${legacyParsed?.type === 'SUDAH_DIAMBIL' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                            <span>Spesifikasi ID Card</span>
                          </div>
                          {renderStatusBadgeFromParsed(legacyParsed)}
                        </div>
                        {legacyParsed?.takenAtText && (
                          <p className="text-[10.5px] text-emerald-700 font-semibold pl-3.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{legacyParsed.takenAtText}</span>
                          </p>
                        )}
                      </div>
                      <div className="pl-3.5 space-y-1 text-slate-600 border-l-2 border-blue-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Warna Bendera:</span>
                          <span className="font-bold text-slate-700">{legacyBendera}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Warna Tali:</span>
                          <span className="font-bold text-slate-700">{legacyTali}</span>
                        </div>
                      </div>

                      {legacyParsed?.type === 'SIAP_DIAMBIL' && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/50">
                          <button
                            type="button"
                            onClick={handleOpenPickupQrModal}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                            id="btn-legacy-pickup-qr"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Lihat QR Pengambilan</span>
                          </button>
                          {!isDatePassed && (
                            <button
                              type="button"
                              onClick={handleOpenPickupModal}
                              title="Konfirmasi Jam Pengambilan"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs"
                              id="btn-legacy-confirm-time"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Konfirmasi Jam ke Admin</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Tombol Beri Rating & Survey jika status legacy SUDAH DIAMBIL */}
                      {legacyParsed?.type === 'SUDAH_DIAMBIL' && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/50">
                          <a
                            href={surveyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                            id="btn-legacy-rating-survey"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>Beri Rating & Survey</span>
                            <ExternalLink className="w-3 h-3 text-amber-100" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Note */}
              <div className="border-t border-slate-50 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] leading-relaxed text-slate-500">
                <p className="flex-1">
                  {getVerificationHelpText()}
                </p>
                <div className="shrink-0 font-medium pt-1 sm:pt-0">
                  <span>Ada yang berbeda? </span>
                  <a
                    href={`https://wa.me/${supportWaNumber}?text=${encodeURIComponent(`Halo Admin Dity Store, saya ingin mengajukan request penggantian/perubahan data atau spesifikasi pada pesanan dengan ID *${order.id}* (atas nama *${order.clientName || 'Pelanggan'}*). Mohon bantuannya.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors inline-flex items-center gap-0.5"
                  >
                    Request penggantian
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specifications & Billing Summary */}
        <div className="space-y-6" id="detail-specs-col">
          {/* Order Specifications */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 shadow-xl shadow-blue-900/5 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">
              SPESIFIKASI ID CARD
            </h3>

            <div className="space-y-4" id="specs-list">
              {order.clientName && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pemesan</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{order.clientName}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Universitas</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                  <School className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{order.parsedData.kampus}</span>
                </div>
              </div>

              {(order.parsedData.fakultas && order.parsedData.fakultas !== '-') && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fakultas</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                    <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{order.parsedData.fakultas}</span>
                  </div>
                </div>
              )}

              {(order.parsedData.prodi && order.parsedData.prodi !== '-') && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Studi</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                    <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{order.parsedData.prodi}</span>
                  </div>
                </div>
              )}

              {(order.parsedData.sma && order.parsedData.sma !== '-') && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asal SMA</span>
                  <div className="text-xs text-slate-700 font-semibold">
                    {order.parsedData.sma}
                  </div>
                </div>
              )}

              {(order.parsedData.jalur && order.parsedData.jalur !== '-') && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jalur Masuk</span>
                  <div className="text-xs text-slate-700 font-semibold">
                    {order.parsedData.jalur}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {(order.parsedData.jenisUniv && order.parsedData.jenisUniv !== '-') && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe Univ</span>
                    <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded px-2 py-1 font-mono text-center font-semibold">
                      {order.parsedData.jenisUniv}
                    </div>
                  </div>
                )}

                {(order.parsedData.jenisFak && order.parsedData.jenisFak !== '-') && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe Fak</span>
                    <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded px-2 py-1 font-mono text-center font-semibold">
                      {order.parsedData.jenisFak}
                    </div>
                  </div>
                )}
              </div>

              {(order.parsedData.ig && order.parsedData.ig !== '-') && (
                <div className="space-y-1 pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username Instagram</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                    <Instagram className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-blue-500">@{cleanIgUsername(order.parsedData.ig)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Billing Card */}
          <div className="bg-white border border-blue-100/80 rounded-3xl p-6 shadow-xl shadow-blue-900/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">
              RINCIAN PEMBAYARAN
            </h3>

            <div className="space-y-3 text-xs" id="billing-list">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Status Pembayaran</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[10px]">
                  Terverifikasi / Lunas
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Total Nominal</span>
                <span className="font-extrabold text-slate-700 text-sm">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>

              {order.finishedAt !== '-' && !isCancelled && (
                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className="text-slate-400 font-medium">Selesai Pada</span>
                  <span className="font-semibold text-slate-600 font-sans text-right">
                    {formatDateTime(order.finishedAt)}
                  </span>
                </div>
              )}

              {order.bisaRefund && (
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-[11px] leading-relaxed text-slate-500">
                  <div>
                    <span className="font-medium text-slate-600">Berubah pikiran? </span>
                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="text-rose-600 hover:text-rose-700 hover:underline font-bold transition-colors cursor-pointer"
                      id="btn-request-refund"
                    >
                      Request pengembalian dana
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Desktop Only) */}
      {showStickyBottom && (
        <div className="hidden sm:flex fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-3.5 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40 items-center justify-between gap-4 animate-slide-up">
          {isAllCardsReadyForPickup ? (
            <>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">
                  PESANAN ANDA SIAP DIAMBIL!
                </span>
                <span className="text-xs text-slate-600 font-sans mt-0.5 leading-tight">
                  Silahkan mengambil pesanan pada: <strong className="text-slate-800">{formatPickupDate(order.tanggalPengambilan, false)}</strong>, hubungi admin untuk jam pastinya.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenPickupQrModal}
                  className="w-52 justify-center px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/15 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
                  id="btn-sticky-pickup-qr"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Lihat QR Pengambilan</span>
                </button>

                {!isDatePassed && (
                  <button
                    onClick={handleOpenPickupModal}
                    title="Konfirmasi Jam Pengambilan ke Admin WhatsApp"
                    className="w-52 justify-center px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/15 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
                    id="btn-sticky-confirm-time"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Konfirmasi Jam ke Admin</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">
                  Pratinjau Desain & Spesifikasi
                </span>
                <span className="text-xs text-slate-500 font-sans mt-0.5 leading-tight">
                  {getVerificationHelpText()}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasIg && (
                  <button
                    onClick={() => order.linkQr && setShowQrPopup(true)}
                    disabled={!order.linkQr}
                    title={!order.linkQr ? "QR Instagram sedang diproses oleh desainer" : "Lihat QR Saya"}
                    className={`w-44 justify-center px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      order.linkQr 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-xs shadow-blue-500/15 cursor-pointer active:scale-95' 
                        : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed disabled:cursor-not-allowed border border-slate-200/50'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Lihat QR Saya</span>
                  </button>
                )}

                <button
                  onClick={() => order.linkProject && setShowProjectPopup(true)}
                  disabled={!order.linkProject}
                  title={!order.linkProject ? "Desainer sedang membuat & menyiapkan ID Card Anda" : "Lihat ID Card Saya"}
                  className={`w-44 justify-center px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    order.linkProject 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-600/15 cursor-pointer active:scale-95' 
                      : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed disabled:cursor-not-allowed border border-slate-200/50'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Lihat ID Card Saya</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* POPUP 1: QR INSTAGRAM */}
      {showQrPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-6 md:p-8 shadow-2xl relative flex flex-col space-y-6 animate-scale-up">
            <button 
              onClick={() => setShowQrPopup(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 font-display">Verifikasi QR Instagram</h3>
              <p className="text-xs text-slate-500">Silahkan periksa QR Instagram Anda, laporkan jika terdapat kesalahan.</p>
            </div>

            <div className="p-6 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <Instagram className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="font-bold text-sm text-slate-800">Tautan QR Instagram</p>
                <p className="text-xs text-slate-400 font-sans">
                  Kode QR Instagram untuk akun {order.parsedData.ig && order.parsedData.ig !== '-' ? `@${cleanIgUsername(order.parsedData.ig)}` : 'Instagram'} dapat diakses langsung secara online.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {order.linkQr ? (
                <a
                  href={order.linkQr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/15 transition-all flex items-center justify-center gap-2 text-center active:scale-98 cursor-pointer"
                >
                  <span>Buka QR Instagram Saya</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed text-center"
                >
                  Tautan QR Belum Siap
                </button>
              )}

              <div className="text-center text-xs text-slate-500 font-medium pt-1">
                <span>Ada yang salah? </span>
                <a
                  href={`https://wa.me/62895634048237?text=${encodeURIComponent(`Halo Admin, saya ingin melaporkan bahwa QR Instagram pada pesanan dengan ID *${order.id}* (atas nama *${order.clientName || 'Pelanggan'}*) terdapat kesalahan. Mohon bantuannya.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:text-rose-700 font-bold underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
                >
                  Laporkan kesalahan
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: PROJECT ID CARD */}
      {showProjectPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-6 md:p-8 shadow-2xl relative flex flex-col space-y-6 animate-scale-up">
            <button 
              onClick={() => setShowProjectPopup(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 font-display">Hasil ID Card Anda</h3>
              <p className="text-xs text-slate-500">Silahkan periksa hasil ID Card Anda, laporkan jika terdapat kesalahan.</p>
            </div>

            <div className="p-6 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <IdCard className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="font-bold text-sm text-slate-800">Tautan Desain Projek</p>
                <p className="text-xs text-slate-400">Desain lengkap ID Card dapat diakses langsung secara online.</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {order.linkProject ? (
                <a
                  href={order.linkProject}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/15 transition-all flex items-center justify-center gap-2 text-center active:scale-98 cursor-pointer"
                >
                  <span>Buka Desain Saya</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed text-center"
                >
                  Tautan Desain Belum Siap
                </button>
              )}

              <div className="text-center text-xs text-slate-500 font-medium pt-1">
                <span>Ada yang salah? </span>
                <a
                  href={`https://wa.me/62895634048237?text=${encodeURIComponent(`Halo Admin, saya ingin melaporkan bahwa Project ID Card pada pesanan dengan ID *${order.id}* (atas nama *${order.clientName || 'Pelanggan'}*) terdapat kesalahan. Mohon bantuannya.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:text-rose-700 font-bold underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
                >
                  Laporkan kesalahan
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 3: AJUKAN PENGEMBALIAN DANA (REFUND) */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="modal-refund">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 p-6 md:p-8 shadow-2xl relative flex flex-col space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setShowRefundModal(false);
                setRefundTermsAccepted(false);
                setRefundReason('');
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
              id="btn-close-refund-modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 font-display">Pengajuan Pengembalian Dana</h3>
              <p className="text-xs text-slate-500">Periksa rincian pesanan sebelum pengembalian dana Anda.</p>
            </div>

            {/* Order Details */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">No. Invoice</span>
                <span className="font-bold font-mono text-slate-800">{order.id}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Pemesan</span>
                <span className="font-bold text-slate-800">{order.clientName || order.clientId}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Deskripsi Pesanan</span>
                <span className="font-bold text-slate-800">{itemDescription}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Total Dibayar</span>
                <span className="font-extrabold text-slate-800">{formatCurrency(order.totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status Pesanan</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                  order.status === 'DIPROSES' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  order.status === 'DIBUAT' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  order.status === 'DIKERJAKAN' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Refund Reason */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Alasan Pengajuan Pengembalian Dana <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Klik rekomendasi atau ketik manual</span>
              </div>

              {/* Quick suggestion tags */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Salah isi data / typo pada pesanan',
                  'Ingin ganti varian / paket ID Card',
                  'Batal memesan / berubah pikiran',
                  'Kendala pembayaran / transfer ganda'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setRefundReason(suggestion)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      refundReason === suggestion
                        ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                        : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>

              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Tuliskan alasan pengembalian dana atau pilih rekomendasi di atas..."
                rows={3}
                required
                className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
                id="input-refund-reason"
              />
            </div>

            {/* Checkbox Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-600 leading-relaxed" id="label-refund-terms">
                <input
                  type="checkbox"
                  checked={refundTermsAccepted}
                  onChange={(e) => setRefundTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer flex-shrink-0"
                  id="chk-refund-terms"
                />
                <span>
                  Dengan menceklis, maka saya telah menyetujui{' '}
                  <a
                    href="/policy#refund"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 decoration-rose-500"
                    id="link-refund-policy"
                  >
                    Syarat &amp; Ketentuan
                  </a>{' '}
                  dalam mengembalikan dana untuk pesanan di Dity Store.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 space-y-2">
              {(() => {
                const isFormValid = refundTermsAccepted && refundReason.trim().length > 0;
                const waMessage = 
                  `Halo Admin Dity Store, saya ingin mengajukan Pengembalian Dana (Refund) untuk pesanan berikut:\n\n` +
                  `- No. Invoice: ${order.id}\n` +
                  `- Pemesan: ${order.clientName || order.clientId}\n` +
                  `- Deskripsi Pesanan: ${itemDescription}\n` +
                  `- Total Dibayar: ${formatCurrency(order.totalPrice)}\n` +
                  `- Status Pesanan: ${order.status}\n` +
                  `- Alasan: ${refundReason.trim()}`;

                return (
                  <a
                    href={isFormValid ? `https://wa.me/62895634048237?text=${encodeURIComponent(waMessage)}` : undefined}
                    target={isFormValid ? "_blank" : undefined}
                    rel={isFormValid ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                      if (!isFormValid) {
                        e.preventDefault();
                        return;
                      }
                      setShowRefundModal(false);
                    }}
                    className={`w-full py-3 px-4 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-center ${
                      isFormValid
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-98 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed border border-slate-200/50 shadow-none'
                    }`}
                    id="btn-submit-refund"
                  >
                    <Undo2 className="w-4 h-4" />
                    <span>Ajukan Pengembalian Dana</span>
                  </a>
                );
              })()}

              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 font-medium text-xs text-center cursor-pointer"
                id="btn-cancel-refund"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 3: QR CODE PENGAMBILAN PESANAN */}
      {showPickupQrPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-6 md:p-8 shadow-2xl relative flex flex-col space-y-5 animate-scale-up">
            <button 
              onClick={() => setShowPickupQrPopup(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              id="btn-close-pickup-qr-modal"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 text-center pr-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-100">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display">QR Code Pengambilan Pesanan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tunjukkan QR ini kepada Admin saat mengambil ID Card Anda.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                <QRCodeSVG 
                  value={order.id} 
                  size={192} 
                  level="H" 
                  marginSize={1}
                  className="w-48 h-48 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-lg text-blue-700 font-mono font-bold text-xs tracking-wider">
                  {order.id}
                </div>
                <p className="text-xs font-semibold text-slate-700">{order.clientName || order.clientId}</p>
                {order.parsedData?.fakultas && order.parsedData.fakultas !== '-' && (
                  <p className="text-xs font-medium text-slate-600">{order.parsedData.fakultas}</p>
                )}
                <p className="text-xs font-medium text-slate-600">
                  Kelompok: {savedGroup || cleanNoKelompokStr(order.noKelompok) || ' '}
                </p>
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center space-y-1">
              <p className="text-[11px] text-blue-800 font-medium">
                Admin akan memindai QR ini untuk memverifikasi penyerahan pesanan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPickupQrPopup(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              id="btn-dismiss-pickup-qr-modal"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* POPUP 4: ATUR KELOMPOK SAYA */}
      {showGroupPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-6 md:p-8 shadow-2xl relative flex flex-col space-y-5 animate-scale-up">
            <button 
              onClick={() => {
                if (!isSavingGroup) {
                  setShowGroupPopup(false);
                  setIsConfirmingGroup(false);
                }
              }}
              disabled={isSavingGroup}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
              id="btn-close-group-modal"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {!isConfirmingGroup ? (
              // Form Input State
              <div className="space-y-5">
                <div className="space-y-1.5 text-center pr-6">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-100">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 font-display">Atur Kelompok Saya</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Masukkan nomor kelompok Anda untuk mempermudah identifikasi pengerjaan ID Card Universitas.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="group-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nomor Kelompok
                  </label>
                  <input
                    id="group-name-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={groupInput}
                    onChange={(e) => setGroupInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Contoh: 25"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-800 transition-all placeholder:text-slate-400"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGroupPopup(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 active:scale-98 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                    id="btn-cancel-group-input"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = groupInput.trim();
                      if (!trimmed) {
                        onShowToast?.("Nomor kelompok tidak boleh kosong.");
                        return;
                      }
                      setIsConfirmingGroup(true);
                    }}
                    disabled={!groupInput.trim()}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    id="btn-confirm-group-input"
                  >
                    Atur Kelompok
                  </button>
                </div>
              </div>
            ) : (
              // Confirmation View State
              <div className="space-y-5">
                <div className="space-y-1.5 text-center">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-100">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 font-display">Konfirmasi Atur Kelompok</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Apakah Anda yakin ingin mengatur nomor kelompok Anda?
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <p className="text-xs text-slate-500">Nomor Kelompok Baru Anda:</p>
                  <p className="text-sm font-extrabold text-slate-800 tracking-wide font-display">Kelompok {groupInput}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingGroup(false)}
                    disabled={isSavingGroup}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 active:scale-98 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer text-center disabled:opacity-50"
                    id="btn-back-to-input"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const trimmed = groupInput.trim();
                      if (!trimmed) {
                        onShowToast?.("Nomor kelompok tidak boleh kosong.");
                        return;
                      }
                      setIsSavingGroup(true);

                      let success = false;
                      let syncError = '';

                      // 1. Try server-side Express API first
                      try {
                        const response = await fetch('/api/orders/group', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            orderId: order.id,
                            noKelompok: parseInt(trimmed, 10)
                          })
                        });

                        if (response.ok) {
                          const result = await response.json();
                          if (result.success) {
                            success = true;
                          } else {
                            syncError = result.syncError || 'Kesalahan Server';
                          }
                        } else {
                          throw new Error(`HTTP status ${response.status}`);
                        }
                      } catch (err: any) {
                        console.warn('[OrderDetail] Server-side group update failed, falling back to direct Google Apps Script call...', err);

                        // 2. Fallback: Direct client-side Google Apps Script fetch
                        try {
                          const response = await fetch(APPS_SCRIPT_URL, {
                            method: "POST",
                            headers: {
                              "Content-Type": "text/plain;charset=utf-8"
                            },
                            body: JSON.stringify({
                              action: "update_kelompok",
                              order_id: order.id,
                              no_kelompok: parseInt(trimmed, 10)
                            })
                          });

                          if (response.ok) {
                            const result = await response.json();
                            if (result.success || result.status === 'success') {
                              success = true;
                            } else {
                              syncError = result.message || result.error || 'Google Sheets returned status: error';
                            }
                          } else {
                            syncError = `Apps Script HTTP ${response.status}`;
                          }
                        } catch (directErr: any) {
                          console.error('[OrderDetail] Direct Google Apps Script update failed too:', directErr);
                          syncError = directErr.message || 'Gagal terhubung ke Apps Script';
                        }
                      }

                      // Save and show result
                      localStorage.setItem(`group_${order.id}`, trimmed);
                      setSavedGroup(trimmed);
                      setShowGroupPopup(false);
                      setIsConfirmingGroup(false);
                      setIsSavingGroup(false);

                      if (success) {
                        onShowToast?.(`Kelompok berhasil diatur ke kelompok ${trimmed}`);
                        // Custom window callback to trigger a refresh of the order list if defined
                        if (typeof window !== 'undefined' && (window as any).refreshOrders) {
                          (window as any).refreshOrders();
                        }
                      } else {
                        onShowToast?.(`Kelompok disimpan di perangkat. Gagal sinkronisasi ke database: ${syncError}`);
                      }
                    }}
                    disabled={isSavingGroup}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50"
                    id="btn-save-group-confirmed"
                  >
                    {isSavingGroup ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Ya, Konfirmasi</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP 5: KONFIRMASI JAM PENGAMBILAN */}
      {showPickupTimeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-6 md:p-8 shadow-2xl relative flex flex-col space-y-5 animate-scale-up">
            <button 
              disabled={isSavingPickupTime}
              onClick={() => {
                if (isSavingPickupTime) return;
                setShowPickupTimeModal(false);
                setPickupTimeError('');
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-40"
              id="btn-close-pickup-time-modal"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 text-center pr-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display">Konfirmasi Jam Pengambilan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih jam estimasi pengambilan pesanan Anda pada <span className="font-bold text-slate-800">{formatPickupDate(order.tanggalPengambilan, true)}</span>.
              </p>
            </div>

            {/* Info Lokasi Pengambilan */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Lokasi Pengambilan:</span>
                <a
                  href={locationInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                  id="link-pickup-gmaps-modal"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{locationInfo.name}</span>
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                </a>
              </div>

              <div className="text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 p-2 rounded-xl flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> Jam pengambilan hanya dapat diatur <strong>1 kali saja</strong> dan tidak dapat diubah di bawah jam yang sudah ditentukan (minimal jam 10.00 WITA).
                </span>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <label className="block text-xs font-bold text-slate-700">
                Jam Pengambilan (Min. {getMinPickupTime().timeStr.replace(':', '.')} - Max 18.00 WITA):
              </label>
              
              <div className="relative">
                <input 
                  type="time" 
                  min={getMinPickupTime().timeStr} 
                  max="18:00"
                  step="900"
                  disabled={isSavingPickupTime}
                  value={selectedPickupTime}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPickupTime(val);
                    const v = validatePickupTime(val);
                    setPickupTimeError(v.isValid ? '' : v.errorMsg);
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-xl font-bold text-base text-slate-800 focus:outline-none focus:ring-2 transition-all shadow-xs disabled:opacity-60 ${
                    pickupTimeError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                  id="input-pickup-time"
                />
              </div>

              {/* Preset Hour Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['10:00', '11:00', '13:00', '15:00', '16:00', '17:00'].map((timePreset) => {
                  const minLimit = getMinPickupTime();
                  const [presetH, presetM] = timePreset.split(':').map(Number);
                  const isPresetDisabled = (presetH * 60 + presetM) < (minLimit.hour * 60 + minLimit.minute);

                  return (
                    <button
                      key={timePreset}
                      type="button"
                      disabled={isPresetDisabled || isSavingPickupTime}
                      onClick={() => {
                        setSelectedPickupTime(timePreset);
                        setPickupTimeError('');
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        isPresetDisabled
                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                          : selectedPickupTime === timePreset 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs cursor-pointer' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {timePreset.replace(':', '.')} WITA
                    </button>
                  );
                })}
              </div>

              {pickupTimeError ? (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pickupTimeError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 italic pt-0.5">
                  * Jam operasional toko pukul 10.00 - 18.00 WITA. Minimal jam {getMinPickupTime().timeStr.replace(':', '.')}.
                </p>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={!validatePickupTime(selectedPickupTime).isValid || isSavingPickupTime}
                onClick={handleSavePickupTime}
                className={`w-full py-3.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2.5 ${
                  validatePickupTime(selectedPickupTime).isValid && !isSavingPickupTime
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-md shadow-emerald-500/20 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border border-slate-300/80 cursor-not-allowed opacity-75 shadow-none'
                }`}
                id="btn-confirm-pickup-time-wa"
              >
                {isSavingPickupTime ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Jam Pengambilan...</span>
                  </>
                ) : (
                  <>
                    <WhatsAppIcon />
                    <span>Konfirmasi ke Admin via WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSavingPickupTime}
                onClick={() => {
                  setShowPickupTimeModal(false);
                  setPickupTimeError('');
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
