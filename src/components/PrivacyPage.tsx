import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, ExternalLink, Phone, Instagram, Lock, UserCheck } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
  onNavigatePolicy: () => void;
}

export default function PrivacyPage({ onBack, onNavigatePolicy }: PrivacyPageProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-6" id="privacy-page">
      {/* Back Navigation Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"
          id="btn-privacy-back"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          onClick={onNavigatePolicy}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          id="btn-switch-policy"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Syarat & Ketentuan &rarr;</span>
        </button>
      </div>

      {/* Main Document Container */}
      <div className="bg-white border border-blue-100/80 rounded-3xl p-6 md:p-10 shadow-xl shadow-blue-900/5 space-y-8">
        {/* Document Header */}
        <div className="border-b border-slate-100 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/60 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Perlindungan Data Pelanggan Dity Store</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-800 tracking-tight">
            KEBIJAKAN & PERLINDUNGAN PRIVASI DITY STORE
          </h1>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-sans">
            Selamat datang di Dity Store. Kami sangat menghargai privasi dan kepercayaan Anda sebagai pelanggan kami. Dokumen Kebijakan Privasi ini menjelaskan bagaimana Dity Store mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi yang Anda berikan saat melakukan pemesanan ID Card dan perlengkapan perkuliahan/kegiatan melalui formulir pendaftaran, situs web, atau kanal komunikasi resmi kami.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-sans bg-slate-50 p-4 rounded-2xl border border-slate-100">
            Dengan mengakses layanan, mengisi formulir pemesanan, atau bertransaksi di Dity Store, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan dalam Kebijakan Privasi ini.
          </p>
        </div>

        {/* Document Sections */}
        <div className="space-y-8 text-xs md:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              1. INFORMASI & DATA YANG KAMI KUMPULKAN
            </h2>
            <p>
              Untuk memproses pemesanan ID Card dan kebutuhan PKKMB/Kampus Anda, Dity Store mengumpulkan data pribadi yang Anda salurkan secara langsung melalui formulir pendaftaran (Google Forms/Website), meliputi:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 text-blue-600">
                  <UserCheck className="w-4 h-4" />
                  <span>Data Identitas Diri</span>
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                  <li>Nama Lengkap (sesuai inputan pemesan)</li>
                  <li>Fakultas dan Program Studi (Prodi)</li>
                  <li>Jalur Kelulusan dan Sekolah Asal</li>
                  <li>Pasfoto / Foto Diri (jika diperlukan pada template)</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 text-purple-600">
                  <Instagram className="w-4 h-4" />
                  <span>Data Kontak & Sosial Media</span>
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                  <li>Alamat Email Aktif</li>
                  <li>Nomor Telepon / WhatsApp</li>
                  <li>Username Instagram / Tautan (Link) QR Code Instagram</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 text-emerald-600">
                  <Lock className="w-4 h-4" />
                  <span>Data Transaksi & Berkas</span>
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                  <li>Bukti Pembayaran / Transfer Bank / E-Wallet</li>
                  <li>Tautan (Link) Berkas Google Drive (misalnya file QR Code atau foto)</li>
                  <li>Catatan khusus atau instruksi tambahan terkait pesanan</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              2. TUJUAN PENGGUNAAN DATA PRIBADI
            </h2>
            <p>
              Seluruh data pribadi yang dikumpulkan oleh Dity Store hanya digunakan untuk kepentingan operasional dan pemenuhan pesanan Anda, antara lain:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><b>Produksi & Desain Produk:</b> Memproses cetak nama, prodi, fakultas, foto, dan QR Code ke dalam ID Card fisik maupun file pratinjau digital (folder Project).</li>
              <li><b>Komunikasi & Verifikasi:</b> Mengirimkan konfirmasi pesanan, tautan pratinjau desain (proofreading), pemberitahuan status produksi, dan pembaruan pengiriman via WhatsApp, Telegram, atau Email.</li>
              <li><b>Pencatatan & Pembukuan Internal:</b> Menghitung transaksi, riwayat status pesanan, serta integrasi sistem otomatisasi internal Dity Store.</li>
              <li><b>Layanan Pelanggan & Garansi:</b> Memverifikasi identitas pemesan saat pengambilan barang mandiri (self pickup) maupun saat proses pengajuan garansi/klaim cacat produksi.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              3. KERAHASIAAN & PERLINDUNGAN DATA
            </h2>
            <p>
              Dity Store berkomitmen penuh untuk menjaga kerahasiaan data pribadi Anda:
            </p>
            <div className="space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/80">
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li><b>Tidak Memperjualbelikan Data:</b> Dity Store menjamin 100% bahwa data pribadi Anda (termasuk email, nomor WhatsApp, foto, dan akun sosial media) tidak akan pernah dijual, disewakan, dipindahtangankan, atau dibagikan kepada pihak ketiga untuk kepentingan komersial, promosi spam, atau pemasaran pihak luar.</li>
                <li><b>Penyimpanan Aman:</b> Data Anda disimpan secara terenkripsi dalam basis data internal Dity Store, penyimpanan atau aplikasi pihak ketiga pendukung lain yang dilindungi oleh otentikasi keamanan ganda.</li>
                <li><b>Akses Terbatas:</b> Hanya tim operasional dan Customer Service resmi Dity Store yang memiliki akses ke data pemesan demi kelancaran proses produksi dan pengiriman.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              4. PENGGUNAAN LAYANAN PIHAK KETIGA
            </h2>
            <p>
              Dalam menjalankan operasional, Dity Store memanfaatkan beberapa infrastruktur teknologi terpercaya:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><b>Google Workspace (Drive, Forms, Sheets):</b> Digunakan untuk formulir pemesanan, penyimpanan file QR Code/foto, serta pembuatan desain ID Card digital.</li>
              <li><b>Jasa Ekspedisi / Kurir:</b> Jika Anda memilih metode pengiriman via kurir, informasi berupa Nama, Alamat Pengiriman, dan Nomor WhatsApp akan dibagikan secara terbatas kepada pihak ekspedisi terkait demi kelancaran pengantaran paket.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              5. HAK PEMESAN TERHADAP DATA PRIBADI
            </h2>
            <p>
              Sebagai pemilik data, Anda memiliki hak-hak berikut:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><b>Hak Memeriksa & Mengoreksi Data:</b> Anda berhak memeriksa kembali data yang tertera pada file pratinjau digital dan meminta koreksi nama/ejaan sebelum proses cetak fisik berjalan.</li>
              <li><b>Hak Menghapus Data (Data Deletion):</b> Setelah transaksi selesai, produk fisik telah diterima, dan masa berlaku garansi (24 jam) berakhir, Anda dapat menghubungi Customer Service kami untuk meminta penghapusan file foto atau berkas QR Code pribadi Anda dari penyimpanan internal kami.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              6. PEMBARUAN KEBIJAKAN PRIVASI
            </h2>
            <p>
              Dity Store berhak untuk memperbarui atau mengubah Kebijakan Privasi ini sewaktu-waktu demi menyesuaikan dengan perkembangan layanan, teknologi, atau ketentuan hukum yang berlaku. Setiap perubahan akan berlaku sejak dipublikasikan di kanal komunikasi resmi Dity Store. Kami menyarankan Anda untuk memeriksa halaman ini secara berkala.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              7. HUBUNGI KAMI
            </h2>
            <p className="text-slate-600">
              Jika Anda memiliki pertanyaan, kendala terkait privasi data, atau permintaan penghapusan berkas pribadi, silakan hubungi Customer Service kami:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="https://wa.me/62895634048237"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl text-emerald-900 transition-all cursor-pointer group"
                id="privacy-link-whatsapp"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">WhatsApp CS</span>
                  <span className="text-xs font-bold font-sans flex items-center gap-1 group-hover:underline">
                    <span>Official Dity Store Admin (+62 895-6340-48237)</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>

              <a
                href="https://instagram.com/dity.storee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 rounded-2xl text-purple-900 transition-all cursor-pointer group"
                id="privacy-link-instagram"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-600/20">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Instagram</span>
                  <span className="text-xs font-bold font-sans flex items-center gap-1 group-hover:underline">
                    <span>Dity Store Service (@dity.storee)</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
