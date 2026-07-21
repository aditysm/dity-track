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
    ORDER_DATA: "Kampus: Universitas Diponegoro | Fakultas: Teknik | Prodi: Sistem Komputer | SMA: SMAN 1 Semarang | Jalur: SNBP | Jenis Univ: Reguler | Jenis Fak: Premium | IG: @adityptra",
    GFORM_ROW: "2"
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
    GFORM_ROW: "3"
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
    GFORM_ROW: "4"
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
    GFORM_ROW: "5"
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
    GFORM_ROW: "6"
  }
];

// Endpoint to fetch order status from Google Sheets SPREADSHEET_ID or fallback
app.get("/api/orders", async (req, res) => {
  const SPREADSHEET_ID = (process.env.SPREADSHEET_ID || "1jdwDEOGPDTWyj2buJTUfv-pm0FoBlkcIQ5ofWgHasyU").trim();
  const SHEET_NAME = "Pesanan";
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

  // Parallel fetch or best-effort fetch of Form Responses 1 for email-to-name mapping
  let emailToNameMap: Record<string, string> = {
    "adityptra212@gmail.com": "Aditya Putra",
    "budi.santoso@yahoo.com": "Budi Santoso",
    "clarissa.putri@gmail.com": "Clarissa Putri",
    "dian.pratama@outlook.com": "Dian Pratama",
    "eko.wijaya@gmail.com": "Eko Wijaya"
  };

  try {
    const responsesUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent("Form Responses 1")}`;
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
            respJson.table.rows.forEach((r: any) => {
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

    // Map rows to ensure keys are exactly matching our schema, integrating real CLIENT_NAME
    const formattedOrders = rows.map((r: any) => {
      const clientId = r.CLIENT_ID || "";
      const emailLower = clientId.trim().toLowerCase();
      const clientName = emailToNameMap[emailLower] || "";
      return {
        ORDER_ID: r.ORDER_ID || "",
        CLIENT_ID: clientId,
        CLIENT_NAME: clientName,
        CONTACT: r.CONTACT || "",
        STATUS: r.STATUS || "DIPROSES",
        TOTAL_PRICE: r.TOTAL_PRICE || "0",
        CREATED_AT: r.CREATED_AT || "",
        FINISHED_AT: r.FINISHED_AT || "-",
        ORDER_DATA: r.ORDER_DATA || "",
        GFORM_ROW: r.GFORM_ROW || "0"
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
    const fallbackOrdersWithNames = MOCK_ORDERS.map(o => ({
      ...o,
      CLIENT_NAME: emailToNameMap[o.CLIENT_ID.toLowerCase()] || ""
    }));

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
