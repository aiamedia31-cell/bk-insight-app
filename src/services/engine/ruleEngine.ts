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
  prioritasUtamaIds?: number[];
  detailMasalah?: string[];
}

export interface AUMResult {
  masalahDominan: string[];
  skorPerDomain: Record<string, number>;
  tingkatMasalah: 'Tinggi' | 'Sedang' | 'Rendah';
  jawabanYaIds?: number[];
  detailMasalah?: string[];
}

export interface BullyingResult {
  peran: 'Korban Sangat Rentan' | 'Korban Ringan' | 'Aman';
  skorKorban: number;
  tingkatRisiko: 'Tinggi' | 'Sedang' | 'Rendah';
  jawabanBermasalahIds?: number[];
  detailMasalah?: string[];
}

export interface MotivasiResult {
  tingkatMotivasi: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
  skorIntrinsik: number;
  skorEkstrinsik: number;
  skorKetekunan: number;
  totalSkor: number;
  jawabanBermasalahIds?: number[];
  detailMasalah?: string[];
}

export interface SelfEsteemResult {
  tingkat: 'Tinggi' | 'Sedang' | 'Rendah';
  skorRSES: number; // Range 10 - 40
  penghargaanDiri: number;
  penerimaanDiri: number;
  jawabanBermasalahIds?: number[];
  detailMasalah?: string[];
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
  const idsPribadi = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(id => responses[id] === 1);
  const idsSosial = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].filter(id => responses[id] === 1);
  const idsBelajar = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30].filter(id => responses[id] === 1);
  const idsKarier = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40].filter(id => responses[id] === 1);

  const countPribadi = idsPribadi.length;
  const countSosial = idsSosial.length;
  const countBelajar = idsBelajar.length;
  const countKarier = idsKarier.length;

  const pctPribadi = Math.round((countPribadi / 10) * 100);
  const pctSosial = Math.round((countSosial / 10) * 100);
  const pctBelajar = Math.round((countBelajar / 10) * 100);
  const pctKarier = Math.round((countKarier / 10) * 100);

  const domains = [
    { name: 'Pribadi' as const, val: pctPribadi, ids: idsPribadi },
    { name: 'Sosial' as const, val: pctSosial, ids: idsSosial },
    { name: 'Belajar' as const, val: pctBelajar, ids: idsBelajar },
    { name: 'Karier' as const, val: pctKarier, ids: idsKarier },
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
    prioritasUtamaIds: domains[0].ids,
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
  const jawabanYaIds: number[] = [];

  Object.entries(responses).forEach(([qId, val]) => {
    const qNum = parseInt(qId, 10);
    const domain = mapDomain[qNum] || 'Lainnya';
    if (!skorPerDomain[domain]) skorPerDomain[domain] = 0;
    if (val === 1) {
      skorPerDomain[domain] += 1;
      totalYa += 1;
      jawabanYaIds.push(qNum);
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
    jawabanYaIds,
  };
}

// -------------------------------------------------------
// 3. Bullying Calculation (Olweus Framework)
// -------------------------------------------------------
export function calculateBullying(responses: Record<number, number>): BullyingResult {
  // 3T Version Extended: All 10 questions measure Victimization (Korban)
  const skorKorban = Object.values(responses).reduce((sum, val) => sum + (val || 1), 0);
  const jawabanBermasalahIds: number[] = [];
  Object.entries(responses).forEach(([qId, val]) => {
    if (val >= 2) jawabanBermasalahIds.push(Number(qId));
  });

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
    jawabanBermasalahIds,
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
  const jawabanBermasalahIds: number[] = [];
  if (responses[3] >= 3) jawabanBermasalahIds.push(3);
  if (responses[4] >= 3) jawabanBermasalahIds.push(4);
  if (responses[6] <= 2 && responses[6] > 0) jawabanBermasalahIds.push(6);
  if (responses[9] >= 3) jawabanBermasalahIds.push(9);

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
    jawabanBermasalahIds,
  };
}

// -------------------------------------------------------
// 5. Self Esteem Calculation (RSES Rosenberg)
// -------------------------------------------------------
export function calculateSelfEsteem(responses: Record<number, number>): SelfEsteemResult {
  let totalSkor = 0;
  let penghargaanDiri = 0;
  let penerimaanDiri = 0;
  const jawabanBermasalahIds: number[] = [];

  // Values in TakeAssessment are already reverse-scored in the UI payload (1-4).
  Object.entries(responses).forEach(([qId, val]) => {
    const numVal = Number(val);
    const numId = Number(qId);
    totalSkor += numVal;
    // qId ganjil: Positif (1,3,5,7,9), qId genap: Negatif (2,4,6,8,10)
    if ([1, 3, 5, 7, 9].includes(numId)) penghargaanDiri += numVal;
    else {
      penerimaanDiri += numVal;
      // In UI payload, values for negative items are reverse scored (1=Sangat Setuju).
      // Sangat Setuju/Setuju pada hal negatif = bermasalah (value <= 2).
      if (numVal <= 2 && numVal > 0) jawabanBermasalahIds.push(numId);
    }
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
    jawabanBermasalahIds,
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

// -------------------------------------------------------
// 8. Risiko Perilaku & Kondisi Keluarga
//    Framework: Problem Behavior Theory (Jessor & Jessor, 1977)
//    + Adverse Childhood Experiences (ACE) Screening
//    Skala Likert 1–3 (Q1-Q60) + Pilihan Ganda Faktual (Q61-Q68)
//    Total: 68 soal (36 Domain A + 14 Domain B + 10 Validitas + 8 Profil Keluarga)
// -------------------------------------------------------

export interface RisikoPerilakuResult {
  // Level Risiko Perilaku (Domain A - 36 soal Likert 1-3)
  levelRisikoPerilaku: 'Tinggi' | 'Sedang' | 'Rendah';
  // Level Kondisi Dukungan Keluarga Persepsi (Domain B - 14 soal Likert 1-3)
  levelKondisiKeluarga: 'Sangat Perlu Perhatian' | 'Perlu Perhatian' | 'Baik';
  // Validitas jawaban (Skala V - 10 soal)
  validitasJawaban: 'Rendah' | 'Sedang' | 'Tinggi';
  // Confidence Score 0-100
  confidenceScore: number;
  // Skor mentah
  skorDomainA: number;     // Range: 36-108 (Likert 1-3)
  skorDomainB: number;     // Range: 14-42  (Likert 1-3)
  skorValiditas: number;   // Range: 10-30  (Likert 1-3)
  // Ringkasan otomatis DSS
  ringkasanOtomatis: string;
  // Sub-domain perilaku yang paling menonjol
  subdominPerilaku: string[];
  detailMasalah?: string[];

  // ── Profil Situasi Keluarga (Q61-Q68, faktual) ──
  statusOrangtua?: 'Lengkap' | 'Cerai/Pisah' | 'Salah Satu Meninggal' | 'Yatim Piatu';
  figurPengasuh?: 'Orang Tua Kandung' | 'Salah Satu Ortu Kandung' | 'Wali/Keluarga Besar' | 'Orang Tua Tiri';
  tempatTinggal?: 'Rumah Sendiri' | 'Rumah Wali' | 'Kos/Asrama/Panti';
  kondisiEkonomi?: 'Cukup' | 'Pas-pasan' | 'Kekurangan';
  labelSituasiKeluarga?: string[];              // Tags: 'BROKEN HOME', 'YATIM PIATU', dll
  levelSituasiKeluarga?: 'Baik' | 'Perlu Perhatian' | 'Sangat Perlu Perhatian';
  perluHomeVisit?: boolean;
  ringkasanSituasiKeluarga?: string;
}

// Domain A — Risiko Perilaku
// Soal regular (skor langsung, lebih tinggi = lebih berisiko)
const A_REGULAR = [1,3,5,8,9,11,14,16,17,20,22,24,27,28,29,31,33,36,38,41,43,44,48,49,51,59];
// Soal reverse (skor = 6 - nilai, respons positif = risiko rendah)
const A_REVERSE  = [7,12,19,26,35,39,46,53,54,56];

// Sub-domain mapping untuk A
const A_SUBDOM: Record<number, string> = {
  1:'Kontrol Diri', 8:'Kontrol Diri', 22:'Kontrol Diri', 41:'Kontrol Diri',
  12:'Kontrol Diri', 46:'Kontrol Diri', 54:'Kontrol Diri',
  5:'Pengaruh Teman', 9:'Pengaruh Teman', 20:'Pengaruh Teman', 28:'Pengaruh Teman', 51:'Pengaruh Teman',
  39:'Pengaruh Teman',
  3:'Sensation Seeking', 16:'Sensation Seeking', 24:'Sensation Seeking', 43:'Sensation Seeking',
  49:'Sensation Seeking', 59:'Sensation Seeking', 35:'Sensation Seeking',
  11:'Kejujuran & Tanggung Jawab', 14:'Kejujuran & Tanggung Jawab', 29:'Kejujuran & Tanggung Jawab',
  36:'Kejujuran & Tanggung Jawab', 38:'Kejujuran & Tanggung Jawab', 48:'Kejujuran & Tanggung Jawab',
  26:'Kejujuran & Tanggung Jawab', 56:'Kejujuran & Tanggung Jawab', 7:'Kejujuran & Tanggung Jawab',
  17:'Kepatuhan Aturan', 27:'Kepatuhan Aturan', 53:'Kepatuhan Aturan',
  19:'Resolusi Konflik', 33:'Resolusi Konflik', 44:'Resolusi Konflik', 31:'Resolusi Konflik',
};

// Domain B — Kondisi Keluarga
// Soal positif (reverse: jawaban baik = risiko rendah, skor = 6 - nilai)
const B_POSITIVE = [2,6,15,18,21,25,30,34,37,42,47,55,58];
// Soal negatif (skor langsung, lebih tinggi = kondisi keluarga lebih bermasalah)
const B_NEGATIVE = [10];

// Skala Validitas (indikasi faking good = skor tinggi)
const V_ITEMS = [4,13,23,32,40,45,50,52,57,60];

export function calculateRisikoPerilaku(responses: Record<number, number>): RisikoPerilakuResult {
  let skorA = 0;
  let skorB = 0;
  let skorV = 0;

  const subdominCount: Record<string, number> = {};

  // Hitung skor Domain A
  A_REGULAR.forEach(id => {
    const val = responses[id] ?? 1;
    skorA += val;
    if (val >= 2) { // Kadang-kadang atau lebih = perlu perhatian (skala 1-3)
      const subdom = A_SUBDOM[id];
      if (subdom) subdominCount[subdom] = (subdominCount[subdom] || 0) + 1;
    }
  });
  A_REVERSE.forEach(id => {
    const val = responses[id] ?? 3;
    const riskVal = 4 - val; // reverse untuk skala 1-3: jawaban tinggi (3) = risiko rendah (1)
    skorA += riskVal;
    if (riskVal >= 2) {
      const subdom = A_SUBDOM[id];
      if (subdom) subdominCount[subdom] = (subdominCount[subdom] || 0) + 1;
    }
  });

  // Hitung skor Domain B
  B_POSITIVE.forEach(id => {
    const val = responses[id] ?? 3;
    skorB += (4 - val); // reverse untuk skala 1-3: jawaban tinggi = keluarga baik = risiko rendah
  });
  B_NEGATIVE.forEach(id => {
    const val = responses[id] ?? 1;
    skorB += val;
  });

  // Hitung skor Validitas (lebih tinggi = lebih mencurigakan)
  V_ITEMS.forEach(id => {
    skorV += responses[id] ?? 1;
  });

  // ── Tentukan Level Risiko Perilaku (Domain A) ──
  // Skala 1-3 | Range: 36–108 | Rendah <55 | Sedang 55–72 | Tinggi ≥73
  let levelRisikoPerilaku: RisikoPerilakuResult['levelRisikoPerilaku'];
  if (skorA >= 73)      levelRisikoPerilaku = 'Tinggi';
  else if (skorA >= 55) levelRisikoPerilaku = 'Sedang';
  else                  levelRisikoPerilaku = 'Rendah';

  // ── Tentukan Level Kondisi Keluarga (Domain B) ──
  // Skala 1-3 | Range: 14–42 | Baik <21 | Perlu Perhatian 21–27 | Sangat Perlu Perhatian ≥28
  let levelKondisiKeluarga: RisikoPerilakuResult['levelKondisiKeluarga'];
  if (skorB >= 28)      levelKondisiKeluarga = 'Sangat Perlu Perhatian';
  else if (skorB >= 21) levelKondisiKeluarga = 'Perlu Perhatian';
  else                  levelKondisiKeluarga = 'Baik';

  // ── Tentukan Validitas Jawaban (Skala V) ──
  // Skala 1-3 | Range: 10–30 | Tinggi <14 | Sedang 14–18 | Rendah >18
  let validitasJawaban: RisikoPerilakuResult['validitasJawaban'];
  if (skorV > 18)       validitasJawaban = 'Rendah';
  else if (skorV >= 14) validitasJawaban = 'Sedang';
  else                  validitasJawaban = 'Tinggi';

  // ── Confidence Score (deterministic) ──
  // Range V: 10-30, divisor 20 untuk skala 1-3
  const rawConfidence = Math.round(100 - ((skorV - 10) / 20 * 75));
  const confidenceScore = Math.max(15, Math.min(100, rawConfidence));

  // ── Sub-domain perilaku yang paling menonjol ──
  const subdominPerilaku = Object.entries(subdominCount)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([subdom]) => subdom)
    .slice(0, 3);

  // ── Ringkasan Otomatis (maks 120 kata) ──
  let ringkasanOtomatis = '';
  if (levelRisikoPerilaku === 'Tinggi' && levelKondisiKeluarga === 'Sangat Perlu Perhatian') {
    ringkasanOtomatis = 'Siswa menunjukkan kecenderungan perilaku berisiko yang perlu segera diperhatikan, disertai dukungan keluarga yang tampak kurang optimal. Kombinasi ini memerlukan konfirmasi melalui observasi langsung, wawancara, dan kemungkinan home visit sesegera mungkin.';
  } else if (levelRisikoPerilaku === 'Tinggi') {
    ringkasanOtomatis = `Siswa menunjukkan sejumlah indikasi perilaku berisiko yang cukup menonjol${subdominPerilaku.length > 0 ? ', terutama pada aspek ' + subdominPerilaku.join(' dan ') : ''}. Disarankan konseling individual dan observasi aktif dalam waktu dekat.`;
  } else if (levelKondisiKeluarga === 'Sangat Perlu Perhatian') {
    ringkasanOtomatis = 'Dukungan dan stabilitas lingkungan keluarga siswa tampak memerlukan perhatian lebih lanjut. Kondisi ini perlu dikonfirmasi melalui wawancara dan komunikasi dengan wali atau orang tua.';
  } else if (levelRisikoPerilaku === 'Sedang' || levelKondisiKeluarga === 'Perlu Perhatian') {
    ringkasanOtomatis = 'Siswa menunjukkan beberapa indikator yang perlu dipantau, baik dari sisi perilaku maupun dukungan keluarga. Monitoring berkala dan komunikasi dengan wali kelas disarankan untuk memastikan perkembangan yang positif.';
  } else {
    ringkasanOtomatis = 'Hasil asesmen menunjukkan profil yang relatif stabil. Siswa tampak memiliki kontrol diri yang cukup baik dan dukungan keluarga yang memadai. Pemantauan rutin tetap disarankan sebagai langkah preventif.';
  }
  if (validitasJawaban === 'Rendah') {
    ringkasanOtomatis += ' Catatan: validitas jawaban perlu dikonfirmasi ulang melalui observasi atau wawancara langsung karena terdeteksi kemungkinan penyesuaian sosial dalam respons.';
  }

  return {
    levelRisikoPerilaku,
    levelKondisiKeluarga,
    validitasJawaban,
    confidenceScore,
    skorDomainA: skorA,
    skorDomainB: skorB,
    skorValiditas: skorV,
    ringkasanOtomatis,
    subdominPerilaku,
    ...calculateProfilKeluargaEmbedded(responses),
  };
}

// ── Profil Situasi Keluarga (Q61-Q68) ── dipanggil dari calculateRisikoPerilaku ──
function calculateProfilKeluargaEmbedded(responses: Record<number, number>): Partial<RisikoPerilakuResult> {
  if (!responses[61]) return {};

  const q61 = responses[61] ?? 1;
  const q62 = responses[62] ?? 1;
  const q63 = responses[63] ?? 1;
  const q64 = responses[64] ?? 1;
  const q65 = responses[65] ?? 1;
  const q66 = responses[66] ?? 1;
  const q67 = responses[67] ?? 1;
  const q68 = responses[68] ?? 1;

  const labelSituasiKeluarga: string[] = [];

  let statusOrangtua: RisikoPerilakuResult['statusOrangtua'];
  if (q61 === 1)      { statusOrangtua = 'Lengkap'; }
  else if (q61 === 2) { statusOrangtua = 'Cerai/Pisah';          labelSituasiKeluarga.push('BROKEN HOME'); }
  else if (q61 === 3) { statusOrangtua = 'Salah Satu Meninggal'; labelSituasiKeluarga.push('YATIM / PIATU'); }
  else                { statusOrangtua = 'Yatim Piatu';          labelSituasiKeluarga.push('YATIM PIATU'); }

  let figurPengasuh: RisikoPerilakuResult['figurPengasuh'];
  if (q62 === 1)      { figurPengasuh = 'Orang Tua Kandung'; }
  else if (q62 === 2) { figurPengasuh = 'Salah Satu Ortu Kandung'; }
  else if (q62 === 3) { figurPengasuh = 'Wali/Keluarga Besar';    labelSituasiKeluarga.push('DIASUH WALI'); }
  else                { figurPengasuh = 'Orang Tua Tiri';          labelSituasiKeluarga.push('ORANG TUA TIRI'); }

  let tempatTinggal: RisikoPerilakuResult['tempatTinggal'];
  if (q67 === 1)      { tempatTinggal = 'Rumah Sendiri'; }
  else if (q67 === 2) { tempatTinggal = 'Rumah Wali'; }
  else                { tempatTinggal = 'Kos/Asrama/Panti'; labelSituasiKeluarga.push('KOS / PANTI'); }

  let kondisiEkonomi: RisikoPerilakuResult['kondisiEkonomi'];
  if (q65 === 1)      { kondisiEkonomi = 'Cukup'; }
  else if (q65 === 2) { kondisiEkonomi = 'Pas-pasan'; }
  else                { kondisiEkonomi = 'Kekurangan'; labelSituasiKeluarga.push('EKONOMI LEMAH'); }

  if (q66 === 2) labelSituasiKeluarga.push('CERAI (BARU)');
  if (q66 === 3) labelSituasiKeluarga.push('DUKA CITA (BARU)');
  if (q66 === 4) labelSituasiKeluarga.push('ORTU MENIKAH LAGI');
  if (q68 === 3) labelSituasiKeluarga.push('MINIM PENGAWASAN');
  if (q64 === 3) labelSituasiKeluarga.push('KONFLIK KELUARGA');
  if (q63 === 4) labelSituasiKeluarga.push('HUBUNGAN RENGGANG');

  let riskScore = 0;
  if (q61 === 2) riskScore += 2;
  if (q61 === 3) riskScore += 2;
  if (q61 === 4) riskScore += 4;
  if (q62 === 3) riskScore += 1;
  if (q62 === 4) riskScore += 2;
  if (q63 === 3) riskScore += 1;
  if (q63 === 4) riskScore += 3;
  if (q64 === 2) riskScore += 1;
  if (q64 === 3) riskScore += 3;
  if (q65 === 2) riskScore += 1;
  if (q65 === 3) riskScore += 2;
  if (q66 === 2) riskScore += 2;
  if (q66 === 3) riskScore += 2;
  if (q66 === 4) riskScore += 1;
  if (q67 === 3) riskScore += 2;
  if (q68 === 2) riskScore += 1;
  if (q68 === 3) riskScore += 3;

  let levelSituasiKeluarga: RisikoPerilakuResult['levelSituasiKeluarga'];
  if (riskScore >= 8)      levelSituasiKeluarga = 'Sangat Perlu Perhatian';
  else if (riskScore >= 4) levelSituasiKeluarga = 'Perlu Perhatian';
  else                     levelSituasiKeluarga = 'Baik';

  const perluHomeVisit = riskScore >= 8 || q61 === 4 || (q68 === 3 && q61 >= 2);

  let ringkasanSituasiKeluarga = '';
  if (q61 === 4) {
    ringkasanSituasiKeluarga = 'Siswa adalah yatim piatu. Diperlukan perhatian khusus pada figur pelindung dan dukungan emosional dari pihak sekolah.';
  } else if (q61 === 3 && q68 === 3) {
    ringkasanSituasiKeluarga = 'Siswa kehilangan salah satu orang tua dan minim pengawasan orang dewasa. Perlu koordinasi segera dengan wali.';
  } else if (q61 === 2 && q64 === 3) {
    ringkasanSituasiKeluarga = 'Keluarga broken home dengan konflik yang sering terjadi. Berpotensi signifikan memengaruhi kesejahteraan emosional siswa.';
  } else if (q61 === 2) {
    ringkasanSituasiKeluarga = 'Siswa dari keluarga broken home (orang tua bercerai/pisah). Perlu pendekatan khusus terkait stabilitas emosi dan figur otoritas.';
  } else if (q62 === 4) {
    ringkasanSituasiKeluarga = 'Siswa tinggal bersama orang tua tiri. Guru BK perlu memastikan siswa merasa aman dan dapat berkomunikasi terbuka.';
  } else if (q68 === 3) {
    ringkasanSituasiKeluarga = 'Siswa minim pengawasan dari orang dewasa di rumah. Perlu monitoring aktif dari pihak sekolah.';
  } else if (q65 === 3) {
    ringkasanSituasiKeluarga = 'Kondisi ekonomi keluarga tergolong kekurangan. Perlu diperhatikan kemungkinan hambatan terhadap kegiatan belajar siswa.';
  } else if (riskScore >= 4) {
    ringkasanSituasiKeluarga = 'Kondisi keluarga memerlukan perhatian. Beberapa faktor risiko terdeteksi yang mungkin memengaruhi kesejahteraan siswa.';
  } else {
    ringkasanSituasiKeluarga = 'Kondisi keluarga siswa tampak relatif stabil dengan dukungan yang memadai.';
  }

  return { statusOrangtua, figurPengasuh, tempatTinggal, kondisiEkonomi, labelSituasiKeluarga, levelSituasiKeluarga, perluHomeVisit, ringkasanSituasiKeluarga };
}
