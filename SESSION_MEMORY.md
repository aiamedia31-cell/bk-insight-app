# 🧠 SESSION MEMORY — BK Insight Project
> **BACA FILE INI PERTAMA KALI DI SETIAP SESI BARU.**
> Ini adalah dokumen memori persisten yang merangkum keseluruhan project, riwayat keputusan, aturan mutlak, status perkembangan, dan arsitektur teknis terkini.
> *Terakhir diperbarui: 4 Agustus 2026 — Sesi 3*

---

## 📌 SECTION 0 — Cara Menggunakan File Ini

Setiap kali sesi AI baru dimulai pada project ini, lakukan langkah berikut:
1. **Baca file ini dari atas ke bawah** sebelum menjawab atau memodifikasi kode apapun.
2. **Perbarui section STATUS** jika ada perubahan signifikan yang diselesaikan dalam sesi tersebut.
3. **Tambahkan ke section RIWAYAT** jika ada keputusan baru atau perubahan arsitektur yang penting.
4. Dokumen ini **tidak menggantikan** kode — selalu validasi dengan file aktual jika ada keraguan.

---

## 🎯 SECTION 1 — Identitas Proyek

| Atribut | Detail |
|---|---|
| **Nama Proyek** | BK Insight |
| **Deskripsi** | Platform Bimbingan Konseling Digital untuk SMP |
| **Versi** | MVP v1.0 |
| **Dibuat** | Juli–Agustus 2026 |
| **Repository Path** | `c:\Users\ACER\Music\BK` |
| **Deployment Target** | Vercel (vercel.json sudah ada) |
| **Live Domain** | Belum dikonfigurasi (MVP lokal) |
| **Supabase** | Terkoneksi (lihat .env untuk URL & ANON_KEY) |

### Misi & Visi
BK Insight membantu **Guru Bimbingan Konseling** di sekolah SMP dalam:
1. Melaksanakan **7 jenis asesmen psikologis** secara digital
2. Mengolah hasil secara **otomatis** menggunakan Rule Engine (BUKAN AI)
3. Menghasilkan **Profil BK Terpadu 360°** per siswa
4. Memberikan **Rekomendasi Layanan BK** berbasis Decision Support System

---

## 👥 SECTION 2 — Target Pengguna & Konteks

### Target Utama: Siswa SMP di Daerah 3T (Tertinggal, Terdepan, Terluar)
- Literasi digital **sangat rendah**
- Menggunakan **smartphone Android kelas bawah** (RAM terbatas)
- Koneksi internet **tidak stabil** atau lambat
- Sering menggunakan HP di **bawah terik matahari** (outdoor)

### Target Sekunder: Guru BK
- Membutuhkan **dashboard analitik instan** tanpa proses manual
- Perlu mengontrol asesmen dengan mudah (buka/kunci per kelas)
- Laporan harus bisa **diekspor PDF/Excel**

---

## 🎨 SECTION 3 — ATURAN DESAIN (MUTLAK, TIDAK BOLEH DILANGGAR)

> [!CAUTION]
> Aturan di bawah ini adalah **keputusan final Product Owner** yang tidak boleh diubah tanpa persetujuan eksplisit.

### 3.1 Tema & Warna
- **Warna Utama:** Emerald (Hijau Mewah) — emerald-600, teal-500
- **Background:** Putih (white) dan Abu-Abu Muda (slate-50)
- **TIDAK ADA DARK MODE** — Wajib High-Contrast agar terbaca di outdoor/terik matahari
- **Aksen:** Rose (bahaya), Amber (peringatan), Indigo (motivasi), Pink (self-esteem), Purple (MI), Sky (sosiometri)

