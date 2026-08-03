import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, FileText, ExternalLink, Phone, Instagram } from 'lucide-react';

interface PolicyPageProps {
  onBack: () => void;
  onNavigatePrivacy: () => void;
}

export default function PolicyPage({ onBack, onNavigatePrivacy }: PolicyPageProps) {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const elementId = hash.replace(/^#/, '');
      const el = document.getElementById(elementId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-6" id="policy-page">
      {/* Back Navigation Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"
          id="btn-policy-back"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          onClick={onNavigatePrivacy}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          id="btn-switch-privacy"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Kebijakan Privasi &rarr;</span>
        </button>
      </div>

      {/* Main Document Container */}
      <div className="bg-white border border-blue-100/80 rounded-3xl p-6 md:p-10 shadow-xl shadow-blue-900/5 space-y-8">
        {/* Document Header */}
        <div className="border-b border-slate-100 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100/60 text-[11px] font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumen Resmi Dity Store</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-800 tracking-tight">
            SYARAT & KETENTUAN LAYANAN DITY STORE
          </h1>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-sans">
            Selamat datang di Dity Store. Terima kasih telah mempercayakan kebutuhan ID Card dan perlengkapan perkuliahan/kegiatan Anda kepada kami.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-sans bg-slate-50 p-4 rounded-2xl border border-slate-100">
            Sebelum melakukan pemesanan, mohon membaca dan memahami Syarat & Ketentuan di bawah ini. Dengan melakukan pemesanan, pembayaran, atau pengisian formulir pemesanan di Dity Store, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan yang berlaku.
          </p>
        </div>

        {/* Document Sections */}
        <div className="space-y-8 text-xs md:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3" id="ketentuan">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              1. KETENTUAN UMUM & CATATAN KHUSUS
            </h2>
            <p>
              Dity Store menyediakan layanan pembuatan desain, pencetakan ID Card (Universitas & Fakultas), tali lanyards/gantung, serta wadah/mika ID Card (Card Case).
            </p>
            <p>
              Seluruh transaksi pemesanan dilakukan secara resmi melalui formulir pendaftaran (Google Forms/Website) dan sistem verifikasi otomatis Dity Store.
            </p>
            <div className="space-y-2 pt-1 bg-blue-50/40 p-4 rounded-2xl border border-blue-100/60">
              <span className="font-bold text-slate-800 text-xs block uppercase tracking-wider text-blue-700">Catatan & Disclaimer Produk:</span>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                <li>Gambar visual yang ditampilkan pada media promosi/katalog merupakan pratinjau (preview) desain untuk memberikan gambaran hasil akhir saat dicetak. Tersedia semua varian desain untuk fakultas lainnya.</li>
                <li>Layout dan tata letak elemen desain dapat disesuaikan sewaktu-waktu demi memastikan ID Card Anda selalu mematuhi aturan & ketentuan resmi dari panitia PKKMB / pihak Kampus.</li>
                <li>Detail model card case (mika) atau variasi tali dapat berbeda tergantung ketersediaan stok bahan di pasaran, namun standar kualitas produk tetap terjamin.</li>
                <li>Dity Store berhak memperbarui atau mengubah Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Versi terbaru akan selalu berlaku untuk setiap pesanan baru.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3" id="akurasi">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              2. PEMESANAN, AKURASI DATA, & VERIFIKASI (PROOFREADING)
            </h2>
            <p>
              Pemesan wajib mengisikan data diri secara benar, lengkap, dan akurat pada formulir pemesanan, meliputi:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-medium text-slate-800">
              <li>Nama Lengkap (penulisan besar/kecil huruf sesuai keinginan pemesan)</li>
              <li>Fakultas & Program Studi (Prodi)</li>
              <li>Jalur Kelulusan & Sekolah Asal</li>
              <li>Username Instagram / Tautan QR Code</li>
              <li>Alamat Email Aktif & Nomor WhatsApp</li>
            </ul>

            <div className="space-y-2 pt-2">
              <span className="font-bold text-slate-900 block">Tanggung Jawab Ejaan & Proofreading:</span>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Dity Store memproses data secara otomatis sesuai dengan data yang Anda ketikkan di formulir pemesanan. Kesalahan ketik (typo), kesalahan ejaan nama, atau kesalahan informasi yang berasal dari input pemesan bukan merupakan tanggung jawab Dity Store.</li>
                <li>Dity Store memberikan sarana pratinjau digital (file di folder Project) dan mengimbau pemesan untuk memeriksa kembali data yang tertera.</li>
                <li>Apabila pemesan sudah diinstruksikan untuk mengecek dan melaporkan kesalahan data/desain namun tidak melaporkannya sebelum proses pencetakan berjalan, maka seluruh kesalahan pada hasil cetak fisik menjadi tanggung jawab penuh pemesan dan tidak berlaku fasilitas cetak ulang gratis maupun refund.</li>
                <li>Perubahan data setelah formulir dikirimkan wajib segera dikomunikasikan kepada Customer Service selama status pesanan belum masuk tahap pencetakan.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3" id="pembayaran">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              3. PEMBAYARAN & HARGA
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>Harga yang berlaku adalah harga yang tertera pada saat pemesanan dikonfirmasi oleh sistem Dity Store.</li>
              <li>Pemesanan baru akan diproses dan dimasukkan ke dalam antrean produksi setelah pembayaran dikonfirmasi lunas atau sesuai dengan kesepakatan uang muka (DP).</li>
              <li>Bukti pembayaran resmi wajib diunggah/dikirimkan melalui kanal resmi Dity Store.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3" id="spesifikasi">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              4. SPESIFIKASI PRODUKSI & TOLERANSI
            </h2>
            <div className="space-y-2">
              <p className="font-bold text-slate-800">Ukuran Card Case (Mika):</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>ID Card Universitas secara standar menggunakan Card Case B4. Ukuran sewaktu-waktu dapat diubah menyesuaikan ketentuan valid yang berlaku.</li>
                <li>ID Card Fakultas secara standar menggunakan Card Case B2. Ukuran sewaktu-waktu dapat diubah menyesuaikan ketentuan valid yang berlaku.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-800">Warna Tali & Bendera:</p>
              <p className="text-slate-600">
                Warna Tali Lanyard dan Bendera Fakultas disesuaikan secara otomatis berdasarkan standar identitas fakultas yang terdaftar di sistem Dity Store. Warna sewaktu-waktu dapat diubah menyesuaikan ketentuan valid yang berlaku.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-800">Toleransi Warna Cetak:</p>
              <p className="text-slate-600">
                Perbedaan minor antara tampilan warna layar digital (RGB) dan hasil cetak fisik (CMYK/Sublim/Digital Print) merupakan toleransi teknis yang wajar dalam dunia percetakan dan bukan merupakan cacat produksi.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4" id="refund">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              5. KEBIJAKAN PEMBATALAN & PENGEMBALIAN DANA (REFUND)
            </h2>
            <p>
              Pengajuan pembatalan pesanan dan besaran pengembalian dana (refund) diatur secara mengikat berdasarkan status pemrosesan pesanan yang tercatat di sistem Dity Store pada saat permohonan diajukan:
            </p>

            {/* Refund Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Status Pesanan Saat Pengajuan</th>
                    <th className="p-3 text-center">Persentase Refund</th>
                    <th className="p-3">Keterangan / Ketentuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-blue-600 font-mono">DIPROSES</td>
                    <td className="p-3 text-center font-extrabold text-emerald-600 bg-emerald-50/50">100%</td>
                    <td className="p-3 text-slate-600">Pesanan belum masuk antrean desain/cetak. Dana dikembalikan penuh.</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-orange-600 font-mono">DIKERJAKAN</td>
                    <td className="p-3 text-center font-extrabold text-orange-600 bg-orange-50/50">80%</td>
                    <td className="p-3 text-slate-600">Berkas desain digital/project sedang dikerjakan. Terpotong biaya administrasi & desain.</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-amber-600 font-mono">DIBUAT</td>
                    <td className="p-3 text-center font-extrabold text-amber-600 bg-amber-50/50">50%</td>
                    <td className="p-3 text-slate-600">Pesanan sudah masuk tahap antrean pencetakan fisik/persiapan bahan baku.</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-600 font-mono">SIAP DIAMBIL / SELESAI</td>
                    <td className="p-3 text-center font-extrabold text-rose-600 bg-rose-50/50">0%</td>
                    <td className="p-3 text-slate-600">Produk cetak fisik telah selesai diproduksi. Tidak dapat di-refund.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <p className="font-bold text-slate-800">Catatan Tambahan:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Jika pembatalan terjadi akibat kendala internal dari pihak Dity Store (misalnya stok bahan habis total dan tidak dapat dipenuhi), pengembalian dana diberikan sebesar 100%.</li>
                <li>Proses pengembalian dana dilakukan melalui transfer bank atau e-wallet dalam waktu 1-3 hari kerja.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3" id="garansi">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              6. KETENTUAN GARANSI & KLAIM CACAT PRODUKSI
            </h2>
            <p>
              Dity Store memberikan garansi kualitas produk dengan ketentuan ketat sebagai berikut:
            </p>
            <p className="font-semibold text-slate-800">
              Masa Berlaku Garansi: <span className="text-rose-600">Klaim garansi wajib diajukan maksimal 24 jam</span> setelah produk fisik dipakai atau digunakan oleh pemesan.
            </p>

            <div className="space-y-2">
              <p className="font-bold text-slate-800">Syarat Klaim:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Garansi hanya berlaku untuk cacat fisik yang terbukti berasal dari kesalahan produksi atau bahan mentah Dity Store (seperti mika sobek sejak awal, tali putus sebelum dipakai, atau tinta cetak luntur/blur parah dari pabrik).</li>
                <li>Pemesan wajib menyertakan bukti foto/video unboxing atau bukti fisik produk yang rusak secara jelas saat menghubungi Customer Service.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-800">Pengecualian Garansi (Garansi Gugur):</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Kerusakan yang disebabkan oleh kelalaian penggunaan pemesan (terjatuh, ditarik paksa, tersiram cairan, atau terlipat secara sengaja/tidak sengaja setelah lewat 24 jam).</li>
                <li>Kesalahan cetak data (nama/prodi/foto) yang disebabkan oleh kesalahan pengisian formulir oleh pemesan sendiri atau karena pemesan tidak melaporkan koreksi pada masa proofreading.</li>
              </ul>
            </div>

            <p className="text-slate-700 font-medium">
              <b>Bentuk Pertanggungjawaban:</b> Jika klaim garansi dinyatakan valid dan memenuhi syarat, Dity Store akan memberikan ganti rugi berupa cetak ulang unit baru / penggantian komponen rusak secara gratis.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3" id="pengiriman">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              7. PENGAMBILAN & PENGIRIMAN
            </h2>
            <div className="space-y-2">
              <p className="font-bold text-slate-800">Pengambilan Mandiri (Self Pickup):</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Pemesan dapat mengambil ID Card di titik pengambilan (pickup point) Dity Store sesuai jadwal operasional.</li>
                <li>Pemesan wajib menunjukkan Bukti Pemesanan / Order ID / Nama Pemesan saat mengambil barang.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-800">Pengiriman via Kurir/Ekspedisi:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Dity Store memastikan seluruh barang dikemas rapat dan aman sebelum diserahkan ke kurir.</li>
                <li>Keterlambatan delivery atau kerusakan akibat kelalaian pihak ekspedisi di luar kendali Dity Store, namun Dity Store siap membantu menjembatani komunikasi klaim ke pihak ekspedisi.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-3" id="haki">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              8. HAK KEKAYAAN INTELEKTUAL & KERAHASIAAN DATA
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Data pribadi (Foto, QR Code, Nama, Email, Nomor WhatsApp) yang diunggah pemesan hanya digunakan untuk kepentingan produksi pesanan dan operasional internal Dity Store.</li>
              <li>Dity Store menjamin kerahasiaan data pemesan dan tidak akan memperjualbelikan data pribadi kepada pihak ketiga.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-4 pt-4 border-t border-slate-100" id="kontak">
            <h2 className="text-sm md:text-base font-bold text-slate-900 font-display flex items-center gap-2 border-l-4 border-blue-500 pl-3">
              9. HUBUNGI KAMI
            </h2>
            <p className="text-slate-600">
              Untuk pertanyaan, koreksi data sebelum cetak, atau pengajuan klaim garansi, silakan hubungi layanan pelanggan resmi kami:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="https://wa.me/62895634048237"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl text-emerald-900 transition-all cursor-pointer group"
                id="policy-link-whatsapp"
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
                id="policy-link-instagram"
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
