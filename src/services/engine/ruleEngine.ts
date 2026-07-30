// =======================================================
// BK INSIGHT MVP - CORE DETERMINISTIC RULE ENGINE
// =======================================================
// Mengkalkulasi skor 7 instrumen secara deterministik dan presisi
// Berdasarkan norma standar POP BK Kemendikbud, RSES, Moreno, Olweus, Gardner

export interface AKPDResult {
  pribadi: number; // Persentase kebutuhan (%)
  sosial: number;
  belajar: number;
  karier: number;
  totalKebutuhan: number;
  prioritasUtama: 'Pribadi' | 'Sosial' | 'Belajar' | 'Karier';
}

export interface AUMResult {
  masalahDominan: string[];
  skorPerDomain: Record<string, number>;
  tingkatMasalah: 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface BullyingResult {
  peran: 'Korban Sangat Rentan' | 'Korban Ringan' | 'Aman';
  skorKorban: number;
  tingkatRisiko: 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface MotivasiResult {
  tingkatMotivasi: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
  skorIntrinsik: number;
  skorEkstrinsik: number;
  skorKetekunan: number;
  totalSkor: number;
}

export interface SelfEsteemResult {
  tingkat: 'Tinggi' | 'Sedang' | 'Rendah';
  skorRSES: number; // Range 10 - 40
  penghargaanDiri: number;
  penerimaanDiri: number;
}

export interface SociometricStudentChoice {
  studentId: string;
  chosenStudentId: string;
  peringkat: number;
}

export interface SociometricResult {
  choiceStatusIndex: number; // CS = pilihan_diterima / (N - 1)
  totalPilihanDiterima: number;
  kategori: 'Popular (Bintang Kelas)' | 'Normal' | 'Isolated (Terisolasi)' | 'Rejected';
  mutualChoices: string[]; // List ID siswa yang saling memilih
}

export interface MIResult {
  topDomains: string[]; // 3 kecerdasan tertinggi
  scores: Record<string, number>;
}

// -------------------------------------------------------
// 1. AKPD Calculation (POP BK Kemendikbud)
// -------------------------------------------------------
export function calculateAKPD(responses: Record<number, number>): AKPDResult {
  // Soal 1-10: Pribadi, 11-20: Sosial, 21-30: Belajar, 31-40: Karier
  const countPribadi = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(id => responses[id] === 1).length;
  const countSosial = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].filter(id => responses[id] === 1).length;
  const countBelajar = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30].filter(id => responses[id] === 1).length;
  const countKarier = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40].filter(id => responses[id] === 1).length;

  const pctPribadi = Math.round((countPribadi / 10) * 100);
  const pctSosial = Math.round((countSosial / 10) * 100);
  const pctBelajar = Math.round((countBelajar / 10) * 100);
  const pctKarier = Math.round((countKarier / 10) * 100);

  const domains = [
    { name: 'Pribadi' as const, val: pctPribadi },
    { name: 'Sosial' as const, val: pctSosial },
    { name: 'Belajar' as const, val: pctBelajar },
    { name: 'Karier' as const, val: pctKarier },
  ];
  domains.sort((a, b) => b.val - a.val);

  const totalKebutuhan = Math.round(((countPribadi + countSosial + countBelajar + countKarier) / 40) * 100);

  return {
    pribadi: pctPribadi,
    sosial: pctSosial,
    belajar: pctBelajar,
    karier: pctKarier,
    totalKebutuhan,
    prioritasUtama: domains[0].name,
  };
}

