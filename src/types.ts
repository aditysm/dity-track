export type OrderStatus = 'DIPROSES' | 'DIKERJAKAN' | 'SIAP DIAMBIL' | 'SELESAI' | 'DIBATALKAN';

export interface ParsedOrderData {
  kampus: string;
  fakultas: string;
  prodi: string;
  sma: string;
  jalur: string;
  jenisUniv: string;
  jenisFak: string;
  ig: string;
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
}
