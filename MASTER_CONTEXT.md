# 🧠 BK Insight - Master Context & Handover

**Dokumen ini adalah ringkasan inti dari seluruh konteks proyek, riwayat keputusan, dan aturan main (guidelines) dari BK Insight. Dokumen ini berfungsi sebagai "Otak Tambahan" atau memori jangkar (anchor memory).** 
*Bagi AI/Agent yang akan melanjutkan proyek ini esok hari, BACA DOKUMEN INI SEBELUM MELAKUKAN PERUBAHAN APAPUN pada kode.*

---

## 🎯 1. Identitas, Visi Proyek & Target Demografis
- **Nama Proyek:** BK Insight (Platform Bimbingan Konseling Digital)
- **Target Pengguna:** 
  - **Siswa:** Anak tingkat SMP di daerah 3T (Tertinggal, Terdepan, Terluar). Infrastruktur literasi rendah dan perangkat *smartphone* terbatas.
  - **Guru BK:** Membutuhkan *dashboard* analitik otomatis yang instan dan komprehensif.
- **Prinsip Utama:** Sistem ini **TIDAK MENGGUNAKAN AI** untuk analisis siswa. Semua kalkulasi skor dan rekomendasi murni menggunakan *Rule Engine* dan *Decision Support System* (DSS).
- **Pendekatan Utama:** *Mobile-First Optimization* (Prioritas utama pada layar *smartphone* Android/iOS kelas bawah hingga menengah).

## 🎨 2. Aturan Desain & UI/UX (Mutlak)
- **Estetika:** Premium, *Clean*, setara aplikasi SaaS level *Enterprise* (Big Tech Company).
- **Tema Warna:** Kombinasi warna **Emerald (Hijau Mewah)** dan Putih/Abu muda.
- **TIDAK ADA DARK MODE:** Wajib *High-Contrast* agar teks terbaca jelas di luar ruangan (daerah 3T).
- **Interaksi Sentuh (Mobile):** Semua elemen yang bisa diklik (tombol, opsi) minimal setinggi **48px** (ramah jempol). Gunakan efek transisi (*micro-animations*) dan `active:scale-[0.96]` untuk respon sentuhan instan.
- **Tipografi:** Modern (Inter/Sans-serif), hindari kotak kaku, manfaatkan *mesh gradients* dan *drop shadows* yang halus. Hindari penggunaan *dropdown* untuk input siswa, gunakan tombol besar.

## 🧠 3. Aturan Pedagogis & Psikometri (Instrumen Asesmen)
Untuk mencegah *Cognitive Fatigue* (kelelahan kognitif membaca) pada anak SMP 3T, kita menggunakan format *Short-Form Assessment* (Instrumen Ringkas):
- **Jumlah Soal:**
  - **AKPD (Angket Kebutuhan Peserta Didik):** 40 Soal (10 Pribadi, 10 Sosial, 10 Belajar, 10 Karier).
  - **AUM (Alat Ungkap Masalah):** 40 Soal (Mencakup Fisik, Ekonomi, Keluarga, Diri Pribadi, Masa Depan, Hubungan Sosial, dan Belajar). Threshold waspada (Tinggi) jika masalah >= 20.
  - **Bullying (Olweus Framework):** 10 Soal (Fisik, Verbal, Sosial, Cyber).
  - **Self-Esteem (RSES Framework):** 10 Soal (5 Positif/Penghargaan Diri, 5 Negatif/Penerimaan Diri).
- **Bahasa:** Harus menggunakan bahasa Indonesia percakapan sehari-hari yang ramah anak ("Aku ngerasa...", "Bapak/Ibu..."). Jangan pakai istilah akademis kaku.
- **Format Pilihan:** Untuk efisiensi *UX*, pilihan dikondensasi dalam tombol "Ya/Tidak" (Guttman) atau tombol skala Likert besar untuk menghindari *Dropdown* yang menyulitkan di HP.
- **Manajemen Asesmen:** Seluruh asesmen **Terkunci** secara default. Guru BK yang membukanya secara manual per kelas via *dashboard*.

## ⚙️ 4. Arsitektur Teknis & Sistem
- **Tech Stack:** Vite + React + TypeScript + Tailwind CSS.
- **Database/Backend (Target):** Supabase + PostgreSQL.
- **State Management / Data:** Masih berjalan dengan *dummy data / mock-up* lokal di `src/services/dataService.ts` yang menyimpan data bank soal dan respons siswa.
- **Core Engine (Tanpa AI):**
  - `ruleEngine.ts`: Memproses respon angka siswa menjadi skor psikologis.
  - `dssEngine.ts`: Mengubah skor menjadi rekomendasi layanan BK (misal: "Konseling Individual" untuk "Sangat Rentan").
- **Kualitas Kode:** TypeScript divalidasi sangat ketat. Tidak boleh ada *error* (seperti `TS2322`). *Build* harus 100% *clean*.

## 🚀 5. Pencapaian (MVP v1.0) & Langkah Selanjutnya
- **Pencapaian:**
  1. Perluasan instrumen utama ke skala **40 soal** telah selesai dilakukan di `TakeAssessment.tsx`.
  2. Penyesuaian matematis pada `ruleEngine.ts` (dividen 10 dan threshold 20) telah selaras sempurna dengan jumlah soal.
  3. Tampilan Halaman Guru (`IntegratedProfile.tsx`) telah siap menampung seluruh analisis ke-7 alat instrumen secara *360-degree holistik*.
- **Fokus Selanjutnya:**
  1. Fitur **Ekspor Laporan** (PDF / Excel).
  2. Merapikan *dummy data* / *routing* jika dibutuhkan.
  3. Persiapan **Deployment** (Vercel/Netlify) atau serah terima final.

---

## 📖 6. Arsip Dialog AI & Product Owner
*Rekapitulasi percakapan dan proses pengambilan keputusan strategis antara Product Owner (Anda) dan AI Developer (Antigravity).*

- **Bahasa & Terminologi:** Mengubah bahasa kaku menjadi bahasa percakapan sehari-hari ramah anak SMP 3T.
- **UX Asesmen:** Scroll dimulai dari atas (Nomor 1). Menghindari penggunaan *dropdown* untuk jawaban (buruk untuk HP), opsi menggunakan Ya/Tidak untuk AUM dan Likert untuk Self-Esteem.
- **Jumlah Soal:** Menyesuaikan jumlah soal mencapai *Golden Ratio* yaitu 40 soal untuk AKPD dan AUM untuk mencegah *Cognitive Fatigue* namun menjaga validitas psikometri. Bullying dan Self-Esteem masing-masing 10 soal.
- **Engine DSS:** Memastikan Rule Engine berjalan real-time secara mandiri tanpa membebani server, dan mampu melakukan analisis spesifik/independen untuk satu asesmen yang dikerjakan saja.
- **Latar Belakang Ekonomi:** Masuk ke dalam AUM domain Ekonomi (uang saku, tunggakan, kondisi pekerjaan orang tua).
- **Manajemen Asesmen:** Asesmen **Tergembok secara default**. Guru memiliki kontrol penuh membuka/menutup asesmen per kelas dengan satu tombol *Toggle* tanpa repot mengatur tenggat waktu.

*(Dokumen dibuat pada: Juli/Agustus 2026)*
