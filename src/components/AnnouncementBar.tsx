import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';

export interface Announcement {
  ANN_ID: string;
  PESAN: string;
  URUTAN: number | string;
  IS_ACTIVE: boolean | string;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { ANN_ID: 'ANN-02', PESAN: 'Data & dokumenmu dijamin aman!', URUTAN: 1, IS_ACTIVE: true },
  { ANN_ID: 'ANN-03', PESAN: 'Harga pelajar, ramah di kantong', URUTAN: 2, IS_ACTIVE: true },
  { ANN_ID: 'ANN-01', PESAN: 'Pengerjaan cepat sesuai deadline yang disepakati', URUTAN: 3, IS_ACTIVE: true },
];

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    let items: Announcement[] = [];

    try {
      // 1. Try fetching from Express backend API
      const res = await fetch('/api/announcements', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.announcements) && data.announcements.length > 0) {
          items = data.announcements;
        }
      }
    } catch (e) {
      console.warn('[AnnouncementBar] Backend fetch failed, trying direct Google Sheets fetch...', e);
    }

    // 2. Direct client-side GViz fetch fallback if backend API returned empty or failed
    if (items.length === 0) {
      try {
        const SPREADSHEET_ID = "1jdwDEOGPDTWyj2buJTUfv-pm0FoBlkcIQ5ofWgHasyU";
        const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent("Announcement")}&_t=${Date.now()}`;
        const resp = await fetch(url, { cache: 'no-store' });
        if (resp.ok) {
          const text = await resp.text();
          const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
          if (match) {
            const data = JSON.parse(match[1]);
            if (data.status !== "error" && data.table && data.table.rows) {
              const cols = data.table.cols.map((c: any) => (c.label || c.id || "").toUpperCase().trim());
              items = data.table.rows.map((r: any) => {
                const getVal = (possibleKeys: string[], fallbackIdx: number) => {
                  if (r && r.c) {
                    for (let i = 0; i < cols.length; i++) {
                      if (possibleKeys.includes(cols[i])) {
                        const cell = r.c[i];
                        return cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
                      }
                    }
                    if (r.c[fallbackIdx]) {
                      const cell = r.c[fallbackIdx];
                      return cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
                    }
                  }
                  return '';
                };

                return {
                  ANN_ID: String(getVal(['ANN_ID', 'ID'], 0)),
                  PESAN: String(getVal(['PESAN', 'MESSAGE'], 1)),
                  URUTAN: getVal(['URUTAN', 'ORDER'], 2),
                  IS_ACTIVE: getVal(['IS_ACTIVE', 'ACTIVE'], 3)
                };
              });
            }
          }
        }
      } catch (e) {
        console.warn('[AnnouncementBar] Direct GViz fetch failed, using default announcements...', e);
      }
    }

    // 3. Fallback to default announcements if still empty
    if (items.length === 0) {
      items = DEFAULT_ANNOUNCEMENTS;
    }

    // Filter active items and sort by URUTAN ascending
    const activeItems = items
      .filter(a => {
        if (a.IS_ACTIVE === true) return true;
        const str = String(a.IS_ACTIVE).toUpperCase().trim();
        return str === 'TRUE' || str === '1' || str === 'YA' || str === 'YES';
      })
      .sort((a, b) => Number(a.URUTAN || 0) - Number(b.URUTAN || 0));

    setAnnouncements(activeItems);

    if (activeItems.length > 0) {
      document.documentElement.style.setProperty('--ann-height', '32px');
    } else {
      document.documentElement.style.setProperty('--ann-height', '0px');
    }
  };

  const closeAnnouncement = () => {
    setIsClosed(true);
    document.documentElement.style.setProperty('--ann-height', '0px');
  };

  if (isClosed || announcements.length === 0) {
    return null;
  }

  const joinedText = announcements.map(a => a.PESAN).join(" • ");

  return (
    <div
      id="announcementBar"
      className="text-white px-3 md:px-4 flex items-center justify-between overflow-hidden shadow-xs border-b border-blue-950/80 select-none z-[1001] w-full"
    >
      <div className="flex items-center gap-1.5 shrink-0 z-10 bg-[#0b1329] pr-3 h-full">
        <Megaphone className="w-3 h-3 text-blue-400 shrink-0" />
      </div>

      <div className="flex-grow relative flex items-center overflow-hidden h-full">
        <div id="marqueeContainer" className="animate-marquee whitespace-nowrap">
          <span className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.22em] inline-block mr-3 text-blue-100/90">
            {joinedText} •&nbsp;
          </span>
          <span className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.22em] inline-block mr-3 text-blue-100/90">
            {joinedText} •&nbsp;
          </span>
        </div>
      </div>

      <div className="flex items-center z-10 bg-[#0b1329] pl-3 h-full">
        <button
          onClick={closeAnnouncement}
          type="button"
          aria-label="Tutup pengumuman"
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/15 active:scale-90 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
