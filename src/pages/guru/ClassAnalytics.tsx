import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DataService } from '../../services/dataService';
import {
  Users,
  Activity,
  AlertTriangle,
  BrainCircuit,
  Shield,
  ClipboardList,
  Target,
  Heart,
  ShieldAlert,
  ChevronRight,
  Home,
  X,
} from 'lucide-react';

interface ClassAnalyticsProps {
  onNavigateToProfile: (studentId: string, kelasId?: string) => void;
}

// ── Compute filtered statistics from per-student breakdown ───────────────────
type StudentRow = {
  id: string; nama: string; kelas_id: string; kelas_nama: string;
  tingkatRisiko: string;
  akpdPrioritas: string | null; aumLevel: string | null; bullyingPeran: string | null;
  motivasiLevel: string | null; selfEsteemLevel: string | null; miTopDomain: string | null;
  risikoPerilakuLevel: string | null; hasSociometri?: boolean;
  kondisiKeluargaLabels: string[]; flags: string[];
};

function buildDisplayStats(breakdown: StudentRow[]) {
  const inc = (obj: Record<string, number>, key: string | null) => {
    if (key) obj[key] = (obj[key] || 0) + 1;
  };
  const stats = {
    totalSiswa: breakdown.length,
    riskLevels: { 'Sangat Tinggi': 0, 'Tinggi': 0, 'Sedang': 0, 'Rendah': 0 } as Record<string, number>,
    akpdPrioritas: { Pribadi: 0, Sosial: 0, Belajar: 0, Karier: 0 } as Record<string, number>,
    aumKedaruratan: { Tinggi: 0, Sedang: 0, Rendah: 0 } as Record<string, number>,
    bullyingRoles: { Aman: 0, 'Korban Ringan': 0, 'Korban Sangat Rentan': 0 } as Record<string, number>,
    motivasiLevels: { 'Sangat Tinggi': 0, Tinggi: 0, Sedang: 0, Rendah: 0, 'Sangat Rendah': 0 } as Record<string, number>,
    selfEsteemLevels: { Tinggi: 0, Sedang: 0, Rendah: 0 } as Record<string, number>,
    risikoPerilakuLevels: { Tinggi: 0, Sedang: 0, Rendah: 0 } as Record<string, number>,
    miDomains: {} as Record<string, number>,
    highRiskStudents: [] as StudentRow[],
    // Key sesuai label ruleEngine yang sebenarnya:
    // 'BROKEN HOME' = q61===2 (cerai/pisah)
    // 'YATIM PIATU' = q61 lain (kedua meninggal)
    // 'YATIM / PIATU' = q61===3 (salah satu meninggal)
    // 'EKONOMI LEMAH' = q65===4 (kekurangan)
    kondisiKeluargaCounts: {
      'BROKEN HOME': 0,
      'YATIM PIATU': 0,
      'YATIM / PIATU': 0,
      'EKONOMI LEMAH': 0,
    } as Record<string, number>,
    // Jumlah siswa yang sudah mengisi tiap asesmen (non-null = sudah mengisi)
    assessmentCounts: {
      akpd: 0, aum: 0, bullying: 0, motivasi: 0,
      selfEsteem: 0, mi: 0, sosiometri: 0, risikoPerilaku: 0,
    },
  };

  for (const s of breakdown) {
    inc(stats.riskLevels, s.tingkatRisiko);
    inc(stats.akpdPrioritas, s.akpdPrioritas);
    inc(stats.aumKedaruratan, s.aumLevel);
    inc(stats.bullyingRoles, s.bullyingPeran);
    inc(stats.motivasiLevels, s.motivasiLevel);
    inc(stats.selfEsteemLevels, s.selfEsteemLevel);
    inc(stats.risikoPerilakuLevels, s.risikoPerilakuLevel);
    inc(stats.miDomains, s.miTopDomain);
    if (s.tingkatRisiko === 'Sangat Tinggi' || s.tingkatRisiko === 'Tinggi') stats.highRiskStudents.push(s);
    const lbl = s.kondisiKeluargaLabels || [];
    // Hitung masing-masing sesuai label ruleEngine yang tepat (TIDAK digabung)
    if (lbl.includes('BROKEN HOME')) stats.kondisiKeluargaCounts['BROKEN HOME']++;
    if (lbl.includes('YATIM PIATU')) stats.kondisiKeluargaCounts['YATIM PIATU']++;     // kedua meninggal
    if (lbl.includes('YATIM / PIATU')) stats.kondisiKeluargaCounts['YATIM / PIATU']++;  // salah satu meninggal
    if (lbl.includes('EKONOMI LEMAH')) stats.kondisiKeluargaCounts['EKONOMI LEMAH']++;
    // Hitung completion per asesmen (non-null = sudah mengisi)
    if (s.akpdPrioritas !== null) stats.assessmentCounts.akpd++;
    if (s.aumLevel !== null) stats.assessmentCounts.aum++;
    if (s.bullyingPeran !== null) stats.assessmentCounts.bullying++;
    if (s.motivasiLevel !== null) stats.assessmentCounts.motivasi++;
    if (s.selfEsteemLevel !== null) stats.assessmentCounts.selfEsteem++;
    if (s.miTopDomain !== null) stats.assessmentCounts.mi++;
    if (s.risikoPerilakuLevel !== null) stats.assessmentCounts.risikoPerilaku++;
    if ((s as any).hasSociometri) stats.assessmentCounts.sosiometri++;
  }

  stats.highRiskStudents.sort((a, b) => {
    if (a.tingkatRisiko === 'Sangat Tinggi' && b.tingkatRisiko !== 'Sangat Tinggi') return -1;
    if (b.tingkatRisiko === 'Sangat Tinggi' && a.tingkatRisiko !== 'Sangat Tinggi') return 1;
    return a.nama.localeCompare(b.nama);
  });

  return stats;
}

