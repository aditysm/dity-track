import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Set up JSON parsing middleware
app.use(express.json());

// Fallback Mock Data matching the exact GForm database columns
const MOCK_ORDERS = [
  {
    ORDER_ID: "INV-20260720-01",
    CLIENT_ID: "adityptra212@gmail.com",
    CONTACT: "628512345678",
    STATUS: "DIPROSES",
    TOTAL_PRICE: "75000",
    CREATED_AT: "2026-07-20 08:30:00",
    FINISHED_AT: "-",
    ORDER_DATA: "Kampus: Universitas Diponegoro | Fakultas: Teknik | Prodi: Sistem Komputer | SMA: SMAN 1 Semarang | Jalur: SNBP | Jenis Univ: Reguler | Jenis Fak: Premium | IG: @adityptra | Warna Bendera: Merah Putih | Warna Tali: Hitam",
    GFORM_ROW: "2",
    LINK_QR: "https://drive.google.com/file/d/1t_W-m63tV1_z-XmO5V_zJg-YmX6f_S_Z/view?usp=sharing",
    LINK_PROJECT: "https://github.com/adityptra212/dity-track",
    STATUS_QR: "",
    STATUS_PROJECT: "",
    WARNA_BENDERA: "Merah Putih",
    WARNA_TALI: "Hitam",
    WARNA_BENDERA_UNIV: "Merah Putih",
    WARNA_BENDERA_FAK: "",
    WARNA_TALI_UNIV: "Hitam",
    WARNA_TALI_FAK: "",
    UKURAN_CASE_UNIV: "B4",
    UKURAN_CASE_FAK: ""
  },
  {
    ORDER_ID: "INV-20260719-02",
    CLIENT_ID: "budi.santoso@yahoo.com",
    CONTACT: "628123456789",
    STATUS: "DIKERJAKAN",
    TOTAL_PRICE: "120000",
    CREATED_AT: "2026-07-19 14:15:00",
    FINISHED_AT: "-",
    ORDER_DATA: "Kampus: Universitas Indonesia | Fakultas: Ilmu Komputer | Prodi: Teknik Informatika | SMA: SMAN 8 Jakarta | Jalur: SNBT | Jenis Univ: Combo | Jenis Fak: Combo | IG: @budisantoso",
    GFORM_ROW: "3",
    LINK_QR: "https://drive.google.com/file/d/1t_W-m63tV1_z-XmO5V_zJg-YmX6f_S_Z/view?usp=sharing",
    LINK_PROJECT: "https://github.com/adityptra212/dity-track",
    STATUS_QR: "",
    STATUS_PROJECT: ""
  },
  {
    ORDER_ID: "INV-20260718-03",
    CLIENT_ID: "clarissa.putri@gmail.com",
    CONTACT: "628998877665",
    STATUS: "SIAP DIAMBIL",
    TOTAL_PRICE: "50000",
    CREATED_AT: "2026-07-18 10:00:00",
    FINISHED_AT: "-",
    ORDER_DATA: "Kampus: Universitas Gadjah Mada | Fakultas: Kedokteran | Prodi: Pendidikan Dokter | SMA: SMA Stella Duce 1 | Jalur: Mandiri | Jenis Univ: Reguler | Jenis Fak: - | IG: @clarissa.ptr",
    GFORM_ROW: "4",
    LINK_QR: "",
    LINK_PROJECT: "",
    STATUS_QR: "",
    STATUS_PROJECT: ""
  },
  {
    ORDER_ID: "INV-20260715-04",
    CLIENT_ID: "dian.pratama@outlook.com",
    CONTACT: "628111222333",
    STATUS: "SELESAI",
    TOTAL_PRICE: "150000",
    CREATED_AT: "2026-07-15 09:00:00",
    FINISHED_AT: "2026-07-17 15:30:00",
    ORDER_DATA: "Kampus: Institut Teknologi Bandung | Fakultas: STEI | Prodi: Teknik Elektro | SMA: SMAN 3 Bandung | Jalur: SNBP | Jenis Univ: Combo | Jenis Fak: Combo | IG: @dianprtm",
    GFORM_ROW: "5",
    LINK_QR: "",
    LINK_PROJECT: "",
    STATUS_QR: "",
    STATUS_PROJECT: ""
  },
  {
    ORDER_ID: "INV-20260710-05",
    CLIENT_ID: "eko.wijaya@gmail.com",
    CONTACT: "628555666777",
    STATUS: "DIBATALKAN",
    TOTAL_PRICE: "35000",
    CREATED_AT: "2026-07-10 11:20:00",
    FINISHED_AT: "2026-07-10 11:45:00",
    ORDER_DATA: "Kampus: Universitas Sebelas Maret | Fakultas: Hukum | Prodi: Ilmu Hukum | SMA: SMAN 1 Surakarta | Jalur: Mandiri | Jenis Univ: - | Jenis Fak: Premium | IG: @ekowjy",
    GFORM_ROW: "6",
    LINK_QR: "",
    LINK_PROJECT: "",
    STATUS_QR: "",
    STATUS_PROJECT: ""
  }
];

