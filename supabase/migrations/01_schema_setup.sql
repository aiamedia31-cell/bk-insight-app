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