### 3.2 UX Mobile-First
- Semua elemen interaktif minimal tinggi **48px** (ramah jempol)
- Gunakan `active:scale-[0.96]` (atau class active-touch) untuk feedback sentuhan
- **JANGAN gunakan Dropdown untuk jawaban asesmen siswa** — gunakan tombol besar Ya/Tidak atau Likert
- Scroll dimulai dari atas (Nomor 1 pertama) — window.scrollTo(0, 0) sudah ada di TakeAssessment
- Tombol submit: **floating bottom bar** di mobile (posisi fixed di bawah)

### 3.3 Tipografi & Estetika
- Font: **Inter / Sans-serif** (Tailwind default font-sans)
- Gunakan **mesh gradients** dan **drop shadows** yang halus (bukan hard shadow)
- Rounded corners menggunakan rounded-2xl / rounded-3xl (modern/premium)
- Progress bar menggunakan gradient: from-emerald-500 to-teal-500
- Kartu instrumen: warna border berbeda per instrumen saat hover

---

## 🧠 SECTION 4 — ATURAN PEDAGOGIS & PSIKOMETRI (MUTLAK)

> [!IMPORTANT]
> Jumlah soal dan threshold berikut adalah hasil kalibrasi psikometri yang sudah final. JANGAN diubah sembarangan.

### 4.1 Jumlah Soal Per Instrumen

| Instrumen | Soal | Format | Threshold |
|---|---|---|---|
| AKPD (Angket Kebutuhan PD) | 40 soal | Ya/Tidak (1=butuh, 0=tidak) | Per domain 10 soal |
| AUM (Alat Ungkap Masalah) | 40 soal | Ya/Tidak (1=ya, 0=tidak) | Tinggi >= 20 jawaban Ya |
| Bullying (Olweus) | 10 soal | Likert 1-3 | Sangat Rentan >= 24; Ringan >= 15 |
| Self-Esteem (RSES Rosenberg) | 10 soal | Likert 1-4 | Tinggi >= 30; Sedang >= 20; Rendah < 20 |
| Motivasi Belajar | 10 soal | Likert 1-4 | Sangat Tinggi >= 32; Tinggi >= 25; Sedang >= 18 |
| Sosiometri | Variabel | Pilihan nama | Moreno CS Formula |
| Multiple Intelligence | 16 soal | Ya/Tidak | Top 3 domain tertinggi |

### 4.2 AKPD Domain Mapping
- **Pribadi:** Soal 1-10
- **Sosial:** Soal 11-20
- **Belajar:** Soal 21-30
- **Karier:** Soal 31-40

### 4.3 AUM Domain Mapping (40 soal, 7 domain)
- **Fisik & Kesehatan:** Soal 1-6
- **Diri Pribadi:** Soal 7-10
- **Keluarga:** Soal 11-15
- **Hubungan Sosial:** Soal 16-21
- **Ekonomi:** Soal 22-28 (domain khusus untuk konteks 3T)
- **Masa Depan:** Soal 29-34
- **Belajar:** Soal 35-40

### 4.4 Bahasa yang Wajib Digunakan
- Gaya bahasa percakapan sehari-hari: "Aku ngerasa...", "Bapak/Ibu saya..."
- JANGAN gunakan istilah akademis kaku pada antarmuka siswa
- Nama asesmen ditulis ramah: "Angket Kebutuhan" bukan "AKPD SMP Kelas VII v2"

### 4.5 Manajemen Asesmen
- **Semua asesmen TERKUNCI secara default**
- Guru BK membuka asesmen dengan sistem **One-Click Toggle** per kelas
- Tidak ada sistem deadline/tanggal otomatis — full kontrol di tangan Guru BK

---

## ⚙️ SECTION 5 — ARSITEKTUR TEKNIS

### 5.1 Tech Stack
```
Frontend:  React 18 + TypeScript + Vite 6
Styling:   Tailwind CSS 3 + PostCSS
Icons:     Lucide React
Backend:   Supabase (PostgreSQL + Auth + Storage)
PDF:       jsPDF + jspdf-autotable
Excel:     xlsx (SheetJS)
Hosting:   Vercel
```

