-- ================================================================
-- BK INSIGHT — INSTRUMEN PROFIL SITUASI KELUARGA
-- ================================================================
-- ID        : profil_keluarga
-- Tujuan    : Data faktual kondisi keluarga siswa
-- Format    : Pilihan ganda (single-select), BUKAN Likert
-- Total     : 8 pertanyaan
-- Catatan   : Bukan asesmen psikologis. Murni data pendukung BK.
-- ================================================================

INSERT INTO public.instruments (id, nama, deskripsi, kategori, total_soal)
VALUES (
  'profil_keluarga',
  'Profil Situasi Keluarga',
  'Pengumpulan data faktual kondisi keluarga siswa untuk membantu guru BK memahami latar belakang kehidupan siswa. Bukan asesmen psikologis—digunakan murni sebagai data pendukung layanan BK yang lebih personal.',
  'Data Awal Siswa',
  8
)
ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    deskripsi = EXCLUDED.deskripsi,
    total_soal = EXCLUDED.total_soal;

DELETE FROM public.questions WHERE instrument_id = 'profil_keluarga';

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES

-- Q1: Status orang tua
('profil_keluarga', 1,
 'Saat ini, ayah dan ibu kandungku...',
 NULL,
 '[{"label":"Masih bersama dan tinggal serumah","value":1},{"label":"Sudah bercerai atau hidup terpisah","value":2},{"label":"Salah satunya sudah berpulang (meninggal)","value":3},{"label":"Keduanya sudah berpulang (meninggal)","value":4}]'),

-- Q2: Tinggal bersama siapa
('profil_keluarga', 2,
 'Sehari-hari, aku tinggal bersama...',
 NULL,
 '[{"label":"Ayah & Ibu kandung","value":1},{"label":"Salah satu orang tua kandung saja","value":2},{"label":"Nenek, Kakek, atau Wali keluarga lainnya","value":3},{"label":"Ayah tiri atau Ibu tiri","value":4}]'),

-- Q3: Hubungan dengan figur pengasuh
('profil_keluarga', 3,
 'Hubunganku dengan orang tua atau wali yang merawatku saat ini...',
 NULL,
 '[{"label":"Sangat dekat — aku bisa cerita apa saja","value":1},{"label":"Baik, meski kami jarang ngobrol panjang","value":2},{"label":"Kurang dekat","value":3},{"label":"Tidak dekat, atau sering ada masalah di antara kami","value":4}]'),

-- Q4: Konflik di rumah
('profil_keluarga', 4,
 'Di rumahku, pertengkaran atau keributan antar orang dewasa...',
 NULL,
 '[{"label":"Hampir tidak pernah terjadi","value":1},{"label":"Kadang-kadang terjadi","value":2},{"label":"Sering terjadi","value":3}]'),

-- Q5: Kondisi ekonomi
('profil_keluarga', 5,
 'Untuk kebutuhan sehari-hari seperti makan dan sekolah, keluargaku...',
 NULL,
 '[{"label":"Cukup terpenuhi atau lebih dari cukup","value":1},{"label":"Pas-pasan, kadang susah memenuhinya","value":2},{"label":"Sering kekurangan dan kesulitan","value":3}]'),

-- Q6: Perubahan besar dalam setahun terakhir
('profil_keluarga', 6,
 'Dalam setahun terakhir, ada perubahan besar di keluargaku:',
 NULL,
 '[{"label":"Tidak ada perubahan besar","value":1},{"label":"Orang tua baru bercerai atau berpisah","value":2},{"label":"Ada anggota keluarga yang meninggal dunia","value":3},{"label":"Orang tua menikah lagi","value":4}]'),

-- Q7: Tempat tinggal
('profil_keluarga', 7,
 'Saat ini aku tinggal di...',
 NULL,
 '[{"label":"Rumah keluargaku sendiri","value":1},{"label":"Rumah saudara atau wali","value":2},{"label":"Kos / Asrama / Panti Asuhan","value":3}]'),

-- Q8: Pengawasan orang dewasa
('profil_keluarga', 8,
 'Ada orang dewasa di rumah yang peduli dan mengawasi kegiatanku sehari-hari?',
 NULL,
 '[{"label":"Ya, selalu ada","value":1},{"label":"Kadang ada, kadang tidak","value":2},{"label":"Tidak ada — aku lebih banyak sendiri","value":3}]');

-- ================================================================
-- VERIFIKASI:
-- SELECT COUNT(*) FROM questions WHERE instrument_id = 'profil_keluarga';
-- Expected: 8
-- ================================================================
