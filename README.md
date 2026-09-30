# Caesar Cipher Toolkit

Desain antarmuka (UI Design) proyek ini dapat diakses dan ditinjau pada tautan Figma berikut:  
https://www.figma.com/design/I8XwtgdCFoEK9Ae1jvOx8i/Caesar-Cipher?node-id=0-1&t=AE0SnTTUwAlbGurk-1

---

## Identitas Kelompok

- **Mata Kuliah**: Kriptografi dan Keamanan Informasi
- **Kelas**: KOM A
- **Kelompok**: Kelompok 6 KOM A

### Anggota Kelompok:

1. 555306 - Gradient
2. 555851 - Gauza
3. 561611 - Nidya
4. 564999 - Aziz
5. 568048 - Sadhu

---

## Deskripsi Aplikasi

Caesar Cipher Toolkit merupakan aplikasi web interaktif yang dikembangkan untuk memfasilitasi demonstrasi, analisis matematis, serta pengujian algoritma kriptografi klasik Caesar Cipher (Shift Cipher).

---

## Landasan Teori

Caesar Cipher merupakan algoritma kriptografi substitusi monoalfabetik klasik di mana setiap huruf pada teks terang (*plaintext*) digantikan oleh huruf lain yang memiliki selisih pergeseran tertentu dalam urutan alfabet.

Secara matematis, proses enkripsi dan dekripsi dinyatakan dalam rumus aritmetika modulo berikut:

1. **Fungsi Enkripsi**:
   $$E(x) = (x + n) \pmod{26}$$

2. **Fungsi Dekripsi**:
   $$D(x) = (x - n) \pmod{26}$$

Keterangan parameter:
- $x$ merepresentasikan nilai numerik huruf alfabet dalam rentang $[0, 25]$, di mana $A = 0, B = 1, \dots, Z = 25$.
- $n$ merupakan kunci pergeseran (*shift key*) yang berada pada rentang $[1, 25]$.
- Operator $\pmod{26}$ memastikan hasil pergeseran tetap berada dalam rentang alfabet 26 huruf (menangani proses *wrap-around* dari $Z$ ke $A$ dan sebaliknya).
- Karakter non-alfabetik (seperti spasi, angka, dan tanda baca) dipertahankan tanpa perubahan nilai.

---

## Arsitektur Sistem

Aplikasi dibangun menggunakan arsitektur perangkat lunak berbasis komponen dengan framework Next.js (App Router) dan TypeScript. Seluruh penamaan berkas modul dan komponen mengadopsi standar konvensi *kebab-case*.

### Struktur Direktori

```text
caesar-cipher-kelompok6/
├── app/
│   ├── cipher.css            # Lembar gaya utama (tema, tata letak, dan responsivitas)
│   ├── globals.css           # Konfigurasi dasar Tailwind CSS
│   ├── layout.tsx            # Berkas tata letak utama dan metadata dokumen
│   └── page.tsx              # Komponen halaman utama (state orchestrator)
├── components/               # Komponen antarmuka pengguna modular (kebab-case)
│   ├── brute-force-panel.tsx # Panel analisis pemecahan brute force
│   ├── crypt-panel.tsx       # Panel interaktif enkripsi dan dekripsi
│   ├── footer.tsx            # Komponen identitas anggota kelompok
│   ├── header.tsx            # Komponen judul dan representasi rumus
│   ├── test-cases-panel.tsx  # Panel suite pengujian kasus uji otomatis
│   ├── wheel.tsx             # Komponen visualisasi interaktif roda cipher
│   └── ui/                   # Komponen utilitas antarmuka dasar
├── lib/                      # Modul fungsi murni dan logika algoritma
│   ├── caesar.ts             # Logika inti enkripsi, dekripsi, scoring, dan diagnosa
│   └── utils.ts              # Fungsi utilitas penggabungan kelas styling
├── public/                   # Aset statis, Apple Touch Icon, dan Favicon
└── package.json              # Dependensi dan skrip proyek
```