### 5.2 Struktur Folder Penting
```
src/
  App.tsx                          - Root router (state: role, student, guru, assessment)
  pages/guru/
    DashboardGuru.tsx              - Container tab navigation guru (5 tab)
    GuruLogin.tsx                  - Login guru (email + password)
    MasterData.tsx                 - Import Excel siswa, tabel data
    AssessmentManager.tsx          - Toggle buka/kunci asesmen per kelas
    ClassAnalytics.tsx             - Analitik kolektif per kelas
    IntegratedProfile.tsx          - Profil BK Terpadu 360° individual
  pages/siswa/
    SiswaLogin.tsx                 - Login siswa (pilih kelas + nama + tgl lahir)
    DashboardSiswa.tsx             - List asesmen yang bisa dikerjakan
    TakeAssessment.tsx             - Pengerjaan asesmen (semua kecuali sosiometri)
    TakeSociometry.tsx             - Pengerjaan sosiometri (pilih teman kelas)
  services/
    supabase.ts                    - Supabase client
    dataService.ts                 - SEMUA operasi DB (static methods)
    excelImporter.ts               - Parser Excel import siswa
    reportGenerator.ts             - Export PDF & Excel laporan
    engine/
      ruleEngine.ts                - Core kalkulasi 7 instrumen
      dssEngine.ts                 - Inference engine & rekomendasi DSS
      knowledgeBase.ts             - Matriks topik layanan BK
      akpdInterpretation.ts        - Bank interpretasi 40 soal AKPD
      instrumentInterpretations.ts - Bank interpretasi AUM, Bullying, Motivasi, SE
supabase/
  migrations/
    01_schema_setup.sql            - Schema DB lengkap (12 tabel)
    02_seed_instruments.sql        - Seed 7 instrumen + soal-soal
  02_seed_real_instruments.sql     - Seed versi terbaru (40 soal AUM/AKPD)
  seed.sql                         - Seed guru & kelas awal
```

### 5.3 Database Schema (Supabase PostgreSQL) - 12 Tabel
```
academic_years         - Tahun ajaran
classes                - Kelas (id, nama_kelas, tingkat)
students               - Siswa (id, nama, gender, kelas_id, tanggal_lahir)
users_guru             - Akun Guru BK (email, password, role)
instruments            - Katalog 7 instrumen
questions              - Bank soal per instrumen (JSONB pilihan_jawaban)
assessments            - Sesi asesmen aktif (instrument_id + kelas_id + is_published)
assessment_responses   - Jawaban siswa (JSONB: {question_id: answer_value})
sociometric_responses  - Pilihan sosiometri
bk_profiles_integrated - Cache profil terpadu (belum digunakan di MVP)
follow_ups             - Catatan tindak lanjut guru
intervention_timelines - Riwayat intervensi
```

**RLS aktif semua tabel. Policy saat ini "Allow ALL" untuk MVP.**

### 5.4 State Management (App.tsx)
Menggunakan useState + localStorage (tidak ada Redux/Zustand):
```
currentRole: 'siswa' | 'guru'     - localStorage: bk_currentRole
activeStudent: StudentData | null  - localStorage: bk_activeStudent
activeGuruEmail: string | null     - localStorage: bk_activeGuruEmail
currentAssessment: { id, instrumentId } | null  - Tidak di-persist
```

### 5.5 ID Instrumen di Database
```
akpd_7              - AKPD SMP Kelas VII
aum                 - Alat Ungkap Masalah
bullying            - Angket Bullying
motivasi            - Motivasi Belajar
self_esteem         - Self-Esteem (RSES)
sosiometri          - Sosiometri
multiple_intelligence - Multiple Intelligence (Gardner)
risiko_perilaku     - Skrining Risiko Perilaku & Profil Situasi Keluarga (68 soal)
```
Assessment ID di UI menggunakan prefix 'asm_' (contoh: 'asm_akpd_7')

---

## 🔧 SECTION 6 — ENGINE TEKNIS (CORE)

