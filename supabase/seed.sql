-- =======================================================
-- BK INSIGHT MVP - SEED DATA (DUMMY DATA FOR TESTING)
-- =======================================================

-- 1. Academic Year
INSERT INTO public.academic_years (id, tahun_ajaran, semester, is_active)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2025/2026', 'Ganjil', true)
ON CONFLICT (tahun_ajaran) DO NOTHING;

-- 2. Classes
INSERT INTO public.classes (id, nama_kelas, tingkat, academic_year_id)
VALUES 
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VII A', 'VII', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'VII B', 'VII', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- 3. Students
INSERT INTO public.students (id, nama, gender, kelas_id, tanggal_lahir)
VALUES 
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Aditya Pratama', 'L', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2010-05-14'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Bunga Citra', 'P', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2010-08-20'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Candra Wijaya', 'L', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2010-11-02'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Diana Putri', 'P', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2010-02-15');

-- 4. Guru
INSERT INTO public.users_guru (id, nama, email, role)
VALUES 
('60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Budi Santoso, S.Pd', 'guru@bkinsight.sch.id', 'guru_bk')
ON CONFLICT (email) DO NOTHING;

-- 5. Instruments
INSERT INTO public.instruments (id, nama, deskripsi, kategori, total_soal)
VALUES 
('akpd_7', 'AKPD Kelas 7', 'Angket Kebutuhan Peserta Didik untuk Kelas 7', 'Kebutuhan', 40),
('aum', 'AUM Umum', 'Alat Ungkap Masalah Umum', 'Masalah', 40),
('bullying', 'Asesmen Bullying', 'Deteksi Risiko dan Peran Bullying', 'Sosial', 10),
('sosiometri', 'Sosiometri', 'Pemetaan Relasi Sosial Kelas', 'Sosial', 0)
ON CONFLICT (id) DO NOTHING;

-- 6. Sample Questions for AKPD (Just a few for testing)
INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban)
VALUES 
('akpd_7', 1, 'Aku sering bingung, sebenarnya apa sih kelebihan dan bakatku?', 'Pribadi', '[{"label": "Ya", "value": 1}, {"label": "Tidak", "value": 0}]'),
('akpd_7', 2, 'Aku merasa susah atau malu buat ngajak ngobrol teman baru kenal.', 'Sosial', '[{"label": "Ya", "value": 1}, {"label": "Tidak", "value": 0}]'),
('akpd_7', 3, 'Aku bingung gimana cara ngatur waktu antara main, bantu orang tua di rumah, dan belajar.', 'Belajar', '[{"label": "Ya", "value": 1}, {"label": "Tidak", "value": 0}]'),
('akpd_7', 4, 'Aku belum tahu kalau udah besar nanti pengen kerja jadi apa.', 'Karier', '[{"label": "Ya", "value": 1}, {"label": "Tidak", "value": 0}]');

-- 7. Dummy Active Assessment
INSERT INTO public.assessments (id, instrument_id, kelas_id, judul, tanggal_mulai, tanggal_selesai, is_published, created_by)
VALUES 
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'akpd_7', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'AKPD Awal Tahun Kelas 7A', '2025-07-01', '2026-12-31', true, '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