### Prinsip Pemisahan Lapisan (Separation of Concerns)

1. **Lapisan Logika Bisnis (`lib/caesar.ts`)**:
   Berisi kumpulan fungsi murni (*pure functions*) yang menangani kalkulasi kriptografi, analisis frekuensi kata, serta pembuatan pesan diagnostik. Lapisan ini terisolasi dari kode tampilan antarmuka sehingga menjamin kode bersifat independen, mudah diuji, dan dapat digunakan kembali.

2. **Lapisan Komponen Antarmuka (`components/*.tsx`)**:
   Masing-masing fitur dibagi ke dalam modul komponen mandiri yang bertanggung jawab atas representasi visual dan menerima data serta *callback event* melalui *props*. Pendekatan ini meminimalkan kompleksitas kode dan mencegah penumpukan logika pada satu berkas.

3. **Lapisan Orkestrasi Halaman (`app/page.tsx`)**:
   Bertindak sebagai pengelola status aplikasi tingkat atas (*top-level state manager*) yang mengoordinasikan pergantian tab, nilai masukan pengguna, status pengujian, serta sinkronisasi data antar komponen.

### Rasionalisasi Pemilihan Framework (Mengapa Next.js?)

Pemilihan framework **Next.js** (berbasis React dan TypeScript) untuk proyek Caesar Cipher Toolkit didasarkan pada perbandingan teknis terhadap sejumlah alternatif teknologi lain (seperti Vanilla HTML/CSS/JavaScript, React SPA murni dengan Vite/Create React App, maupun framework lain seperti Vue/Nuxt atau Svelte):

1. **Reaktivitas Deklaratif dan Sinkronisasi Status Waktu Nyata (*vs. Vanilla JavaScript*)**:
   - Pada aplikasi ini, perubahan nilai kunci (*shift key*) memerlukan pembaruan simultan pada visualisasi roda sandi konsentris (SVG), teks keluaran enkripsi/dekripsi, serta indikator pergeseran secara instan.
   - Menggunakan Vanilla JavaScript mengharuskan manipulasi DOM imperatif secara manual (`document.getElementById`, `addEventListener`), yang rawan memicu inkonsistensi status (*state divergence*) dan kode yang sulit dirawat (*spaghetti code*).
   - Next.js memanfaatkan paradigma deklaratif React: setiap kali nilai kunci atau teks berubah, siklus rendering memutakhirkan seluruh antarmuka secara terprediksi dan efisien.

2. **Arsitektur Berbasis Komponen yang Bersih dan Modular (*Component-Driven Architecture*)**:
   - Seluruh modul fungsional (seperti `CryptPanel`, `BruteForcePanel`, `TestCasesPanel`, dan `Wheel`) diisolasi dalam berkas independen dengan konvensi *kebab-case*.
   - Pemisahan ini memungkinkan setiap anggota tim mengembangkan dan menguji komponen secara terpisah tanpa risiko konflik kode pada satu berkas monolitik.

3. **Integrasi TypeScript Tingkat Pertama Tanpa Konfigurasi Manual (*Type Safety*)**:
   - Operasi aritmetika modulo pada Caesar Cipher menuntut ketelitian tipe data yang ketat (misalnya rentang nilai kunci, representasi karakter ASCII, dan validasi masukan).
   - Next.js menyediakan lingkungan TypeScript bawaan (*zero-config*) yang memberikan verifikasi tipe saat waktu kompilasi (*compile-time checking*), mencegah potensi *runtime errors* atau salah penanganan tipe data numerik.

4. **Sistem Tata Letak dan Manajemen Metadata Deklaratif (*Next.js App Router*)**:
   - Melalui berkas `app/layout.tsx`, pengelolaan metadata dokumen seperti judul, deskripsi, favicon multi-resolusi (`icon-light-32x32.png`, `icon-dark-32x32.png`), Apple Touch Icon (`apple-icon.png`), serta pengaturan tema warna gelap (*dark mode*) dilakukan secara terpusat dan terstruktur tanpa manipulasi tag `<head>` HTML manual.