### 6.1 Rule Engine - 7 Fungsi Kalkulasi (ruleEngine.ts)

| Fungsi | Output Interface |
|---|---|
| calculateAKPD(responses) | AKPDResult |
| calculateAUM(responses) | AUMResult |
| calculateBullying(responses) | BullyingResult |
| calculateMotivasi(responses) | MotivasiResult |
| calculateSelfEsteem(responses) | SelfEsteemResult |
| calculateSociometry(targetId, totalClass, allChoices) | SociometricResult |
| calculateMI(responses) | MIResult |
| calculateRisikoPerilaku(responses) | RisikoPerilakuResult |

> **calculateRisikoPerilaku** memproses Q1-Q60 (Likert 1-3) + memanggil `calculateProfilKeluargaEmbedded` untuk Q61-Q68 (pilihan ganda faktual). Output gabungan.

**Catatan Scoring Penting:**
- AKPD: skor 1 = butuh layanan BK, 0 = tidak butuh
- AUM: skor 1 = ya ada masalah, 0 = tidak; threshold Tinggi >= 20, Sedang >= 10
- Bullying: Likert 1-3; Sangat Rentan >= 24; Ringan >= 15
- Self-Esteem: nilai negatif sudah di-reverse score di sisi UI (nilai 1-4); Tinggi >= 30
- Sosiometri: CS = pilihan_diterima / (N-1); Popular >= 0.35 atau >= 5 pilihan

### 6.2 DSS Engine (dssEngine.ts)
```
generateDSSAnalysis(akpd?, aum?, bullying?, motivasi?, selfEsteem?, sosiometri?, mi?)
Output: DSSIntegratedAnalysis {
    ringkasanStatus, tingkatRisikoGlobal,
    riskAlerts, layananRekomendasi,
    prioritasMasalah, faktorPendukung,
    faktorRisiko, targetMonitoring
}
```

**Risk Score Logic (0-100):**
- Bullying Sangat Rentan: +40
- Bullying Ringan: +25
- Sosiometri Terisolasi: +25
- Self-Esteem Rendah: +20
- Motivasi Rendah: +15
- Total >= 50: Sangat Tinggi | >= 30: Tinggi | >= 15: Sedang | < 15: Rendah

### 6.3 Interpretation Banks
- AKPD_INTERPRETATION_BANK: 40 entri (soal 1-40)
- AUM_INTERPRETATION_BANK: 40 entri (soal 1-40)
- BULLYING_INTERPRETATION_BANK: 10 entri (soal 1-10)
- MOTIVASI_INTERPRETATION_BANK: 4 entri (soal 3,4,6,9)
- SELF_ESTEEM_INTERPRETATION_BANK: 5 entri (soal 2,4,6,8,10)

### 6.4 Knowledge Base (knowledgeBase.ts)
```
TOPIC_KNOWLEDGE_MATRIX:
  Pribadi  -> ['Pengembangan Kepercayaan Diri & Self-Esteem', ...]
  Sosial   -> ['Etika Berkomunikasi & Berteman', ...]
  Belajar  -> ['Manajemen Waktu & Jadwal Belajar', ...]
  Karier   -> ['Eksplorasi Minat, Bakat & Cita-Cita', ...]
```

---

## 📊 SECTION 7 — STATUS FITUR (MVP v1.0)

### SUDAH SELESAI & BERFUNGSI:
1. Login Guru BK (email + password ke Supabase users_guru)
2. Login Siswa (pilih kelas + cari nama + tanggal lahir sebagai PIN)
3. Dashboard Siswa (list asesmen terbuka untuk kelas siswa)
4. TakeAssessment (AKPD, AUM, Bullying, SE, Motivasi, MI):
   - Tombol besar Ya/Tidak dan Likert (bukan dropdown)
   - Sticky progress bar
   - Floating bottom action bar
   - Auto-scroll ke atas saat mulai
   - Load jawaban lama jika sudah pernah mengerjakan
