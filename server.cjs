var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var MOCK_ORDERS = [
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
app.get("/api/orders", async (req, res) => {
  const SPREADSHEET_ID = (process.env.SPREADSHEET_ID || "1jdwDEOGPDTWyj2buJTUfv-pm0FoBlkcIQ5ofWgHasyU").trim();
  const SHEET_NAME = "Pesanan";
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
  let emailToNameMap = {
    "adityptra212@gmail.com": "Aditya Putra",
    "budi.santoso@yahoo.com": "Budi Santoso",
    "clarissa.putri@gmail.com": "Clarissa Putri",
    "dian.pratama@outlook.com": "Dian Pratama",
    "eko.wijaya@gmail.com": "Eko Wijaya"
  };
  let rowToNameMap = {
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
        if (respJson.status !== "error" && respJson.table && respJson.table.cols) {
          const respCols = respJson.table.cols.map((c) => (c.label || c.id || "").trim());
          let emailColIdx = -1;
          let nameColIdx = -1;
          respCols.forEach((col, idx) => {
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
            respJson.table.rows.forEach((r, idx) => {
              if (r && r.c) {
                const emailCell = r.c[emailColIdx];
                const nameCell = r.c[nameColIdx];
                if (emailCell && emailCell.v !== null && emailCell.v !== void 0 && nameCell && nameCell.v !== null && nameCell.v !== void 0) {
                  const emailVal = String(emailCell.v).trim().toLowerCase();
                  const nameVal = String(nameCell.v).trim();
                  if (emailVal && nameVal) {
                    emailToNameMap[emailVal] = nameVal;
                  }
                }
                if (nameCell && nameCell.v !== null && nameCell.v !== void 0) {
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
    const cols = data.table.cols.map((c) => c.label || c.id || "");
    const rows = data.table.rows.map((r) => {
      const rowObj = {};
      r.c.forEach((cell, i) => {
        const colName = cols[i];
        if (colName) {
          if (cell && cell.v !== null && cell.v !== void 0) {
            rowObj[colName] = String(cell.v);
          } else {
            rowObj[colName] = "";
          }
        }
      });
      return rowObj;
    });
    const formattedOrders = rows.map((r) => {
      const clientId = r.CLIENT_ID || "";
      const emailLower = clientId.trim().toLowerCase();
      const gformRow = String(r.GFORM_ROW || "").trim();
      const clientName = gformRow && rowToNameMap[gformRow] || emailToNameMap[emailLower] || "";
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
        GFORM_ROW: gformRow
      };
    }).filter((order) => order.ORDER_ID !== "" && order.ORDER_ID !== "ORDER_ID");
    return res.json({
      success: true,
      source: "google-sheets",
      spreadsheetId: SPREADSHEET_ID,
      orders: formattedOrders
    });
  } catch (error) {
    console.warn(`[Server] Google Sheets fetch failed: ${error.message}. Serving clean fallback mock data.`);
    const isUnauthorized = !!(error.message && (error.message.includes("401") || error.message.includes("403") || error.message.includes("unauthorized") || error.message.includes("Unauthorized")));
    const fallbackOrdersWithNames = MOCK_ORDERS.map((o) => {
      const gformRow = String(o.GFORM_ROW || "").trim();
      const clientName = gformRow && rowToNameMap[gformRow] || emailToNameMap[o.CLIENT_ID.toLowerCase()] || "";
      return {
        ...o,
        CLIENT_NAME: clientName
      };
    });
    return res.json({
      success: true,
      source: "fallback-mock-data",
      spreadsheetId: SPREADSHEET_ID,
      isUnauthorized,
      errorDetails: error.message || "Unknown error",
      note: "Gunakan spreadsheet ID anda sendiri dan bagikan sebagai 'Siapa saja yang memiliki link dapat melihat' untuk sinkronisasi data langsung.",
      orders: fallbackOrdersWithNames
    });
  }
});
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dity Store Server] running on http://localhost:${PORT}`);
  });
}
bootstrap();
//# sourceMappingURL=server.cjs.map