5. **Pengalaman Pengembangan Cepat (*Fast Refresh & Turbopack*)**:
   - Fitur *Fast Refresh* pada Next.js mempertahankan status aplikasi (*state preservation*) saat kode diperbarui, memungkinkan pengujian dan penyesuaian logika algoritma serta tata letak antarmuka berjalan lancar tanpa kehilangan teks yang sedang diuji.

6. **Optimasi Aset dan Kesiapan Penerapan Produksi (*Production Readiness*)**:
   - Next.js secara otomatis melakukan *tree-shaking*, minifikasi kode, dan kompresi aset statis saat proses *build* produksi. Hal ini menghasilkan muatan berkas (*bundle size*) yang sangat ringkas dan waktu muat halaman awal (*First Contentful Paint*) yang sangat cepat ketika di-deploy ke lingkungan komputasi awan.

---

## Penjelasan Fitur Aplikasi

### 1. Panel Enkripsi dan Dekripsi Interaktif (`CryptPanel`)
Fitur ini menyediakan antarmuka dua arah untuk melakukan transformasi teks secara waktu nyata (*real-time*).
- **Pengaturan Nilai Kunci (*Key Shift*)**: Pengguna dapat menentukan nilai pergeseran $n$ dari 1 hingga 25 menggunakan kendali *slider* horizontal maupun kotak masukan angka yang saling tersinkronisasi. Nilai default awal kunci diatur pada angka 1.
- **Roda Sandi Visual (*Cipher Wheel*)**: Komponen grafis berbasis SVG yang menggambarkan dua lingkaran konsentris. Lingkaran luar menampilkan alfabet teks terang (*plaintext*), sementara lingkaran dalam menampilkan alfabet sandi (*ciphertext*) yang berputar secara dinamis sesuai pergeseran nilai $n$.
- **Transformasi Teks Dua Arah**: Mendukung mode Enkripsi (*Plaintext* menjadi *Ciphertext*) dan mode Dekripsi (*Ciphertext* menjadi *Plaintext*).
- **Penyalinan Hasil (*Copy to Clipboard*)**: Dilengkapi tombol salin satu kali klik dengan indikator umpan balik visual (*Copied!*) untuk mempermudah pengguna menyalin hasil keluaran.
- **Penanganan Karakter Komprehensif**: Mendukung huruf kapital maupun huruf kecil dengan mempertahankan status *case sensitivity*, serta mempertahankan karakter khusus (angka, spasi, simbol) tanpa distorsi.

### 2. Panel Analisis Brute Force (`BruteForcePanel`)
Fitur ini berfungsi untuk membuktikan kelemahan ruang kunci (*keyspace*) Caesar Cipher yang hanya berjumlah 25 kemungkinan kunci non-trivial.
- **Pencarian Komprehensif Seluruh Kunci**: Sistem melakukan dekripsi teks masukan secara otomatis ke dalam 25 variasi pergeseran kunci secara instan.
- **Algoritma Deteksi Kata Masuk Akal (*Dictionary Scoring*)**: Sistem menganalisis setiap baris keluaran dekripsi dengan membandingkannya terhadap daftar kosakata umum bahasa Indonesia dan bahasa Inggris.
- **Penanda Hasil Paling Mungkin (*Best Match Badge*)**: Baris yang memperoleh skor kesesuaian kata tertinggi secara otomatis ditandai dengan badge khusus bertuliskan `Paling mungkin`. Badge ini diletakkan berdampingan langsung di sebelah kanan teks hasil dekripsi untuk keterbacaan yang optimal.
- **Penyedia Sampel Uji Cepat**: Tombol bantuan untuk memuat contoh *ciphertext* terenkripsi agar pengguna dapat langsung menguji fungsionalitas algoritma brute force tanpa harus mengetik manual.