5. TakeSociometry (pilih teman kelas ranking 1-3)
6. Dashboard Guru - Tab Analitik Kelas (ClassAnalytics)
7. Dashboard Guru - Tab Profil Individual (IntegratedProfile):
   - Identity card siswa
   - Status Risiko Global DSS
   - Rekomendasi Layanan BK
   - 7 kartu instrumen dengan detail masalah
   - Tombol reset jawaban siswa
   - Tombol ekspor PDF
8. Dashboard Guru - Tab Master Data (Import Excel + tabel siswa)
9. Dashboard Guru - Tab Manajemen Asesmen (toggle buka/kunci)
10. Dashboard Guru - Tab Sosiogram (visualisasi graph)
11. Ekspor PDF per siswa (jsPDF + autoTable)
12. Ekspor Excel rekap kelas (fungsi ada, belum ada tombol di UI)
13. Database Schema lengkap (12 tabel + RLS + SQL migrations)
14. Seed Data (7 instrumen + 40 soal AKPD + 40 soal AUM + dll)
15. **[BARU]** Instrumen ke-8: Risiko Perilaku & Profil Situasi Keluarga (68 soal total)
    - 60 soal Likert 1-3 (Domain A, B, Validitas)
    - 8 soal faktual Q61-Q68 (broken home, yatim piatu, ortu tiri, ekonomi, pengawasan)
    - Rule Engine: calculateRisikoPerilaku + calculateProfilKeluargaEmbedded
    - Dashboard guru: Kartu orange (Likert) + Kartu ungu (Profil Keluarga)
    - Tag badges: BROKEN HOME, YATIM PIATU, ORANG TUA TIRI, EKONOMI LEMAH, dll
    - Flag: perluHomeVisit (auto-trigger jika riskScore ≥ 8 atau yatim piatu)

### BELUM SELESAI (TODO):

**Prioritas Tinggi:**
- [ ] Laporan PDF lebih kaya (detail 7 instrumen secara visual)
- [ ] Tombol ekspor Excel di UI (fungsi sudah ada di reportGenerator.ts)
- [ ] ClassAnalytics - grafik distribusi bullying, AUM, sosiometri kelas

**Prioritas Menengah:**
- [ ] Follow-up & Timeline Intervensi (DB sudah ada, UI belum)
- [ ] Hashing password guru (saat ini plain text - tidak aman untuk production)
- [ ] Validasi TypeScript 100% clean (jalankan: npx tsc --noEmit)

**Prioritas Rendah (Pre-Production):**
- [ ] Migrasi login guru ke Supabase Auth proper
- [ ] RLS role-based (guru hanya akses data kelasnya)
- [ ] Optimasi bundle size

---

## 📖 SECTION 8 — RIWAYAT KEPUTUSAN STRATEGIS

### [Juli 2026] — Fondasi Project
- **Keputusan:** TIDAK menggunakan AI untuk analisis siswa. Semua menggunakan Rule Engine + DSS deterministik.
- **Alasan:** Transparansi, akuntabilitas, tidak bergantung API eksternal yang mahal.

### [Juli 2026] — Penyederhanaan UX Asesmen
- **Keputusan:** Hapus semua dropdown jawaban siswa, ganti dengan tombol besar.
- **Alasan:** Dropdown sangat sulit di HP Android kelas bawah dengan layar kecil.

### [Juli 2026] — "Golden Ratio" Soal Psikometri
- **Keputusan:** AKPD 40 soal, AUM 40 soal, Bullying & SE masing-masing 10 soal.
- **Alasan:** Mencegah Cognitive Fatigue pada anak SMP 3T, menjaga validitas psikometri.

### [Juli 2026] — Toggle One-Click Manajemen Asesmen
- **Keputusan:** Asesmen terkunci default, guru buka dengan One-Click Toggle per kelas.
- **Alasan:** Tidak ada deadline ribet. Guru memegang kendali penuh kapanpun.

