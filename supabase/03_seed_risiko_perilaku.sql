-- ================================================================
-- BK INSIGHT â€” TAMBAH INSTRUMEN KE-8 (SAFE VERSION)
-- ================================================================
-- Jalankan file ini jika schema & instrumen 1-7 sudah ada.
-- File ini aman dijalankan berulang kali (idempotent).
-- ================================================================

-- Step 1: Cek dulu apakah tabel instruments ada
-- Jika error "relation does not exist" maka jalankan FULL_SETUP_ALL_IN_ONE.sql dahulu

-- Step 2: Insert instrument catalog ke-8
INSERT INTO public.instruments (id, nama, deskripsi, kategori, total_soal)
VALUES (
  'risiko_perilaku',
  'Deteksi Risiko Perilaku & Keluarga',
  'Instrumen skrining awal untuk mendeteksi potensi risiko perilaku siswa dan kualitas dukungan lingkungan keluarga. Bukan alat diagnosisâ€”hanya screening tool untuk membantu guru BK menentukan prioritas pendampingan.',
  'Skrining Perilaku & Keluarga',
  68
)
ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    deskripsi = EXCLUDED.deskripsi,
    total_soal = EXCLUDED.total_soal;

-- Step 3: Hapus soal lama jika ada (aman untuk re-run)
DELETE FROM public.questions WHERE instrument_id = 'risiko_perilaku';

-- Step 4: Insert 60 soal
INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES

