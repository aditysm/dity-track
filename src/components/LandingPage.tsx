import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, AlertCircle, Sparkles, Layers, ShieldCheck, Cpu, X } from 'lucide-react';

interface LandingPageProps {
  onSearch: (query: string) => void;
  isFallback: boolean;
  isUnauthorized?: boolean;
  spreadsheetId?: string;
  onOpenHelp?: () => void;
  onSelectSample: (id: string) => void;
  recentSearches?: string[];
  onRemoveRecentSearch?: (term: string) => void;
}

export default function LandingPage({ 
  onSearch, 
  isFallback, 
  isUnauthorized = false,
  spreadsheetId = '',
  onOpenHelp,
  onSelectSample,
  recentSearches = [],
  onRemoveRecentSearch
}: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle debounced search: wait 1.5 seconds after typing finishes to search
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const delayDebounceFn = setTimeout(() => {
      onSearch(searchQuery.trim());
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center"
      id="landing-container"
    >
      {/* Hero Headings */}
      <div className="text-center space-y-3 mb-10 max-w-2xl" id="hero-headings">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-slate-800 leading-tight">
          Pantau Pesanan <span className="text-blue-500">ID Card</span> Anda
        </h1>
        <p className="text-sm md:text-base text-slate-500 font-sans leading-relaxed">
          Masukkan Nomor Invoice atau Email Anda untuk melihat status pengerjaan ID Card secara transparan.
        </p>
      </div>

      {isFallback && isUnauthorized && (
        <div className="w-full bg-amber-50/80 border border-amber-200 rounded-2xl p-5 mb-8 flex gap-3 text-amber-900 text-xs leading-relaxed" id="unauthorized-warning">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1.5 flex-1">
            <p className="font-bold text-sm text-amber-900">Google Sheets mengembalikan status 401 (Akses Terbatas)</p>
            <p className="text-amber-800">
              ID Spreadsheet <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded font-bold break-all">{spreadsheetId}</code> saat ini bersifat privat. Agar pencarian otomatis bekerja secara real-time, harap buka Google Sheets Anda, klik tombol <b>Bagikan (Share)</b>, lalu ubah akses umum menjadi <b>&ldquo;Siapa saja yang memiliki link dapat melihat&rdquo;</b> (Anyone with the link can view).
            </p>
            {onOpenHelp && (
              <button 
                onClick={onOpenHelp}
                className="mt-1 text-amber-950 font-bold underline hover:text-black transition-colors block text-xs"
              >
                Lihat Panduan Integrasi Selengkapnya &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Input Card */}
      <div className="w-full bg-white rounded-3xl border border-blue-100/80 p-6 md:p-8 shadow-xl shadow-blue-900/5 mb-12" id="search-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            {/* Search Button on the Left */}
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="absolute left-2.5 top-2.5 bottom-2.5 w-11 sm:w-28 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 focus:outline-none flex items-center justify-center cursor-pointer"
              id="search-button-left"
              title="Cari"
            >
              <span className="hidden sm:inline">Cari</span>
              <span className="inline sm:hidden"><Search className="w-4 h-4" /></span>
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Masukkan Nomor Invoice atau Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-16 sm:pl-32 pr-12 rounded-2xl bg-white border border-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 text-slate-700 transition-all font-sans text-base shadow-inner placeholder:truncate truncate"
              id="search-input"
            />
            {/* Clear Button on the Right */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all focus:outline-none flex items-center justify-center cursor-pointer"
                id="search-clear-button"
                title="Hapus Pencarian"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <p className="text-xs text-slate-400 text-center animate-fade-in" id="search-help">
            Sistem mendukung pencarian otomatis multi-identifikasi.
          </p>
        </form>

        {/* Clickable Recent Search Pills */}
        {recentSearches.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-50 flex flex-col items-center gap-2" id="recent-searches">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pencarian Terakhir</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {recentSearches.map((term, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/70 hover:bg-blue-100 text-blue-600 border border-blue-100/40 rounded-full text-xs font-semibold hover:scale-105 active:scale-95 transition-all"
                >
                  <button
                    onClick={() => {
                      setSearchQuery(term);
                      onSearch(term);
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    {term}
                  </button>
                  {onRemoveRecentSearch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecentSearch(term);
                      }}
                      className="p-0.5 rounded-full hover:bg-blue-200/60 text-blue-400 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer"
                      title="Hapus pencarian ini"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feature Grid - Hidden as requested
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full" id="features-grid">
        <div className="bg-white border border-blue-50/60 p-6 rounded-2xl shadow-lg shadow-blue-900/5 space-y-3 transition-transform hover:-translate-y-0.5 duration-300" id="feat-1">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 font-display">Desain Kreatif & Presisi</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Setiap kartu universitas maupun fakultas dikerjakan oleh tim desain profesional untuk menjamin hasil cetak terbaik.
          </p>
        </div>

        <div className="bg-white border border-blue-50/60 p-6 rounded-2xl shadow-lg shadow-blue-900/5 space-y-3 transition-transform hover:-translate-y-0.5 duration-300" id="feat-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 font-display">Manajemen Aset Cloud</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Didukung otomatisasi folder penyimpanan Google Drive terorganisir untuk memisahkan file payment, assets, dan project Anda.
          </p>
        </div>

        <div className="bg-white border border-blue-50/60 p-6 rounded-2xl shadow-lg shadow-blue-900/5 space-y-3 transition-transform hover:-translate-y-0.5 duration-300" id="feat-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 font-display">Status Terbuka & Real-time</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tidak perlu bertanya berkali-kali di chat WhatsApp. Cukup buka halaman web ini kapan saja untuk melihat progres pesanan.
          </p>
        </div>
      </div>
      */}

      {/* Instructions on connecting real sheet if in fallback mode */}
      {isFallback && (
        <div 
          className="w-full mt-12 p-4 bg-blue-50/60 border border-blue-100/80 rounded-xl max-w-xl text-center"
          id="instructions-banner"
        >
          <div className="flex items-center justify-center gap-1.5 text-blue-700 text-xs font-semibold mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Bagaimana Cara Menghubungkan Google Sheet Anda?</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aplikasi saat ini menggunakan data sampel cadangan karena database Google Sheet belum dibagikan secara publik. Agar sinkronisasi otomatis berjalan, pastikan spreadsheet Anda memiliki izin akses <b>"Siapa saja yang memiliki link dapat melihat"</b> (Anyone with the link can view).
          </p>
        </div>
      )}
    </div>
  );
}