// -------------------------------------------------------
// 2. AUM Calculation (Prof. Prayitno Framework)
// -------------------------------------------------------
export function calculateAUM(responses: Record<number, number>): AUMResult {
  // Updated for 40 questions (3T Version Optimal Minimum)
  const mapDomain: Record<number, string> = {
    1: 'Fisik & Kesehatan', 2: 'Fisik & Kesehatan', 3: 'Fisik & Kesehatan', 4: 'Fisik & Kesehatan', 5: 'Fisik & Kesehatan', 6: 'Fisik & Kesehatan',
    7: 'Diri Pribadi', 8: 'Diri Pribadi', 9: 'Diri Pribadi', 10: 'Diri Pribadi',
    11: 'Keluarga', 12: 'Keluarga', 13: 'Keluarga', 14: 'Keluarga', 15: 'Keluarga',
    16: 'Hubungan Sosial', 17: 'Hubungan Sosial', 18: 'Hubungan Sosial', 19: 'Hubungan Sosial', 20: 'Hubungan Sosial', 21: 'Hubungan Sosial',
    22: 'Ekonomi', 23: 'Ekonomi', 24: 'Ekonomi', 25: 'Ekonomi', 26: 'Ekonomi', 27: 'Ekonomi', 28: 'Ekonomi',
    29: 'Masa Depan', 30: 'Masa Depan', 31: 'Masa Depan', 32: 'Masa Depan', 33: 'Masa Depan', 34: 'Masa Depan',
    35: 'Belajar', 36: 'Belajar', 37: 'Belajar', 38: 'Belajar', 39: 'Belajar', 40: 'Belajar',
  };

  const skorPerDomain: Record<string, number> = {};
  let totalYa = 0;

  Object.entries(responses).forEach(([qId, val]) => {
    const qNum = parseInt(qId, 10);
    const domain = mapDomain[qNum] || 'Lainnya';
    if (!skorPerDomain[domain]) skorPerDomain[domain] = 0;
    if (val === 1) {
      skorPerDomain[domain] += 1;
      totalYa += 1;
    }
  });

  const sortedDomains = Object.entries(skorPerDomain)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([dom]) => dom);

  const tingkatMasalah: AUMResult['tingkatMasalah'] = 
    totalYa >= 20 ? 'Tinggi' : totalYa >= 10 ? 'Sedang' : 'Rendah';

  return {
    masalahDominan: sortedDomains.slice(0, 3),
    skorPerDomain,
    tingkatMasalah,
  };
}

// -------------------------------------------------------
// 3. Bullying Calculation (Olweus Framework)
// -------------------------------------------------------
export function calculateBullying(responses: Record<number, number>): BullyingResult {
  // 3T Version Extended: All 10 questions measure Victimization (Korban)
  const skorKorban = Object.values(responses).reduce((sum, val) => sum + (val || 1), 0);

  let peran: BullyingResult['peran'] = 'Aman';
  let tingkatRisiko: BullyingResult['tingkatRisiko'] = 'Rendah';

  // Max score: 10 * 3 = 30. Min: 10 * 1 = 10.
  if (skorKorban >= 24) {
    peran = 'Korban Sangat Rentan';
    tingkatRisiko = 'Tinggi';
  } else if (skorKorban >= 15) {
    peran = 'Korban Ringan';
    tingkatRisiko = 'Sedang';
  } else {
    peran = 'Aman';
    tingkatRisiko = 'Rendah';
  }

  return {
    peran,
    skorKorban,
    tingkatRisiko,
  };
}

// -------------------------------------------------------
// 4. Motivasi Belajar Calculation (Deci & Ryan)
// -------------------------------------------------------
export function calculateMotivasi(responses: Record<number, number>): MotivasiResult {
  const skorIntrinsik = (responses[1]||0) + (responses[2]||0) + (responses[8]||0) + (responses[10]||0);
  const skorEkstrinsik = (responses[3]||0) + (responses[4]||0) + (responses[9]||0);
  const skorKetekunan = (responses[5]||0) + (responses[6]||0) + (responses[7]||0);
  
  const totalSkor = skorIntrinsik + skorEkstrinsik + skorKetekunan;

  let tingkatMotivasi: MotivasiResult['tingkatMotivasi'] = 'Sedang';
  if (totalSkor >= 32) tingkatMotivasi = 'Sangat Tinggi';
  else if (totalSkor >= 25) tingkatMotivasi = 'Tinggi';
  else if (totalSkor >= 18) tingkatMotivasi = 'Sedang';
  else tingkatMotivasi = 'Rendah';

  return {
    tingkatMotivasi,
    skorIntrinsik,
    skorEkstrinsik,
    skorKetekunan,
    totalSkor,
  };
}