### 3. Panel Suite Kasus Uji dan Diagnostik Sistem (`TestCasesPanel`)
Fitur ini menyediakan lingkungan pengujian unit otomatis (*automated unit test suite*) untuk memverifikasi kebenaran implementasi algoritma dan mengedukasi pengguna mengenai potensi galat pemrograman.
- **8 Skenario Kasus Uji Standar**:
  1. *Huruf besar*: Memverifikasi penanganan teks kapital penuh.
  2. *Huruf kecil*: Memverifikasi penanganan teks huruf kecil penuh.
  3. *Huruf campuran + tanda baca*: Menguji integritas pergeseran pada kalimat majemuk.
  4. *Angka & simbol tidak berubah*: Memastikan karakter numerik dan simbol tidak termutasi.
  5. *Wrap-around Z ke A (enkripsi)*: Memverifikasi perputaran alfabet pada batas akhir ke awal.
  6. *Wrap-around A ke Z (dekripsi)*: Memverifikasi perputaran alfabet mundur pada operasi dekripsi.
  7. *Key 13 (ROT13)*: Menguji pergeseran simetris separuh alfabet.
  8. *Round-trip enkripsi lalu dekripsi*: Menguji konsistensi restorasi data awal setelah melalui dua proses transformasi berturut-turut.
- **Simulasi Galat (*Bug Simulation*)**: Pengguna dapat mengaktifkan opsi simulasi kesalahan untuk melihat dampak implementasi algoritma tanpa operasi modulo 26.
- **Sistem Diagnostik Cerdas**: Jika pengujian gagal, aplikasi menyajikan analisis komputasi mendalam yang menerangkan karakter pertama yang tidak cocok, posisi indeks yang bermasalah, serta penjelasan matematis mengenai alasan kegagalan perhitungan.
- **Siklus Status Interaktif**: Pengujian awal disajikan dalam kondisi tertutup (*collapsed*). Pengguna dapat mengeksekusi pengujian secara individual maupun serentak (*Run All*). Tombol *Run* akan berganti fungsi menjadi tombol *Reset*, dan menekan *Reset* akan mengembalikan status ke kondisi semula (*NOT RUN*).

### 4. Optimalisasi Tampilan dan Responsivitas Mobile
- **Hierarki Kontras Tinggi**: Seluruh label panduan, teks deskriptif, dan status pengujian dirancang dengan warna putih berdefinisi tinggi di atas latar belakang *Midnight Navy* (`#0A1128`) untuk memastikan tingkat keterbacaan (*readability*) yang maksimal.
- **Tata Letak Baris Tunggal pada Perangkat Seluler**: Formula matematis pada bagian atas dan indikator status pengujian dioptimalkan dengan aturan penataan responsif agar tetap berada dalam satu baris horizontal tanpa mengalami pemotongan baris (*line wrapping*) yang canggung pada layar ponsel.
- **Ikon Aplikasi Apple Touch Kustom**: Dilengkapi aset grafis ikon resolusi tinggi berformat Apple Touch Icon bertema roda kriptografi emas klasik untuk favicon browser dan pintasan layar beranda.

---

## Petunjuk Penggunaan dan Instalasi

### Prasyarat Sistem
- Node.js versi 18.17.0 atau versi yang lebih baru.
- Pengelola paket npm, pnpm, atau yarn.

### Langkah Instalasi

1. **Buka Direktori Proyek**:
   ```bash
   cd d:\caesar-cipher-kelompok6
   ```

2. **Pasang Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Lingkungan Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban web pada alamat `http://localhost:3000`.

4. **Kompilasi Lingkungan Produksi**:
   ```bash
   npm run build
   npm run start
   ```

---

## Teknologi yang Digunakan

- **Framework Web**: Next.js 16 (App Router)
- **Bahasa Pemrograman**: TypeScript
- **Pustaka Antarmuka**: React 19
- **Tata Letak & Gaya**: Tailwind CSS 4 dan berkas CSS kustom (`cipher.css`)
- **Tipografi**: Inter dan JetBrains Mono via Google Fonts
