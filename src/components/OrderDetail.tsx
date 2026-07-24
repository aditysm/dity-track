import { useState } from 'react';
import { 
  ArrowLeft, Calendar, CreditCard, School, Copy, Check, User, Hash, 
  MessageCircle, ExternalLink, ShieldAlert, CheckCircle2, Circle, AlertTriangle, Instagram, BookOpen, GraduationCap, X, Loader2
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency, formatDateTime, getEmailDisplayName } from '../utils';

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onConfirm: (orderId: string, type: 'qr' | 'project', status: string) => Promise<boolean> | boolean;
}

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

export default function OrderDetail({ order, onBack, onConfirm }: OrderDetailProps) {
  const [copied, setCopied] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ active: boolean; type: 'qr' | 'project' } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActionConfirm = async () => {
    if (!confirmDialog || isConfirming) return;
    setIsConfirming(true);
    const { type } = confirmDialog;
    try {
      const success = await onConfirm(order.id, type, 'DIKONFIRMASI');
      if (success) {
        setConfirmDialog(null);
        setShowQrPopup(false);
        setShowProjectPopup(false);
      }
    } catch (err) {
      console.error('Konfirmasi gagal:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusStepIndex = (status: Order['status']): number => {
    switch (status) {
      case 'DIPROSES': return 0;
      case 'DIKERJAKAN': return 1;
      case 'SIAP DIAMBIL': return 2;
      case 'SELESAI': return 3;
      default: return -1;
    }
  };

  const currentStepIndex = getStatusStepIndex(order.status);
  const isCancelled = order.status === 'DIBATALKAN';

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
      desc: 'Desainer kami sedang memproses desain ID Card sesuai spesifikasi formulir Anda.',
      statusKey: 'DIKERJAKAN'
    },
    {
      title: 'Siap Diambil',
      desc: 'Produksi cetak ID Card selesai dilakukan. Pesanan siap diambil atau dikirim.',
      statusKey: 'SIAP DIAMBIL'
    },
    {
      title: 'Selesai',
      desc: 'Barang sudah diterima oleh Klien secara lengkap dan dalam kondisi baik.',
      statusKey: 'SELESAI'
    }
  ];

  const hasIg = order.parsedData.ig && order.parsedData.ig !== '-';
  const isDikerjakan = order.status === 'DIKERJAKAN';
  const showStickyBottom = isDikerjakan && hasIg && (order.statusQr !== 'DIKONFIRMASI' || order.statusProject !== 'DIKONFIRMASI');

  return (
    <div
      className={`w-full max-w-4xl mx-auto px-4 py-6 space-y-8 ${showStickyBottom ? 'pb-28' : ''}`}
      id="detail-container"
    >
      {/* Back to Results */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors group"
        id="btn-back-results"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali ke Hasil Pencarian</span>
      </button>

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
              className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-600 border border-slate-100 transition-all"
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
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95"
            id="btn-join-group"
          >
            <WhatsAppIcon />
            <span>Gabung Grup WhatsApp</span>
          </a>
          <a
            href={whatsappSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold border border-blue-100 text-xs rounded-xl transition-all"
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
                    <span className="font-mono text-blue-500">{order.parsedData.ig}</span>
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
            </div>
          </div>

          {/* Status Verifikasi Desain Card */}
          {hasIg && (
            <div className="bg-white border border-blue-100/80 rounded-3xl p-6 shadow-xl shadow-blue-900/5 space-y-4" id="verification-status-card">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">
                STATUS VERIFIKASI DESAIN
              </h3>

              <div className="space-y-3 text-xs">
                {/* QR Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-slate-400" />
                    <span>QR Instagram</span>
                  </span>
                  {order.statusQr === 'DIKONFIRMASI' ? (
                    <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Terkonfirmasi
                    </span>
                  ) : order.linkQr ? (
                    <button
                      onClick={() => setShowQrPopup(true)}
                      className="font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md text-[10px] hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Perlu Konfirmasi
                    </button>
                  ) : (
                    <span className="font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px]">
                      Menunggu Desain
                    </span>
                  )}
                </div>

                {/* Project Status */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hasil ID Card</span>
                  </span>
                  {order.statusProject === 'DIKONFIRMASI' ? (
                    <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Terkonfirmasi
                    </span>
                  ) : order.linkProject ? (
                    <button
                      onClick={() => setShowProjectPopup(true)}
                      className="font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md text-[10px] hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Perlu Konfirmasi
                    </button>
                  ) : (
                    <span className="font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px]">
                      Menunggu Hasil
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {showStickyBottom && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3.5 px-4 md:px-8 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] z-40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">
              {order.statusQr !== 'DIKONFIRMASI' ? 'Tahap 1: Verifikasi QR' : 'Tahap 2: Hasil ID Card'}
            </span>
            <span className="text-xs text-slate-500 font-sans mt-0.5">
              {order.statusQr !== 'DIKONFIRMASI' 
                ? (order.linkQr ? 'Silakan periksa dan konfirmasi QR Instagram Anda di bawah.' : 'Menunggu desainer mengunggah link QR Instagram.') 
                : (order.linkProject ? 'Project desain selesai! Silakan periksa hasil ID Card Anda.' : 'Menunggu desainer mengunggah link hasil ID Card Anda.')}
            </span>
          </div>

          {order.statusQr !== 'DIKONFIRMASI' ? (
            <button
              onClick={() => {
                setImageError(false);
                setShowQrPopup(true);
              }}
              disabled={!order.linkQr}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                order.linkQr 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/15 cursor-pointer active:scale-95' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>Lihat QR Saya</span>
            </button>
          ) : (
            <button
              onClick={() => setShowProjectPopup(true)}
              disabled={!order.linkProject}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                order.linkProject 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/15 cursor-pointer active:scale-95' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Lihat ID Card Saya</span>
            </button>
          )}
        </div>
      )}

      {/* POPUP 1: QR INSTAGRAM */}
      {showQrPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 p-6 md:p-8 shadow-2xl relative flex flex-col space-y-6">
            <button 
              onClick={() => setShowQrPopup(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 font-display">Verifikasi QR Instagram</h3>
              <p className="text-xs text-slate-400">Silakan periksa QR Instagram untuk akun {order.parsedData.ig} melalui tombol di bawah ini.</p>
            </div>

            <div className="p-6 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <Instagram className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="font-bold text-sm text-slate-800">Tautan QR Instagram</p>
                <p className="text-xs text-slate-400 font-sans">Kode QR Instagram dapat diakses langsung secara online.</p>
              </div>
              {order.linkQr ? (
                <a
                  href={order.linkQr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/15 active:scale-95 cursor-pointer"
                >
                  <span>Buka QR Instagram Saya</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <p className="text-xs text-amber-600 font-bold">Tautan QR belum siap.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog({ active: true, type: 'qr' })}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>QR Sudah Benar</span>
              </button>
              
              <a
                href={`https://wa.me/62895634048237?text=${encodeURIComponent(`Halo Admin, saya ingin melaporkan bahwa QR pada pesanan dengan ID *${order.id}* (atas nama *${order.clientName || 'Pelanggan'}*) salah. Mohon bantuannya.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/10 transition-all flex items-center justify-center gap-1.5 text-center"
              >
                <AlertTriangle className="w-4.5 h-4.5" />
                <span>Laporkan QR Salah</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: PROJECT ID CARD */}
      {showProjectPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 p-6 md:p-8 shadow-2xl relative flex flex-col space-y-6">
            <button 
              onClick={() => setShowProjectPopup(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 font-display">Hasil ID Card Anda</h3>
              <p className="text-xs text-slate-400">Projek ID Card Anda sudah selesai dibuat. Silakan periksa melalui tombol di bawah ini.</p>
            </div>

            <div className="p-6 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <ExternalLink className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="font-bold text-sm text-slate-800">Tautan Desain Projek</p>
                <p className="text-xs text-slate-400">Desain lengkap ID Card dapat diakses langsung secara online.</p>
              </div>
              {order.linkProject ? (
                <a
                  href={order.linkProject}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/15 active:scale-95 cursor-pointer"
                >
                  <span>Buka Desain Saya</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <p className="text-xs text-amber-600 font-bold">Link desain belum siap.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog({ active: true, type: 'project' })}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>Desain Sudah Benar</span>
              </button>
              
              <a
                href={`https://wa.me/62895634048237?text=${encodeURIComponent(`Halo Admin, saya ingin melaporkan bahwa Project ID Card pada pesanan dengan ID *${order.id}* (atas nama *${order.clientName || 'Pelanggan'}*) salah. Mohon bantuannya.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/10 transition-all flex items-center justify-center gap-1.5 text-center"
              >
                <AlertTriangle className="w-4.5 h-4.5" />
                <span>Laporkan ID Card Salah</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 3: OVERALL CONFIRMATION BOX */}
      {confirmDialog?.active && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-100 p-6 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 text-base font-display">Konfirmasi Persetujuan</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apakah Anda yakin data ini sudah benar? Setelah dikonfirmasi, data tidak dapat diubah kembali.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => !isConfirming && setConfirmDialog(null)}
                disabled={isConfirming}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleActionConfirm}
                disabled={isConfirming}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Ya, Benar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