export const ClassAnalytics: React.FC<ClassAnalyticsProps> = ({ onNavigateToProfile }) => {
  const [summary, setSummary] = useState<any>(null);
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [animated, setAnimated] = useState(false);
  const [tableVisible, setTableVisible] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  // Modal state for kondisi keluarga
  const [keluargaModal, setKeluargaModal] = useState<{ key: string; label: string; icon: string; students: StudentRow[] } | null>(null);
  // Modal state for skrining risiko perilaku
  const [risikoModal, setRisikoModal] = useState<{ level: string; students: StudentRow[] } | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    DataService.getClassAnalyticsSummary().then((data) => {
      setSummary(data);
      animFrameRef.current = requestAnimationFrame(() => {
        setTimeout(() => { setAnimated(true); setTableVisible(true); }, 80);
      });
    });
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleFilterChange = useCallback((kelasId: string) => {
    setTableVisible(false);
    setAnimated(false);
    setIsFiltering(true);
    setFilterKelas(kelasId);
    // 1-detik loading effect sebelum menampilkan data baru
    setTimeout(() => {
      setIsFiltering(false);
      setTableVisible(true);
      setAnimated(true);
    }, 1000);
  }, []);

  // ── Filtered statistics (recomputed when filter changes) ──────────────────
  const displayStats = useMemo(() => {
    if (!summary) return null;
    const breakdown: StudentRow[] = summary.studentBreakdown || [];
    const filtered = filterKelas === 'all' ? breakdown : breakdown.filter((s: StudentRow) => s.kelas_id === filterKelas);
    return buildDisplayStats(filtered);
  }, [summary, filterKelas]);

  if (!summary || !displayStats) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-200">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Memuat data analitik...</p>
      </div>
    );
  }

  const getPct = (val: number, total: number) => total === 0 ? 0 : Math.round((val / total) * 100);

  const totalWithAKPD = Object.values(displayStats.akpdPrioritas).reduce((a, b) => a + b, 0);
  const totalWithAUM = Object.values(displayStats.aumKedaruratan).reduce((a, b) => a + b, 0);
  const totalWithMI = Object.values(displayStats.miDomains).reduce((a, b) => a + b, 0);
  const totalWithMotivasi = Object.values(displayStats.motivasiLevels).reduce((a, b) => a + b, 0);
  const totalWithSelfEsteem = Object.values(displayStats.selfEsteemLevels).reduce((a, b) => a + b, 0);
  const totalWithRisiko = Object.values(displayStats.risikoPerilakuLevels).reduce((a, b) => a + b, 0);
  const activeKelasName = filterKelas === 'all'
    ? 'Semua Kelas'
    : `Kelas ${(summary.classes || []).find((c: any) => c.id === filterKelas)?.nama || ''}`;
  const totalKelasDisplay = filterKelas === 'all' ? summary.totalKelas : 1;

  const BarRow = ({ label, count, total, color, textColor }: { label: string; count: number; total: number; color: string; textColor: string }) => {
    const pct = getPct(count, total);
    return (
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-semibold text-slate-700 text-xs sm:text-sm">{label}</span>
          <span className={`font-bold text-xs ${textColor}`}>
            {pct}%<span className="text-slate-400 font-normal hidden sm:inline"> ({count} Siswa)</span>
            <span className="text-slate-400 font-normal sm:hidden"> ({count})</span>
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div className={`${color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: animated ? `${pct}%` : '0%' }} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Filter Toolbar ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm relative">
        {isFiltering && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Kelas</span>
          {filterKelas !== 'all' && (
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full animate-in fade-in duration-200">
              {activeKelasName}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => handleFilterChange('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${filterKelas === 'all' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'}`}>Semua</button>
          {(summary.classes || []).map((cls: any) => (
            <button key={cls.id} onClick={() => handleFilterChange(cls.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${filterKelas === cls.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'}`}>
              {cls.nama}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Executive Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'hover:border-emerald-300', label: 'Total Siswa', value: displayStats.totalSiswa, sub: `${totalKelasDisplay} Kelas`, subColor: 'text-slate-400' },
          { icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-rose-100', text: 'text-rose-600', border: 'hover:border-rose-300', label: 'Risiko Sangat Tinggi', value: displayStats.riskLevels['Sangat Tinggi'] || 0, valueColor: 'text-rose-700', sub: 'Siswa DSS' },
          { icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-orange-100', text: 'text-orange-600', border: 'hover:border-orange-300', label: 'Risiko Tinggi', value: displayStats.riskLevels['Tinggi'] || 0, valueColor: 'text-orange-700', sub: 'Siswa DSS' },
          { icon: <Activity className="w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-amber-100', text: 'text-amber-600', border: 'hover:border-amber-300', label: 'Risiko Sedang', value: displayStats.riskLevels['Sedang'] || 0, valueColor: 'text-amber-700', sub: 'Siswa DSS' },
          { icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />, bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'hover:border-emerald-300', label: 'Risiko Rendah', value: displayStats.riskLevels['Rendah'] || 0, valueColor: 'text-emerald-700', sub: 'Siswa DSS' },
        ].map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-3 relative overflow-hidden group ${card.border} transition-all`}>
            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${card.bg} flex items-center justify-center ${card.text} group-hover:scale-110 transition-transform shrink-0`}>{card.icon}</div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{card.label}</p>
              <h3 className={`text-xl sm:text-2xl font-black ${(card as any).valueColor || 'text-slate-900'}`}>{card.value}</h3>
              <p className={`text-[9px] sm:text-[10px] font-semibold ${(card as any).subColor || 'text-slate-400'}`}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. Kondisi Keluarga Cards ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl shrink-0"><Home className="w-4 h-4 sm:w-5 sm:h-5" /></div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Kondisi Keluarga Siswa</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Klik kartu untuk melihat daftar siswa</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              key: 'BROKEN HOME',
              label: 'Broken Home',
              desc: 'Orang tua bercerai/pisah',
              bg: 'bg-rose-50 border-rose-200', textLabel: 'text-rose-500', textVal: 'text-rose-700',
              icon: '💔', hoverBg: 'hover:bg-rose-100 hover:border-rose-300',
              matchFn: (lbl: string[]) => lbl.includes('BROKEN HOME'),
            },
            {
              key: 'YATIM PIATU',
              label: 'Yatim Piatu',
              desc: 'Kedua orang tua meninggal',
              bg: 'bg-slate-50 border-slate-200', textLabel: 'text-slate-500', textVal: 'text-slate-700',
              icon: '🕊️', hoverBg: 'hover:bg-slate-100 hover:border-slate-300',
              matchFn: (lbl: string[]) => lbl.includes('YATIM PIATU'), // tepat — bukan 'YATIM / PIATU'
            },
            {
              key: 'YATIM / PIATU',
              label: 'Salah Satu Meninggal',
              desc: 'Ayah atau ibu telah meninggal',
              bg: 'bg-amber-50 border-amber-200', textLabel: 'text-amber-600', textVal: 'text-amber-700',
              icon: '🌿', hoverBg: 'hover:bg-amber-100 hover:border-amber-300',
              matchFn: (lbl: string[]) => lbl.includes('YATIM / PIATU'), // tepat — bukan 'YATIM PIATU'
            },
            {
              key: 'EKONOMI LEMAH',
              label: 'Ekonomi Lemah',
              desc: 'Kondisi ekonomi kekurangan',
              bg: 'bg-orange-50 border-orange-200', textLabel: 'text-orange-500', textVal: 'text-orange-700',
              icon: '💸', hoverBg: 'hover:bg-orange-100 hover:border-orange-300',
              matchFn: (lbl: string[]) => lbl.includes('EKONOMI LEMAH'),
            },
          ].map(({ key, label, desc, bg, textLabel, textVal, icon, hoverBg, matchFn }) => {
            const count = displayStats.kondisiKeluargaCounts[key] || 0;
            const matchingStudents = (filterKelas === 'all'
              ? (summary.studentBreakdown || [])
              : (summary.studentBreakdown || []).filter((s: StudentRow) => s.kelas_id === filterKelas)
            ).filter((s: StudentRow) => matchFn(s.kondisiKeluargaLabels || []));
            return (
              <button
                key={key}
                onClick={() => count > 0 && setKeluargaModal({ key, label, icon, students: matchingStudents })}
                disabled={count === 0}
                className={`border ${bg} ${count > 0 ? `${hoverBg} cursor-pointer active:scale-[0.97]` : 'cursor-default opacity-60'} p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center text-center gap-1 transition-all duration-200 w-full`}
              >
                <span className="text-xl sm:text-2xl mb-0.5">{icon}</span>
                <span className={`text-2xl sm:text-3xl font-black ${textVal}`}>{count}</span>
                <span className={`text-xs font-black ${textLabel}`}>{label}</span>
                <span className={`text-[9px] sm:text-[10px] ${textLabel} opacity-70 leading-tight hidden sm:block`}>{desc}</span>
                {count > 0 && <span className={`text-[8px] sm:text-[9px] ${textLabel} opacity-50 mt-0.5`}>Klik untuk lihat</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Partisipasi Asesmen Siswa ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Partisipasi Pengisian Asesmen</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              Dari {displayStats.totalSiswa} siswa {filterKelas !== 'all' ? `di ${activeKelasName}` : 'semua kelas'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: 'AKPD', sub: 'Angket Kebutuhan Pengembangan Diri', count: displayStats.assessmentCounts.akpd, color: 'from-emerald-500 to-teal-400', textColor: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'AUM', sub: 'Alat Ungkap Masalah', count: displayStats.assessmentCounts.aum, color: 'from-amber-500 to-yellow-400', textColor: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Bullying', sub: 'Angket Bullying Olweus', count: displayStats.assessmentCounts.bullying, color: 'from-rose-500 to-red-400', textColor: 'text-rose-700', bg: 'bg-rose-50' },
            { label: 'Self-Esteem', sub: 'Rosenberg Self-Esteem Scale', count: displayStats.assessmentCounts.selfEsteem, color: 'from-pink-500 to-fuchsia-400', textColor: 'text-pink-700', bg: 'bg-pink-50' },
            { label: 'Motivasi Belajar', sub: 'Skala Motivasi Intrinsik', count: displayStats.assessmentCounts.motivasi, color: 'from-indigo-500 to-blue-400', textColor: 'text-indigo-700', bg: 'bg-indigo-50' },
            { label: 'Multiple Intelligence', sub: 'Kecerdasan Majemuk Gardner', count: displayStats.assessmentCounts.mi, color: 'from-purple-500 to-violet-400', textColor: 'text-purple-700', bg: 'bg-purple-50' },
            { label: 'Sosiometri', sub: 'Peta Relasi Sosial Moreno', count: displayStats.assessmentCounts.sosiometri, color: 'from-sky-500 to-cyan-400', textColor: 'text-sky-700', bg: 'bg-sky-50' },
            { label: 'Deteksi Risiko Perilaku', sub: 'Problem Behavior + Profil Keluarga', count: displayStats.assessmentCounts.risikoPerilaku, color: 'from-orange-500 to-amber-400', textColor: 'text-orange-700', bg: 'bg-orange-50' },
          ].map(({ label, sub, count, color, textColor, bg }) => {
            const total = displayStats.totalSiswa;
            const pct = total === 0 ? 0 : Math.round((count / total) * 100);
            const isComplete = pct === 100;
            const isGood = pct >= 75;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${bg} ${textColor} shrink-0`}>
                      {pct}%
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate leading-tight">{label}</p>
                      <p className="text-[9px] text-slate-400 leading-tight hidden sm:block truncate">{sub}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-black shrink-0 ml-2 ${isComplete ? 'text-emerald-600' : isGood ? 'text-slate-700' : 'text-slate-400'}`}>
                    {count}<span className="font-normal text-slate-400">/{total}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out relative`}
                    style={{ width: animated ? `${pct}%` : '0%' }}
                  >
                    {isComplete && (
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-white text-[8px] font-black leading-none">✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Summary footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium">Rata-rata partisipasi:</span>
            <span className="text-sm font-black text-slate-800">
              {displayStats.totalSiswa === 0 ? '0' : Math.round(
                (displayStats.assessmentCounts.akpd + displayStats.assessmentCounts.aum +
                 displayStats.assessmentCounts.bullying + displayStats.assessmentCounts.motivasi +
                 displayStats.assessmentCounts.selfEsteem + displayStats.assessmentCounts.mi +
                 displayStats.assessmentCounts.sosiometri + displayStats.assessmentCounts.risikoPerilaku
                ) / 8 / displayStats.totalSiswa * 100
              )}% <span className="text-xs text-slate-400 font-normal">dari 8 asesmen</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            <span className="text-[10px] text-slate-400">Sudah mengisi</span>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 ml-2" />
            <span className="text-[10px] text-slate-400">Belum mengisi</span>
          </div>
        </div>
      </div>

      {/* ── 4. Charts Row 1: AKPD & AUM ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Distribusi Kebutuhan Layanan (AKPD)</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Berdasarkan {totalWithAKPD} siswa yang mengisi</p>
            </div>
          </div>
          {totalWithAKPD > 0 ? (
            <div className="space-y-4">
              {[{ key: 'Pribadi', color: 'bg-teal-500', textColor: 'text-teal-700' }, { key: 'Sosial', color: 'bg-sky-500', textColor: 'text-sky-700' }, { key: 'Belajar', color: 'bg-emerald-500', textColor: 'text-emerald-700' }, { key: 'Karier', color: 'bg-indigo-500', textColor: 'text-indigo-700' }].map(({ key, color, textColor }) => (
                <BarRow key={key} label={key} count={displayStats.akpdPrioritas[key] || 0} total={totalWithAKPD} color={color} textColor={textColor} />
              ))}
            </div>
          ) : <div className="py-8 text-center text-slate-400 italic text-sm">Belum ada data AKPD.</div>}
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Activity className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Peta Kedaruratan Masalah (AUM)</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Berdasarkan {totalWithAUM} siswa yang mengisi</p>
            </div>
          </div>
          {totalWithAUM > 0 ? (
            <div className="space-y-4">
              {[{ label: 'Tinggi (Masalah Berat)', key: 'Tinggi', color: 'bg-rose-500', textColor: 'text-rose-700' }, { label: 'Sedang (Perlu Perhatian)', key: 'Sedang', color: 'bg-amber-500', textColor: 'text-amber-700' }, { label: 'Rendah (Relatif Aman)', key: 'Rendah', color: 'bg-emerald-500', textColor: 'text-emerald-700' }].map((item) => (
                <BarRow key={item.key} label={item.label} count={displayStats.aumKedaruratan[item.key] || 0} total={totalWithAUM} color={item.color} textColor={item.textColor} />
              ))}
            </div>
          ) : <div className="py-8 text-center text-slate-400 italic text-sm">Belum ada data AUM.</div>}
        </div>
      </div>

      {/* ── 4. Charts Row 2: Motivasi & Self-Esteem ────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Target className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Distribusi Motivasi Belajar</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Berdasarkan {totalWithMotivasi} siswa yang mengisi</p>
            </div>
          </div>
          {totalWithMotivasi > 0 ? (
            <div className="space-y-4">
              {[{ key: 'Sangat Tinggi', color: 'bg-emerald-500', textColor: 'text-emerald-700' }, { key: 'Tinggi', color: 'bg-teal-500', textColor: 'text-teal-700' }, { key: 'Sedang', color: 'bg-indigo-500', textColor: 'text-indigo-700' }, { key: 'Rendah', color: 'bg-amber-500', textColor: 'text-amber-700' }, { key: 'Sangat Rendah', color: 'bg-rose-500', textColor: 'text-rose-700' }].map(({ key, color, textColor }) => (
                <BarRow key={key} label={key} count={displayStats.motivasiLevels[key] || 0} total={totalWithMotivasi} color={color} textColor={textColor} />
              ))}
            </div>
          ) : <div className="py-8 text-center text-slate-400 italic text-sm">Belum ada data Motivasi Belajar.</div>}
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-xl shrink-0"><Heart className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Distribusi Self-Esteem (RSES)</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Berdasarkan {totalWithSelfEsteem} siswa yang mengisi</p>
            </div>
          </div>
          {totalWithSelfEsteem > 0 ? (
            <div className="space-y-4">
              {[{ key: 'Tinggi', color: 'bg-emerald-500', textColor: 'text-emerald-700' }, { key: 'Sedang', color: 'bg-amber-500', textColor: 'text-amber-700' }, { key: 'Rendah', color: 'bg-rose-500', textColor: 'text-rose-700' }].map(({ key, color, textColor }) => (
                <BarRow key={key} label={key} count={displayStats.selfEsteemLevels[key] || 0} total={totalWithSelfEsteem} color={color} textColor={textColor} />
              ))}
            </div>
          ) : <div className="py-8 text-center text-slate-400 italic text-sm">Belum ada data Self-Esteem.</div>}
        </div>
      </div>

      {/* ── 5. Charts Row 3: MI & Bullying + Risiko ────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl shrink-0"><BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Dominasi Kecerdasan Majemuk</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Rekomendasi pendekatan guru mata pelajaran</p>
            </div>
          </div>
          {totalWithMI > 0 ? (
            <div className="space-y-3">
              {Object.entries(displayStats.miDomains).sort(([, a], [, b]) => b - a).map(([domain, count], idx) => {
                const colors = ['bg-purple-500', 'bg-violet-500', 'bg-indigo-500', 'bg-fuchsia-500', 'bg-blue-500', 'bg-pink-500', 'bg-rose-500', 'bg-teal-500'];
                const textColors = ['text-purple-700', 'text-violet-700', 'text-indigo-700', 'text-fuchsia-700', 'text-blue-700', 'text-pink-700', 'text-rose-700', 'text-teal-700'];
                return <BarRow key={domain} label={`#${idx + 1} ${domain}`} count={count as number} total={totalWithMI} color={colors[idx % colors.length]} textColor={textColors[idx % textColors.length]} />;
              })}
            </div>
          ) : <div className="py-8 text-center text-slate-400 italic text-sm">Belum ada data Multiple Intelligence.</div>}
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0"><Shield className="w-4 h-4 sm:w-5 sm:h-5" /></div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Peta Kerawanan Bullying</h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Klasifikasi korban &amp; pelaku perundungan</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Korban Sangat Rentan', key: 'Korban Sangat Rentan', bg: 'bg-rose-50 border-rose-200', tl: 'text-rose-500', tv: 'text-rose-700' },
                { label: 'Korban Ringan', key: 'Korban Ringan', bg: 'bg-amber-50 border-amber-200', tl: 'text-amber-500', tv: 'text-amber-700' },
                { label: 'Relasi Aman', key: 'Aman', bg: 'bg-emerald-50 border-emerald-200', tl: 'text-emerald-500', tv: 'text-emerald-700' },
              ].map(({ label, key, bg, tl, tv }) => (
                <div key={key} className={`border ${bg} p-3 rounded-xl sm:rounded-2xl flex flex-col justify-center items-center text-center`}>
                  <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider ${tl} mb-1 leading-tight`}>{label}</span>
                  <span className={`text-2xl sm:text-3xl font-black ${tv}`}>{displayStats.bullyingRoles[key] || 0}</span>
                  <span className={`text-[8px] sm:text-[10px] font-medium ${tl} mt-0.5 uppercase`}>Siswa</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl shrink-0"><ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" /></div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Skrining Risiko Perilaku</h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Berdasarkan {totalWithRisiko} siswa yang mengisi</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { key: 'Tinggi', bg: 'bg-rose-50 border-rose-200', tl: 'text-rose-500', tv: 'text-rose-700', hoverBg: 'hover:bg-rose-100 hover:border-rose-300' },
                { key: 'Sedang', bg: 'bg-amber-50 border-amber-200', tl: 'text-amber-500', tv: 'text-amber-700', hoverBg: 'hover:bg-amber-100 hover:border-amber-300' },
                { key: 'Rendah', bg: 'bg-emerald-50 border-emerald-200', tl: 'text-emerald-500', tv: 'text-emerald-700', hoverBg: 'hover:bg-emerald-100 hover:border-emerald-300' },
              ].map(({ key, bg, tl, tv, hoverBg }) => {
                const count = displayStats.risikoPerilakuLevels[key] || 0;
                const matchingStudents = (filterKelas === 'all'
                  ? (summary.studentBreakdown || [])
                  : (summary.studentBreakdown || []).filter((s: StudentRow) => s.kelas_id === filterKelas)
                ).filter((s: StudentRow) => s.risikoPerilakuLevel === key);
                return (
                  <button
                    key={key}
                    onClick={() => count > 0 && setRisikoModal({ level: key, students: matchingStudents })}
                    disabled={count === 0}
                    className={`border ${bg} ${count > 0 ? `${hoverBg} cursor-pointer active:scale-[0.97]` : 'cursor-default opacity-60'} p-3 rounded-xl sm:rounded-2xl flex flex-col justify-center items-center text-center gap-0.5 transition-all duration-200 w-full`}
                  >
                    <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider ${tl} mb-1`}>Risiko {key}</span>
                    <span className={`text-2xl sm:text-3xl font-black ${tv}`}>{count}</span>
                    <span className={`text-[8px] sm:text-[10px] font-medium ${tl} mt-0.5 uppercase`}>Siswa</span>
                    {count > 0 && <span className={`text-[8px] ${tl} opacity-50 mt-0.5`}>Klik untuk lihat</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. High-Risk Students Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0"><AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Prioritas Intervensi BK</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                Siswa dengan <span className="font-bold text-orange-600">Skor DSS Tinggi / Sangat Tinggi</span> — memerlukan tindak lanjut segera dari Guru BK
                {filterKelas !== 'all' && <span className="ml-1 font-bold text-emerald-600">— {activeKelasName}</span>}
              </p>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">
                DSS menggabungkan hasil AKPD, AUM, Bullying, Self-Esteem, Motivasi, Sosiometri &amp; Skrining Perilaku · Klik baris untuk membuka profil
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-rose-100 text-rose-700 px-2.5 py-1 rounded-xl border border-rose-200 shrink-0">{displayStats.highRiskStudents.length} Siswa</span>
        </div>

        {displayStats.highRiskStudents.length > 0 ? (
          <div style={{ opacity: tableVisible ? 1 : 0, transform: tableVisible ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {displayStats.highRiskStudents.map((student: StudentRow) => (
                <div key={student.id} onClick={() => onNavigateToProfile(student.id, student.kelas_id)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 active:scale-[0.98] cursor-pointer transition-all group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-sm font-black text-slate-600 shrink-0 group-hover:from-emerald-400 group-hover:to-teal-300 group-hover:text-white transition-all">{student.nama.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-700">{student.nama}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{student.kelas_nama}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        student.tingkatRisiko === 'Sangat Tinggi' ? 'bg-rose-100 text-rose-700'
                        : student.tingkatRisiko === 'Tinggi' ? 'bg-orange-100 text-orange-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>{student.tingkatRisiko}</span>
                    </div>
                    {student.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.flags.slice(0, 3).map((flag: string, i: number) => <span key={i} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{flag}</span>)}
                        {student.flags.length > 3 && <span className="text-[9px] font-bold text-slate-400">+{student.flags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <table className="w-full text-sm hidden sm:table">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 pr-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="text-left pb-3 pr-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="text-left pb-3 pr-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level DSS</th>
                  <th className="text-left pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Indikator</th>
                  <th className="pb-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayStats.highRiskStudents.map((student: StudentRow) => (
                  <tr key={student.id} onClick={() => onNavigateToProfile(student.id, student.kelas_id)} className="group hover:bg-emerald-50 cursor-pointer transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-xs font-black text-slate-600 shrink-0 group-hover:from-emerald-400 group-hover:to-teal-300 group-hover:text-white transition-all">{student.nama.charAt(0)}</div>
                        <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">{student.nama}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4"><span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{student.kelas_nama}</span></td>
                    <td className="py-3.5 pr-4">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        student.tingkatRisiko === 'Sangat Tinggi' ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : student.tingkatRisiko === 'Tinggi' ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>{student.tingkatRisiko}</span>
                    </td>
                    <td className="py-3.5 pr-2">
                      <div className="flex flex-wrap gap-1">
                        {student.flags.map((flag: string, i: number) => <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">{flag}</span>)}
                        {student.flags.length === 0 && <span className="text-[10px] text-slate-400 italic">—</span>}
                      </div>
                    </td>
                    <td className="py-3.5 text-center"><ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center text-center" style={{ opacity: tableVisible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-400 mb-3"><Shield className="w-6 h-6" /></div>
            <p className="font-bold text-slate-700 text-sm">Tidak Ada Siswa Berisiko Tinggi</p>
            <p className="text-xs text-slate-400 mt-1">{filterKelas !== 'all' ? 'Tidak ada siswa berisiko di kelas ini.' : 'Semua siswa berada di level risiko Sedang atau Rendah.'}</p>
          </div>
        )}
      </div>

      {/* ── Loading Overlay saat filter berubah ────────────────────────── */}
      {isFiltering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl px-8 py-6 shadow-2xl border border-emerald-100 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-100 rounded-full" />
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-800">Memuat Data</p>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">{activeKelasName}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Kondisi Keluarga ────────────────────────────────────── */}
      {keluargaModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setKeluargaModal(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          {/* Panel */}
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{keluargaModal.icon}</span>
                <div>
                  <h3 className="text-base font-black text-slate-900">{keluargaModal.label}</h3>
                  <p className="text-xs text-slate-500 font-medium">{keluargaModal.students.length} siswa terdeteksi</p>
                </div>
              </div>
              <button
                onClick={() => setKeluargaModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Student list */}
            <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
              {keluargaModal.students.length > 0 ? keluargaModal.students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => { setKeluargaModal(null); onNavigateToProfile(student.id, student.kelas_id); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent active:scale-[0.98] cursor-pointer transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-sm font-black text-slate-600 shrink-0 group-hover:from-emerald-400 group-hover:to-teal-300 group-hover:text-white transition-all">
                    {student.nama.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 truncate">{student.nama}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Kelas {student.kelas_nama}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                </button>
              )) : (
                <div className="py-8 text-center text-slate-400 italic text-sm">Tidak ada data siswa</div>
              )}
            </div>
            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
              <p className="text-[10px] text-slate-400 text-center font-medium">Klik nama siswa untuk membuka profil lengkap</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Risiko Perilaku ───────────────────────────────────────── */}
      {risikoModal && (() => {
        const cfg = risikoModal.level === 'Tinggi'
          ? { icon: '🚨', color: 'text-rose-700', badge: 'bg-rose-100 text-rose-700 border-rose-200', header: 'bg-rose-50 border-rose-100' }
          : risikoModal.level === 'Sedang'
          ? { icon: '⚠️', color: 'text-amber-700', badge: 'bg-amber-100 text-amber-700 border-amber-200', header: 'bg-amber-50 border-amber-100' }
          : { icon: '✅', color: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', header: 'bg-emerald-50 border-emerald-100' };
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setRisikoModal(null)}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${cfg.header} rounded-t-3xl`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cfg.icon}</span>
                  <div>
                    <h3 className={`text-base font-black ${cfg.color}`}>Risiko Perilaku {risikoModal.level}</h3>
                    <p className="text-xs text-slate-500 font-medium">{risikoModal.students.length} siswa terdeteksi{filterKelas !== 'all' ? ` — ${activeKelasName}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => setRisikoModal(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Student list */}
              <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
                {risikoModal.students.length > 0 ? risikoModal.students
                  .sort((a, b) => a.nama.localeCompare(b.nama))
                  .map((student) => (
                  <button
                    key={student.id}
                    onClick={() => { setRisikoModal(null); onNavigateToProfile(student.id, student.kelas_id); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent active:scale-[0.98] cursor-pointer transition-all group text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-sm font-black text-slate-600 shrink-0 group-hover:from-emerald-400 group-hover:to-teal-300 group-hover:text-white transition-all">
                      {student.nama.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 truncate">{student.nama}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">Kelas {student.kelas_nama}</span>
                        {student.akpdPrioritas && (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">AKPD: {student.akpdPrioritas}</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${cfg.badge} shrink-0`}>{risikoModal.level}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                  </button>
                )) : (
                  <div className="py-8 text-center text-slate-400 italic text-sm">Tidak ada data siswa</div>
                )}
              </div>
              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                <p className="text-[10px] text-slate-400 text-center font-medium">Klik nama siswa untuk membuka profil lengkap</p>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
