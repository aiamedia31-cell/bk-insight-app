// =======================================================
// BK INSIGHT MVP - KNOWLEDGE BASE & POP BK RULES MATRIX
// =======================================================
// Matriks inferensi dan pengetahuan dasar layanan Bimbingan Konseling (POP BK)

export interface ServiceRecommendation {
  jenisLayanan: 'Bimbingan Klasikal' | 'Bimbingan Kelompok' | 'Konseling Individual' | 'Referal / Alih Tangan' | 'Kunjungan Rumah (Home Visit)';
  prioritas: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
  topikLayanan: string;
  tujuanLayanan: string;
}

export interface RiskAlert {
  level: 'Merah (Tinggi)' | 'Kuning (Sedang)' | 'Hijau (Rendah)';
  kategori: string;
  deskripsi: string;
}

// Matriks rekomendasi topik layanan BK berdasarkan domain masalah
export const TOPIC_KNOWLEDGE_MATRIX: Record<string, string[]> = {
  Pribadi: [
    'Pengembangan Kepercayaan Diri & Self-Esteem',
    'Manajemen Emosi & Pengendalian Diri',
    'Pengenalan Potensi Diri & Pembentukan Karakter',
    'Pola Hidup Bersih & Sehat untuk Remaja',
  ],
  Sosial: [
    'Etika Berkomunikasi & Berteman di Sekolah',
    'Pencegahan Perundungan (Anti-Bullying) & Cyberbullying',
    'Keterampilan Asertif: Berani Berkata Tidak pada Hal Negatif',
    'Manajemen Konflik Teman Sebaya',
  ],
  Belajar: [
    'Manajemen Waktu & Pembuatan Jadwal Belajar Efektif',
    'Mengenali Gaya Belajar Utama (Visual/Auditori/Kinestetik)',
    'Strategi Mengatasi Kejenuhan & Masalah Konsentrasi Belajar',
    'Teknik Mengatasi Kecemasan Menghadapi Ujian',
  ],
  Karier: [
    'Eksplorasi Minat, Bakat, & Cita-Cita Masa Depan',
    'Pengenalan Ragam Profesi & Dunia Kerja',
    'Pemilihan Ekstrakurikuler yang Sesuai Potensi',
    'Persiapan Persyaratan Jenjang Sekolah Lanjutan (SMA/SMK)',
  ],
};

export function getRecommendedTopics(bidang: 'Pribadi' | 'Sosial' | 'Belajar' | 'Karier'): string[] {
  return TOPIC_KNOWLEDGE_MATRIX[bidang] || TOPIC_KNOWLEDGE_MATRIX['Pribadi'];
}
