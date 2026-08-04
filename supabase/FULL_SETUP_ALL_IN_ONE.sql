-- ================================================================
-- BK INSIGHT — FULL SETUP (All-In-One)
-- Jalankan file ini sekali di Supabase SQL Editor untuk setup penuh
-- 
-- URUTAN:
--   1. Schema (CREATE TABLE, RLS, Policies)
--   2. Seed 7 Instrumen Awal
--   3. Seed Data Real Instrumen
--   4. Seed Instrumen ke-8: Risiko Perilaku & Kondisi Keluarga
-- ================================================================

-- =======================================================
-- BK INSIGHT MVP - DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- =======================================================

-- 1. Academic Years Table
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tahun_ajaran VARCHAR(20) NOT NULL UNIQUE, -- e.g. "2025/2026"
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_kelas VARCHAR(50) NOT NULL, -- e.g. "VII A", "VII B"
    tingkat VARCHAR(10) DEFAULT 'VII',
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table (Menggunakan Tanggal Lahir untuk PIN Verifikasi)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nama VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('L', 'P')),
    kelas_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    tanggal_lahir DATE NOT NULL, -- Format YYYY-MM-DD
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast dropdown & verification queries
CREATE INDEX IF NOT EXISTS idx_students_kelas_id ON public.students(kelas_id);
CREATE INDEX IF NOT EXISTS idx_students_verification ON public.students(kelas_id, nama, tanggal_lahir);