// -------------------------------------------------------
// 5. Self Esteem Calculation (RSES Rosenberg)
// -------------------------------------------------------
export function calculateSelfEsteem(responses: Record<number, number>): SelfEsteemResult {
  let totalSkor = 0;
  let penghargaanDiri = 0;
  let penerimaanDiri = 0;

  // Values in TakeAssessment are already reverse-scored in the UI payload (1-4).
  Object.entries(responses).forEach(([qId, val]) => {
    const numVal = Number(val);
    totalSkor += numVal;
    // qId ganjil: Positif (1,3,5,7,9), qId genap: Negatif (2,4,6,8,10)
    if ([1, 3, 5, 7, 9].includes(Number(qId))) penghargaanDiri += numVal;
    else penerimaanDiri += numVal;
  });

  // Max score for 10 questions is 40.
  let tingkat: SelfEsteemResult['tingkat'] = 'Sedang';
  if (totalSkor >= 30) tingkat = 'Tinggi';
  else if (totalSkor >= 20) tingkat = 'Sedang';
  else tingkat = 'Rendah';

  return {
    tingkat,
    skorRSES: totalSkor,
    penghargaanDiri,
    penerimaanDiri,
  };
}

// -------------------------------------------------------
// 6. Sosiometri Graph Calculation (Jacob L. Moreno CS Formula)
// -------------------------------------------------------
export function calculateSociometry(
  targetStudentId: string,
  totalClassStudents: number,
  allChoices: SociometricStudentChoice[]
): SociometricResult {
  if (totalClassStudents <= 1) {
    return {
      choiceStatusIndex: 0,
      totalPilihanDiterima: 0,
      kategori: 'Normal',
      mutualChoices: [],
    };
  }

  // Count choices received by target student
  const choicesReceived = allChoices.filter(c => c.chosenStudentId === targetStudentId);
  const totalPilihanDiterima = choicesReceived.length;
  const choiceStatusIndex = parseFloat((totalPilihanDiterima / (totalClassStudents - 1)).toFixed(2));

  // Find mutual choices (siswa target memilih B, dan B memilih target)
  const chosenByTarget = allChoices.filter(c => c.studentId === targetStudentId).map(c => c.chosenStudentId);
  const mutualChoices = choicesReceived
    .map(c => c.studentId)
    .filter(id => chosenByTarget.includes(id));

  let kategori: SociometricResult['kategori'] = 'Normal';
  if (choiceStatusIndex >= 0.35 || totalPilihanDiterima >= 5) {
    kategori = 'Popular (Bintang Kelas)';
  } else if (totalPilihanDiterima === 0) {
    kategori = 'Isolated (Terisolasi)';
  } else if (choiceStatusIndex < 0.1) {
    kategori = 'Rejected';
  }

  return {
    choiceStatusIndex,
    totalPilihanDiterima,
    kategori,
    mutualChoices,
  };
}

// -------------------------------------------------------
// 7. Multiple Intelligence Calculation (Howard Gardner)
// -------------------------------------------------------
export function calculateMI(responses: Record<number, number>): MIResult {
  const mapMI: Record<number, string> = {
    1: 'Linguistik', 2: 'Linguistik',
    3: 'Logika-Matematik', 4: 'Logika-Matematik',
    5: 'Visual-Spasial', 6: 'Visual-Spasial',
    7: 'Kinestetik', 8: 'Kinestetik',
    9: 'Musikal', 10: 'Musikal',
    11: 'Interpersonal', 12: 'Interpersonal',
    13: 'Intrapersonal', 14: 'Intrapersonal',
    15: 'Naturalis', 16: 'Naturalis',
  };

  const scores: Record<string, number> = {};

  Object.entries(responses).forEach(([qId, val]) => {
    const domain = mapMI[Number(qId)];
    if (domain) {
      if (!scores[domain]) scores[domain] = 0;
      if (val === 1) scores[domain] += 1;
    }
  });

  const sortedDomains = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([dom]) => dom);

  return {
    topDomains: sortedDomains.slice(0, 3),
    scores,
  };
}
