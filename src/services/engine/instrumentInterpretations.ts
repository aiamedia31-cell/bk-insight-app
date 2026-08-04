export const AUM_INTERPRETATION_BANK: Record<number, string> = {
  1: "Sering mengalami kelelahan, pusing, atau keluhan fisik selama jam sekolah.",
  2: "Masalah kesehatan akibat sering tidak sarapan sebelum berangkat sekolah.",
  3: "Sering absen sekolah karena penyakit bawaan atau kondisi fisik yang lemah.",
  4: "Mengalami gangguan penglihatan saat melihat papan tulis.",
  5: "Mengalami rasa tidak nyaman atau tidak aman dengan bentuk/ukuran tubuh.",
  6: "Mengalami gangguan kesehatan ringan (gigi, sariawan, kulit) yang mengganggu belajar.",
  7: "Krisis kepercayaan diri merasa diri memiliki banyak kekurangan.",
  8: "Merasa sangat kesepian dan terasing meskipun berada di keramaian.",
  9: "Merasa kehilangan tujuan hidup dan menganggap hidup terlalu berat.",
  10: "Sering mengalami kecemasan atau ketakutan tanpa alasan yang jelas (indikasi anxiety).",
  11: "Kurangnya kasih sayang atau sering mendapat perlakuan keras dari orang tua.",
  12: "Tertekan akibat sering melihat konflik atau pertengkaran orang tua di rumah.",
  13: "Sering menangis dan memikirkan permasalahan keluarga.",
  14: "Kurangnya waktu komunikasi dengan orang tua akibat kesibukan kerja.",
  15: "Merasa dibedakan atau menjadi korban pilih kasih dalam keluarga.",
  16: "Menjadi korban gangguan, ejekan, atau pemalakan di sekolah.",
  17: "Tidak memiliki teman akrab untuk berbagi cerita atau curhat.",
  18: "Sedang mengalami konflik panjang yang belum terselesaikan dengan teman.",
  19: "Kesulitan dan merasa canggung/segan untuk berkomunikasi dengan guru.",
  20: "Merasa dijauhi oleh lingkungan sosial karena faktor kondisi rumah/penampilan.",
  21: "Kesulitan bergaul karena perbedaan gaya bahasa atau komunikasi.",
  22: "Merasa sedih akibat tidak mendapatkan uang saku yang cukup.",
  23: "Keluarga mengalami kesulitan finansial untuk biaya sekolah/tunggakan.",
  24: "Kelelahan belajar akibat harus ikut bekerja kasar membantu orang tua.",
  25: "Kebutuhan perlengkapan sekolah (seragam/sepatu) yang belum bisa terpenuhi.",
  26: "Suasana rumah tidak kondusif akibat beban hutang atau masalah finansial orang tua.",
  27: "Sering menahan lapar di sekolah karena tidak membawa bekal/uang saku.",
  28: "Merasa khawatir dengan ketersediaan makanan keluarga di rumah.",
  29: "Sering merasa takut dan cemas memikirkan masa depan yang suram.",
  30: "Kekhawatiran tinggi harus putus sekolah karena masalah biaya.",
  31: "Tuntutan orang tua untuk segera bekerja pasca lulus SMP/sederajat.",
  32: "Kebingungan akibat cita-cita masa depan yang tidak disetujui orang tua.",
  33: "Krisis keyakinan diri mengenai potensi yang bisa digunakan untuk bekerja.",
  34: "Ketakutan akan menganggur akibat sulitnya mencari lapangan pekerjaan.",
  35: "Kesulitan menangkap materi pelajaran yang dirasa terlalu berat.",
  36: "Kurangnya fasilitas belajar dasar (buku/LKS/penerangan) di rumah.",
  37: "Tingkat prokrastinasi tinggi (menunda PR demi game/HP).",
  38: "Ketakutan untuk bertanya akibat gaya mengajar guru yang kurang nyaman.",
  39: "Sering terlambat sekolah akibat masalah jarak atau transportasi.",
  40: "Ketakutan berlebih akan ancaman tinggal kelas akibat nilai buruk."
};

export const BULLYING_INTERPRETATION_BANK: Record<number, string> = {
  1: "Pernah menjadi sasaran ejekan verbal terkait fisik atau nama orang tua.",
  2: "Pernah disoraki atau dipermalukan secara publik saat berbicara di kelas.",
  3: "Pernah mengalami kekerasan fisik (dipukul/didorong/dijegal).",
  4: "Pernah mengalami kekerasan fisik berupa tendangan, cubitan, atau lemparan barang.",
  5: "Pernah mengalami perampasan, perusakan, atau penyembunyian barang pribadi.",
  6: "Pernah mengalami pengucilan sosial secara sengaja oleh teman-teman.",
  7: "Pernah mendapatkan penolakan sosial yang terlihat jelas dari kelompok pertemanan.",
  8: "Pernah menjadi korban penyebaran fitnah atau cerita bohong yang merusak reputasi.",
  9: "Pernah menerima ancaman atau caci maki secara digital (Cyberbullying).",
  10: "Pernah menjadi korban penyebaran aib/foto tanpa izin di media sosial (Cyberbullying)."
};

// Motivasi Negatif / Area of Improvement
export const MOTIVASI_INTERPRETATION_BANK: Record<number, string> = {
  3: "Motivasi belajar didorong oleh rasa takut hukuman, bukan kesadaran (Ekstrinsik Negatif).",
  4: "Motivasi belajar bergantung pada imbalan uang/hadiah (Ekstrinsik transaksional).",
  6: "Mudah menyerah dan menghindari kesulitan dalam belajar (Ketekunan Rendah).",
  9: "Hanya mau mencatat/belajar saat diawasi atau diwajibkan guru (Inisiatif Rendah)."
};

