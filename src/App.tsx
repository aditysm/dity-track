import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Database, Sparkles, HelpCircle, X, Contact } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from './types';
import { parseOrderData } from './utils';
import LandingPage from './components/LandingPage';
import SearchResults from './components/SearchResults';
import OrderDetail from './components/OrderDetail';

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [search, setSearch] = useState(window.location.search);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dity_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('[App] Failed to load recent searches:', e);
      }
    }
  }, []);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const clean = query.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 3);
      localStorage.setItem('dity_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveRecentSearch = (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((q) => q !== term);
      localStorage.setItem('dity_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  // Auto-dismiss sync toast after 4 seconds
  useEffect(() => {
    if (showSyncToast) {
      const timer = setTimeout(() => {
        setShowSyncToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSyncToast]);

  // Custom client-side router function
  const navigate = (path: string, params?: Record<string, string>) => {
    let searchStr = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) searchParams.set(k, v);
      });
      searchStr = searchParams.toString();
    }
    const url = path + (searchStr ? '?' + searchStr : '');
    window.history.pushState(null, '', url);
    setPathname(path);
    setSearch(searchStr ? '?' + searchStr : '');
  };

  // Sync route on popstate (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch orders from our server-side API with direct client-side fallback
  const fetchOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // 1. Try fetching from server API first
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error(`Server API status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.orders) {
        const parsedOrders: Order[] = data.orders.map((o: any) => ({
          id: o.ORDER_ID,
          clientId: o.CLIENT_ID,
          clientName: o.CLIENT_NAME || '',
          contact: o.CONTACT,
          status: o.STATUS as Order['status'],
          totalPrice: o.TOTAL_PRICE,
          createdAt: o.CREATED_AT,
          finishedAt: o.FINISHED_AT,
          orderData: o.ORDER_DATA,
          gformRow: o.GFORM_ROW,
          parsedData: parseOrderData(o.ORDER_DATA)
        }));
        
        setOrders(parsedOrders);
        setIsFallback(data.source === 'fallback-mock-data');
        setIsUnauthorized(!!data.isUnauthorized);
        setSpreadsheetId(data.spreadsheetId || '');

        const now = new Date();
        setLastSyncTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
        setShowSyncToast(true);
        return;
      } else {
        throw new Error('Format data respons server tidak valid');
      }
    } catch (err) {
      console.warn('[App] Server-side API fetch failed, trying direct client-side Google Sheets fetch...', err);
      
      // 2. Direct client-side Google Sheets Visualization API fetch
      const SPREADSHEET_ID = "1jdwDEOGPDTWyj2buJTUfv-pm0FoBlkcIQ5ofWgHasyU";
      const SHEET_NAME = "Pesanan";
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
      
      try {
        const emailToNameMap: Record<string, string> = {
          "adityptra212@gmail.com": "Aditya Putra",
          "budi.santoso@yahoo.com": "Budi Santoso",
          "clarissa.putri@gmail.com": "Clarissa Putri",
          "dian.pratama@outlook.com": "Dian Pratama",
          "eko.wijaya@gmail.com": "Eko Wijaya"
        };
        const rowToNameMap: Record<string, string> = {
          "2": "Aditya Putra",
          "3": "Budi Santoso",
          "4": "Clarissa Putri",
          "5": "Dian Pratama",
          "6": "Eko Wijaya"
        };
        
        try {
          const responsesUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent("Form Responses 1")}`;
          const resp = await fetch(responsesUrl);
          if (resp.ok) {
            const respText = await resp.text();
            const respMatch = respText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
            if (respMatch) {
              const respJson = JSON.parse(respMatch[1]);
              if (respJson.status !== "error" && respJson.table && respJson.table.cols && respJson.table.rows) {
                const respCols = respJson.table.cols.map((c: any) => (c.label || c.id || "").trim());
                let emailColIdx = -1;
                let nameColIdx = -1;
                respCols.forEach((col: string, idx: number) => {
                  const colLower = col.toLowerCase();
                  if (colLower.includes("email") || colLower.includes("username") || colLower === "client_id") {
                    if (emailColIdx === -1 || colLower === "email address" || colLower === "alamat email") emailColIdx = idx;
                  }
                  if (colLower.includes("nama") || colLower.includes("name")) {
                    if (nameColIdx === -1 || colLower === "nama" || colLower === "nama lengkap" || colLower === "nama pemesan") nameColIdx = idx;
                  }
                });
                
                if (emailColIdx !== -1 && nameColIdx !== -1) {
                  respJson.table.rows.forEach((r: any, idx: number) => {
                    if (r && r.c) {
                      const emailCell = r.c[emailColIdx];
                      const nameCell = r.c[nameColIdx];
                      if (emailCell && emailCell.v !== null && emailCell.v !== undefined &&
                          nameCell && nameCell.v !== null && nameCell.v !== undefined) {
                        const emailVal = String(emailCell.v).trim().toLowerCase();
                        const nameVal = String(nameCell.v).trim();
                        if (emailVal && nameVal) {
                          emailToNameMap[emailVal] = nameVal;
                        }
                      }

                      if (nameCell && nameCell.v !== null && nameCell.v !== undefined) {
                        const nameVal = String(nameCell.v).trim();
                        if (nameVal) {
                          const sheetRowStr = String(idx + 2);
                          rowToNameMap[sheetRowStr] = nameVal;
                        }
                      }
                    }
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn('[App] Direct client name mapping fetch failed:', e);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Google Sheets direct fetch returned status ${response.status}`);
        }
        
        const text = await response.text();
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
        if (!match) {
          throw new Error("Format visualisasi Google Sheets tidak valid");
        }
        
        const data = JSON.parse(match[1]);
        if (data.status === "error") {
          throw new Error(data.errors?.[0]?.detailed_message || "Error dari Google Sheets API");
        }
        
        const cols = data.table.cols.map((c: any) => c.label || c.id || "");
        const rows = data.table.rows.map((r: any) => {
          const rowObj: any = {};
          r.c.forEach((cell: any, i: number) => {
            const colName = cols[i];
            if (colName) {
              rowObj[colName] = cell && cell.v !== null && cell.v !== undefined ? String(cell.v) : "";
            }
          });
          return rowObj;
        });
        
        const parsedOrders: Order[] = rows.map((r: any) => {
          const clientId = r.CLIENT_ID || "";
          const emailLower = clientId.trim().toLowerCase();
          const gformRow = String(r.GFORM_ROW || "").trim();
          const clientName = (gformRow && rowToNameMap[gformRow]) || emailToNameMap[emailLower] || "";
          return {
            id: r.ORDER_ID || "",
            clientId: clientId,
            clientName: clientName,
            contact: r.CONTACT || "",
            status: (r.STATUS || "DIPROSES") as Order['status'],
            totalPrice: r.TOTAL_PRICE || "0",
            createdAt: r.CREATED_AT || "",
            finishedAt: r.FINISHED_AT || "-",
            orderData: r.ORDER_DATA || "",
            gformRow: gformRow,
            parsedData: parseOrderData(r.ORDER_DATA || "")
          };
        }).filter((order: Order) => order.id !== "" && order.id !== "ORDER_ID");
        
        setOrders(parsedOrders);
        setIsFallback(false);
        setIsUnauthorized(false);
        setSpreadsheetId(SPREADSHEET_ID);

        const now = new Date();
        setLastSyncTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
        setShowSyncToast(true);
      } catch (directErr: any) {
        console.error('[App] Direct client-side Google Sheets fetch also failed. Using local mock data:', directErr);
        
        // Final fallback to mock data
        const MOCK_ORDERS = [
          {
            id: "INV-20260720-01",
            clientId: "adityptra212@gmail.com",
            clientName: "Aditya Putra",
            contact: "628512345678",
            status: "DIPROSES" as Order['status'],
            totalPrice: "75000",
            createdAt: "2026-07-20 08:30:00",
            finishedAt: "-",
            orderData: "Kampus: Universitas Diponegoro | Fakultas: Teknik | Prodi: Sistem Komputer | SMA: SMAN 1 Semarang | Jalur: SNBP | Jenis Univ: Reguler | Jenis Fak: Premium | IG: @adityptra",
            gformRow: "2",
            parsedData: parseOrderData("Kampus: Universitas Diponegoro | Fakultas: Teknik | Prodi: Sistem Komputer | SMA: SMAN 1 Semarang | Jalur: SNBP | Jenis Univ: Reguler | Jenis Fak: Premium | IG: @adityptra")
          },
          {
            id: "INV-20260719-02",
            clientId: "budi.santoso@yahoo.com",
            clientName: "Budi Santoso",
            contact: "628123456789",
            status: "DIKERJAKAN" as Order['status'],
            totalPrice: "120000",
            createdAt: "2026-07-19 14:15:00",
            finishedAt: "-",
            orderData: "Kampus: Universitas Indonesia | Fakultas: Ilmu Komputer | Prodi: Teknik Informatika | SMA: SMAN 8 Jakarta | Jalur: SNBT | Jenis Univ: Combo | Jenis Fak: Combo | IG: @budisantoso",
            gformRow: "3",
            parsedData: parseOrderData("Kampus: Universitas Indonesia | Fakultas: Ilmu Komputer | Prodi: Teknik Informatika | SMA: SMAN 8 Jakarta | Jalur: SNBT | Jenis Univ: Combo | Jenis Fak: Combo | IG: @budisantoso")
          }
        ];
        
        setOrders(MOCK_ORDERS);
        setIsFallback(true);
        setSpreadsheetId(SPREADSHEET_ID);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Extract query parameters
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const urlSearchQuery = useMemo(() => searchParams.get('query') || '', [searchParams]);
  const urlSelectedOrderId = useMemo(() => searchParams.get('id') || '', [searchParams]);

  // Filter orders based on query parameter
  const filteredOrders = useMemo(() => {
    if (!urlSearchQuery.trim()) return [];
    
    const cleanQuery = urlSearchQuery.trim().toLowerCase();
    return orders.filter(order => {
      const matchId = order.id.toLowerCase().includes(cleanQuery);
      const matchEmail = order.clientId.toLowerCase().includes(cleanQuery);
      return matchId || matchEmail;
    });
  }, [urlSearchQuery, orders]);

  // Find selected order based on id parameter
  const selectedOrder = useMemo(() => {
    if (!urlSelectedOrderId) return null;
    const cleanId = urlSelectedOrderId.trim().toLowerCase();
    
    // First try exact invoice id match
    let found = orders.find(o => o.id.toLowerCase() === cleanId);
    if (!found) {
      // If the ID is combined or a substring, try matching
      found = orders.find(o => cleanId.includes(o.id.toLowerCase()) || o.id.toLowerCase().includes(cleanId));
    }
    return found || null;
  }, [urlSelectedOrderId, orders]);

  const handleSearch = (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    saveSearch(cleanQuery);
    navigate('/hasil', { query: cleanQuery });
  };

  const handleSelectOrder = (order: Order) => {
    navigate('/detail', { id: order.id });
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleBackToResults = () => {
    if (urlSearchQuery) {
      navigate('/hasil', { query: urlSearchQuery });
    } else if (selectedOrder) {
      navigate('/hasil', { query: selectedOrder.clientId || selectedOrder.id });
    } else {
      navigate('/');
    }
  };

  const handleSelectSample = (id: string) => {
    handleSearch(id);
  };

  // Determine active view based on routing pathname
  const activeView = useMemo(() => {
    if (pathname === '/hasil') return 'RESULTS';
    if (pathname === '/detail') return 'DETAIL';
    return 'LANDING';
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans" id="app-root">
      {/* Floating Sync Success Toast */}
      <div 
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-lg shadow-emerald-900/5 transition-all duration-300 ${
          showSyncToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
        id="sync-toast"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span>Berhasil sinkronisasi data terbaru pada {lastSyncTime}</span>
      </div>

      {/* Top Banner Navigation Bar */}
      <header 
        className="w-full bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between"
        id="app-header"
      >
        <button 
          onClick={handleBackToLanding}
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
          id="btn-header-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-505 bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
            <Contact className="w-4 h-4" />
          </div>
          <span className="font-display font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 tracking-tight">
            Dity Track
          </span>
        </button>

        {/* Database control indicators */}
        <div className="flex items-center gap-3" id="header-controls">
          <button
            onClick={() => fetchOrders(true)}
            disabled={isLoading || isRefreshing}
            className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100/60 hover:bg-blue-100 disabled:opacity-50 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sinkronkan</span>
          </button>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="flex-1 flex flex-col py-8 justify-center" id="main-content">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20" id="loading-spinner">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Memuat data pesanan...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeView === 'LANDING' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <LandingPage 
                  onSearch={handleSearch} 
                  isFallback={isFallback}
                  isUnauthorized={isUnauthorized}
                  spreadsheetId={spreadsheetId}
                  onOpenHelp={() => setShowConfigHelp(true)}
                  onSelectSample={handleSelectSample}
                  recentSearches={recentSearches}
                  onRemoveRecentSearch={handleRemoveRecentSearch}
                />
              </motion.div>
            )}
            {activeView === 'RESULTS' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <SearchResults 
                  query={urlSearchQuery} 
                  results={filteredOrders} 
                  onBack={handleBackToLanding} 
                  onSelectOrder={handleSelectOrder}
                  onSearch={handleSearch}
                />
              </motion.div>
            )}
            {activeView === 'DETAIL' && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {selectedOrder ? (
                  <OrderDetail 
                    order={selectedOrder} 
                    onBack={handleBackToResults}
                  />
                ) : (
                  <div className="text-center py-20 space-y-4" id="order-not-found-fallback">
                    <p className="text-slate-500 text-sm">Pesanan dengan ID &ldquo;<span className="font-mono text-blue-600 font-semibold">{urlSelectedOrderId}</span>&rdquo; tidak ditemukan.</p>
                    <button 
                      onClick={handleBackToLanding}
                      className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl"
                    >
                      Kembali ke Beranda
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Simple, Professional, Centered Footer */}
      <footer className="w-full border-t border-blue-50 bg-white/50 py-6 px-10 flex items-center justify-center text-[11px] text-slate-400 mt-12" id="app-footer">
        <p id="footer-copyright">&copy; 2026 Dity Track - Powered by Dity Store</p>
      </footer>

      {/* Integration Setup Modal */}
      {showConfigHelp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 p-6 md:p-8 shadow-xl space-y-6 relative" id="help-modal">
            <button 
              onClick={() => setShowConfigHelp(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display">Panduan Integrasi Google Sheets</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dity Store Tracking dirancang khusus agar otomatis melacak data dari tab sheet bernama &ldquo;<b>Pesanan</b>&rdquo; yang dibuat secara mandiri oleh skrip Google Apps Script Anda.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-600 border-t border-slate-100 pt-4" id="help-steps">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-700">Publikasikan Akses Google Sheet</p>
                  <p className="text-slate-400">Buka file Google Sheets Anda, klik tombol <b>Bagikan (Share)</b>, ubah akses umum menjadi <b>&ldquo;Siapa saja yang memiliki link dapat melihat&rdquo;</b> (Anyone with the link can view).</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-700">Ubah ID Spreadsheet di Workspace</p>
                  <p className="text-slate-400">Pastikan variabel <code>SPREADSHEET_ID</code> pada panel setelan admin atau file <code>.env</code> Anda sudah diatur menggunakan ID sheet utama Anda.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  3
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-700">Gunakan Apps Script V3</p>
                  <p className="text-slate-400">Pastikan kode Apps Script pada Google Form Anda adalah versi mutakhir yang secara otomatis melacak dan merekam baris ke dalam tab sheet khusus &ldquo;Pesanan&rdquo;.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowConfigHelp(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
