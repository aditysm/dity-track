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
var import_config = require("dotenv/config");
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
    UKURAN_CASE_FAK: "",
    BISA_REFUND: true
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
    STATUS_PROJECT: "",
    BISA_REFUND: true
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
app.get("/api/orders", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const SPREADSHEET_ID = (process.env.SPREADSHEET_ID || "1jdwDEOGPDTWyj2buJTUfv-pm0FoBlkcIQ5ofWgHasyU").trim();
  const SHEET_NAME = "Pesanan";
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&_t=${Date.now()}`;
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
    const responsesUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent("Form Responses 1")}&_t=${Date.now()}`;
    const resp = await fetch(responsesUrl, { cache: "no-store" });
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
    const response = await fetch(url, { cache: "no-store" });
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
    const getCellByCol = (rObj, rawCells, possibleKeys, colIdx) => {
      const keys = Object.keys(rObj);
      if (keys.length > 0) {
        for (const k of keys) {
          const normK = k.toUpperCase().replace(/[\s_]/g, "");
          for (const pk of possibleKeys) {
            if (normK === pk.toUpperCase().replace(/[\s_]/g, "")) {
              return String(rObj[k] ?? "").trim();
            }
          }
        }
        return "";
      }
      if (rawCells && rawCells[colIdx]) {
        const cell = rawCells[colIdx];
        if (cell && cell.v !== null && cell.v !== void 0) {
          return String(cell.v).trim();
        }
      }
      return "";
    };
    const formattedOrders = data.table.rows.map((rRaw, idx) => {
      const rObj = rows[idx] || {};
      const rawCells = rRaw ? rRaw.c : [];
      const orderId = getCellByCol(rObj, rawCells, ["ORDER_ID", "ID", "INVOICE"], 0) || String(rObj.ORDER_ID || "");
      const clientId = getCellByCol(rObj, rawCells, ["CLIENT_ID", "EMAIL"], 1) || String(rObj.CLIENT_ID || "");
      const emailLower = clientId.trim().toLowerCase();
      const gformRow = getCellByCol(rObj, rawCells, ["GFORM_ROW", "ROW"], 8) || String(idx + 2);
      const clientName = gformRow && rowToNameMap[gformRow] || emailToNameMap[emailLower] || "";
      const cleanLink = (val) => {
        if (!val) return "";
        const s = String(val).trim();
        if (s === "" || s === "-") return "";
        if (!s.toLowerCase().startsWith("http://") && !s.toLowerCase().startsWith("https://")) {
          return "";
        }
        return s;
      };
      const rawLinkQr = getCellByCol(rObj, rawCells, ["LINK_QR", "QR_LINK", "LINKQR"], 9);
      const rawLinkClient = getCellByCol(rObj, rawCells, ["LINK_CLIENT", "CLIENT_LINK", "LINKCLIENT"], 10);
      const rawLinkProject = getCellByCol(rObj, rawCells, ["LINK_PROJECT", "PROJECT_LINK", "LINKPROJECT"], 11);
      const linkQr = cleanLink(rawLinkQr);
      const linkClient = cleanLink(rawLinkClient);
      const linkProject = cleanLink(rawLinkProject);
      const statusQr = getCellByCol(rObj, rawCells, ["STATUS_QR", "STATUS QR", "STATUSQR"], 22);
      const statusProject = getCellByCol(rObj, rawCells, ["STATUS_PROJECT", "STATUS PROJECT", "STATUSPROJECT"], 23);
      const statusOrder = getCellByCol(rObj, rawCells, ["STATUS"], 3) || "DIPROSES";
      const contact = getCellByCol(rObj, rawCells, ["CONTACT"], 2);
      const totalPrice = getCellByCol(rObj, rawCells, ["TOTAL_PRICE"], 4) || "0";
      const createdAt = getCellByCol(rObj, rawCells, ["CREATED_AT"], 5);
      const finishedAt = getCellByCol(rObj, rawCells, ["FINISHED_AT"], 6) || "-";
      const orderData = getCellByCol(rObj, rawCells, ["ORDER_DATA"], 7);
      const rawWarnaBenderaUniv = getCellByCol(rObj, rawCells, ["WARNA_BENDERA_UNIV", "WARNA BENDERA UNIV", "BENDERA UNIV", "WARNA_BENDERA_UNIVERSITAS", "BENDERA UNIVERSITAS"], 12);
      const rawWarnaBenderaFak = getCellByCol(rObj, rawCells, ["WARNA_BENDERA_FAK", "WARNA BENDERA FAK", "BENDERA FAK", "WARNA_BENDERA_FAKULTAS", "BENDERA FAKULTAS"], 13);
      const rawUkuranCaseUniv = getCellByCol(rObj, rawCells, ["UKURAN_CASE_UNIV", "UKURAN CASE UNIV", "CASE UNIV", "HOLDER UNIV", "UKURAN HOLDER UNIV"], 14);
      const rawWarnaTaliUniv = getCellByCol(rObj, rawCells, ["WARNA_TALI_UNIV", "WARNA TALI UNIV", "TALI UNIV", "WARNA_TALI_UNIVERSITAS", "TALI UNIVERSITAS"], 15);
      const rawWarnaTaliFak = getCellByCol(rObj, rawCells, ["WARNA_TALI_FAK", "WARNA TALI FAK", "TALI FAK", "WARNA_TALI_FAKULTAS", "TALI FAKULTAS"], 16);
      const rawUkuranCaseFak = getCellByCol(rObj, rawCells, ["UKURAN_CASE_FAK", "UKURAN CASE FAK", "CASE FAK", "HOLDER FAK", "UKURAN HOLDER FAK"], 17);
      const rawBisaRefund = getCellByCol(rObj, rawCells, ["BISA_REFUND", "BISA REFUND", "REFUND", "BISA_PENGEMBALIAN_DANA"], 18);
      const rawStatusUniv = getCellByCol(rObj, rawCells, ["STATUS_UNIV", "STATUS UNIV", "STATUS_UNIVERSITAS", "STATUS UNIVERSITAS"], 19);
      const rawStatusFak = getCellByCol(rObj, rawCells, ["STATUS_FAK", "STATUS FAK", "STATUS_FAKULTAS", "STATUS FAKULTAS"], 20);
      const rawNoKelompok = getCellByCol(rObj, rawCells, ["NO_KELOMPOK", "NO KELOMPOK", "KELOMPOK", "NO_GROUP", "GROUP"], 21);
      const rawTanggalPengambilan = getCellByCol(rObj, rawCells, ["TANGGAL_PENGAMBILAN", "TANGGAL PENGAMBILAN", "TGL_PENGAMBILAN", "TGL PENGAMBILAN", "PICKUP_DATE", "TANGGAL"], 22);
      const bisaRefund = String(rawBisaRefund || "").trim().toUpperCase() === "TRUE" || String(rawBisaRefund || "").trim().toUpperCase() === "YA" || String(rawBisaRefund || "").trim() === "1";
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
        LINK_CLIENT: linkClient,
        LINK_PROJECT: linkProject,
        STATUS_QR: statusQr,
        STATUS_PROJECT: statusProject,
        STATUS_UNIV: rawStatusUniv || "",
        STATUS_FAK: rawStatusFak || "",
        WARNA_BENDERA_UNIV: rawWarnaBenderaUniv,
        WARNA_BENDERA_FAK: rawWarnaBenderaFak,
        WARNA_TALI_UNIV: rawWarnaTaliUniv,
        WARNA_TALI_FAK: rawWarnaTaliFak,
        UKURAN_CASE_UNIV: rawUkuranCaseUniv,
        UKURAN_CASE_FAK: rawUkuranCaseFak,
        BISA_REFUND: bisaRefund,
        NO_KELOMPOK: rawNoKelompok ? String(rawNoKelompok).trim() : "",
        TANGGAL_PENGAMBILAN: rawTanggalPengambilan || "2026-08-04"
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
        CLIENT_NAME: clientName,
        STATUS_QR: o.STATUS_QR || "",
        STATUS_PROJECT: o.STATUS_PROJECT || ""
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
          type,
          status: status || "DIKONFIRMASI"
        })
      });
      if (response.ok) {
        const textResponse = await response.text();
        const lowerText = textResponse.toLowerCase();
        let result = null;
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
          console.log(`[Server] Sync success to Google Sheets for order ${orderId}, row ${row || "auto"}`);
        } else {
          syncError = result ? result.error || "Google Sheets returned success: false" : `Google Apps Script returned invalid response`;
          console.warn(`[Server] Google Sheets sync failed: ${syncError}`);
        }
      } else {
        syncError = `HTTP status ${response.status}`;
        console.warn(`[Server] Google Sheets sync HTTP error: ${syncError}`);
      }
    } catch (err) {
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
app.post("/api/orders/group", async (req, res) => {
  const { orderId, noKelompok } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, message: "ORDER_ID atau CLIENT_ID wajib disertakan." });
  }
  let cleanNoKelompok = "";
  if (noKelompok !== void 0 && noKelompok !== null) {
    cleanNoKelompok = String(noKelompok).replace(/[^0-9]/g, "").trim();
  }
  if (cleanNoKelompok === "") {
    return res.status(400).json({ success: false, message: "NO_KELOMPOK harus berupa angka yang valid." });
  }
  const numericKelompok = Number(cleanNoKelompok);
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyz2irrGBi5tCo0cmot-OWIOxkTU0B66c5K1f9Y0jWVtCBENJJjNtvtzIoPXYcFSwpw/exec";
  let syncedWithSheets = false;
  let syncError = null;
  if (APPS_SCRIPT_URL) {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
          // Menghindari preflight CORS
        },
        body: JSON.stringify({
          action: "update_kelompok",
          order_id: orderId,
          no_kelompok: numericKelompok
        })
      });
      if (response.ok) {
        const textResponse = await response.text();
        const lowerText = textResponse.toLowerCase();
        let result = null;
        if (!lowerText.includes("<html") && !lowerText.includes("<!doctype") && !lowerText.includes("script function not found") && !lowerText.includes("page not found")) {
          try {
            result = JSON.parse(textResponse);
          } catch (e) {
            const trimmed = textResponse.trim().toUpperCase();
            if (trimmed === "OK" || trimmed === "SUCCESS" || trimmed.includes("SUCCESS")) {
              result = { status: "success" };
            }
          }
        }
        if (result && (result.success === true || result.status === "success" || result.result === "success")) {
          syncedWithSheets = true;
          console.log(`[Server] Group update success for order ${orderId} with kelompok ${numericKelompok}`);
        } else {
          syncError = result ? result.message || result.error || "Google Sheets returned status: error" : `Google Apps Script returned invalid response`;
          console.warn(`[Server] Group update failed: ${syncError}`);
        }
      } else {
        syncError = `HTTP status ${response.status}`;
        console.warn(`[Server] Group update HTTP error: ${syncError}`);
      }
    } catch (err) {
      syncError = err.message || "Unknown error";
      console.warn(`[Server] Failed to connect to APPS_SCRIPT_URL for group update: ${syncError}`);
    }
  }
  return res.json({
    success: syncedWithSheets,
    syncedWithSheets,
    syncError,
    noKelompok: numericKelompok
  });
});
app.get("/api/announcements", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const SPREADSHEET_ID = (process.env.SPREADSHEET_ID || "1jdwDEOGPDTWyj2buJTUfv-pm0FoBlkcIQ5ofWgHasyU").trim();
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent("Announcement")}&_t=${Date.now()}`;
  const FALLBACK_ANNOUNCEMENTS = [
    { ANN_ID: "ANN-02", PESAN: "Data & dokumenmu dijamin aman!", URUTAN: 1, IS_ACTIVE: true },
    { ANN_ID: "ANN-03", PESAN: "Harga pelajar, ramah di kantong", URUTAN: 2, IS_ACTIVE: true },
    { ANN_ID: "ANN-01", PESAN: "Pengerjaan cepat sesuai deadline yang disepakati", URUTAN: 3, IS_ACTIVE: true }
  ];
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }
    const text = await response.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/);
    if (!match) {
      throw new Error("Invalid response format from Google Sheets");
    }
    const data = JSON.parse(match[1]);
    if (data.status === "error" || !data.table || !data.table.cols) {
      throw new Error("Error or empty sheet returned");
    }
    const cols = data.table.cols.map((c) => (c.label || c.id || "").toUpperCase().trim());
    const parsedAnnouncements = (data.table.rows || []).map((r) => {
      const getColVal = (possibleNames, defaultIdx) => {
        if (r && r.c) {
          for (let i = 0; i < cols.length; i++) {
            if (possibleNames.includes(cols[i])) {
              const cell = r.c[i];
              return cell && cell.v !== null && cell.v !== void 0 ? cell.v : "";
            }
          }
          if (r.c[defaultIdx]) {
            const cell = r.c[defaultIdx];
            return cell && cell.v !== null && cell.v !== void 0 ? cell.v : "";
          }
        }
        return "";
      };
      const annId = String(getColVal(["ANN_ID", "ANN ID", "ID"], 0)).trim();
      const pesan = String(getColVal(["PESAN", "MESSAGE", "TEXT"], 1)).trim();
      const urutan = getColVal(["URUTAN", "ORDER"], 2);
      const isActive = getColVal(["IS_ACTIVE", "IS ACTIVE", "ACTIVE"], 3);
      return {
        ANN_ID: annId,
        PESAN: pesan,
        URUTAN: urutan,
        IS_ACTIVE: isActive
      };
    }).filter((item) => item.PESAN !== "");
    if (parsedAnnouncements.length === 0) {
      return res.json({ success: true, announcements: FALLBACK_ANNOUNCEMENTS });
    }
    return res.json({ success: true, announcements: parsedAnnouncements });
  } catch (err) {
    console.warn(`[Server] Announcements fetch failed (${err.message}), serving fallback.`);
    return res.json({ success: true, announcements: FALLBACK_ANNOUNCEMENTS });
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
