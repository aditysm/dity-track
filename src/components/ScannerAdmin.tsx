import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Camera, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Search, ShieldCheck, Award, Building2, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Order } from '../types';
import { isInvoiceMatch } from '../utils';

interface ScannerAdminProps {
  orders: Order[];
  onBack: () => void;
  onShowToast?: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyz2irrGBi5tCo0cmot-OWIOxkTU0B66c5K1f9Y0jWVtCBENJJjNtvtzIoPXYcFSwpw/exec";

export default function ScannerAdmin({ orders, onBack, onShowToast }: ScannerAdminProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Always require password authentication on fresh visit
  useEffect(() => {
    sessionStorage.removeItem('dity_admin_auth');
    setIsAuthenticated(false);
  }, []);

  // Scanner & Claim State
  const [scannedOrder, setScannedOrder] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [pendingClaimType, setPendingClaimType] = useState<'univ' | 'fak' | 'all' | null>(null);
  const [claimedMap, setClaimedMap] = useState<Record<string, { univ?: boolean; fak?: boolean; all?: boolean }>>({});
  const qrRef = useRef<Html5Qrcode | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (qrRef.current && qrRef.current.isScanning) {
        qrRef.current.stop().catch((err) => console.error('[Scanner] Unmount stop error:', err));
      }
    };
  }, []);

  // Handle password login submit
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const cleanPw = password.trim();
    if (cleanPw === 'qwerty123') {
      sessionStorage.setItem('dity_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      onShowToast?.("Akses Admin berhasil dibuka", "success");
    } else {
      setAuthError('Kata sandi salah. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dity_admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Start Camera QR Reader with maximum speed & performance
  const startScanner = () => {
    setCameraError(null);
    setCameraActive(true);

    setTimeout(() => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        qrRef.current = html5QrCode;

        const config = {
          fps: 30, // 30 FPS for fast QR detection
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.75);
            return { width: Math.max(edge, 180), height: Math.max(edge, 180) };
          },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true // Native hardware acceleration if available
          }
        };

        html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            const trimmed = decodedText.trim();
            if (trimmed) {
              // Immediately show scanned result in 0ms delay
              setScannedOrder(trimmed);
              setStatusMsg(null);
              setCameraActive(false);

              // Stop camera scanner asynchronously
              if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                  qrRef.current = null;
                }).catch((err) => {
                  console.error('[Scanner] Async stop error:', err);
                  qrRef.current = null;
                });
              }
            }
          },
          () => {}
        ).catch(err => {
          console.error('[Scanner] Start failed:', err);
          setCameraActive(false);
          setCameraError("Tidak dapat mengaktifkan kamera. Pastikan browser diizinkan mengakses kamera.");
        });
      } catch (e) {
        console.error('[Scanner] Exception:', e);
        setCameraActive(false);
        setCameraError("Terjadi kesalahan saat menginisialisasi kamera pemindai.");
      }
    }, 30);
  };

  const stopScanner = () => {
    if (qrRef.current && qrRef.current.isScanning) {
      qrRef.current.stop().then(() => {
        qrRef.current = null;
        setCameraActive(false);
      }).catch(err => {
        console.error('[Scanner] Stop error:', err);
        setCameraActive(false);
      });
    } else {
      setCameraActive(false);
    }
  };

  const handleManualSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setScannedOrder(manualInput.trim());
    setStatusMsg(null);
  };

  // Handle Order Handover Claim
  const handleClaim = async (claimType: 'univ' | 'fak' | 'all') => {
    if (!scannedOrder) return;
    setLoading(true);
    setStatusMsg(null);

    const targetId = officialOrderId || scannedOrder;
    const orderKey = targetId.toLowerCase();

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "process_claim",
          order_id: targetId,
          claim_type: claimType
        })
      });

      const resData = await response.json();

      // Update local claim state map
      setClaimedMap((prev) => {
        const existing = prev[orderKey] || {};
        if (claimType === 'univ') return { ...prev, [orderKey]: { ...existing, univ: true } };
        if (claimType === 'fak') return { ...prev, [orderKey]: { ...existing, fak: true } };
        return { ...prev, [orderKey]: { univ: true, fak: true, all: true } };
      });

      // Check if order is complete
      const isNowComplete = resData.is_complete || !isCombo || claimType === 'all' || 
        (claimType === 'univ' && (isFakTaken || Boolean(claimedMap[orderKey]?.fak))) ||
        (claimType === 'fak' && (isUnivTaken || Boolean(claimedMap[orderKey]?.univ)));

      if (resData.success) {
        const msg = isNowComplete 
          ? "Pesanan Selesai Diserahkan" 
          : "Penyerahan Parsial Berhasil Dicatat";
        setStatusMsg({ text: msg, isSuccess: true });
        onShowToast?.(msg, "success");

        // Automatically close popup if order is complete or single item
        if (isNowComplete) {
          setTimeout(() => {
            setScannedOrder(null);
            setStatusMsg(null);
            setPendingClaimType(null);
          }, 1200);
        }
      } else {
        const errMsg = "Gagal: " + (resData.message || resData.error || "Pesanan tidak dapat diproses");
        setStatusMsg({ text: errMsg, isSuccess: false });
        onShowToast?.(errMsg, "error");
      }
    } catch (err) {
      console.error('[Scanner] Claim fetch error:', err);
      const msg = "Penyerahan Berhasil Diproses";
      setStatusMsg({ text: msg, isSuccess: true });
      onShowToast?.(msg, "success");

      setClaimedMap((prev) => ({
        ...prev,
        [orderKey]: { univ: true, fak: true, all: true }
      }));

      // Fallback auto-close popup
      setTimeout(() => {
        setScannedOrder(null);
        setStatusMsg(null);
        setPendingClaimType(null);
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  // Find matching order in local state if available using flexible invoice matching
  const matchedOrder = scannedOrder ? orders.find(o => isInvoiceMatch(o.id, scannedOrder)) : null;
  const officialOrderId = matchedOrder ? matchedOrder.id : (scannedOrder || '');
  const orderDataLower = (matchedOrder?.orderData || '').toLowerCase();

  // Helper to determine if status string means already claimed/taken
  const isStatusTaken = (statusStr: string): boolean => {
    const s = statusStr.trim().toUpperCase();
    if (!s) return false;
    if (s.includes('SIAP')) return false; // "SIAP DIAMBIL" means ready for pickup, NOT taken
    return s.includes('TAKEN') || s.includes('DIAMBIL') || s.includes('SELESAI') || s.includes('SUDAH');
  };

  // Robust detection if order is 2x ID Card / Combo
  const isCombo = Boolean(
    orderDataLower.includes('combo') ||
    orderDataLower.includes('2x') ||
    orderDataLower.includes('2 id') ||
    orderDataLower.includes('dua id') ||
    (orderDataLower.includes('univ') && orderDataLower.includes('fak')) ||
    matchedOrder?.statusUniv ||
    matchedOrder?.statusFak
  );

  // Status checks for current order & local claims
  const orderKey = scannedOrder ? scannedOrder.toLowerCase() : '';
  const localClaims = claimedMap[orderKey] || {};

  // Overall order status
  const rawOverallStatus = matchedOrder?.status ? matchedOrder.status.trim().toUpperCase() : '';
  const isOverallTaken = isStatusTaken(rawOverallStatus);

  // Status Univ & Status Fak
  const rawUnivStatus = (matchedOrder?.statusUniv || '').trim().toUpperCase();
  const rawFakStatus = (matchedOrder?.statusFak || '').trim().toUpperCase();
  const hasSubStatuses = Boolean(matchedOrder?.statusUniv || matchedOrder?.statusFak);

  const isUnivTaken = isOverallTaken || isStatusTaken(rawUnivStatus) || Boolean(localClaims.univ) || Boolean(localClaims.all);
  const isFakTaken = isOverallTaken || isStatusTaken(rawFakStatus) || Boolean(localClaims.fak) || Boolean(localClaims.all);

  // Status Univ / Fak ready check
  const isUnivReady = !isUnivTaken && (
    rawUnivStatus.includes('SIAP') || (!hasSubStatuses && rawOverallStatus.includes('SIAP'))
  );

  const isFakReady = !isFakTaken && (
    rawFakStatus.includes('SIAP') || (!hasSubStatuses && rawOverallStatus.includes('SIAP'))
  );

  // Valid if either Univ or Fak is ready for pickup
  const isAnyReady = isUnivReady || isFakReady;

  // Format order specification split by '|'
  const specLines = (matchedOrder?.orderData || '')
    .split('|')
    .map(line => line.trim())
    .filter(Boolean);

  const getClaimLabel = (type: 'univ' | 'fak' | 'all' | null) => {
    if (type === 'univ') return 'ID Card Universitas';
    if (type === 'fak') return 'ID Card Fakultas';
    return isCombo ? 'Kedua ID Card (Univ & Fak)' : 'Pesanan';
  };

  // Render Password Lock Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-10" id="scanner-admin-login">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl relative overflow-hidden">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/80 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-slate-800">Akses Admin Scanner</h2>
              <p className="text-xs text-slate-500 mt-1">Masukkan kata sandi admin untuk melanjutkan</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi Admin
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                  placeholder="Masukkan kata sandi..."
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <p className="text-[11px] font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Masuk ke Scanner</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Admin QR Scanner Dashboard
  return (
    <div className="max-w-xl mx-auto px-4 py-4 font-sans" id="scanner-admin-main">
      {/* Top Admin Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs mb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-600"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-slate-800">Dity Track</span>
              <span className="bg-blue-50 text-blue-600 border border-blue-200/80 font-bold text-[10px] px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
        >
          Keluar
        </button>
      </div>

      {/* Fullscreen Style Scanner View (Always Rendered as Background Canvas) */}
      <div className="relative w-full h-[75vh] min-h-[460px] max-h-[640px] rounded-3xl overflow-hidden bg-slate-950 text-white shadow-2xl flex flex-col justify-between border border-slate-800">
        {/* Reader HTML5 Video */}
        <div id="reader" className="w-full h-full object-cover absolute inset-0 z-1"></div>

        {/* Header Bar Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="font-display font-bold text-sm">Pemindai QR Code</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
            Dity Track
          </span>
        </div>

        {/* Scanner Frame Overlay */}
        <div className="absolute inset-0 z-2 pointer-events-none flex flex-col items-center justify-center">
          <div className="w-[260px] h-[260px] rounded-[24px] relative shadow-[0_0_0_4000px_rgba(0,0,0,0.55)] border border-blue-400/30">
            <div className="absolute w-8 h-8 border-4 border-blue-500 top-[-2px] left-[-2px] border-r-0 border-b-0 rounded-tl-[20px]"></div>
            <div className="absolute w-8 h-8 border-4 border-blue-500 top-[-2px] right-[-2px] border-l-0 border-b-0 rounded-tr-[20px]"></div>
            <div className="absolute w-8 h-8 border-4 border-blue-500 bottom-[-2px] left-[-2px] border-r-0 border-t-0 rounded-bl-[20px]"></div>
            <div className="absolute w-8 h-8 border-4 border-blue-500 bottom-[-2px] right-[-2px] border-l-0 border-t-0 rounded-br-[20px]"></div>
            
            {/* Scan Laser Animation */}
            {cameraActive && (
              <div className="absolute w-[90%] h-[2.5px] bg-blue-500 left-[5%] shadow-[0_0_14px_#3B82F6] animate-scan-laser z-10"></div>
            )}
          </div>
        </div>

        {/* Footer Bar Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-5 z-10 text-center bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-3">
          <p className="text-xs text-slate-200 font-medium">Arahkan ke QR Code milik klien</p>

          {!cameraActive ? (
            <button
              onClick={startScanner}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs md:text-sm px-6 py-3 rounded-full shadow-lg shadow-blue-600/30 transition-all cursor-pointer pointer-events-auto flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Buka Kamera</span>
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-full backdrop-blur-xs shadow-md transition-all cursor-pointer pointer-events-auto"
            >
              Matikan Kamera
            </button>
          )}

          {cameraError && (
            <p className="text-[11px] text-rose-400 max-w-xs">{cameraError}</p>
          )}

          {/* Manual ID Search form */}
          <form onSubmit={handleManualSearch} className="w-full max-w-xs flex gap-1.5 pt-2 pointer-events-auto">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Ketik No/ID misal: 01 atau 20260720-01..."
              className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono"
            />
            <button
              type="submit"
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* POPUP MODAL ORDER DETAILS */}
      {scannedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-5 md:p-6 relative overflow-hidden space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Loading Overlay inside Modal during process */}
            {loading && (
              <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
                <RefreshCw className="w-9 h-9 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Sedang Memproses Serah Terima...</p>
                  <p className="text-xs text-slate-500 mt-1">Mohon tunggu sebentar, status penyerahan sedang diperbarui.</p>
                </div>
              </div>
            )}

            {/* Modal Header & Close Button */}
            <div className="flex items-start justify-between border-b border-dashed border-slate-200 pb-3 pr-2">
              <div>
                <span className="bg-blue-50 text-blue-600 border border-blue-200/80 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full inline-block mb-1">
                  ID: {scannedOrder}
                </span>
                <h3 className="text-base font-display font-bold text-slate-800">
                  {matchedOrder?.clientName || matchedOrder?.clientId || "Detail Pesanan"}
                </h3>
                {matchedOrder?.clientId && (
                  <p className="text-xs text-slate-500 mt-0.5">{matchedOrder.clientId}</p>
                )}
              </div>
              <button
                onClick={() => { setScannedOrder(null); setStatusMsg(null); setPendingClaimType(null); }}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Validation Warning if neither Univ nor Fak is 'SIAP DIAMBIL' */}
            {!isAnyReady ? (
              <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 text-center space-y-2.5">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">Pesanan Ditolak / Belum Siap</h4>
                  <div className="text-xs text-rose-600 mt-1 font-semibold flex flex-col gap-1 items-center">
                    <span>Status Saat Ini:</span>
                    <div className="flex flex-wrap gap-1.5 justify-center font-mono text-[11px]">
                      {matchedOrder?.statusUniv && (
                        <span className="bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-md">
                          UNIV: {matchedOrder.statusUniv}
                        </span>
                      )}
                      {matchedOrder?.statusFak && (
                        <span className="bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-md">
                          FAK: {matchedOrder.statusFak}
                        </span>
                      )}
                      {!matchedOrder?.statusUniv && !matchedOrder?.statusFak && (
                        <span className="bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-md">
                          {matchedOrder?.status || 'TIDAK DIKETAHUI'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  Serah terima hanya dapat dilakukan jika status ID Card Universitas atau Fakultas di sistem berstatus <strong className="text-emerald-700">SIAP DIAMBIL</strong>.
                </p>
              </div>
            ) : (
              <>
                {/* Spesifikasi Pesanan (Multi-line separated by '|') */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    SPESIFIKASI PESANAN
                  </span>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 max-h-36 overflow-y-auto">
                    {specLines.length > 0 ? (
                      specLines.map((line, idx) => {
                        const colonIdx = line.indexOf(':');
                        if (colonIdx !== -1) {
                          const key = line.slice(0, colonIdx).trim();
                          const val = line.slice(colonIdx + 1).trim();
                          return (
                            <div key={idx} className="text-xs text-slate-700 flex items-start gap-1">
                              <span className="font-bold text-slate-900 min-w-max">{key}:</span>
                              <span className="text-slate-600">{val}</span>
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{line}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-500">Rincian spesifikasi pesanan Dity Track.</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Claim */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    PILIH AKSI SERAH TERIMA
                  </span>

                  {isCombo ? (
                    /* Combo item (2x ID Card) -> 3 buttons */
                    <div className="flex flex-col gap-2">
                      {/* Button Univ */}
                      <button
                        onClick={() => setPendingClaimType('univ')}
                        disabled={loading || isUnivTaken || !isUnivReady}
                        className={`w-full py-3 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                          isUnivTaken 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : !isUnivReady
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                        <span>
                          {isUnivTaken 
                            ? 'ID Card Univ (Sudah Diambil)' 
                            : !isUnivReady 
                            ? 'ID Card Univ (Belum Siap)' 
                            : 'Serahkan ID Card Univ'}
                        </span>
                      </button>

                      {/* Button Fak */}
                      <button
                        onClick={() => setPendingClaimType('fak')}
                        disabled={loading || isFakTaken || !isFakReady}
                        className={`w-full py-3 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                          isFakTaken 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : !isFakReady
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>
                          {isFakTaken 
                            ? 'ID Card Fak (Sudah Diambil)' 
                            : !isFakReady 
                            ? 'ID Card Fak (Belum Siap)' 
                            : 'Serahkan ID Card Fak'}
                        </span>
                      </button>

                      {/* Button Both */}
                      <button
                        onClick={() => setPendingClaimType('all')}
                        disabled={loading || !isUnivReady || !isFakReady || isUnivTaken || isFakTaken}
                        className={`w-full py-3 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                          (isUnivTaken && isFakTaken)
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : (!isUnivReady || !isFakReady || isUnivTaken || isFakTaken)
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {(isUnivTaken && isFakTaken)
                            ? 'Kedua ID Card (Sudah Diambil)'
                            : (!isUnivReady || !isFakReady)
                            ? 'Serahkan Keduanya (Salah Satu Belum Siap)'
                            : 'Serahkan Keduanya Sekaligus'}
                        </span>
                      </button>
                    </div>
                  ) : (
                    /* Single item -> 1 button */
                    <button
                      onClick={() => setPendingClaimType('all')}
                      disabled={loading || !isAnyReady}
                      className={`w-full py-3 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                        !isAnyReady
                          ? 'bg-slate-100 text-slate-400 border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{!isAnyReady ? 'Pesanan Belum Siap' : 'Konfirmasi Serah Terima Pesanan'}</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Status Alert Result */}
            {statusMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 justify-center ${
                statusMsg.isSuccess 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {statusMsg.isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <button
              onClick={() => { setScannedOrder(null); setStatusMsg(null); setPendingClaimType(null); }}
              disabled={loading}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tutup &amp; Scan Lain
            </button>
          </div>
        </div>
      )}

      {/* DOUBLE CONFIRMATION MODAL */}
      {pendingClaimType && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">Konfirmasi Penyerahan</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menyerahkan <strong className="text-slate-900 font-bold">{getClaimLabel(pendingClaimType)}</strong> kepada <strong className="text-slate-900 font-bold">{matchedOrder?.clientName || matchedOrder?.clientId || 'klien'}</strong>?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setPendingClaimType(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const claimType = pendingClaimType;
                  setPendingClaimType(null);
                  handleClaim(claimType);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Ya, Serahkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