-- 4. Guru BK / Admin Auth Table (Disimpan terpisah / sync via Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users_guru (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- References auth.users if available
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'guru_bk' CHECK (role IN ('admin', 'guru_bk')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Instruments Catalog (7 Fixed Instruments)
CREATE TABLE IF NOT EXISTS public.instruments (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'akpd_7', 'aum', 'bullying', 'motivasi', 'self_esteem', 'sosiometri', 'multiple_intelligence'
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    kategori VARCHAR(50),
    total_soal INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Instrument Questions Bank
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id VARCHAR(50) REFERENCES public.instruments(id) ON DELETE CASCADE,
    no_urut INT NOT NULL,
    pernyataan TEXT NOT NULL,
    bidang VARCHAR(50), -- Untuk AKPD (Pribadi/Sosial/Belajar/Karier) atau Domain MI/Bullying/AUM
    pilihan_jawaban JSONB NOT NULL, -- Array of {label, value, score}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(instrument_id, no_urut)
);

CREATE INDEX IF NOT EXISTS idx_questions_instrument ON public.questions(instrument_id, no_urut);

-- 7. Active Assessment Sessions (Dikontrol Guru BK)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id VARCHAR(50) REFERENCES public.instruments(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    judul VARCHAR(150) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users_guru(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Assessment Responses (Jawaban & Skor Siswa)
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    jawaban JSONB NOT NULL, -- { question_id: answer_value }
    skor_total NUMERIC(5,2),
    skor_detail JSONB, -- Breakdown per bidang (Pribadi, Sosial, Belajar, Karier, dll)
    status VARCHAR(20) DEFAULT 'selesai' CHECK (status IN ('draft', 'selesai')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assessment_id, student_id)
);

-- 9. Sociometric Responses (Khusus Sosiometri)
CREATE TABLE IF NOT EXISTS public.sociometric_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- Siswa pemilih
    chosen_student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- Siswa terpilih
    kriteria VARCHAR(50) DEFAULT 'belajar', -- 'belajar' / 'bermain'
    peringkat INT CHECK (peringkat IN (1, 2, 3)), -- Pilihan ke-1, 2, 3
    alasan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Integrated BK Profiles (Profil BK Terpadu per Siswa)
CREATE TABLE IF NOT EXISTS public.bk_profiles_integrated (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
    skor_akpd JSONB, -- { pribadi: %, sosial: %, belajar: %, karier: % }
    skor_aum JSONB, -- { masalah_dominan: [], detail: {} }
    status_bullying JSONB, -- { peran: 'Aman'|'Korban'|'Pelaku'|'Saksi', skor: 0 }
    skor_motivasi JSONB, -- { tingkat: 'Tinggi', intrinsik: 0, ekstrinsik: 0 }
    skor_self_esteem JSONB, -- { tingkat: 'Tinggi', skor_rses: 0 }
    status_sosiometri JSONB, -- { status: 'Popular'|'Isolated'|'Normal', cs_index: 0.85 }
    top_intelligence JSONB, -- [ 'Linguistik', 'Interpersonal', 'Logika' ]
    ringkasan_dss JSONB, -- { prioritas_layanan: [], faktor_risiko: [], rekomendasi: [] }
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Follow Ups & Interventions (Tindak Lanjut & Timeline)
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    guru_id UUID REFERENCES public.users_guru(id),
    jenis_layanan VARCHAR(50) NOT NULL, -- 'Bimbingan Klasikal', 'Bimbingan Kelompok', 'Konseling Individual', 'Referal'
    bidang VARCHAR(50) NOT NULL, -- 'Pribadi', 'Sosial', 'Belajar', 'Karier'
    tanggal_pelaksanaan DATE NOT NULL,
    catatan TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'rencana' CHECK (status IN ('rencana', 'proses', 'selesai')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.intervention_timelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    tahap VARCHAR(50) NOT NULL, -- 'Asesmen', 'Interpretasi', 'Intervensi', 'Monitoring', 'Evaluasi'
    deskripsi TEXT NOT NULL,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) to satisfy Supabase requirements
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sociometric_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bk_profiles_integrated ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_timelines ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for ALL tables (Allows full read/write access for MVP)
CREATE POLICY "Allow all for academic_years" ON public.academic_years FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for users_guru" ON public.users_guru FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for instruments" ON public.instruments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for assessment_responses" ON public.assessment_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sociometric_responses" ON public.sociometric_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for bk_profiles_integrated" ON public.bk_profiles_integrated FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for follow_ups" ON public.follow_ups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for intervention_timelines" ON public.intervention_timelines FOR ALL USING (true) WITH CHECK (true);


-- ==============================================
-- SEED BAGIAN 1: 7 INSTRUMEN DASAR
-- ==============================================

-- =========================================================================
-- SEED DATA 7 INSTRUMEN ASESMEN BK SMP (BERBASIS LITERATUR AKADEMIS REKAP)
-- =========================================================================

-- 1. Insert 7 Catalog Instruments
INSERT INTO public.instruments (id, nama, deskripsi, kategori, total_soal) VALUES
('akpd_7', 'AKPD SMP Kelas VII', 'Angket Kebutuhan Peserta Didik untuk mengidentifikasi kebutuhan layanan BK pada Bidang Pribadi, Sosial, Belajar, dan Karier (Standar POP BK Kemendikbud)', 'Utama', 16),
('aum', 'AUM (Alat Ungkap Masalah)', 'Mengidentifikasi bidang masalah dominan siswa (Prof. Prayitno Framework)', 'Utama', 15),
('bullying', 'Angket Bullying', 'Mengidentifikasi peran Korban, Pelaku, dan Saksi Perundungan (Olweus Bullying Questionnaire)', 'Spesifik', 12),
('motivasi', 'Angket Motivasi Belajar', 'Mengukur Motivasi Intrinsik, Ekstrinsik, dan Ketekunan Belajar (Self-Determination Theory)', 'Spesifik', 10),
('self_esteem', 'Self Esteem (Penghargaan Diri)', 'Mengukur tingkat Penghargaan Diri & Kepercayaan Diri (Rosenberg Self-Esteem Scale / RSES)', 'Spesifik', 10),
('sosiometri', 'Asesmen Sosiometri', 'Pemetaan jaringan pertemanan kelas, indikator popularitas, dan isolasi sosial (Moreno Sociometry Framework)', 'Spesifik', 2),
('multiple_intelligence', 'Multiple Intelligence', 'Mengidentifikasi 8 tipe kecerdasan majemuk siswa (Howard Gardner Framework)', 'Spesifik', 16)
ON CONFLICT (id) DO UPDATE SET 
    nama = EXCLUDED.nama,
    deskripsi = EXCLUDED.deskripsi,
    total_soal = EXCLUDED.total_soal;

-- -------------------------------------------------------------------------
-- 2. Seed Questions: AKPD SMP Kelas VII (Bidang: Pribadi, Sosial, Belajar, Karier)
-- -------------------------------------------------------------------------
DELETE FROM public.questions WHERE instrument_id = 'akpd_7';

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES
('akpd_7', 1, 'Saya sering merasa belum memahami potensi dan kelebihan yang ada dalam diri saya.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 2, 'Saya merasa sulit mengendalikan emosi atau rasa marah ketika menghadapi masalah.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 3, 'Saya sering merasa kurang percaya diri saat tampil di depan umum atau di kelas.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 4, 'Saya membutuhkan bimbingan tentang cara menjaga kesehatan fisik dan pola hidup bersih.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),

('akpd_7', 5, 'Saya merasa canggung dan kesulitan saat harus memulai pertemanan baru di sekolah.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 6, 'Saya sering merasa cemas saat terjadi konflik atau pertengkaran dengan teman sebaya.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 7, 'Saya merasa ragu untuk menolak ajakan teman yang berdampak negatif (perilaku asusila/merokok).', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 8, 'Saya butuh pemahaman lebih lanjut tentang tata krama dan etika berkomunikasi di media sosial.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),

('akpd_7', 9, 'Saya kesulitan mengatur jadwal belajar harian di rumah.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 10, 'Saya merasa cepat jenuh dan kehilangan konsentrasi saat mendengarkan penjelasan guru.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 11, 'Saya membutuhkan teknik atau gaya belajar yang paling sesuai dengan diri saya.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 12, 'Saya merasa cemas secara berlebihan saat menghadapi ujian atau ulangan harian.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),

('akpd_7', 13, 'Saya belum memiliki gambaran yang jelas mengenai minat cita-cita masa depan saya.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 14, 'Saya ingin mengenal berbagai jenis profesi dan dunia kerja sejak dini.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 15, 'Saya bingung menentukan pilihan ekstrakurikuler yang sesuai dengan bakat saya.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 16, 'Saya membutuhkan informasi syarat jenjang sekolah lanjutan setelah lulus SMP.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]');

-- -------------------------------------------------------------------------
-- 3. Seed Questions: AUM (Alat Ungkap Masalah)
-- -------------------------------------------------------------------------
DELETE FROM public.questions WHERE instrument_id = 'aum';

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES
('aum', 1, 'Mudah lelah, sering pusing, atau merasa badan kurang fit saat jam sekolah.', 'Fisik & Kesehatan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 2, 'Merasa cemas jika memikirkan masa depan atau cita-cita yang belum jelas.', 'Masa Depan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 3, 'Kesulitan membeli perlengkapan sekolah atau kebutuhan belajar karena keterbatasan biaya.', 'Ekonomi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 4, 'Merasa diri tidak menarik atau merasa memiliki banyak kekurangan dibanding teman lain.', 'Diri Sendiri', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 5, 'Sering merasa diabaikan atau kurang diperhatikan di lingkungan rumah/keluarga.', 'Keluarga', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 6, 'Kesulitan memahami materi pelajaran yang disampaikan oleh guru.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 7, 'Sering ditolak atau tidak diajak saat kegiatan pertemanan kelompok.', 'Hubungan Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 8, 'Merasa takut salah bicara atau dipersalahkan saat mengemukakan pendapat.', 'Diri Sendiri', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 9, 'Fasilitas belajar di rumah kurang memadai (tidak ada ruangan tenang/gadget/internet).', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 10, 'Mudah tersinggung dan emosi ketika dikritik oleh teman sebaya.', 'Hubungan Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 11, 'Sering menunda-nunda mengerjakan tugas sekolah sampai mendekati batas waktu.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 12, 'Orang tua terlalu menuntut target nilai tinggi yang membuat merasa tertekan.', 'Keluarga', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 13, 'Sering tidak fokus karena memikirkan masalah pribadi saat belajar di kelas.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 14, 'Bingung memilih kegiatan yang bermanfaat di waktu luang.', 'Diri Sendiri', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 15, 'Merasa tidak aman saat berada di lingkungan sekolah atau perjalanan pulang.', 'Fisik & Kesehatan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]');

-- -------------------------------------------------------------------------
-- 4. Seed Questions: Angket Bullying (Olweus Framework)
-- -------------------------------------------------------------------------
DELETE FROM public.questions WHERE instrument_id = 'bullying';

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES
('bullying', 1, 'Pernahkah kamu dipanggil dengan julukan ejekan yang menyakitkan atau diolok-olok teman di sekolah?', 'Verbal', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 2, 'Pernahkah kamu sengaja didorong, dipukul, dijahili secara fisik, atau dihalangi jalanmu oleh teman?', 'Fisik', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 3, 'Pernahkah kamu sengaja dikucilkan, disembunyikan barangnya, atau dilarang bergabung dalam kelompok?', 'Sosial', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 4, 'Pernahkah kamu menerima pesan ejekan, ancaman, atau gosip bohong di media sosial/WhatsApp group?', 'Cyber', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 5, 'Apakah kamu pernah melontarkan kata-kata sindiran atau ejekan kepada teman lain saat bercanda?', 'Relasi Pelaku', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 6, 'Apakah kamu pernah menyebarkan cerita/gosip teman lain yang belum tentu benar?', 'Relasi Pelaku', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 7, 'Apakah kamu pernah sengaja tidak mau menyapa atau menolak berteman dengan seseorang?', 'Relasi Pelaku', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 8, 'Apakah kamu pernah melihat secara langsung temanmu diolok-olok atau disakiti oleh siswa lain?', 'Saksi', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 9, 'Ketika melihat tindakan perundungan/ejekan, apa yang biasanya kamu lakukan?', 'Saksi', '[{"label":"Diam saja / Takut","value":1},{"label":"Membantu Korban / Lapor Guru","value":3},{"label":"Ikut Tertawa","value":0}]'),
('bullying', 10, 'Apakah kamu merasa aman dan nyaman berada di lingkungan sekolahmu saat ini?', 'Perasaan Aman', '[{"label":"Sangat Aman","value":3},{"label":"Cukup Aman","value":2},{"label":"Tidak Aman","value":1}]'),
('bullying', 11, 'Apakah kamu tahu harus melapor kepada siapa jika mengalami atau melihat aksi perundungan?', 'Pengetahuan Saksi', '[{"label":"Ya, Tahu","value":2},{"label":"Kurang Yakin","value":1},{"label":"Tidak Tahu","value":0}]'),
('bullying', 12, 'Apakah guru BK atau pihak sekolah bertindak cepat jika ada laporan ejekan/perundungan?', 'Penilaian Sekolah', '[{"label":"Sangat Cepat","value":3},{"label":"Cukup Cepat","value":2},{"label":"Tidak Bertindak","value":1}]');

-- -------------------------------------------------------------------------
-- 5. Seed Questions: Motivasi Belajar (Self-Determination Theory)
-- -------------------------------------------------------------------------
DELETE FROM public.questions WHERE instrument_id = 'motivasi';

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES
('motivasi', 1, 'Saya semangat belajar karena merasa ingin menambah ilmu dan wawasan baru.', 'Intrinsik', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('motivasi', 2, 'Saya merasa senang ketika berhasil menyelesaikan tugas sekolah yang sulit.', 'Intrinsik', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('motivasi', 3, 'Saya belajar terutama karena ingin mendapatkan nilai bagus atau hadiah dari orang tua.', 'Ekstrinsik', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('motivasi', 4, 'Saya belajar hanya jika ada teguran atau paksaan dari orang tua/guru.', 'Ekstrinsik', '[{"label":"Sangat Sesuai","value":1},{"label":"Sesuai","value":2},{"label":"Kurang Sesuai","value":3},{"label":"Tidak Sesuai","value":4}]'),
('motivasi', 5, 'Saya tetap berusaha mengerjakan PR meskipun ada gangguan HP atau acara TV.', 'Ketekunan', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('motivasi', 6, 'Saya membuat catatan ringkasan sendiri untuk mempermudah belajar saat ujian.', 'Ketekunan', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('motivasi', 7, 'Ketika nilai ulangan saya kurang memuaskan, saya terdorong untuk memperbaiki cara belajar.', 'Ketekunan', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('motivasi', 8, 'Saya aktif bertanya kepada guru atau teman jika ada materi pelajaran yang belum paham.', 'Intrinsik', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('motivasi', 9, 'Saya merasa rugi atau lelah jika harus membaca buku pelajaran di luar jam sekolah.', 'Ekstrinsik', '[{"label":"Sangat Sesuai","value":1},{"label":"Sesuai","value":2},{"label":"Kurang Sesuai","value":3},{"label":"Tidak Sesuai","value":4}]'),
('motivasi', 10, 'Saya memiliki target capaian nilai atau prestasi belajar yang ingin diraih semester ini.', 'Intrinsik', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]');

-- -------------------------------------------------------------------------
-- 6. Seed Questions: Self Esteem (Rosenberg Self-Esteem Scale - RSES Adaptasi)
-- -------------------------------------------------------------------------
DELETE FROM public.questions WHERE instrument_id = 'self_esteem';

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES
('self_esteem', 1, 'Secara umum, saya merasa puas dengan diri saya sendiri.', 'Penghargaan Diri', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('self_esteem', 2, 'Terkadang saya merasa bahwa saya tidak memiliki kelebihan apapun.', 'Penerimaan Diri', '[{"label":"Sangat Sesuai","value":1},{"label":"Sesuai","value":2},{"label":"Kurang Sesuai","value":3},{"label":"Tidak Sesuai","value":4}]'),
('self_esteem', 3, 'Saya merasa memiliki sejumlah potensi dan kualitas yang baik dalam diri.', 'Penghargaan Diri', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('self_esteem', 4, 'Saya mampu melakukan hal-hal sebaik kebanyakan teman sebaya saya.', 'Percaya Diri', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('self_esteem', 5, 'Saya merasa tidak banyak hal yang bisa saya banggakan dari diri saya.', 'Penerimaan Diri', '[{"label":"Sangat Sesuai","value":1},{"label":"Sesuai","value":2},{"label":"Kurang Sesuai","value":3},{"label":"Tidak Sesuai","value":4}]'),
('self_esteem', 6, 'Terkadang saya merasa diri saya benar-benar kurang berguna.', 'Penerimaan Diri', '[{"label":"Sangat Sesuai","value":1},{"label":"Sesuai","value":2},{"label":"Kurang Sesuai","value":3},{"label":"Tidak Sesuai","value":4}]'),
('self_esteem', 7, 'Saya merasa bahwa saya adalah orang yang berharga, setidaknya setara dengan orang lain.', 'Penghargaan Diri', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]'),
('self_esteem', 8, 'Saya berharap saya bisa lebih menghormati dan menyukai diri saya sendiri.', 'Penghargaan Diri', '[{"label":"Sangat Sesuai","value":2},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":4},{"label":"Tidak Sesuai","value":1}]'),
('self_esteem', 9, 'Melihat secara keseluruhan, saya cenderung merasa bahwa saya gagal dalam banyak hal.', 'Penerimaan Diri', '[{"label":"Sangat Sesuai","value":1},{"label":"Sesuai","value":2},{"label":"Kurang Sesuai","value":3},{"label":"Tidak Sesuai","value":4}]'),
('self_esteem', 10, 'Saya mengambil sikap dan pandangan yang positif terhadap diri saya.', 'Percaya Diri', '[{"label":"Sangat Sesuai","value":4},{"label":"Sesuai","value":3},{"label":"Kurang Sesuai","value":2},{"label":"Tidak Sesuai","value":1}]');

-- -------------------------------------------------------------------------
-- 7. Seed Questions: Multiple Intelligence (Gardner 8 Framework)
-- -------------------------------------------------------------------------
DELETE FROM public.questions WHERE instrument_id = 'multiple_intelligence';

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES
('multiple_intelligence', 1, 'Saya menyukai aktivitas membaca buku, menulis karangan, atau bermain teka-teki kata.', 'Linguistik', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 2, 'Saya cepat mengingat kata-kata puitis, ungkapan lucu, atau kosakata baru.', 'Linguistik', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 3, 'Saya menyukai pelajaran matematika, soal hitungan, atau teka-teki logika angka.', 'Logika-Matematik', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 4, 'Saya terbiasa memikirkan pola sebab-akibat atau urutan langkah secara sistematis.', 'Logika-Matematik', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 5, 'Saya dengan mudah membayangkan bentuk gambar, diagram, peta, atau denah lokasi.', 'Visual-Spasial', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 6, 'Saya menyukai kegiatan menggambar, mewarnai, memfoto, atau mendesain sesuatu.', 'Visual-Spasial', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 7, 'Saya menyukai olahraga, menari, berakting, atau membuat kerajinan tangan.', 'Kinestetik', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 8, 'Saya lebih mudah memahami sesuatu dengan mempraktikkan langsung gerakan atau tangannya.', 'Kinestetik', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 9, 'Saya peka terhadap irama lagu, nada musik, dan mudah menghafal lirik musik baru.', 'Musikal', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 10, 'Saya suka bernyanyi, memukul meja mengikuti irama, atau memainkan alat musik.', 'Musikal', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 11, 'Saya senang bergaul, mudah mendengarkan curhat teman, dan suka bekerja kelompok.', 'Interpersonal', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 12, 'Saya peka terhadap perasaan orang lain dan sering menjadi penengah jika ada teman bertengkar.', 'Interpersonal', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 13, 'Saya paham kelebihan dan kekurangan diri saya sendiri dan menyukai waktu renungan pribadi.', 'Intrapersonal', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 14, 'Saya mandiri dalam menetapkan tujuan hidup dan tidak mudah terpengaruh pendapat orang lain.', 'Intrapersonal', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 15, 'Saya menyukai kegiatan di luar ruangan, berkemah, merawat tanaman, atau memelihara hewan.', 'Naturalis', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]'),
('multiple_intelligence', 16, 'Saya peka terhadap perubahan cuaca, lingkungan alam, dan isu kelestarian lingkungan.', 'Naturalis', '[{"label":"Sangat Sesuai","value":1},{"label":"Tidak Sesuai","value":0}]');


-- ==============================================
-- SEED BAGIAN 2: DATA INSTRUMEN REAL
-- ==============================================

-- Add password column
ALTER TABLE public.users_guru ADD COLUMN IF NOT EXISTS password VARCHAR(100);

-- Add Guru
INSERT INTO public.users_guru (nama, email, role, password)
VALUES ('Admin BK', 'masukbk', 'guru_bk', 'masukbk')
ON CONFLICT (email) DO UPDATE SET password = 'masukbk';

-- Seed Instruments
INSERT INTO public.instruments (id, nama, deskripsi, kategori, total_soal) VALUES
('akpd_7', 'AKPD Kelas 7', 'Angket Kebutuhan Peserta Didik untuk Kelas 7', 'Kebutuhan', 40),
('aum', 'AUM Umum', 'Alat Ungkap Masalah Umum', 'Masalah', 40),
('bullying', 'Asesmen Bullying', 'Deteksi Risiko dan Peran Bullying', 'Sosial', 10),
('self_esteem', 'Self Esteem', 'Tingkat Harga Diri', 'Pribadi', 10),
('motivasi', 'Motivasi Belajar', 'Tingkat Motivasi dan Ketekunan Belajar', 'Belajar', 10),
('multiple_intelligence', 'Kecerdasan Majemuk', 'Pemetaan Bakat dan Kecerdasan Dominan', 'Karier', 16),
('sosiometri', 'Sosiometri', 'Pemetaan Relasi Sosial Kelas', 'Sosial', 0)
ON CONFLICT (id) DO NOTHING;

-- Seed Questions
INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES
('akpd_7', 1, 'Aku sering bingung, sebenarnya apa sih kelebihan dan bakatku?', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 2, 'Kalau lagi marah atau sedih, aku suka susah mengendalikan diri dan gampang emosi.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 3, 'Aku sering merasa malu atau nggak pede kalau disuruh maju ke depan kelas.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 4, 'Aku pengen tahu cara menjaga kebersihan badanku biar tetap sehat terus.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 5, 'Kadang aku ngerasa malas banget buat berangkat sekolah atau ngerjain tugas.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 6, 'Aku merasa kurang pandai merawat diri atau mengatur penampilan.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 7, 'Aku sering merasa bersalah terus-terusan kalau ngelakuin kesalahan kecil.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 8, 'Aku pengen tahu cara ngilangin rasa bosan dan stres waktu sendirian di rumah.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 9, 'Aku sering merasa minder karena kondisi badanku (terlalu gemuk, kurus, atau pendek).', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 10, 'Aku pengen diajarin cara bersyukur dan lebih nerima diriku apa adanya.', 'Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 11, 'Aku merasa susah atau malu buat ngajak ngobrol teman baru kenal.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 12, 'Aku sering kepikiran dan cemas kalau lagi musuhan atau beda pendapat sama teman.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 13, 'Aku susah nolak kalau diajak teman main atau bolos, padahal aku tahu itu salah.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 14, 'Aku kadang bingung gimana cara ngobrol yang sopan sama guru atau orang yang lebih tua.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 15, 'Aku sering merasa dijauhi atau nggak diajak main sama teman-teman sekelas.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 16, 'Aku bingung gimana cara negur atau nasehatin teman tanpa bikin dia emosi.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 17, 'Aku pengen tahu gimana sih batas pergaulan laki-laki dan perempuan yang bener.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 18, 'Aku merasa susah membaur sama lingkungan anak-anak tetangga di rumah.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 19, 'Aku ngerasa gampang banget terpengaruh ikut-ikutan kelakuan jelek teman-teman.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 20, 'Aku butuh diajarin cara minta maaf yang bener kalau aku punya salah sama orang lain.', 'Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 21, 'Aku bingung gimana cara ngatur waktu antara main, bantu orang tua di rumah, dan belajar.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 22, 'Waktu guru ngejelasin pelajaran di depan, aku sering ngantuk dan susah fokus.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 23, 'Aku belum tahu cara belajar yang paling pas buat aku biar cepat paham dan masuk ke otak.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 24, 'Kalau besok mau ulangan, malamnya aku sering takut, cemas, atau malah nggak bisa tidur.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 25, 'Aku sering lupa ngerjain PR karena keasyikan main bareng teman atau bantu di rumah.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 26, 'Aku butuh diajarin cara nyari bahan tugas atau minjem buku pelajaran yang gratis.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 27, 'Aku sering gugup sampai nge-blank (lupa semua) kalau tiba-tiba disuruh guru maju.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 28, 'Aku pengen tahu cara bikin catetan atau rangkuman yang gampang buat dihafal.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 29, 'Aku sering ngerasa putus asa kalau udah nyoba belajar tapi tetap nggak paham-paham.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 30, 'Aku pengen diajarin cara ngilangin rasa malas belajar yang sering datang tiba-tiba.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 31, 'Aku belum tahu kalau udah besar nanti pengen kerja jadi apa.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 32, 'Aku pengen tahu macam-macam pekerjaan yang bisa ngasilin uang halal buat bantu keluarga.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 33, 'Aku bingung mau milih eskul (ekstrakurikuler) apa yang cocok buat bakatku.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 34, 'Aku butuh info, nanti habis lulus SMP ini sebaiknya lanjut ke SMA, SMK, atau Pesantren ya?', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 35, 'Aku kadang takut cita-citaku nggak bakal kecapai karena keluargaku nggak punya banyak biaya.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 36, 'Aku pengen banget cari sekolah lanjutan yang ada beasiswanya gratis.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 37, 'Aku pengen tahu pekerjaan apa yang kira-kira cocok sama hobiku sekarang.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 38, 'Aku belum ngerti kenapa nilai rapot sekarang itu penting buat daftar sekolah nanti.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 39, 'Aku belum tahu banyak informasi tentang pilihan jurusan di SMK yang cocok buatku.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('akpd_7', 40, 'Aku butuh panduan cara ngenalin minat dan potensi diriku buat persiapan masa depan.', 'Karier', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 1, 'Akhir-akhir ini aku gampang capek, pusing, atau kurang sehat waktu jam sekolah.', 'Fisik & Kesehatan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 2, 'Aku sering nggak sarapan dari rumah, jadi perut kerasa perih atau lemes di kelas.', 'Fisik & Kesehatan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 3, 'Aku punya sakit bawaan atau gampang drop yang bikin aku sering bolos sekolah.', 'Fisik & Kesehatan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 4, 'Mata aku sering perih atau kurang jelas kalau lihat tulisan di papan tulis.', 'Fisik & Kesehatan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 5, 'Aku merasa badanku terlalu kurus, gemuk, atau pendek, dan itu bikin nggak nyaman.', 'Fisik & Kesehatan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 6, 'Gigiku sering sakit, sariawan, atau badanku gatal-gatal pas lagi belajar di kelas.', 'Fisik & Kesehatan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 7, 'Aku ngerasa diriku ini banyak kurangnya, jelek, atau nggak sepintar teman-teman.', 'Diri Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 8, 'Aku sering merasa sangat kesepian walaupun lagi rame kumpul sama orang.', 'Diri Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 9, 'Aku sering merasa hidup ini berat banget dan kaya nggak punya tujuan yang jelas.', 'Diri Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 10, 'Aku sering tiba-tiba ngerasa ketakutan atau cemas sendiri tanpa alasan yang jelas.', 'Diri Pribadi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 11, 'Di rumah aku sering dimarahi, disalahkan, atau kurang diperhatiin sama bapak/ibu.', 'Keluarga', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 12, 'Orang tuaku sering berantem atau ribut di rumah dan itu bikin aku sedih banget.', 'Keluarga', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 13, 'Aku sering kepikiran masalah keluarga sampai nangis sendiri di kamar.', 'Keluarga', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 14, 'Orang tuaku terlalu sibuk kerja atau ngurus hal lain sampai jarang ngobrol sama aku.', 'Keluarga', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 15, 'Aku ngerasa dibeda-bedain, dibanding-bandingin, atau pilih kasih sama saudara di rumah.', 'Keluarga', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 16, 'Aku sering digangguin, diejek, atau dimintain uang paksa sama teman di sekolah.', 'Hubungan Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 17, 'Aku ngerasa kesepian, nggak punya teman akrab yang bisa diajak curhat bareng.', 'Hubungan Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 18, 'Aku lagi berantem atau musuhan lama sama teman sekelas dan belum baikan.', 'Hubungan Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 19, 'Aku merasa canggung, takut, atau segan kalau harus ngomong sama guru.', 'Hubungan Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 20, 'Aku merasa dijauhi gara-gara kondisi rumah, seragam, atau penampilanku.', 'Hubungan Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 21, 'Aku merasa susah bergaul karena bahasaku atau caraku ngomong beda sama mereka.', 'Hubungan Sosial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 22, 'Aku kadang sedih karena nggak punya uang jajan atau nggak bisa jajan kayak teman lain.', 'Ekonomi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 23, 'Keluargaku lagi kesusahan uang buat bayar tunggakan atau daftar ulang sekolahku.', 'Ekonomi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 24, 'Aku harus ikut kerja kasar buat bantu orang tua cari uang, jadi capek kalau di kelas.', 'Ekonomi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 25, 'Seragam, tas, atau sepatuku udah rusak tapi bapak/ibu belum ada uang buat beli baru.', 'Ekonomi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 26, 'Orang tuaku lagi banyak tanggungan atau hutang yang bikin suasana rumah jadi muram.', 'Ekonomi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 27, 'Aku sering nahan lapar di sekolah karena nggak dibekali uang saku atau makanan sama sekali.', 'Ekonomi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 28, 'Aku khawatir orang tuaku kesulitan buat beli beras atau makanan buat keluarga di rumah.', 'Ekonomi', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 29, 'Aku sering takut dan kepikiran, nanti masa depanku bakal suram nggak ya?', 'Masa Depan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 30, 'Aku khawatir banget nggak bisa lanjut sekolah gara-gara nggak ada biayanya.', 'Masa Depan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 31, 'Orang tuaku nyuruh aku cepat-cepat kerja aja habis lulus sekolah ini.', 'Masa Depan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 32, 'Aku bingung karena apa yang aku pengen buat masa depan ditolak sama orang tua.', 'Masa Depan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 33, 'Aku merasa nggak punya kepintaran apa-apa yang bisa kepakai buat cari kerja nanti.', 'Masa Depan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 34, 'Aku sering dengar kalau cari kerja sekarang susah banget, jadi aku takut nanti nganggur.', 'Masa Depan', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 35, 'Aku ngerasa pelajaran di sekolah ini susah-susah banget, aku sering nggak nyambung.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 36, 'Aku nggak punya buku cetak, LKS, atau tempat terang buat belajar di rumah.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 37, 'Aku sering malas banget ngerjain PR dan milih mabar game atau main HP.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 38, 'Cara guru ngejelasin kadang kecepatan atau galak, aku jadi takut nanya.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 39, 'Jarak rumah ke sekolah lumayan jauh atau susah angkutannya, bikin sering kesiangan.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('aum', 40, 'Nilai-nilaiku banyak yang jelek, dan aku takut banget kalau sampai nggak naik kelas.', 'Belajar', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('bullying', 1, 'Pernah nggak kamu dipanggil pakai nama bapakmu atau ejekan fisik yang bikin kamu sakit hati?', 'Verbal', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 2, 'Pernah nggak kamu diolok-olok, disorakin, atau diketawain sekelas pas lagi ngomong?', 'Verbal', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 3, 'Pernah nggak kamu dipukul, didorong, atau dijegal sampai jatuh sama teman dengan sengaja?', 'Fisik', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 4, 'Pernah nggak kamu ditendang, dicubit, atau dilempar pakai barang sama teman?', 'Fisik', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 5, 'Pernah nggak barang-barangmu (sepatu, buku, uang) disembunyiin, dirusak, atau dimintain paksa?', 'Fisik', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 6, 'Pernah nggak kamu sengaja ditinggalin dan dilarang ikut main sama anak-anak lain?', 'Sosial', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 7, 'Pernah nggak teman-teman tiba-tiba diam, bisik-bisik, atau bubar waktu kamu mau ikut ngumpul?', 'Sosial', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 8, 'Pernah nggak ada teman yang nyebarin gosip, fitnah, atau cerita bohong tentang kamu?', 'Sosial', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 9, 'Pernah nggak kamu dikirimin chat ancaman, dimaki, atau ditag dengan kata kasar di grup WA/FB?', 'Cyber', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('bullying', 10, 'Pernah nggak fotomu atau aibmu diam-diam disebar buat bahan ketawaan di status sosmed?', 'Cyber', '[{"label":"Sering","value":3},{"label":"Pernah","value":2},{"label":"Tidak Pernah","value":1}]'),
('self_esteem', 1, 'Aku merasa bersyukur dan bangga jadi diriku sendiri apa adanya.', 'Penghargaan Diri', '[{"label":"Sangat Setuju","value":4},{"label":"Setuju","value":3},{"label":"Kurang Setuju","value":2},{"label":"Tidak Setuju","value":1}]'),
('self_esteem', 2, 'Kadang aku mikir kalau aku ini anak yang nggak berguna dan nyusahin keluarga.', 'Penerimaan Diri', '[{"label":"Sangat Setuju","value":1},{"label":"Setuju","value":2},{"label":"Kurang Setuju","value":3},{"label":"Tidak Setuju","value":4}]'),
('self_esteem', 3, 'Aku yakin suatu saat nanti aku bisa jadi orang sukses yang merubah nasib keluargaku.', 'Penghargaan Diri', '[{"label":"Sangat Setuju","value":4},{"label":"Setuju","value":3},{"label":"Kurang Setuju","value":2},{"label":"Tidak Setuju","value":1}]'),
('self_esteem', 4, 'Kalau ada tugas maju atau disuruh guru, aku sering ngerasa pasti salah duluan.', 'Percaya Diri', '[{"label":"Sangat Setuju","value":1},{"label":"Setuju","value":2},{"label":"Kurang Setuju","value":3},{"label":"Tidak Setuju","value":4}]'),
('self_esteem', 5, 'Aku berani nanya atau minta diajarin ulang ke guru kalau pelajarannya belum nyambung.', 'Percaya Diri', '[{"label":"Sangat Setuju","value":4},{"label":"Setuju","value":3},{"label":"Kurang Setuju","value":2},{"label":"Tidak Setuju","value":1}]'),
('self_esteem', 6, 'Aku sering merasa malu sama orang kalau nginget kondisi ekonomi atau rumah orang tuaku.', 'Penerimaan Diri', '[{"label":"Sangat Setuju","value":1},{"label":"Setuju","value":2},{"label":"Kurang Setuju","value":3},{"label":"Tidak Setuju","value":4}]'),
('self_esteem', 7, 'Aku merasa punya sifat dan kelakuan yang baik, dan teman-teman juga suka itu.', 'Penghargaan Diri', '[{"label":"Sangat Setuju","value":4},{"label":"Setuju","value":3},{"label":"Kurang Setuju","value":2},{"label":"Tidak Setuju","value":1}]'),
('self_esteem', 8, 'Aku sering iri dan berandai-andai pengen banget dilahirin jadi orang lain aja.', 'Penerimaan Diri', '[{"label":"Sangat Setuju","value":1},{"label":"Setuju","value":2},{"label":"Kurang Setuju","value":3},{"label":"Tidak Setuju","value":4}]'),
('self_esteem', 9, 'Walaupun susah, aku selalu nyoba nyelesain masalahku sendiri dulu tanpa nyerah.', 'Percaya Diri', '[{"label":"Sangat Setuju","value":4},{"label":"Setuju","value":3},{"label":"Kurang Setuju","value":2},{"label":"Tidak Setuju","value":1}]'),
('self_esteem', 10, 'Setiap kali ngaca atau lihat fotoku, aku ngerasa banyak banget jeleknya.', 'Penerimaan Diri', '[{"label":"Sangat Setuju","value":1},{"label":"Setuju","value":2},{"label":"Kurang Setuju","value":3},{"label":"Tidak Setuju","value":4}]'),
('motivasi', 1, 'Aku belajar sungguh-sungguh karena aku memang suka dan ingin tahu lebih banyak.', 'Intrinsik', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('motivasi', 2, 'Aku merasa puas dan senang kalau berhasil memecahkan soal pelajaran yang susah.', 'Intrinsik', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('motivasi', 3, 'Aku rajin belajar karena takut dimarahi guru atau dihukum orang tua.', 'Ekstrinsik', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('motivasi', 4, 'Aku semangat ngerjain tugas kalau dijanjiin hadiah atau uang jajan tambahan.', 'Ekstrinsik', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('motivasi', 5, 'Kalau dikasih PR yang banyak, aku tetap berusaha nyelesain sampai tuntas.', 'Ketekunan', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('motivasi', 6, 'Aku gampang menyerah dan langsung nutup buku kalau nemu pelajaran yang susah.', 'Ketekunan', '[{"label":"Selalu","value":1},{"label":"Sering","value":2},{"label":"Kadang-kadang","value":3},{"label":"Tidak Pernah","value":4}]'),
('motivasi', 7, 'Walaupun nggak ada ulangan besok, aku tetap meluangkan waktu buat belajar di rumah.', 'Ketekunan', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('motivasi', 8, 'Mencari nilai bagus adalah kepuasan pribadiku, bukan cuma buat pamer ke teman.', 'Intrinsik', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('motivasi', 9, 'Aku cuma mau mencatat pelajaran kalau disuruh atau diawasin guru.', 'Ekstrinsik', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('motivasi', 10, 'Belajar hal baru bikin aku ngerasa berkembang dan makin pintar setiap hari.', 'Intrinsik', '[{"label":"Selalu","value":4},{"label":"Sering","value":3},{"label":"Kadang-kadang","value":2},{"label":"Tidak Pernah","value":1}]'),
('multiple_intelligence', 1, 'Aku suka banget nulis cerita, puisi, atau ngisi diary kegiatan sehari-hari.', 'Linguistik', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 2, 'Aku gampang ngafal kata-kata baru, jago berdebat, atau suka ngobrol lama.', 'Linguistik', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 3, 'Pelajaran berhitung kayak matematika atau main tebak-tebakan logika itu seru banget buatku.', 'Logika-Matematik', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 4, 'Aku suka nyari tahu kenapa suatu barang bisa rusak atau gimana mesin bekerja.', 'Logika-Matematik', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 5, 'Aku suka nge-gambar, corat-coret, atau ngebayangin bentuk bangunan di kepalaku.', 'Visual-Spasial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 6, 'Aku gampang ingat jalan dan jarang tersesat kalau pergi ke tempat baru.', 'Visual-Spasial', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 7, 'Aku nggak bisa diam lama-lama, tanganku gatal pengen gerak atau praktek langsung.', 'Kinestetik', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 8, 'Aku jago olahraga, nari, atau mainin barang dengan tangkas tanpa gampang jatuh.', 'Kinestetik', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 9, 'Aku suka banget nyanyi, dengerin musik, atau hafal nada lagu dengan cepat.', 'Musikal', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 10, 'Kalau lagi belajar atau ngerjain tugas, aku lebih fokus kalau sambil dengerin lagu.', 'Musikal', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 11, 'Aku punya banyak teman dan gampang banget berbaur di lingkungan baru.', 'Interpersonal', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 12, 'Teman-teman sering curhat ke aku karena aku bisa ngertiin perasaan mereka.', 'Interpersonal', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 13, 'Aku lebih suka kerja sendirian dan butuh waktu tenang buat mikirin diriku sendiri.', 'Intrapersonal', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 14, 'Aku tahu pasti apa kelebihan dan kelemahanku, serta tujuan hidupku ke depan.', 'Intrapersonal', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 15, 'Aku suka banget melihara hewan, merawat tanaman, atau jalan-jalan ke alam bebas.', 'Naturalis', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]'),
('multiple_intelligence', 16, 'Aku peduli banget sama lingkungan, misalnya nggak tega buang sampah sembarangan.', 'Naturalis', '[{"label":"Ya","value":1},{"label":"Tidak","value":0}]');


-- ==============================================
-- SEED BAGIAN 3: INSTRUMEN KE-8
-- ==============================================

-- ================================================
-- BK INSIGHT â€” INSTRUMEN KE-8
-- Deteksi Risiko Perilaku & Kondisi Keluarga
-- ================================================
-- Framework  : Problem Behavior Theory (Jessor & Jessor, 1977)
--              + Adverse Childhood Experiences (ACE) Screening
-- Target     : Siswa SMP, usia 12â€“15 tahun
-- Skala      : Likert 1â€“5 (Tidak Pernah â†’ Hampir Selalu)
-- Total Soal : 60 (36 Domain A + 14 Domain B + 10 Skala Validitas)
-- Durasi     : 8â€“12 menit
-- ================================================
-- KODING DOMAIN (internal, tidak ditampilkan ke siswa):
--   A  = Domain A: Risiko Perilaku (pertanyaan reguler)
--   AR = Domain A: Risiko Perilaku (reverse-scored)
--   B+ = Domain B: Kondisi Keluarga (positif, reverse-scored untuk skor risiko)
--   B- = Domain B: Kondisi Keluarga (negatif, skor langsung)
--   V  = Skala Validitas (deteksi faking good / careless responding)
-- ================================================

INSERT INTO public.instruments (id, nama, deskripsi, kategori, total_soal)
VALUES (
  'risiko_perilaku',
  'Deteksi Risiko Perilaku & Keluarga',
  'Instrumen skrining awal untuk mendeteksi potensi risiko perilaku siswa dan kualitas dukungan lingkungan keluarga. Bukan alat diagnosisâ€”hanya screening tool untuk membantu guru BK menentukan prioritas pendampingan.',
  'Skrining Perilaku & Keluarga',
  60
)
ON CONFLICT (id) DO NOTHING;

-- Catatan: bidang = NULL agar tidak ditampilkan sebagai label ke siswa
-- (menjaga kerahasiaan tujuan tiap butir soal dari responden)

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 1 | Domain A (Kontrol Diri - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 1,
 'Kalau lagi emosi, aku susah buat diem aja.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 2 | Domain B+ (Dukungan Emosional - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 2,
 'Di rumah, ada orang yang selalu dengerin kalau aku curhat.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 3 | Domain A (Sensation Seeking - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 3,
 'Ngelakuin sesuatu yang dilarang rasanya lebih seru buat aku.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 4 | Domain V (Faking Good Detection)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 4,
 'Aku selalu jujur dalam semua hal, tanpa pernah bohong sama sekali.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 5 | Domain A (Pengaruh Teman - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 5,
 'Kalau teman ngajak, aku kadang langsung ikut aja.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 6 | Domain B+ (Komunikasi Keluarga - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 6,
 'Orang di rumahku tahu siapa saja teman dekatku.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 7 | Domain AR (Tanggung Jawab - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 7,
 'Kalau ada tugas yang susah, aku tetap ngerjain sendiri.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 8 | Domain A (Impulsivitas - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 8,
 'Kalau ada yang nyebelin, aku langsung bereaksi tanpa mikir dulu.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 9 | Domain A (Pengaruh Teman - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 9,
 'Aku susah bilang nggak kalau teman ngajak sesuatu yang seru.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 10 | Domain B- (Kondisi Keluarga - negatif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 10,
 'Aku sering ngerasa kesepian meski ada keluarga di rumah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 11 | Domain A (Kejujuran - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 11,
 'Aku pernah bohong ke guru buat ngindarin masalah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 12 | Domain AR (Kontrol Diri - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 12,
 'Waktu marah, aku masih bisa mikirin dulu akibatnya.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 13 | Domain V (Faking Good Detection)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 13,
 'Aku nggak pernah ngerasa iri sama teman, sama sekali.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 14 | Domain A (Tanggung Jawab - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 14,
 'Aku pernah nyalahin orang lain biar aku nggak kena masalah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 15 | Domain B+ (Hubungan Orang Tua - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 15,
 'Aku ngerasa nyaman kalau mau ngobrol sama orang tua atau wali.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 16 | Domain A (Sensation Seeking - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 16,
 'Aku suka nyoba hal baru meski risikonya belum jelas.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 17 | Domain A (Kepatuhan Aturan - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 17,
 'Peraturan sekolah itu kadang bikin aku pengen ngelanggar aja.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 18 | Domain B+ (Figur Dewasa Terpercaya - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 18,
 'Ada orang dewasa yang bisa aku percaya buat berbagi masalah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 19 | Domain AR (Penyelesaian Konflik - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 19,
 'Kalau ada masalah sama teman, aku lebih suka ngomong baik-baik.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 20 | Domain A (Konformitas - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 20,
 'Aku lebih suka nurutin teman daripada diketawain sendiri.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 21 | Domain B+ (Komunikasi Keluarga - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 21,
 'Di rumah, kami sering ngobrol santai bareng sekeluarga.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 22 | Domain A (Impulsivitas - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 22,
 'Aku gampang kepancing kalau orang lain mulai duluan.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 23 | Domain V (Faking Good Detection)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 23,
 'Aku selalu melakukan semua hal dengan benar, nggak pernah salah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 24 | Domain A (Sensation Seeking - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 24,
 'Aku pernah ngelakuin sesuatu yang dilarang cuma buat seru-seruan.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 25 | Domain B+ (Kenyamanan di Rumah - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 25,
 'Aku ngerasa rumah adalah tempat yang nyaman buat aku.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 26 | Domain AR (Kejujuran & Tanggung Jawab - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 26,
 'Kalau bikin kesalahan, aku mau ngakuin ke yang bersangkutan.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 27 | Domain A (Kepatuhan Aturan - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 27,
 'Kalau gurunya nggak masuk, aku lebih milih keluar kelas aja.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 28 | Domain A (Konformitas - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 28,
 'Kalau semua teman ngelakuin sesuatu, aku ikut biar nggak beda sendiri.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 29 | Domain A (Tanggung Jawab - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 29,
 'Aku sering lupa nunapin janji yang udah aku buat.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 30 | Domain B+ (Pengawasan Orang Tua - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 30,
 'Orang tua atau wali aku tahu kegiatan aku sehari-hari.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 31 | Domain A (Konsekuensi Impulsif - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 31,
 'Aku pernah nyesel karena terlanjur marah-marah ke orang lain.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 32 | Domain V (Faking Good Detection)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 32,
 'Aku nggak pernah punya pikiran buruk tentang orang lain sama sekali.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 33 | Domain A (Agresivitas - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 33,
 'Kalau ada yang ngejek aku, aku langsung pengen bales.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 34 | Domain B+ (Rasa Aman - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 34,
 'Aku ngerasa aman dan terlindungi di lingkungan rumahku.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 35 | Domain AR (Risk Taking - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 35,
 'Aku lebih milih aman dan nggak ambil risiko yang nggak perlu.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 36 | Domain A (Penghindaran Tanggung Jawab - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 36,
 'Kalau nggak ngerjain PR, aku lebih suka cari alasan ke guru.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 37 | Domain B+ (Dukungan Keluarga - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 37,
 'Aku ngerasa didukung dan diperhatiin sama keluarga di rumah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 38 | Domain A (Kecurangan Akademis - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 38,
 'Aku pernah nyontek waktu ulangan karena takut nilai jelek.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 39 | Domain AR (Asertivitas - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 39,
 'Aku bisa bilang nggak ke teman kalau aku memang nggak mau.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 40 | Domain V (Inconsistency Check)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 40,
 'Aku nggak pernah ikut-ikutan teman buat ngelakuin hal yang salah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 41 | Domain A (Impulsivitas - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 41,
 'Aku langsung bertindak kalau lagi panas, tanpa mikir panjang.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 42 | Domain B+ (Dukungan Darurat - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 42,
 'Kalau ada masalah besar, aku bisa minta tolong ke orang di rumah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 43 | Domain A (Risk Taking - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 43,
 'Aku suka tantangan, meski itu bisa bikin aku kena masalah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 44 | Domain A (Perilaku Kelompok Negatif - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 44,
 'Aku pernah ikut-ikutan rame-rame ngusilin atau ngerjain teman lain.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 45 | Domain V (Inconsistency Check)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 45,
 'Aku selalu menyelesaikan semua tugas sekolah tepat waktu tanpa kecuali.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 46 | Domain AR (Kontrol Diri - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 46,
 'Aku bisa nahan diri kalau mau ngomong sesuatu yang kasar.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 47 | Domain B+ (Komunikasi Respons - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 47,
 'Orang di rumahku mau dengerin dan merespons cerita atau masalahku.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 48 | Domain A (Kejujuran - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 48,
 'Kalau ada barang orang lain yang tergeletak, aku lebih milih pura-pura nggak tau.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 49 | Domain A (Ketertarikan Hal Terlarang - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 49,
 'Aku ngerasa penasaran sama hal-hal yang dilarang atau tersembunyi.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 50 | Domain V (Inconsistency Check)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 50,
 'Aku selalu nurut sama semua aturan tanpa pernah melanggar sama sekali.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 51 | Domain A (Orientasi Sosial - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 51,
 'Menurut aku, yang paling penting itu disukai dan diterima di kelompok teman.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 52 | Domain V (Faking Good / Saintly)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 52,
 'Aku nggak pernah merasa bete atau frustrasi sama sekali.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 53 | Domain AR (Kepatuhan - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 53,
 'Aku tetap masuk kelas meski lagi males banget sekalipun.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 54 | Domain AR (Deliberasi - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 54,
 'Waktu ada masalah, aku lebih milih mikir dulu sebelum bereaksi.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 55 | Domain B+ (Sumber Dukungan - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 55,
 'Aku punya seseorang untuk curhat yang bikin aku ngerasa lebih tenang.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 56 | Domain AR (Tanggung Jawab - reverse)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 56,
 'Aku mau tanggung jawab kalau udah bikin kesalahan ke orang lain.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 57 | Domain V (Faking Good / Saintly)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 57,
 'Aku nggak pernah ngelakuin sesuatu yang aku tau itu salah.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 58 | Domain B+ (Rasa Dihargai - positif)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 58,
 'Di rumah, aku ngerasa didengar dan dianggap penting sama keluarga.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 59 | Domain A (Kesiapan Melanggar Norma - regular)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 59,
 'Aku ngerasa cukup berani buat ngelanggar aturan kalau situasinya tepat.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]'),

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- SOAL 60 | Domain V (Faking Good / Saintly)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
('risiko_perilaku', 60,
 'Aku nggak pernah berbohong, bahkan cuma bohong kecil sekalipun.',
 NULL,
 '[{"label":"Tidak Pernah","value":1},{"label":"Jarang","value":2},{"label":"Kadang-kadang","value":3},{"label":"Sering","value":4},{"label":"Hampir Selalu","value":5}]');

-- ================================================
-- VERIFIKASI SETELAH INSERT:
-- SELECT COUNT(*) FROM questions WHERE instrument_id = 'risiko_perilaku';
-- Expected: 60
-- Domain A (regular): 1,3,5,8,9,11,14,16,17,20,22,24,27,28,29,31,33,36,38,41,43,44,48,49,51,59 = 26 items
-- Domain A (reverse): 7,12,19,26,35,39,46,53,54,56 = 10 items
-- Domain A total: 36 items
-- Domain B (positive): 2,6,15,18,21,25,30,34,37,42,47,55,58 = 13 items
-- Domain B (negative): 10 = 1 item
-- Domain B total: 14 items
-- Validity Scale: 4,13,23,32,40,45,50,52,57,60 = 10 items
-- GRAND TOTAL: 60 items âœ“
-- ================================================