// Endpoint to fetch order status from Google Sheets SPREADSHEET_ID or fallback
app.get("/api/orders", async (req, res) => {
  const SPREADSHEET_ID = (process.env.SPREADSHEET_ID || "1jdwDEOGPDTWyj2buJTUfv-pm0FoBlkcIQ5ofWgHasyU").trim();
  const SHEET_NAME = "Pesanan";
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&_t=${Date.now()}`;

  // Parallel fetch or best-effort fetch of Form Responses 1 for email-to-name mapping
  let emailToNameMap: Record<string, string> = {
    "adityptra212@gmail.com": "Aditya Putra",
    "budi.santoso@yahoo.com": "Budi Santoso",
    "clarissa.putri@gmail.com": "Clarissa Putri",
    "dian.pratama@outlook.com": "Dian Pratama",
    "eko.wijaya@gmail.com": "Eko Wijaya"
  };
  let rowToNameMap: Record<string, string> = {
    "2": "Aditya Putra",
    "3": "Budi Santoso",
    "4": "Clarissa Putri",
    "5": "Dian Pratama",
    "6": "Eko Wijaya"
  };

  try {
    const responsesUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent("Form Responses 1")}&_t=${Date.now()}`;
    const resp = await fetch(responsesUrl);
    if (resp.ok) {
      const respText = await resp.text();
      const respMatch = respText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
      if (respMatch) {
        const respJson = JSON.parse(respMatch[1]);
        if (respJson.status !== "error" && respJson.table && respJson.table.cols) {
          const respCols = respJson.table.cols.map((c: any) => (c.label || c.id || "").trim());
          
          let emailColIdx = -1;
          let nameColIdx = -1;

          respCols.forEach((col: string, idx: number) => {
            const colLower = col.toLowerCase();
            if (colLower.includes("email") || colLower.includes("username") || colLower === "client_id") {
              if (emailColIdx === -1 || colLower === "email address" || colLower === "alamat email") {
                emailColIdx = idx;
              }
            }
            if (colLower.includes("nama") || colLower.includes("name")) {
              if (nameColIdx === -1 || colLower === "nama" || colLower === "nama lengkap" || colLower === "nama pemesan") {
                nameColIdx = idx;
              }
            }
          });

          if (emailColIdx !== -1 && nameColIdx !== -1 && respJson.table.rows) {
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
  } catch (err) {
    console.warn(`[Server] Gagal mengambil data pemesan dari "Form Responses 1":`, err);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheets returned status ${response.status}`);
    }

    const text = await response.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
    
    if (!match) {
      throw new Error("Invalid format returned from Google Sheets visualization API");
    }

    const jsonStr = match[1];
    const data = JSON.parse(jsonStr);

    if (data.status === "error") {
      throw new Error(data.errors?.[0]?.detailed_message || "Error from Google Sheets API");
    }

    const cols = data.table.cols.map((c: any) => c.label || c.id || "");
    const rows = data.table.rows.map((r: any) => {
      const rowObj: any = {};
      r.c.forEach((cell: any, i: number) => {
        const colName = cols[i];
        if (colName) {
          if (cell && cell.v !== null && cell.v !== undefined) {
            rowObj[colName] = String(cell.v);
          } else {
            rowObj[colName] = "";
          }
        }
      });
      return rowObj;
    });

    const getCellByCol = (rObj: any, rawCells: any[], possibleKeys: string[], colIdx: number) => {
      const keys = Object.keys(rObj);
      if (keys.length > 0) {
        for (const k of keys) {
          const normK = k.toUpperCase().replace(/[\s_]/g, '');
          for (const pk of possibleKeys) {
            if (normK === pk.toUpperCase().replace(/[\s_]/g, '')) {
              return String(rObj[k] ?? '').trim();
            }
          }
        }
        return "";
      }

      if (rawCells && rawCells[colIdx]) {
        const cell = rawCells[colIdx];
        if (cell && cell.v !== null && cell.v !== undefined) {
          return String(cell.v).trim();
        }
      }
      return "";
    };

    // Map rows to ensure keys are exactly matching our schema, integrating real CLIENT_NAME
    const formattedOrders = data.table.rows.map((rRaw: any, idx: number) => {
      const rObj = rows[idx] || {};
      const rawCells = rRaw ? rRaw.c : [];

      const orderId = getCellByCol(rObj, rawCells, ["ORDER_ID", "ID", "INVOICE"], 0) || String(rObj.ORDER_ID || "");
      const clientId = getCellByCol(rObj, rawCells, ["CLIENT_ID", "EMAIL"], 1) || String(rObj.CLIENT_ID || "");
      const emailLower = clientId.trim().toLowerCase();
      
      const gformRow = getCellByCol(rObj, rawCells, ["GFORM_ROW", "ROW"], 8) || String(idx + 2);
      const clientName = (gformRow && rowToNameMap[gformRow]) || emailToNameMap[emailLower] || "";
      
      const cleanLink = (val: any) => {
        if (!val) return "";
        const s = String(val).trim();
        if (s === "" || s === "-") return "";
        if (!s.toLowerCase().startsWith("http://") && !s.toLowerCase().startsWith("https://")) {
          return "";
        }
        return s;
      };

      const rawLinkQr = getCellByCol(rObj, rawCells, ["LINK_QR", "QR_LINK", "LINKQR"], 9);
      const rawLinkProject = getCellByCol(rObj, rawCells, ["LINK_PROJECT", "PROJECT_LINK", "LINKPROJECT"], 10);
      const linkQr = cleanLink(rawLinkQr);
      const linkProject = cleanLink(rawLinkProject);

      const statusQr = getCellByCol(rObj, rawCells, ["STATUS_QR", "STATUS QR", "STATUSQR"], 11);
      const statusProject = getCellByCol(rObj, rawCells, ["STATUS_PROJECT", "STATUS PROJECT", "STATUSPROJECT"], 12);
      const statusOrder = getCellByCol(rObj, rawCells, ["STATUS"], 3) || "DIPROSES";
      const contact = getCellByCol(rObj, rawCells, ["CONTACT"], 2);
      const totalPrice = getCellByCol(rObj, rawCells, ["TOTAL_PRICE"], 4) || "0";
      const createdAt = getCellByCol(rObj, rawCells, ["CREATED_AT"], 5);
      const finishedAt = getCellByCol(rObj, rawCells, ["FINISHED_AT"], 6) || "-";
      const orderData = getCellByCol(rObj, rawCells, ["ORDER_DATA"], 7);

      const rawWarnaBendera = getCellByCol(rObj, rawCells, ["WARNA_BENDERA", "WARNA BENDERA"], 13);
      const rawWarnaTali = getCellByCol(rObj, rawCells, ["WARNA_TALI", "WARNA TALI"], 14);

      const rawWarnaBenderaUniv = getCellByCol(rObj, rawCells, ["WARNA_BENDERA_UNIV", "WARNA BENDERA UNIV", "BENDERA UNIV", "WARNA_BENDERA_UNIVERSITAS", "BENDERA UNIVERSITAS"], 15);
      const rawWarnaBenderaFak = getCellByCol(rObj, rawCells, ["WARNA_BENDERA_FAK", "WARNA BENDERA FAK", "BENDERA FAK", "WARNA_BENDERA_FAKULTAS", "BENDERA FAKULTAS"], 16);
      const rawWarnaTaliUniv = getCellByCol(rObj, rawCells, ["WARNA_TALI_UNIV", "WARNA TALI UNIV", "TALI UNIV", "WARNA_TALI_UNIVERSITAS", "TALI UNIVERSITAS"], 17);
      const rawWarnaTaliFak = getCellByCol(rObj, rawCells, ["WARNA_TALI_FAK", "WARNA TALI FAK", "TALI FAK", "WARNA_TALI_FAKULTAS", "TALI FAKULTAS"], 18);
      const rawUkuranCaseUniv = getCellByCol(rObj, rawCells, ["UKURAN_CASE_UNIV", "UKURAN CASE UNIV", "CASE UNIV", "HOLDER UNIV", "UKURAN HOLDER UNIV"], 19);
      const rawUkuranCaseFak = getCellByCol(rObj, rawCells, ["UKURAN_CASE_FAK", "UKURAN CASE FAK", "CASE FAK", "HOLDER FAK", "UKURAN HOLDER FAK"], 20);

      return {
        ORDER_ID: orderId,
        CLIENT_ID: clientId,
        CLIENT_NAME: clientName,
        CONTACT: contact,
        STATUS: statusOrder,
        TOTAL_PRICE: totalPrice,
        CREATED_AT: createdAt,
        FINISHED_AT: finishedAt,
        ORDER_DATA: orderData,
        GFORM_ROW: gformRow,
        LINK_QR: linkQr,
        LINK_PROJECT: linkProject,
        STATUS_QR: statusQr,
        STATUS_PROJECT: statusProject,
        WARNA_BENDERA: rawWarnaBendera,
        WARNA_TALI: rawWarnaTali,
        WARNA_BENDERA_UNIV: rawWarnaBenderaUniv,
        WARNA_BENDERA_FAK: rawWarnaBenderaFak,
        WARNA_TALI_UNIV: rawWarnaTaliUniv,
        WARNA_TALI_FAK: rawWarnaTaliFak,
        UKURAN_CASE_UNIV: rawUkuranCaseUniv,
        UKURAN_CASE_FAK: rawUkuranCaseFak
      };
    }).filter((order: any) => order.ORDER_ID !== "" && order.ORDER_ID !== "ORDER_ID"); // Filter headers or empty items

    return res.json({
      success: true,
      source: "google-sheets",
      spreadsheetId: SPREADSHEET_ID,
      orders: formattedOrders
    });

  } catch (error: any) {
    console.warn(`[Server] Google Sheets fetch failed: ${error.message}. Serving clean fallback mock data.`);
    const isUnauthorized = !!(error.message && (error.message.includes("401") || error.message.includes("403") || error.message.includes("unauthorized") || error.message.includes("Unauthorized")));
    
    // Fallback data mapping with fallback names
    const fallbackOrdersWithNames = MOCK_ORDERS.map(o => {
      const gformRow = String(o.GFORM_ROW || "").trim();
      const clientName = (gformRow && rowToNameMap[gformRow]) || emailToNameMap[o.CLIENT_ID.toLowerCase()] || "";
      return {
        ...o,
        CLIENT_NAME: clientName,
        STATUS_QR: o.STATUS_QR || "",
        STATUS_PROJECT: o.STATUS_PROJECT || ""
      };
    });

    return res.json({
      success: true,
      source: "fallback-mock-data",
      spreadsheetId: SPREADSHEET_ID,
      isUnauthorized: isUnauthorized,
      errorDetails: error.message || "Unknown error",
      note: "Gunakan spreadsheet ID anda sendiri dan bagikan sebagai 'Siapa saja yang memiliki link dapat melihat' untuk sinkronisasi data langsung.",
      orders: fallbackOrdersWithNames
    });
  }
});

// Endpoint to confirm QR or Client status
app.post("/api/orders/confirm", async (req, res) => {
  const { orderId, clientId, type, status, row } = req.body;
  if (!orderId || !type || !status) {
    return res.status(400).json({ success: false, message: "Informasi konfirmasi tidak lengkap" });
  }

  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyz2irrGBi5tCo0cmot-OWIOxkTU0B66c5K1f9Y0jWVtCBENJJjNtvtzIoPXYcFSwpw/exec";
  let syncedWithSheets = false;
  let syncError = null;

  if (APPS_SCRIPT_URL) {
    try {
      const targetRow = String(row || "").trim();
      const queryParams = new URLSearchParams({
        action: "update_status",
        row: targetRow,
        type: String(type || ""),
        status: String(status || "DIKONFIRMASI")
      }).toString();

      const targetUrl = `${APPS_SCRIPT_URL}?${queryParams}`;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "update_status",
          row: targetRow,
          type: type,
          status: status || "DIKONFIRMASI"
        })
      });

      if (response.ok) {
        const textResponse = await response.text();
        const lowerText = textResponse.toLowerCase();
        let result: any = null;

        if (!lowerText.includes("<html") && !lowerText.includes("<!doctype") && !lowerText.includes("script function not found") && !lowerText.includes("page not found")) {
          try {
            result = JSON.parse(textResponse);
          } catch (e) {
            const trimmed = textResponse.trim().toUpperCase();
            if (trimmed === "OK" || trimmed === "SUCCESS" || trimmed.includes("SUCCESS")) {
              result = { success: true };
            }
          }
        }

        if (result && (result.success === true || result.status === "success" || result.result === "success")) {
          syncedWithSheets = true;
          console.log(`[Server] Sync success to Google Sheets for order ${orderId}, row ${row || 'auto'}`);
        } else {
          syncError = result ? (result.error || "Google Sheets returned success: false") : `Google Apps Script returned invalid response`;
          console.warn(`[Server] Google Sheets sync failed: ${syncError}`);
        }
      } else {
        syncError = `HTTP status ${response.status}`;
        console.warn(`[Server] Google Sheets sync HTTP error: ${syncError}`);
      }
    } catch (err: any) {
      syncError = err.message || "Unknown error";
      console.warn(`[Server] Failed to connect to APPS_SCRIPT_URL: ${syncError}`);
    }
  }

  return res.json({
    success: syncedWithSheets,
    syncedWithSheets,
    syncError
  });
});

// Configure Vite integration or asset serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dity Store Server] running on http://localhost:${PORT}`);
  });
}

bootstrap();
