// =======================================================
// BK INSIGHT MVP - INFERENCE ENGINE & DECISION SUPPORT SYSTEM
// =======================================================
import {
  AKPDResult,
  AUMResult,
  BullyingResult,
  MotivasiResult,
  SelfEsteemResult,
  SociometricResult,
  MIResult,
} from './ruleEngine';
import { ServiceRecommendation, RiskAlert, getRecommendedTopics } from './knowledgeBase';

export interface DSSIntegratedAnalysis {
  ringkasanStatus: string;
  tingkatRisikoGlobal: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
  riskAlerts: RiskAlert[];
  layananRekomendasi: ServiceRecommendation[];
  prioritasMasalah: string[];
  faktorPendukung: string[];
  faktorRisiko: string[];
  targetMonitoring: string[];
}

export function generateDSSAnalysis(
  akpd?: AKPDResult,
  aum?: AUMResult,
  bullying?: BullyingResult,
  motivasi?: MotivasiResult,
  selfEsteem?: SelfEsteemResult,
  sosiometri?: SociometricResult,
  mi?: MIResult
): DSSIntegratedAnalysis {
  const riskAlerts: RiskAlert[] = [];
  const layananRekomendasi: ServiceRecommendation[] = [];
  const prioritasMasalah: string[] = [];
  const faktorPendukung: string[] = [];
  const faktorRisiko: string[] = [];
  const targetMonitoring: string[] = [];

  let globalRiskScore = 0; // 0 - 100

  // 1. Analisis AKPD
  if (akpd) {
    prioritasMasalah.push(`Kebutuhan Layanan BK Utama: Bidang ${akpd.prioritasUtama} (${akpd[akpd.prioritasUtama.toLowerCase() as keyof AKPDResult]}%)`);
    const topics = getRecommendedTopics(akpd.prioritasUtama);
    layananRekomendasi.push({
      jenisLayanan: 'Bimbingan Klasikal',
      prioritas: 'Tinggi',
      topikLayanan: topics[0],
      tujuanLayanan: `Meningkatkan pemahaman siswa terkait bidang ${akpd.prioritasUtama}`,
    });
  }

  // 2. Analisis Bullying
  if (bullying) {
    if (bullying.peran === 'Korban Sangat Rentan') {
      globalRiskScore += 40;
      riskAlerts.push({
        level: 'Merah (Tinggi)',
        kategori: 'Perundungan',
        deskripsi: 'Siswa terdeteksi sebagai KORBAN SANGAT RENTAN (Bullying). Memerlukan tindakan dan perlindungan segera.',
      });
      layananRekomendasi.push({
        jenisLayanan: 'Konseling Individual',
        prioritas: 'Sangat Tinggi',
        topikLayanan: 'Pendampingan Korban Bullying & Pemulihan Kepercayaan Diri',
        tujuanLayanan: 'Memberikan rasa aman, dukungan emosional, dan penanganan trauma',
      });
      faktorRisiko.push('Terindikasi mengalami ancaman perundungan (bullying) verbal/fisik/sosial');
      targetMonitoring.push('Pantau kondisi emosional dan interaksi sosial harian siswa di kelas');
    } else if (bullying.peran === 'Korban Ringan') {
      globalRiskScore += 25;
      riskAlerts.push({
        level: 'Kuning (Sedang)',
        kategori: 'Perundungan',
        deskripsi: 'Siswa terindikasi mengalami KORBAN RINGAN. Perlu pemantauan agar tidak memburuk.',
      });
      layananRekomendasi.push({
        jenisLayanan: 'Bimbingan Kelompok',
        prioritas: 'Tinggi',
        topikLayanan: 'Pelatihan Asertivitas & Membangun Batasan Sosial',
        tujuanLayanan: 'Memberikan skill keberanian untuk membela diri dari gangguan ringan',
      });
    }
  }

  // 3. Analisis Sosiometri
  if (sosiometri) {
    if (sosiometri.kategori === 'Isolated (Terisolasi)') {
      globalRiskScore += 25;
      riskAlerts.push({
        level: 'Kuning (Sedang)',
        kategori: 'Hubungan Sosial',
        deskripsi: 'Siswa TERISOLASI dalam sosiometri kelas (0 pilihan dari teman sebaya).',
      });
      layananRekomendasi.push({
        jenisLayanan: 'Bimbingan Kelompok',
        prioritas: 'Tinggi',
        topikLayanan: 'Pelatihan Keterampilan Sosialisasi & Integrasi Kelompok Pertemanan',
        tujuanLayanan: 'Membantu siswa berintegrasi dan membangun hubungan teman sebaya',
      });
      faktorRisiko.push('Tidak memiliki teman dekat di kelas (terisolasi sosial)');
    } else if (sosiometri.kategori === 'Popular (Bintang Kelas)') {
      faktorPendukung.push(`Memiliki popularitas sosial tinggi di kelas (Choice Status CS: ${sosiometri.choiceStatusIndex})`);
    }
  }

  // 4. Analisis Self Esteem
  if (selfEsteem) {
    if (selfEsteem.tingkat === 'Rendah') {
      globalRiskScore += 20;
      riskAlerts.push({
        level: 'Kuning (Sedang)',
        kategori: 'Pribadi',
        deskripsi: 'Penghargaan diri (Self-Esteem) siswa tergolong RENDAH (Skor RSES: ' + selfEsteem.skorRSES + ').',
      });
      layananRekomendasi.push({
        jenisLayanan: 'Konseling Individual',
        prioritas: 'Tinggi',
        topikLayanan: 'Peningkatan Self-Esteem & Penerimaan Diri Positif',
        tujuanLayanan: 'Membangun persepsi positif terhadap diri sendiri',
      });
      faktorRisiko.push('Merasa kurang berharga atau rendah diri dibanding teman sebaya');
    } else {
      faktorPendukung.push('Memiliki penghargaan diri (Self-Esteem) yang sehat & positif');
    }
  }

  // 5. Analisis Motivasi Belajar
  if (motivasi) {
    if (motivasi.tingkatMotivasi === 'Rendah') {
      globalRiskScore += 15;
      prioritasMasalah.push('Motivasi belajar tergolong RENDAH (Perlu dorongan intrinsik/ekstrinsik)');
      layananRekomendasi.push({
        jenisLayanan: 'Bimbingan Kelompok',
        prioritas: 'Tinggi',
        topikLayanan: 'Strategi Meningkatkan Motivasi Belajar & Penetapan Target (Goal Setting)',
        tujuanLayanan: 'Meningkatkan antusiasme dan komitmen belajar',
      });
    } else {
      faktorPendukung.push(`Motivasi belajar ${motivasi.tingkatMotivasi} dengan skor intrinsik yang baik`);
    }
  }

  // 6. Analisis Multiple Intelligence
  if (mi && mi.topDomains.length > 0) {
    faktorPendukung.push(`Dominan Kecerdasan: ${mi.topDomains.join(', ')}`);
  }

  // Tentukan tingkat risiko global
  let tingkatRisikoGlobal: DSSIntegratedAnalysis['tingkatRisikoGlobal'] = 'Rendah';
  if (globalRiskScore >= 50) tingkatRisikoGlobal = 'Sangat Tinggi';
  else if (globalRiskScore >= 30) tingkatRisikoGlobal = 'Tinggi';
  else if (globalRiskScore >= 15) tingkatRisikoGlobal = 'Sedang';

  // Ringkasan status
  let ringkasanStatus = `Siswa memerlukan perhatian pada bidang ${akpd?.prioritasUtama || 'Pribadi'}. `;
  if (tingkatRisikoGlobal === 'Sangat Tinggi' || tingkatRisikoGlobal === 'Tinggi') {
    ringkasanStatus += 'Ditemukan faktor risiko signifikan yang memerlukan intervensi segera dari Guru BK.';
  } else {
    ringkasanStatus += 'Kondisi siswa secara umum stabil dan mendukung proses perkembangan sekolah.';
  }

  return {
    ringkasanStatus,
    tingkatRisikoGlobal,
    riskAlerts,
    layananRekomendasi,
    prioritasMasalah,
    faktorPendukung,
    faktorRisiko,
    targetMonitoring,
  };
}