### [Juli/Agustus 2026] — Domain Ekonomi di AUM
- **Keputusan:** AUM ditambahkan domain "Ekonomi" (uang saku, tunggakan, pekerjaan orang tua).
- **Alasan:** Sangat relevan untuk siswa daerah 3T yang rentan masalah ekonomi keluarga.

### [Juli/Agustus 2026] — Migrasi ke Supabase
- **Keputusan:** Migrasi dari dummy data lokal ke Supabase + PostgreSQL.
- **Alasan:** Data real, multi-user, dapat diakses dari mana saja.

### [Agustus 2026] — detailMasalah di Engine Results
- **Keputusan:** Setiap result engine memiliki detailMasalah[] (teks interpretasi per item bermasalah).
- **Alasan:** IntegratedProfile.tsx butuh detail spesifik, bukan hanya skor agregat.

---

## 🛡️ SECTION 9 — ATURAN PENGEMBANGAN (WAJIB DIPATUHI)

> [!WARNING]
> Pelanggaran aturan di bawah ini dapat merusak integritas sistem dan pengalaman pengguna.

### 9.1 Kualitas Kode
- TypeScript STRICT — tidak boleh ada `any` yang tidak perlu
- Tidak boleh ada TS2322 atau error TypeScript saat build
- Build harus 100% clean: tsc && vite build
- Selalu gunakan interface/type yang sudah ada di ruleEngine.ts

### 9.2 Konsistensi Engine
- JANGAN ubah jumlah soal tanpa menyesuaikan semua threshold di ruleEngine.ts
- JANGAN ubah domain mapping AUM/AKPD tanpa menyesuaikan interpretation bank
- Scoring AUM: threshold Tinggi = >= 20, Sedang = >= 10 (bukan 15!)
- Scoring AKPD: dividen per domain adalah 10 (bukan total soal)

### 9.3 Database
- Selalu gunakan supabase client dari src/services/supabase.ts
- Gunakan maybeSingle() bukan single() saat tidak yakin record ada
- Assessment ID di UI selalu prefix 'asm_' (contoh: 'asm_akpd_7')

### 9.4 UI/UX
- Semua teks antarmuka siswa HARUS menggunakan bahasa Indonesia informal ramah anak
- Jangan buat halaman baru yang memerlukan React Router — semua state di App.tsx
- Jangan tambah fitur baru tanpa mempertimbangkan dampak ke UX siswa 3T

---

## 📋 SECTION 10 — PANDUAN MENJALANKAN PROJECT

```bash
# Install dependencies
npm install

# Jalankan development server (localhost:5173)
npm run dev

# Build production
npm run build

# Validasi TypeScript
npx tsc --noEmit
```

