export type OrderStatus = 'DIPROSES' | 'DIKERJAKAN' | 'DIBUAT' | 'SIAP DIAMBIL' | 'SELESAI' | 'DIBATALKAN';

export interface ParsedOrderData {
  kampus: string;
  fakultas: string;
  prodi: string;
  sma: string;
  jalur: string;
  jenisUniv: string;
  jenisFak: string;
  ig: string;
  warnaBendera?: string;
  warnaTali?: string;
  warnaBenderaUniv?: string;
  warnaBenderaFak?: string;
  warnaTaliUniv?: string;
  warnaTaliFak?: string;
  ukuranCaseUniv?: string;
  ukuranCaseFak?: string;
}

export interface Order {
  id: string;          // ORDER_ID
  clientId: string;    // CLIENT_ID (email)
  clientName?: string; // Mapped name from Form Responses 1
  contact: string;     // CONTACT (WhatsApp formatted number)
  status: OrderStatus; // STATUS
  totalPrice: string;  // TOTAL_PRICE
  createdAt: string;   // CREATED_AT
  finishedAt: string;  // FINISHED_AT
  orderData: string;   // ORDER_DATA raw string
  gformRow: string;    // GFORM_ROW index
  parsedData: ParsedOrderData;
  linkQr?: string;       // LINK_QR
  linkClient?: string;   // LINK_CLIENT
  linkProject?: string;  // LINK_PROJECT
  statusQr?: string;     // STATUS_QR
  statusProject?: string; // STATUS_PROJECT
  statusUniv?: string;   // STATUS_UNIV
  statusFak?: string;    // STATUS_FAK
  warnaBendera?: string; // WARNA_BENDERA
  warnaTali?: string;    // WARNA_TALI
  warnaBenderaUniv?: string; // WARNA_BENDERA_UNIV
  warnaBenderaFak?: string;  // WARNA_BENDERA_FAK
  warnaTaliUniv?: string;    // WARNA_TALI_UNIV
  warnaTaliFak?: string;     // WARNA_TALI_FAK
  ukuranCaseUniv?: string;   // UKURAN_CASE_UNIV
  ukuranCaseFak?: string;    // UKURAN_CASE_FAK
  bisaRefund?: boolean;      // BISA_REFUND
  noKelompok?: string;       // NO_KELOMPOK
  tanggalPengambilan?: string; // TANGGAL_PENGAMBILAN
  jamPengambilan?: string;     // JAM_PENGAMBILAN
}
