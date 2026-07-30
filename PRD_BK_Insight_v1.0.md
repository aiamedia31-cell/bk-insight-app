# Product Requirements Document (PRD)

# Sistem Asesmen dan Decision Support System (DSS) Bimbingan dan Konseling SMP

**Versi:** 1.0 MVP

------------------------------------------------------------------------

# 1. Overview

## Nama Produk

**BK Insight** *(nama sementara)*

## Deskripsi

BK Insight adalah platform digital yang membantu Guru Bimbingan dan
Konseling (BK) dalam melaksanakan asesmen, mengolah hasil secara
otomatis menggunakan Rule Engine dan Knowledge Base, serta memberikan
rekomendasi tindak lanjut berbasis data.

Aplikasi **tidak menggunakan AI dalam proses analisis siswa**.

AI hanya digunakan oleh tim pengembang apabila diperlukan pada tahap
pengembangan instrumen berdasarkan referensi ilmiah.

------------------------------------------------------------------------

# 2. Tujuan

Menyediakan sistem yang mampu:

-   Digitalisasi asesmen BK.
-   Menyimpan seluruh hasil asesmen.
-   Menghasilkan interpretasi otomatis.
-   Menampilkan dashboard sekolah.
-   Membantu penyusunan program BK.
-   Memberikan rekomendasi tindakan kepada Guru BK.

------------------------------------------------------------------------

# 3. Target Pengguna

### Administrator

Mengelola sistem.

### Guru BK

Melaksanakan asesmen dan tindak lanjut.

### Siswa

Mengerjakan asesmen.

------------------------------------------------------------------------

# 4. Ruang Lingkup

Aplikasi hanya menyediakan tujuh asesmen berikut:

1.  AKPD SMP Kelas VII
2.  AUM
3.  Angket Bullying
4.  Angket Motivasi Belajar
5.  Self Esteem
6.  Sosiometri
7.  Multiple Intelligence

Tidak ada fitur membuat asesmen baru.

------------------------------------------------------------------------

# 5. Modul Asesmen

## 1. AKPD SMP Kelas VII

Mengidentifikasi kebutuhan layanan BK pada bidang: - Pribadi - Sosial -
Belajar - Karier

## 2. AUM

Mengidentifikasi masalah dominan siswa.

## 3. Angket Bullying

Mengidentifikasi: - Korban - Pelaku - Saksi

## 4. Motivasi Belajar

Mengukur: - Motivasi intrinsik - Motivasi ekstrinsik - Ketekunan belajar

## 5. Self Esteem

Mengukur: - Penghargaan diri - Percaya diri - Penerimaan diri

## 6. Sosiometri

Mode: - Pemilihan Teman - Pemilihan Teman Belajar

Output: - Sociogram - Popularitas - Isolasi sosial - Kelompok pertemanan

## 7. Multiple Intelligence

Mengidentifikasi kecenderungan: - Linguistik - Logika-Matematis -
Visual-Spasial - Kinestetik - Musikal - Interpersonal - Intrapersonal -
Naturalis

------------------------------------------------------------------------

# 6. Login

## Guru BK

-   Email
-   Password

## Siswa

-   NIS/NISN
-   Password

------------------------------------------------------------------------

# 7. Dashboard Guru BK

## Beranda

Menampilkan: - Total siswa - Total kelas - Asesmen aktif - Asesmen
selesai - Belum mengerjakan - Statistik sekolah

## Master Data

-   Tahun ajaran
-   Guru BK
-   Kelas
-   Siswa

Mendukung import data siswa melalui Excel.

## Asesmen

Guru BK dapat: - Membuka asesmen - Memilih jenis asesmen - Menentukan
kelas sasaran - Menentukan tanggal mulai dan selesai - Publish asesmen

## Monitoring

Memantau: - Belum mengerjakan - Sedang mengerjakan - Sudah selesai

------------------------------------------------------------------------

# 8. Dashboard Hasil

Hasil tersedia pada level: - Sekolah - Kelas - Individu

Visualisasi: - Grafik - Persentase - Distribusi - Prioritas kebutuhan

------------------------------------------------------------------------

# 9. Profil BK Terpadu

Menggabungkan seluruh hasil asesmen dalam satu halaman:

-   AKPD
-   AUM
-   Bullying
-   Motivasi Belajar
-   Self Esteem
-   Sosiometri
-   Multiple Intelligence

------------------------------------------------------------------------

# 10. Rule Engine

Core sistem untuk melakukan analisis otomatis berdasarkan aturan yang
telah ditentukan.

Tidak menggunakan AI.

------------------------------------------------------------------------

# 11. Knowledge Base

Berisi: - Aturan interpretasi - Hubungan antar indikator - Prioritas
layanan - Rekomendasi tindakan

------------------------------------------------------------------------

# 12. Inference Engine

Mengintegrasikan seluruh hasil asesmen menjadi satu interpretasi
terpadu.

------------------------------------------------------------------------

# 13. Decision Support System (DSS)

Menghasilkan rekomendasi bagi Guru BK berupa:

-   Ringkasan interpretasi
-   Prioritas masalah
-   Faktor pendukung
-   Faktor risiko
-   Prioritas layanan
-   Materi layanan BK
-   Target monitoring

Sistem tidak memberikan diagnosis psikologis.

------------------------------------------------------------------------

# 14. Follow Up

Guru BK dapat:

-   Menentukan status tindak lanjut
-   Menambahkan catatan
-   Menentukan jenis layanan
-   Menentukan tanggal pelaksanaan
-   Mengunggah lampiran bila diperlukan

------------------------------------------------------------------------

# 15. Timeline Intervensi

Riwayat kronologis:

1.  Asesmen
2.  Interpretasi
3.  Intervensi
4.  Monitoring
5.  Evaluasi

------------------------------------------------------------------------

# 16. Dashboard Analitik

Dashboard: - Sekolah - Kelas - Individu

Meliputi: - Statistik AKPD - Statistik AUM - Bullying - Motivasi - Self
Esteem - Multiple Intelligence - Sociogram

------------------------------------------------------------------------

# 17. Laporan

Mendukung: - PDF - Excel

Jenis laporan: - Per siswa - Per kelas - Per sekolah - Per asesmen -
Rekap semester

------------------------------------------------------------------------

# 18. Teknologi

Frontend: - React

Backend: - Supabase

Database: - PostgreSQL

Hosting: - Vercel

Authentication: - Supabase Auth

Storage: - Supabase Storage

------------------------------------------------------------------------

# 19. Keamanan

-   HTTPS
-   Role Based Access Control
-   Audit Log
-   Backup Database
-   Enkripsi Password

------------------------------------------------------------------------

# 20. Non Functional Requirements

-   Responsif desktop & mobile
-   Waktu muat \< 3 detik
-   Mendukung minimal 1.000 siswa
-   Mendukung asesmen serentak
-   Backup otomatis
-   Audit trail

------------------------------------------------------------------------

# 21. Batasan Produk

Aplikasi tidak: - Menggunakan AI untuk analisis. - Melakukan diagnosis
psikologis. - Menggantikan layanan profesional BK. - Menyediakan
pembuatan instrumen baru oleh pengguna.

------------------------------------------------------------------------

# 22. Unique Value Proposition

BK Insight mengintegrasikan tujuh asesmen BK dalam satu Profil BK
Terpadu dan menggunakan Rule Engine, Knowledge Base, serta Decision
Support System (DSS) untuk menghasilkan interpretasi dan rekomendasi
layanan yang konsisten, transparan, dan dapat dipertanggungjawabkan
tanpa ketergantungan pada AI pada proses operasional.
