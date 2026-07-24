import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Database, Sparkles, HelpCircle, X, Contact, Copy, Check, Code, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  const [copiedScript, setCopiedScript] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [toast, setToast] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
          parsedData: parseOrderData(o.ORDER_DATA),
          linkQr: o.LINK_QR || '',
          linkProject: o.LINK_PROJECT || '',
          statusQr: o.STATUS_QR || '',
          statusProject: o.STATUS_PROJECT || ''
        }));
        
        setOrders(parsedOrders);
        setIsFallback(data.source === 'fallback-mock-data');
        setIsUnauthorized(!!data.isUnauthorized);
        setSpreadsheetId(data.spreadsheetId || '');

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setLastSyncTime(timeStr);
        if (!silent) {
          setToast({
            type: 'success',
            message: 'Sinkronisasi berhasil!'
          });
        }
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
        
        const parsedOrders: Order[] = rows.map((r: any, idx: number) => {
          const clientId = r.CLIENT_ID || "";
          const emailLower = clientId.trim().toLowerCase();
          const gformRow = String(r.GFORM_ROW || "").trim() || String(idx + 2);
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
            parsedData: parseOrderData(r.ORDER_DATA || ""),
            linkQr: (() => {
              const val = r.LINK_QR || r._QR || r.QR_LINK || "";
              const s = String(val).trim();
              if (s === "" || s === "-") return "";
              if (!s.toLowerCase().startsWith("http://") && !s.toLowerCase().startsWith("https://")) return "";
              return s;
            })(),
            linkProject: (() => {
              const val = r.LINK_PROJECT || r.LINK_PROJECT1 || "";
              const s = String(val).trim();
              if (s === "" || s === "-") return "";
              if (!s.toLowerCase().startsWith("http://") && !s.toLowerCase().startsWith("https://")) return "";
              return s;
            })(),
            statusQr: r.STATUS_QR || "",
            statusProject: r.STATUS_PROJECT || ""
          };
        }).filter((order: Order) => order.id !== "" && order.id !== "ORDER_ID");
        
        setOrders(parsedOrders);
        setIsFallback(false);
        setIsUnauthorized(false);
        setSpreadsheetId(SPREADSHEET_ID);

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setLastSyncTime(timeStr);
        if (!silent) {
          setToast({
            type: 'success',
            message: 'Sinkronisasi berhasil!'
          });
        }
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
            parsedData: parseOrderData("Kampus: Universitas Diponegoro | Fakultas: Teknik | Prodi: Sistem Komputer | SMA: SMAN 1 Semarang | Jalur: SNBP | Jenis Univ: Reguler | Jenis Fak: Premium | IG: @adityptra"),
            linkQr: "https://drive.google.com/file/d/1t_W-m63tV1_z-XmO5V_zJg-YmX6f_S_Z/view?usp=sharing",
            linkProject: "https://github.com/adityptra212/dity-track",
            statusQr: "",
            statusProject: ""
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
            parsedData: parseOrderData("Kampus: Universitas Indonesia | Fakultas: Ilmu Komputer | Prodi: Teknik Informatika | SMA: SMAN 8 Jakarta | Jalur: SNBT | Jenis Univ: Combo | Jenis Fak: Combo | IG: @budisantoso"),
            linkQr: "https://drive.google.com/file/d/1t_W-m63tV1_z-XmO5V_zJg-YmX6f_S_Z/view?usp=sharing",
            linkProject: "https://github.com/adityptra212/dity-track",
            statusQr: "",
            statusProject: ""
          }
        ];
        
        setOrders(MOCK_ORDERS);
        setIsFallback(true);
        setSpreadsheetId(SPREADSHEET_ID);
        if (!silent) {
          setToast({
            type: 'warning',
            message: 'Gagal sinkronisasi. Menggunakan data lokal.'
          });
        }
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

  const handleConfirm = async (orderId: string, type: 'qr' | 'project', status: string) => {
    const matchingOrder = orders.find(o => o.id === orderId);
    const row = matchingOrder ? matchingOrder.gformRow : "";
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyz2irrGBi5tCo0cmot-OWIOxkTU0B66c5K1f9Y0jWVtCBENJJjNtvtzIoPXYcFSwpw/exec";

    // Update local state immediately for snappy UI
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          statusQr: type === 'qr' ? status : o.statusQr,
          statusProject: type === 'project' ? status : o.statusProject
        };
      }
      return o;
    }));

    let syncedWithSheets = false;

    // 1. First attempt via Express server backend API
    try {
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, type, status, row })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.syncedWithSheets) {
          syncedWithSheets = true;
        }
      }
    } catch (serverErr) {
      console.warn('[App] Backend API unavailable or failed. Trying direct Google Apps Script fetch...', serverErr);
    }

    // 2. Direct client-side fetch fallback to Google Apps Script Web App (e.g. for GitHub Pages) if server didn't sync
    if (!syncedWithSheets) {
      try {
        const directResp = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            action: "update_status",
            row: row || "",
            orderId: orderId,
            type: type,
            status: status || "DIKONFIRMASI"
          })
        });

        if (directResp.ok) {
          const respText = await directResp.text();
          let parsed: any = null;
          try {
            parsed = JSON.parse(respText);
          } catch {
            const upper = respText.trim().toUpperCase();
            if ((upper === 'OK' || upper === 'SUCCESS' || upper.includes('SUCCESS')) && !upper.includes('<HTML')) {
              parsed = { success: true };
            }
          }

          if (parsed && (parsed.success === true || parsed.status === 'success' || parsed.result === 'success')) {
            syncedWithSheets = true;
          }
        }
      } catch (directErr) {
        console.warn('[App] Direct Apps Script fetch error:', directErr);
      }
    }

    // Refresh order list silently
    await fetchOrders(true);

    if (syncedWithSheets) {
      setToast({
        type: 'success',
        message: type === 'qr' ? 'QR berhasil dikonfirmasi dan diperbarui di Google Sheet!' : 'Project berhasil disesuaikan dan diperbarui di Google Sheet!'
      });
    } else {
      setToast({
        type: 'warning',
        message: type === 'qr' ? 'QR dikonfirmasi secara lokal (Google Sheet tidak terupdate).' : 'Project dikonfirmasi secara lokal (Google Sheet tidak terupdate).'
      });
    }

    return true;
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

  // Scroll to top instantly on page/view transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans" id="app-root">
      {/* Floating Sync & Action Toast */}
      <div className="fixed top-24 left-0 right-0 z-50 flex justify-center pointer-events-none px-4" id="toast-container">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4.5 py-2.5 rounded-full border shadow-lg transition-all duration-300 max-w-[92vw] whitespace-nowrap ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/5'
                  : toast.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-500/5'
                    : 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-500/5'
              }`}
              id="app-toast"
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              <span className="text-xs font-bold font-sans">{toast.message}</span>
              <button 
                onClick={() => setToast(null)} 
                className={`text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  toast.type === 'success' 
                    ? 'hover:bg-emerald-100/50' 
                    : toast.type === 'error' 
                      ? 'hover:bg-rose-100/50' 
                      : 'hover:bg-amber-100/50'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
            onClick={() => fetchOrders(false)}
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
                    onConfirm={handleConfirm}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-100 p-6 md:p-8 shadow-xl relative flex flex-col max-h-[90vh]" id="help-modal">
            <button 
              onClick={() => setShowConfigHelp(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display">Panduan Integrasi Google Sheets</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dity Store Tracking dirancang khusus agar otomatis melacak dan memperbarui data dari tab sheet bernama &ldquo;<b>Pesanan</b>&rdquo; secara real-time.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 my-4 space-y-5 text-xs text-slate-600 border-t border-b border-slate-100 py-4" id="help-steps">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-700">Publikasikan Akses Google Sheet</p>
                  <p className="text-slate-400 font-sans">Buka file Google Sheets Anda, klik tombol <b>Bagikan (Share)</b>, ubah akses umum menjadi <b>&ldquo;Siapa saja yang memiliki link dapat melihat&rdquo;</b> (Anyone with the link can view).</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-700">Ubah ID Spreadsheet di Workspace</p>
                  <p className="text-slate-400 font-sans">Pastikan variabel <code>SPREADSHEET_ID</code> pada panel setelan admin atau file <code>.env</code> Anda sudah diatur menggunakan ID sheet utama Anda.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  3
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-700">Gunakan Apps Script V3</p>
                  <p className="text-slate-400 font-sans">Pastikan kode Apps Script pada Google Form Anda adalah versi mutakhir yang secara otomatis melacak dan merekam baris ke dalam tab sheet khusus &ldquo;Pesanan&rdquo;.</p>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-50 pt-4">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  4
                </div>
                <div className="space-y-2 w-full">
                  <p className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Aktifkan Sinkronisasi Konfirmasi (Tulis Balik)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold font-mono uppercase tracking-wider">Opsional</span>
                  </p>
                  <p className="text-slate-400 font-sans">
                    Agar tombol konfirmasi (<b>QR Sudah Benar</b> / <b>Hasil Selesai</b>) di website dapat langsung mengubah isi Google Sheets, tambahkan kode Apps Script berikut ke dalam proyek skrip Anda:
                  </p>

                  <div className="relative mt-2 border border-slate-100 rounded-xl overflow-hidden bg-slate-900/5 text-slate-700 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" />
                        <span>Google Apps Script</span>
                      </span>
                      <button
                        onClick={() => {
                          const code = `function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var spreadsheetId = params.spreadsheetId;
    var sheet;
    
    // Sangat Fleksibel: Dukung container-bound script maupun standalone script
    if (spreadsheetId) {
      try {
        sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("Pesanan");
      } catch (errOpen) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pesanan");
      }
    } else {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pesanan");
    }
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Tab Sheet 'Pesanan' tidak ditemukan" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var orderId = params.orderId;
    var row = parseInt(params.row);
    var type = params.type; // "qr" atau "project"
    var status = params.status; // "DIKONFIRMASI"
    
    // Cari baris jika tidak ada parameter row atau tidak valid
    if (isNaN(row) || row < 2) {
      var lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < data.length; i++) {
          if (String(data[i][0]).trim() === String(orderId).trim()) {
            row = i + 2;
            break;
          }
        }
      }
    }
    
    if (isNaN(row) || row < 2) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invoice ID '" + orderId + "' tidak ditemukan di Sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Ambil headers (baris 1) untuk deteksi kolom
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var colName = type === "qr" ? "STATUS_QR" : "STATUS_PROJECT";
    var colIndex = -1;
    
    // Pencarian kolom yang tahan spasi & case-insensitive
    for (var j = 0; j < headers.length; j++) {
      var headerStr = String(headers[j]).trim().toUpperCase();
      if (headerStr === colName) {
        colIndex = j + 1;
        break;
      }
    }
    
    // Fallback absolut jika kolom tidak terdeteksi dari nama
    if (colIndex === -1) {
      if (type === "qr") {
        colIndex = 12; // Kolom L (STATUS_QR)
      } else {
        colIndex = 14; // Kolom N (STATUS_PROJECT)
      }
    }
    
    sheet.getRange(row, colIndex).setValue(status);
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Status diperbarui di Baris " + row }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
                          navigator.clipboard.writeText(code);
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-white/80 hover:bg-white text-slate-600 rounded-lg text-[10px] font-bold shadow-xs border border-slate-200/50 transition-all cursor-pointer active:scale-95"
                      >
                        {copiedScript ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600">Disalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Kode</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono overflow-x-auto text-slate-600 max-h-[140px] leading-relaxed select-all">
{`function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var spreadsheetId = params.spreadsheetId;
    var sheet;
    
    if (spreadsheetId) {
      try {
        sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("Pesanan");
      } catch (errOpen) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pesanan");
      }
    } else {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pesanan");
    }
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Tab Sheet 'Pesanan' tidak ditemukan" }));
    }
    
    var orderId = params.orderId;
    var row = parseInt(params.row);
    var type = params.type; // "qr" atau "project"
    var status = params.status; // "DIKONFIRMASI"
    
    if (isNaN(row) || row < 2) {
      var lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < data.length; i++) {
          if (String(data[i][0]).trim() === String(orderId).trim()) {
            row = i + 2;
            break;
          }
        }
      }
    }
    
    if (isNaN(row) || row < 2) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invoice ID '" + orderId + "' tidak ditemukan di Sheet" }));
    }
    
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var colName = type === "qr" ? "STATUS_QR" : "STATUS_PROJECT";
    var colIndex = -1;
    
    for (var j = 0; j < headers.length; j++) {
      var headerStr = String(headers[j]).trim().toUpperCase();
      if (headerStr === colName) {
        colIndex = j + 1;
        break;
      }
    }
    
    if (colIndex === -1) {
      if (type === "qr") {
        colIndex = 12; // Kolom L (STATUS_QR)
      } else {
        colIndex = 14; // Kolom N (STATUS_PROJECT)
      }
    }
    
    sheet.getRange(row, colIndex).setValue(status);
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Status diperbarui" }));
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }));
  }
}`}
                    </pre>
                  </div>
                  
                  <p className="text-slate-400 font-sans mt-2">
                    Setelah kode ditempelkan di Apps Script Spreadsheet:
                    <ol className="list-decimal pl-4 mt-1 space-y-1">
                      <li>Klik <b>Terapkan (Deploy) &gt; Penerapan baru (New deployment)</b>.</li>
                      <li>Pilih jenis penerapan: <b>Aplikasi Web (Web App)</b>.</li>
                      <li>Atur &ldquo;Jalankan sebagai&rdquo; ke <b>Saya (Me)</b>, dan &ldquo;Siapa yang memiliki akses&rdquo; ke <b>Siapa saja (Anyone)</b>.</li>
                      <li>Salin <b>URL Aplikasi Web</b> yang didapatkan, lalu simpan ke variabel <code>APPS_SCRIPT_URL</code> di panel setelan admin atau file <code>.env</code> Anda.</li>
                    </ol>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex-shrink-0">
              <button
                onClick={() => setShowConfigHelp(false)}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer active:scale-95"
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
