# 📋 PROJECT HANDOVER & CONTEXT RECAPP (BK Insight MVP v1.0)

**Dokumen ini berfungsi sebagai "Otak Tambahan" atau memori jangkar (anchor memory).** 
*Bagi AI/Agent yang akan melanjutkan proyek ini esok hari, BACA DOKUMEN INI SEBELUM MELAKUKAN PERUBAHAN APAPUN pada kode.*

---

## 🎯 1. Visi Proyek & Target Demografis
* **Nama Proyek:** BK Insight (Platform Bimbingan Konseling Digital)
* **Target Pengguna:** 
  * **Siswa:** Anak tingkat SMP di daerah 3T (Tertinggal, Terdepan, Terluar). Infrastruktur literasi rendah.
  * **Guru BK:** Membutuhkan *dashboard* analitik yang instan dan komprehensif.
* **Pendekatan Utama:** *Mobile-First Optimization* (Prioritas utama pada layar *smartphone* Android/iOS kelas bawah hingga menengah).

---

## 🎨 2. Filosofi Desain & UI/UX (Hukum Mutlak)
* **Estetika:** Premium, setara aplikasi SaaS level *Enterprise* (Big Tech Company).
* **Tema Warna:** Minimalis *Clean*. Kombinasi warna **Emerald** (Hijau Mewah) dan Putih/Abu muda. 
* **TIDAK ADA DARK MODE.** Fokus pada *High-Contrast* agar tulisan sangat terbaca di luar ruangan (3T environment).
* **Interaksi *Mobile*:** Semua tombol/opsi harus memiliki tinggi minimal **48px** (ramah jempol), menggunakan transisi halus (*micro-animations*), dan efek sentuhan `active:scale-[0.96]` untuk umpan balik instan.
* **Typografi:** Modern (*Inter/Sans-serif*) tanpa kotak (*badge*) putih yang kaku. Menggunakan *Mesh Gradients* dan *Drop Shadows* lembut.

---

## 🧠 3. Aspek Pedagogis & Psikometri (Instrumen)
Karena siswa 3T rentan mengalami *Cognitive Fatigue* (kelelahan membaca), instrumen sengaja didesain menggunakan metode **Short-Form Assessment (Instrumen Ringkas)**:
1. **AKPD (Angket Kebutuhan Peserta Didik):** **40 Soal** (10 Pribadi, 10 Sosial, 10 Belajar, 10 Karier).
2. **AUM (Alat Ungkap Masalah):** **40 Soal** (Mencakup Fisik, Ekonomi, Keluarga, Diri Pribadi, Masa Depan, Hubungan Sosial, dan Belajar). Threshold waspada (Tinggi) jika masalah >= 20.
3. **Bullying (Olweus Framework):** **10 Soal** (Fisik, Verbal, Sosial, Cyber).
4. **Self-Esteem (RSES Framework):** **10 Soal** (5 Positif/Penghargaan Diri, 5 Negatif/Penerimaan Diri).
* **Gaya Bahasa:** Keseluruhan instrumen menggunakan Bahasa Indonesia percakapan yang sangat ramah anak (contoh: "Aku ngerasa...", "Bapak/Ibu...").
* **Format Pilihan:** Untuk efisiensi *UX*, pilihan dikondensasi dalam tombol "Ya/Tidak" (Guttman) atau tombol skala Likert besar untuk menghindari *Dropdown* yang menyulitkan di HP.

---

## ⚙️ 4. Status Teknis & Arsitektur Sistem
* **Tech Stack:** Vite + React + TypeScript + Tailwind CSS.
* **State Management:** Saat ini berjalan secara lokal *mock-up* melalui `src/services/dataService.ts` yang menyimpan data bank soal dan respons siswa.
* **Otak Kalkulasi (Engine):** 
  * `ruleEngine.ts` (Bertanggung jawab memproses angka dari respons menjadi skor psikologis).
  * `dssEngine.ts` (Bertanggung jawab memetakan skor menjadi rekomendasi layanan, misal: *Konseling Individual* untuk *Korban Sangat Rentan*).
* **Status Kompilasi:** TypeScript telah divalidasi ketat (terhindar dari `TS2322` error). Perintah `npm run build` sukses 100% (*Clean Build*).

---

## 🚀 5. Pencapaian Terakhir (Titik Berhenti Saat Ini)
1. Perluasan instrumen utama ke skala **40 soal** telah selesai dilakukan di `TakeAssessment.tsx`.
2. Penyesuaian matematis pada `ruleEngine.ts` (dividen 10 dan threshold 20) telah selaras sempurna dengan jumlah soal.
3. Tampilan Halaman Guru (`IntegratedProfile.tsx`) telah siap menampung seluruh analisis ke-7 alat instrumen secara *360-degree holistik*.

---

## 🔜 6. Langkah Selanjutnya (Next Steps)
Proyek MVP secara fitur *(Feature-Complete)* sudah selesai. Fokus selanjutnya adalah:
1. Menambahkan fitur Ekspor Laporan (PDF atau Excel).
2. Merapikan *dummy data* atau *routing* tambahan jika dibutuhkan.
3. Persiapan *Deployment* (Vercel/Netlify) atau serah terima final.

*(Dokumen dibuat pada: Juli 2026)*
