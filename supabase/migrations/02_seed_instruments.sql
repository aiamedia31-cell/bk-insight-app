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