export const SELF_ESTEEM_INTERPRETATION_BANK: Record<number, string> = {
  2: "Memiliki perasaan tidak berguna dan menjadi beban bagi keluarga (Penerimaan diri rendah).",
  4: "Kurangnya kepercayaan diri dan merasa pasti gagal sebelum mencoba.",
  6: "Merasa malu dengan latar belakang keluarga dan ekonomi sendiri.",
  8: "Keinginan kuat menjadi orang lain (Penolakan identitas diri).",
  10: "Ketidakpuasan tinggi terhadap penampilan fisik (Body Image Negatif)."
};

// -----------------------------------------------------------------
// RISIKO PERILAKU — Interpretation Bank
// Domain A Regular: item dijawab >= 3 (Kadang-kadang ke atas) = berisiko
// Domain A Reverse: item dijawab <= 2 (tidak aman karena skor risiko = 6-answer >= 4)
// Domain B Negatif: item dijawab >= 3
// -----------------------------------------------------------------
export const RISIKO_PERILAKU_INTERPRETATION_BANK: Record<number, string> = {
  // Domain A - Kontrol Diri (regular)
  1:  "Kesulitan mengendalikan reaksi emosional — cenderung bereaksi impulsif saat marah.",
  8:  "Reaksi spontan tanpa pertimbangan akibat — indikasi lemahnya kontrol diri situasional.",
  22: "Mudah terprovokasi oleh perilaku orang lain — ambang batas emosi rendah.",
  41: "Bertindak agresif saat emosi memuncak tanpa deliberasi terlebih dahulu.",
  // Kontrol Diri (reverse - berisiko jika jawaban rendah)
  12: "Kesulitan mengelola reaksi emosional saat marah (tidak sempat pikir akibat).",
  46: "Kesulitan menahan ucapan kasar saat emosi meningkat.",
  54: "Kecenderungan reaktif — jarang berpikir panjang sebelum bertindak.",
  // Domain A - Pengaruh Teman (regular)
  5:  "Kecenderungan mengikuti ajakan teman tanpa proses penyaringan yang memadai.",
  9:  "Kesulitan asertif — sulit menolak ajakan teman meski tidak ingin.",
  20: "Konformitas berlebihan — menyesuaikan diri dengan teman untuk menghindari penolakan.",
  28: "Tekanan kelompok (peer pressure) kuat — ikut serta demi tidak tampak berbeda.",
  51: "Orientasi kuat pada penerimaan sosial — popularitas dianggap prioritas utama.",
  // Pengaruh Teman (reverse)
  39: "Lemahnya asertivitas — sulit berkata tidak kepada teman sebaya.",
  // Domain A - Sensation Seeking (regular)
  3:  "Tertarik pada sensasi dari hal terlarang — risiko sebagai daya tarik, bukan hambatan.",
  16: "Kecenderungan mencoba hal baru tanpa pertimbangan risiko yang matang.",
  24: "Riwayat pelanggaran aturan yang dimotivasi oleh pencarian kesenangan.",
  43: "Pencarian tantangan meski berpotensi mengakibatkan masalah (thrill-seeking).",
  49: "Rasa ingin tahu aktif terhadap hal-hal yang dilarang atau tersembunyi.",
  59: "Kesiapan kognitif melanggar norma jika situasi dianggap mengizinkan.",
  // Sensation Seeking (reverse)
  35: "Tingginya kecenderungan mengambil risiko — tidak memilih pilihan aman sebagai preferensi.",
  // Domain A - Kejujuran & Tanggung Jawab (regular)
  11: "Penggunaan kebohongan sebagai strategi menghindari konsekuensi.",
  14: "Kecenderungan blame-shifting (menyalahkan orang lain untuk melindungi diri sendiri).",
  29: "Rendahnya konsistensi komitmen — sering tidak menepati janji yang dibuat.",
  36: "Pola penghindaran tanggung jawab akademis melalui alibi kepada guru.",
  38: "Riwayat kecurangan akademis yang dimotivasi rasa takut akan nilai buruk.",
  48: "Kecenderungan mengabaikan hak milik orang lain di lingkungan sekitar.",
  // Kejujuran & Tanggung Jawab (reverse)
  7:  "Rendahnya kemandirian mengerjakan tugas — mudah menyerah atau bergantung pada orang lain.",
  26: "Kesulitan mengakui kesalahan secara terbuka dan bertanggung jawab.",
  56: "Rendahnya tanggung jawab atas dampak kesalahan yang diperbuat kepada orang lain.",
  // Domain A - Kepatuhan Aturan (regular)
  17: "Kecenderungan kognitif menantang atau melanggar peraturan sekolah.",
  27: "Memanfaatkan ketidakhadiran guru untuk keluar kelas tanpa izin.",
  // Kepatuhan Aturan (reverse)
  53: "Rendahnya kepatuhan hadir ke sekolah — kemalasan berpotensi membentuk pola absen.",
  // Domain A - Resolusi Konflik (regular)
  31: "Dampak nyata dari perilaku impulsif sebelumnya — pola penyesalan pasca tindakan.",
  33: "Kecenderungan agresif-reaktif saat mendapat ejekan atau provokasi.",
  44: "Pernah terlibat dalam perilaku kelompok yang merugikan teman lain.",
  // Resolusi Konflik (reverse)
  19: "Kecenderungan menghindari dialog konstruktif — memilih diam atau konfrontatif.",
  // Domain B - Negatif (berisiko jika dijawab >= 3)
  10: "Perasaan kesepian dan terasing secara emosional meski tinggal bersama keluarga.",
};