Konfigurasi .env yang dibutuhkan:
```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

---

## 🗒️ SECTION 11 — STATUS TERKINI

**Terakhir Diperbarui: 4 Agustus 2026**

### Status Build
- Development server berjalan normal
- Supabase terkoneksi
- 7 instrumen ter-seed di database
- Schema DB: 12 tabel + RLS policies

### Log Sesi

**[4 Agustus 2026]**
- Dilakukan: Pembacaan menyeluruh seluruh project
- Semua file MD, seluruh kode sumber, schema DB, dan engine dibaca
- Dibuat: File SESSION_MEMORY.md ini sebagai persistent memory untuk setiap sesi baru
- Status: MVP v1.0 dalam kondisi stabil, fitur inti lengkap

---

*"BK Insight: Mendengar yang Tak Terucap, Menjangkau yang Terjauh."*

> **INSTRUKSI UNTUK AI:** Update section ini (SECTION 11 - Log Sesi) di akhir setiap sesi yang melakukan perubahan signifikan. Catat: tanggal, apa yang dilakukan, dan status akhir.

**[4 Agustus 2026 — Sesi 2]**
- Ditambahkan: Instrumen ke-8 — "Skrining Risiko Perilaku & Kondisi Keluarga"
- Framework: Problem Behavior Theory (Jessor & Jessor, 1977) + ACE Screening
- 60 soal Likert 1-5: 36 Domain A (Risiko Perilaku) + 14 Domain B (Kondisi Keluarga) + 10 Validity Scale
- File baru: supabase/03_seed_risiko_perilaku.sql
- File dimodifikasi: ruleEngine.ts, dssEngine.ts, dataService.ts, IntegratedProfile.tsx, knowledgeBase.ts
- TypeScript: 100% clean (npx tsc --noEmit = exit code 0)
- DSS: Risk score baru (+45 Tinggi, +20 Sedang perilaku; +20 Sangat Perlu Perhatian keluarga)
- UI: Kartu ke-8 aksen Orange + 3 skor + sub-domain menonjol + ringkasan otomatis DSS
- Fitur Validitas: Confidence Score 0-100 + deteksi social desirability (faking good)
- ID instrumen di DB: 'risiko_perilaku'

**[4 Agustus 2026 — Sesi 3]**
- Diubah: Skala instrumen ke-8 dari Likert 1-5 → **Likert 1-3** (Tidak Pernah / Kadang-kadang / Sering)
  - Alasan: Lebih ramah kognitif untuk siswa SMP 3T, tetap diskriminatif untuk screening
  - Threshold dikalibrasi ulang: Domain A (<55 Rendah, 55-72 Sedang, ≥73 Tinggi, range 36-108)
  - Reverse scoring: 6-val → 4-val; default dari 5 → 3
  - Confidence score divisor: 40 → 20
- Ditambahkan: **8 soal Profil Situasi Keluarga (Q61-Q68)** disematkan di instrumen ke-8
  - Format: pilihan ganda faktual (single-select, BUKAN Likert), bidang='Profil Keluarga'
  - Q61: status ortu | Q62: tinggal bersama | Q63: hubungan pengasuh | Q64: konflik rumah
  - Q65: ekonomi | Q66: perubahan besar | Q67: tempat tinggal | Q68: pengawasan
  - Total instrumen ke-8: 68 soal
- Ditambahkan: calculateProfilKeluargaEmbedded() dalam ruleEngine.ts
  - Auto-tag: BROKEN HOME, YATIM PIATU, YATIM / PIATU, ORANG TUA TIRI, DIASUH WALI
  - Auto-tag: EKONOMI LEMAH, KOS / PANTI, CERAI (BARU), MINIM PENGAWASAN, dll
  - levelSituasiKeluarga: Baik / Perlu Perhatian / Sangat Perlu Perhatian
  - perluHomeVisit: true jika riskScore ≥ 8 atau yatim piatu atau (minim pengawasan + broken home)
- Ditambahkan: Kartu visual Profil Keluarga di IntegratedProfile.tsx
  - Header ungu gelap + banner ⚠ REKOMENDASI HOME VISIT (pulse animation)
  - Badge tags berwarna: merah (kritis), amber (perhatian), ungu (info)
  - Grid 4 fakta: Status Ortu | Diasuh Oleh | Tempat Tinggal | Ekonomi (warna adaptif)
  - Ringkasan + level badge berwarna
- SQL: 03_seed_risiko_perilaku.sql diperbarui (68 soal, Likert 1-3)
- Git: commit + push ke origin main (commit hash: 7dee26a)
- TypeScript: 100% clean (npx tsc --noEmit = exit code 0)

### ⚠️ Catatan Penting Skala Likert 1-3
Instrumen ke-8 (risiko_perilaku) menggunakan **Likert 1-3**, bukan 1-5 atau 1-4 seperti instrumen lain.
Jangan ubah ke 1-5 lagi — ini keputusan final berdasarkan pertimbangan konteks 3T.
Jika ada instrumen baru yang butuh Likert, gunakan 1-3 sebagai standar untuk siswa SMP 3T.
