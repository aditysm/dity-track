import { ArrowLeft, Clock, Copy, Check, Calendar, CreditCard, School, ChevronRight, Search, X, ShoppingCart } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { formatCurrency, formatDateTime, getEmailDisplayName } from '../utils';

interface SearchResultsProps {
  query: string;
  results: Order[];
  onBack: () => void;
  onSelectOrder: (order: Order) => void;
  onSearch: (query: string) => void;
}

export default function SearchResults({ query, results, onBack, onSelectOrder, onSearch }: SearchResultsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state if query from URL changes
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  // Handle debounced search: wait 1.5 seconds after typing finishes to search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim() === query) return;

    const delayDebounceFn = setTimeout(() => {
      onSearch(searchQuery.trim());
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, onSearch, query]);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
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

  const handleRetrySearch = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Helper to render status badges with distinct colored styles
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'DIPROSES':
        return {
          bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          label: 'Diproses'
        };
      case 'DIKERJAKAN':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Sedang Dikerjakan'
        };
      case 'SIAP DIAMBIL':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Siap Diambil'
        };
      case 'SELESAI':
        return {
          bg: 'bg-green-50 text-green-700 border-green-200',
          label: 'Selesai'
        };
      case 'DIBATALKAN':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          label: 'Dibatalkan'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          label: status
        };
    }
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 pt-1 pb-6"
      id="results-container"
    >
      {/* Sleek Search Card */}
      <div className="w-full bg-white rounded-2xl border border-blue-100/50 p-4 shadow-md shadow-blue-900/5 mb-8 animate-fade-in" id="results-search-card">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex items-center">
            {/* Search Button on the Left */}
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="absolute left-1.5 top-1.5 bottom-1.5 px-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 text-white font-bold text-[11px] rounded-lg transition-all active:scale-95 focus:outline-none flex items-center justify-center cursor-pointer"
              id="results-search-button-left"
              title="Cari"
            >
              <span className="hidden sm:inline">Cari</span>
              <span className="inline sm:hidden"><Search className="w-3.5 h-3.5" /></span>
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Masukkan Nomor Invoice atau Email Anda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-14 sm:pl-16 pr-10 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 text-slate-700 transition-all font-sans text-xs placeholder:truncate truncate"
              id="results-search-input"
            />
            {/* Clear Button on the Right */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all focus:outline-none flex items-center justify-center cursor-pointer"
                id="results-search-clear-button"
                title="Hapus"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results summary header */}
      <div className="mb-8" id="results-header">
        <h2 className="text-xl md:text-2xl font-display font-bold text-slate-800">
          Hasil Pencarian untuk &ldquo;<span className="text-blue-500 font-mono font-medium">{query}</span>&rdquo;
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Menampilkan {results.length} pesanan yang cocok dengan kueri Anda.
        </p>
      </div>

      {results.length === 0 ? (
        <div 
          className="bg-white border border-blue-100 rounded-2xl p-12 text-center space-y-5 max-w-xl mx-auto shadow-xl shadow-blue-900/5"
          id="no-results-card"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-700 font-display">Pesanan Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 leading-relaxed px-4">
              Kami tidak dapat menemukan pesanan yang sesuai dengan kata kunci tersebut. Pastikan Anda memasukkan nomor invoice atau email yang benar.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleRetrySearch}
              className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 text-xs font-bold rounded-xl transition-all focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Ulangi Pencarian</span>
            </button>
            <a
              href="https://forms.gle/j9AbQKU9bNvcS5Np8"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl transition-all focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
              <span>Buat Pesanan</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="results-grid">
          {results.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="bg-white hover:bg-slate-50/10 border border-blue-50/80 rounded-2xl p-6 shadow-md shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Card Header: Invoice, Details and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50/80 px-2 py-1 rounded border border-blue-100/30">
                        {order.id}
                      </span>
                      <button
                        onClick={(e) => handleCopy(order.id, e)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
                        title="Salin No. Invoice"
                      >
                        {copiedId === order.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Selected product detail label */}
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/20">
                        {(() => {
                          const hasUniv = order.parsedData.jenisUniv && order.parsedData.jenisUniv !== '-';
                          const hasFak = order.parsedData.jenisFak && order.parsedData.jenisFak !== '-';
                          if (hasUniv && hasFak) {
                            return "2x ID Card (Univ & Fak)";
                          } else if (hasUniv) {
                            return "1x ID Card Univ";
                          } else if (hasFak) {
                            return "1x ID Card Fak";
                          } else {
                            return "1x ID Card Custom";
                          }
                        })()}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Client name / Email Display */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-500">
                      Pemesan: <span className="text-slate-800 font-bold">{order.clientName || getEmailDisplayName(order.clientId)}</span>
                    </div>
                    
                    {/* Basic Order metadata */}
                    <div className="space-y-2 text-[11px] text-slate-400">
                      {order.parsedData.kampus && order.parsedData.kampus !== '-' && (
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate text-slate-600 font-semibold">{order.parsedData.kampus}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>Dibuat: {formatDateTime(order.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="font-bold text-slate-700">
                          Total TF: {formatCurrency(order.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer link */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-blue-500 transition-colors">
                  <span>Lihat Detail Pesanan</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