-- Soal 1 (Domain A - Kontrol Diri)
('risiko_perilaku', 1, 'Kalau lagi emosi, aku susah buat diem aja.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 2 (Domain B+ - Dukungan Emosional)
('risiko_perilaku', 2, 'Di rumah, ada orang yang selalu dengerin kalau aku curhat.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 3 (Domain A - Sensation Seeking)
('risiko_perilaku', 3, 'Ngelakuin sesuatu yang dilarang rasanya lebih seru buat aku.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 4 (Domain V - Faking Good)
('risiko_perilaku', 4, 'Aku selalu jujur dalam semua hal, tanpa pernah bohong sama sekali.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 5 (Domain A - Pengaruh Teman)
('risiko_perilaku', 5, 'Kalau teman ngajak, aku kadang langsung ikut aja.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 6 (Domain B+ - Komunikasi Keluarga)
('risiko_perilaku', 6, 'Orang di rumahku tahu siapa saja teman dekatku.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 7 (Domain AR - Tanggung Jawab, reverse)
('risiko_perilaku', 7, 'Kalau ada tugas yang susah, aku tetap ngerjain sendiri.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 8 (Domain A - Impulsivitas)
('risiko_perilaku', 8, 'Kalau ada yang nyebelin, aku langsung bereaksi tanpa mikir dulu.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 9 (Domain A - Pengaruh Teman)
('risiko_perilaku', 9, 'Aku susah bilang nggak kalau teman ngajak sesuatu yang seru.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 10 (Domain B- - Kondisi Keluarga Negatif)
('risiko_perilaku', 10, 'Aku sering ngerasa kesepian meski ada keluarga di rumah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 11 (Domain A - Kejujuran)
('risiko_perilaku', 11, 'Aku pernah bohong ke guru buat ngindarin masalah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 12 (Domain AR - Kontrol Diri, reverse)
('risiko_perilaku', 12, 'Waktu marah, aku masih bisa mikirin dulu akibatnya.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 13 (Domain V - Faking Good)
('risiko_perilaku', 13, 'Aku nggak pernah ngerasa iri sama teman, sama sekali.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 14 (Domain A - Tanggung Jawab)
('risiko_perilaku', 14, 'Aku pernah nyalahin orang lain biar aku nggak kena masalah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 15 (Domain B+ - Hubungan Orang Tua)
('risiko_perilaku', 15, 'Aku ngerasa nyaman kalau mau ngobrol sama orang tua atau wali.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 16 (Domain A - Sensation Seeking)
('risiko_perilaku', 16, 'Aku suka nyoba hal baru meski risikonya belum jelas.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 17 (Domain A - Kepatuhan Aturan)
('risiko_perilaku', 17, 'Peraturan sekolah itu kadang bikin aku pengen ngelanggar aja.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 18 (Domain B+ - Figur Dewasa Terpercaya)
('risiko_perilaku', 18, 'Ada orang dewasa yang bisa aku percaya buat berbagi masalah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 19 (Domain AR - Penyelesaian Konflik, reverse)
('risiko_perilaku', 19, 'Kalau ada masalah sama teman, aku lebih suka ngomong baik-baik.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 20 (Domain A - Konformitas)
('risiko_perilaku', 20, 'Aku lebih suka nurutin teman daripada diketawain sendiri.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 21 (Domain B+ - Komunikasi Keluarga)
('risiko_perilaku', 21, 'Di rumah, kami sering ngobrol santai bareng sekeluarga.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 22 (Domain A - Impulsivitas)
('risiko_perilaku', 22, 'Aku gampang kepancing kalau orang lain mulai duluan.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 23 (Domain V - Faking Good)
('risiko_perilaku', 23, 'Aku selalu melakukan semua hal dengan benar, nggak pernah salah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 24 (Domain A - Sensation Seeking)
('risiko_perilaku', 24, 'Aku pernah ngelakuin sesuatu yang dilarang cuma buat seru-seruan.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 25 (Domain B+ - Kenyamanan di Rumah)
('risiko_perilaku', 25, 'Aku ngerasa rumah adalah tempat yang nyaman buat aku.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 26 (Domain AR - Kejujuran & Tanggung Jawab, reverse)
('risiko_perilaku', 26, 'Kalau bikin kesalahan, aku mau ngakuin ke yang bersangkutan.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 27 (Domain A - Kepatuhan Aturan)
('risiko_perilaku', 27, 'Kalau gurunya nggak masuk, aku lebih milih keluar kelas aja.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 28 (Domain A - Konformitas)
('risiko_perilaku', 28, 'Kalau semua teman ngelakuin sesuatu, aku ikut biar nggak beda sendiri.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 29 (Domain A - Tanggung Jawab)
('risiko_perilaku', 29, 'Aku sering lupa nunapin janji yang udah aku buat.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 30 (Domain B+ - Pengawasan Orang Tua)
('risiko_perilaku', 30, 'Orang tua atau wali aku tahu kegiatan aku sehari-hari.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 31 (Domain A - Konsekuensi Impulsif)
('risiko_perilaku', 31, 'Aku pernah nyesel karena terlanjur marah-marah ke orang lain.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 32 (Domain V - Faking Good)
('risiko_perilaku', 32, 'Aku nggak pernah punya pikiran buruk tentang orang lain sama sekali.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 33 (Domain A - Agresivitas)
('risiko_perilaku', 33, 'Kalau ada yang ngejek aku, aku langsung pengen bales.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 34 (Domain B+ - Rasa Aman)
('risiko_perilaku', 34, 'Aku ngerasa aman dan terlindungi di lingkungan rumahku.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 35 (Domain AR - Risk Taking, reverse)
('risiko_perilaku', 35, 'Aku lebih milih aman dan nggak ambil risiko yang nggak perlu.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 36 (Domain A - Penghindaran Tanggung Jawab)
('risiko_perilaku', 36, 'Kalau nggak ngerjain PR, aku lebih suka cari alasan ke guru.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 37 (Domain B+ - Dukungan Keluarga)
('risiko_perilaku', 37, 'Aku ngerasa didukung dan diperhatiin sama keluarga di rumah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 38 (Domain A - Kecurangan Akademis)
('risiko_perilaku', 38, 'Aku pernah nyontek waktu ulangan karena takut nilai jelek.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 39 (Domain AR - Asertivitas, reverse)
('risiko_perilaku', 39, 'Aku bisa bilang nggak ke teman kalau aku memang nggak mau.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 40 (Domain V - Inconsistency Check)
('risiko_perilaku', 40, 'Aku nggak pernah ikut-ikutan teman buat ngelakuin hal yang salah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 41 (Domain A - Impulsivitas)
('risiko_perilaku', 41, 'Aku langsung bertindak kalau lagi panas, tanpa mikir panjang.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 42 (Domain B+ - Dukungan Darurat)
('risiko_perilaku', 42, 'Kalau ada masalah besar, aku bisa minta tolong ke orang di rumah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 43 (Domain A - Risk Taking)
('risiko_perilaku', 43, 'Aku suka tantangan, meski itu bisa bikin aku kena masalah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 44 (Domain A - Perilaku Kelompok Negatif)
('risiko_perilaku', 44, 'Aku pernah ikut-ikutan rame-rame ngusilin atau ngerjain teman lain.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 45 (Domain V - Inconsistency Check)
('risiko_perilaku', 45, 'Aku selalu menyelesaikan semua tugas sekolah tepat waktu tanpa kecuali.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 46 (Domain AR - Kontrol Diri, reverse)
('risiko_perilaku', 46, 'Aku bisa nahan diri kalau mau ngomong sesuatu yang kasar.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 47 (Domain B+ - Komunikasi Respons)
('risiko_perilaku', 47, 'Orang di rumahku mau dengerin dan merespons cerita atau masalahku.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 48 (Domain A - Kejujuran)
('risiko_perilaku', 48, 'Kalau ada barang orang lain yang tergeletak, aku lebih milih pura-pura nggak tau.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 49 (Domain A - Ketertarikan Hal Terlarang)
('risiko_perilaku', 49, 'Aku ngerasa penasaran sama hal-hal yang dilarang atau tersembunyi.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 50 (Domain V - Inconsistency Check)
('risiko_perilaku', 50, 'Aku selalu nurut sama semua aturan tanpa pernah melanggar sama sekali.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 51 (Domain A - Orientasi Sosial)
('risiko_perilaku', 51, 'Menurut aku, yang paling penting itu disukai dan diterima di kelompok teman.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 52 (Domain V - Faking Good / Saintly)
('risiko_perilaku', 52, 'Aku nggak pernah merasa bete atau frustrasi sama sekali.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 53 (Domain AR - Kepatuhan, reverse)
('risiko_perilaku', 53, 'Aku tetap masuk kelas meski lagi males banget sekalipun.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 54 (Domain AR - Deliberasi, reverse)
('risiko_perilaku', 54, 'Waktu ada masalah, aku lebih milih mikir dulu sebelum bereaksi.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 55 (Domain B+ - Sumber Dukungan)
('risiko_perilaku', 55, 'Aku punya seseorang untuk curhat yang bikin aku ngerasa lebih tenang.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 56 (Domain AR - Tanggung Jawab, reverse)
('risiko_perilaku', 56, 'Aku mau tanggung jawab kalau udah bikin kesalahan ke orang lain.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 57 (Domain V - Faking Good / Saintly)
('risiko_perilaku', 57, 'Aku nggak pernah ngelakuin sesuatu yang aku tau itu salah.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 58 (Domain B+ - Rasa Dihargai)
('risiko_perilaku', 58, 'Di rumah, aku ngerasa didengar dan dianggap penting sama keluarga.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 59 (Domain A - Kesiapan Melanggar Norma)
('risiko_perilaku', 59, 'Aku ngerasa cukup berani buat ngelanggar aturan kalau situasinya tepat.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]'),

-- Soal 60 (Domain V - Faking Good / Saintly)
('risiko_perilaku', 60, 'Aku nggak pernah berbohong, bahkan cuma bohong kecil sekalipun.', NULL, '[{"label":"Tidak Pernah","value":1},{"label":"Kadang-kadang","value":2},{"label":"Sering","value":3}]');

-- ================================================================
-- VERIFIKASI:
-- SELECT COUNT(*) FROM questions WHERE instrument_id = 'risiko_perilaku';
-- Expected: 60
-- SELECT * FROM instruments WHERE id = 'risiko_perilaku';
-- Expected: 1 row
-- ================================================================

-- ================================================================
-- BAGIAN 2: PROFIL SITUASI KELUARGA (Q61–Q68)
-- Format   : Pilihan ganda faktual (single-select, BUKAN Likert)
-- Bidang   : 'Profil Keluarga' (untuk membedakan dari Likert)
-- ================================================================

INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES

('risiko_perilaku', 61,
 'Saat ini, ayah dan ibu kandungku...',
 'Profil Keluarga',
 '[{"label":"Masih bersama dan tinggal serumah","value":1},{"label":"Sudah bercerai atau hidup terpisah","value":2},{"label":"Salah satunya sudah berpulang (meninggal)","value":3},{"label":"Keduanya sudah berpulang (meninggal)","value":4}]'),

('risiko_perilaku', 62,
 'Sehari-hari, aku tinggal bersama...',
 'Profil Keluarga',
 '[{"label":"Ayah dan Ibu kandung","value":1},{"label":"Salah satu orang tua kandung saja","value":2},{"label":"Nenek, Kakek, atau Wali keluarga lainnya","value":3},{"label":"Ayah tiri atau Ibu tiri","value":4}]'),

('risiko_perilaku', 63,
 'Hubunganku dengan orang tua atau wali yang merawatku saat ini...',
 'Profil Keluarga',
 '[{"label":"Sangat dekat, aku bisa cerita apa saja","value":1},{"label":"Baik, meski kami jarang ngobrol panjang","value":2},{"label":"Kurang dekat","value":3},{"label":"Tidak dekat, atau sering ada masalah di antara kami","value":4}]'),

('risiko_perilaku', 64,
 'Di rumahku, pertengkaran atau keributan antar orang dewasa...',
 'Profil Keluarga',
 '[{"label":"Hampir tidak pernah terjadi","value":1},{"label":"Kadang-kadang terjadi","value":2},{"label":"Sering terjadi","value":3}]'),

('risiko_perilaku', 65,
 'Untuk kebutuhan sehari-hari seperti makan dan sekolah, keluargaku...',
 'Profil Keluarga',
 '[{"label":"Cukup terpenuhi atau lebih dari cukup","value":1},{"label":"Pas-pasan, kadang susah memenuhinya","value":2},{"label":"Sering kekurangan dan kesulitan","value":3}]'),

('risiko_perilaku', 66,
 'Dalam setahun terakhir, ada perubahan besar di keluargaku:',
 'Profil Keluarga',
 '[{"label":"Tidak ada perubahan besar","value":1},{"label":"Orang tua baru bercerai atau berpisah","value":2},{"label":"Ada anggota keluarga yang meninggal dunia","value":3},{"label":"Orang tua menikah lagi","value":4}]'),

('risiko_perilaku', 67,
 'Saat ini aku tinggal di...',
 'Profil Keluarga',
 '[{"label":"Rumah keluargaku sendiri","value":1},{"label":"Rumah saudara atau wali","value":2},{"label":"Kos / Asrama / Panti Asuhan","value":3}]'),

('risiko_perilaku', 68,
 'Ada orang dewasa di rumah yang peduli dan mengawasi kegiatanku sehari-hari?',
 'Profil Keluarga',
 '[{"label":"Ya, selalu ada","value":1},{"label":"Kadang ada, kadang tidak","value":2},{"label":"Tidak ada -- aku lebih banyak sendiri","value":3}]');

-- ================================================================
-- VERIFIKASI LENGKAP:
-- SELECT COUNT(*) FROM questions WHERE instrument_id = 'risiko_perilaku';
-- Expected: 68  (60 Likert + 8 Profil Keluarga)
-- SELECT COUNT(*) FROM questions WHERE instrument_id = 'risiko_perilaku' AND bidang = 'Profil Keluarga';
-- Expected: 8
-- ================================================================