import React, { useState, useEffect } from 'react';
import { DataService } from '../../services/dataService';
import { exportIntegratedProfilePDF } from '../../services/reportGenerator';
import {
  AlertTriangle,
  Download,
  Shield,
  Heart,
  Users,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Target,
  BrainCircuit,
  Activity,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  RotateCcw,
  ShieldAlert,
  Home as HomeIcon
} from 'lucide-react';

export const IntegratedProfile: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    DataService.getStudents().then((res) => {
      setStudents(res);
      if (res.length > 0 && !selectedStudentId) {
        setSelectedStudentId(res[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      setProfileData(null);
      return;
    }
    DataService.getIntegratedStudentProfile(selectedStudentId).then(setProfileData);
  }, [selectedStudentId]);

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Belum Ada Data Terpilih</h3>
        <p className="text-sm text-slate-500 mt-1 text-center max-w-sm">
          Silakan impor data siswa di menu Master Data, atau pilih siswa dari *dropdown* di atas untuk melihat Profil BK Terpadu.
        </p>
      </div>
    );
  }

  const { student, dss, akpd, aum, motivasi, mi, selfEsteem, sosiometri, bullying, risikoPerilaku } = profileData;

  // Determine Risk Colors
  const isHighRisk = dss.tingkatRisikoGlobal === 'Sangat Tinggi' || dss.tingkatRisikoGlobal === 'Tinggi';
  const isMedRisk = dss.tingkatRisikoGlobal === 'Sedang';

  return (
    <div className="space-y-6">
      
      {/* Top Navigation / Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Pilih Siswa:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama} ({s.kelas_nama})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={async () => {
              if (window.confirm(`Yakin ingin MENGHAPUS SELURUH JAWABAN ASESMEN untuk ${student.nama}? Data yang dihapus tidak dapat dikembalikan.`)) {
                const success = await DataService.resetStudentResponses(student.id);
                if (success) {
                  alert('Data jawaban berhasil dikosongkan!');
                  window.location.reload();
                } else {
                  alert('Gagal mengosongkan data. Silakan coba lagi.');
                }
              }
            }}
            className="w-full sm:w-auto py-2.5 px-4 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Jawaban</span>
          </button>
          
          <button
            onClick={() => exportIntegratedProfilePDF(student.id)}
            className="w-full sm:w-auto py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Cetak Laporan PDF</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* =========================================
            KOLOM KIRI: Identitas & Kesimpulan DSS
            ========================================= */}
        <div className="w-full xl:w-1/3 space-y-6 shrink-0">
          
          {/* 1. Student Identity Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shadow-emerald-500/30 mb-4">
                {student.nama.charAt(0)}
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {student.nama}
              </h1>
              <div className="mt-2 mb-5">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full border border-slate-200">
                  Kelas {student.kelas_nama}
                </span>
              </div>
              
              <div className="w-full border-t border-slate-100 mb-4"></div>
              
              <div className="w-full space-y-3 text-left">
                <div className="flex items-center text-sm">
                  <UserIcon className="w-4 h-4 text-slate-400 mr-3" />
                  <span className="text-slate-500 w-24">Gender:</span>
                  <span className="font-semibold text-slate-800">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 mr-3" />
                  <span className="text-slate-500 w-24">Tgl Lahir:</span>
                  <span className="font-semibold text-slate-800">{student.tanggal_lahir}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Global Risk Status */}
          <div className={`rounded-3xl p-6 border shadow-sm flex items-start space-x-4 ${
            isHighRisk 
              ? 'bg-rose-50 border-rose-200 shadow-rose-100' 
              : isMedRisk 
              ? 'bg-amber-50 border-amber-200 shadow-amber-100' 
              : 'bg-emerald-50 border-emerald-200 shadow-emerald-100'
          }`}>
            <div className={`p-3 rounded-2xl shrink-0 ${
              isHighRisk ? 'bg-rose-100 text-rose-600' : isMedRisk ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {isHighRisk ? <AlertTriangle className="w-6 h-6" /> : isMedRisk ? <Activity className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Status Risiko Global DSS</p>
              <h3 className={`text-2xl font-black ${
                isHighRisk ? 'text-rose-700' : isMedRisk ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {dss.tingkatRisikoGlobal}
              </h3>
            </div>
          </div>

          {/* 3. DSS Recommendations */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-900 pointer-events-none">
              <Sparkles className="w-24 h-24" />
            </div>
            
            <div className="flex items-center space-x-2 mb-5 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Rekomendasi Layanan</h3>
            </div>
            
            {dss.layananRekomendasi.length > 0 ? (
              <ul className="space-y-4 relative z-10">
                {dss.layananRekomendasi.map((rek: any, idx: number) => (
                  <li key={idx} className="flex items-start group">
                    <div className="mt-0.5 mr-3 flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700 leading-relaxed font-medium">
                      {rek.jenisLayanan} - {rek.topikLayanan}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4 italic">Belum ada rekomendasi. Data asesmen belum mencukupi.</p>
            )}
          </div>

        </div>


        {/* =========================================
            KOLOM KANAN: Grid Instrumen (7 Modul)
            ========================================= */}
        <div className="w-full xl:w-2/3">
          
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Hasil Asesmen Terpadu</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Rekapitulasi dari 7 instrumen pengukur psikologi & akademis siswa.</p>
            </div>
          </div>

          {/* CSS Grid for Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. AKPD */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><ClipboardList className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-800">AKPD Umum</span>
                </div>
                {!akpd && <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Diisi</span>}
              </div>
              
              {akpd ? (
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Prioritas Layanan</p>
                  <p className="text-lg font-black text-emerald-700 mb-3">Bidang {akpd.prioritasUtama}</p>
                  
                  {akpd.detailMasalah && akpd.detailMasalah.length > 0 && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Masalah Dominan Terdeteksi:</p>
                      <ul className="list-disc list-outside ml-4 text-xs text-amber-900 space-y-1 leading-relaxed">
                        {akpd.detailMasalah.map((masalah: string, idx: number) => (
                          <li key={idx} className="pl-1">{masalah}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>Pribadi: <strong className="text-slate-900">{akpd.pribadi}%</strong></div>
                    <div>Sosial: <strong className="text-slate-900">{akpd.sosial}%</strong></div>
                    <div>Belajar: <strong className="text-slate-900">{akpd.belajar}%</strong></div>
                    <div>Karier: <strong className="text-slate-900">{akpd.karier}%</strong></div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic font-medium group-hover:text-emerald-600 transition-colors">Menunggu siswa mengerjakan...</div>
              )}
            </div>

            {/* 2. AUM */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-800">AUM (Masalah)</span>
                </div>
                {!aum && <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Diisi</span>}
              </div>
              
              {aum ? (
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Status Kedaruratan</p>
                  <p className={`text-lg font-black mb-3 ${aum.tingkatMasalah === 'Tinggi' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {aum.tingkatMasalah === 'Tinggi' ? 'Masalah Berat' : aum.tingkatMasalah === 'Sedang' ? 'Perlu Perhatian' : 'Relatif Aman'}
                  </p>
                  
                  {aum.detailMasalah && aum.detailMasalah.length > 0 && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Masalah Spesifik Terdeteksi:</p>
                      <ul className="list-disc list-outside ml-4 text-xs text-amber-900 space-y-1 leading-relaxed">
                        {aum.detailMasalah.map((masalah: string, idx: number) => (
                          <li key={idx} className="pl-1">{masalah}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Dominan di bidang: <strong className="text-slate-900">{aum.masalahDominan.length > 0 ? aum.masalahDominan.join(', ') : 'Tidak ada'}</strong>.
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic font-medium group-hover:text-amber-600 transition-colors">Menunggu siswa mengerjakan...</div>
              )}
            </div>

            {/* 3. Bullying */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-rose-300 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Shield className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-800">Status Bullying</span>
                </div>
                {!bullying && <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Diisi</span>}
              </div>
              
              {bullying ? (
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Peran Teridentifikasi</p>
                  <p className={`text-lg font-black mb-3 ${bullying.peran === 'Aman' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {bullying.peran}
                  </p>
                  
                  {bullying.detailMasalah && bullying.detailMasalah.length > 0 && (
                    <div className="mb-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                      <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2">Indikasi Perundungan:</p>
                      <ul className="list-disc list-outside ml-4 text-xs text-rose-900 space-y-1 leading-relaxed">
                        {bullying.detailMasalah.map((masalah: string, idx: number) => (
                          <li key={idx} className="pl-1">{masalah}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Skor Tingkat Risiko Bullying: <strong className="text-slate-900">{bullying.tingkatRisiko}</strong>.
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic font-medium group-hover:text-rose-600 transition-colors">Menunggu siswa mengerjakan...</div>
              )}
            </div>

            {/* 4. Self Esteem */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-pink-300 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-pink-50 text-pink-600 rounded-lg"><Heart className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-800">Self-Esteem</span>
                </div>
                {!selfEsteem && <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Diisi</span>}
              </div>
              
              {selfEsteem ? (
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Kategori (RSES)</p>
                  <p className={`text-lg font-black mb-3 ${selfEsteem.tingkat === 'Tinggi' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selfEsteem.tingkat}
                  </p>

                  {selfEsteem.detailMasalah && selfEsteem.detailMasalah.length > 0 && (
                    <div className="mb-3 p-3 bg-pink-50 border border-pink-100 rounded-xl">
                      <p className="text-[10px] font-bold text-pink-700 uppercase tracking-wider mb-2">Aspek Harga Diri Rendah:</p>
                      <ul className="list-disc list-outside ml-4 text-xs text-pink-900 space-y-1 leading-relaxed">
                        {selfEsteem.detailMasalah.map((masalah: string, idx: number) => (
                          <li key={idx} className="pl-1">{masalah}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Mencapai skor total <strong className="text-slate-900">{selfEsteem.skorRSES}</strong> dari skala Rosenberg (10 soal).
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic font-medium group-hover:text-pink-600 transition-colors">Menunggu siswa mengerjakan...</div>
              )}
            </div>

            {/* 5. Motivasi Belajar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Target className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-800">Motivasi Belajar</span>
                </div>
                {!motivasi && <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Diisi</span>}
              </div>
              
              {motivasi ? (
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Tingkat Motivasi</p>
                  <p className={`text-lg font-black mb-3 ${motivasi.tingkatMotivasi === 'Sangat Tinggi' || motivasi.tingkatMotivasi === 'Tinggi' ? 'text-emerald-600' : motivasi.tingkatMotivasi === 'Sedang' ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {motivasi.tingkatMotivasi}
                  </p>
                  
                  {motivasi.detailMasalah && motivasi.detailMasalah.length > 0 && (
                    <div className="mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2">Faktor Demotivasi:</p>
                      <ul className="list-disc list-outside ml-4 text-xs text-indigo-900 space-y-1 leading-relaxed">
                        {motivasi.detailMasalah.map((masalah: string, idx: number) => (
                          <li key={idx} className="pl-1">{masalah}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Skor: <strong className="text-slate-900">{motivasi.totalSkor}</strong>.
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic font-medium group-hover:text-indigo-600 transition-colors">Menunggu siswa mengerjakan...</div>
              )}
            </div>

            {/* 6. Kecerdasan Majemuk */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><BrainCircuit className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-800">Multiple Intelligence</span>
                </div>
                {!mi && <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Diisi</span>}
              </div>
              
              {mi ? (
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Gaya Belajar Dominan</p>
                  <p className="text-lg font-black text-purple-700 mb-3">{mi.topDomains.length > 0 ? mi.topDomains[0] : 'Belum Terdeteksi'}</p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Belajar efektif dengan format materi terkait <strong className="text-slate-900 capitalize">{mi.topDomains.length > 0 ? mi.topDomains[0] : ''}</strong>.
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic font-medium group-hover:text-purple-600 transition-colors">Menunggu siswa mengerjakan...</div>
              )}
            </div>

            {/* 7. Sosiometri (Full Width inside Right Column) */}
            <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-300 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><Users className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-800">Sosiometri (Pemetaan Sosial)</span>
                </div>
                {!sosiometri && <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Ada Data</span>}
              </div>
              
              {sosiometri ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Status Relasi Kelas</p>
                    <p className={`text-lg font-black ${sosiometri.kategori === 'Isolated (Terisolasi)' || sosiometri.kategori === 'Rejected' ? 'text-rose-600' : 'text-sky-600'}`}>
                      {sosiometri.kategori}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 sm:w-1/2">
                    Indeks Skor (*Choice Status*): <strong className="text-slate-900 text-base">{sosiometri.choiceStatusIndex.toFixed(2)}</strong>
                    <br />
                    Total Pilihan Diterima: {sosiometri.totalPilihanDiterima}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic font-medium group-hover:text-sky-600 transition-colors">Sosiogram belum bisa digenerate. Perlu partisipasi anggota kelas...</div>
              )}
            </div>

            {/* 8. Risiko Perilaku & Kondisi Keluarga (Full Width) */}
            <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 hover:border-orange-300 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><ShieldAlert className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-800">Skrining Risiko Perilaku & Kondisi Keluarga</span>
                </div>
                {!risikoPerilaku && <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Diisi</span>}
              </div>

              {risikoPerilaku ? (
                <div className="space-y-4">
                  {/* Skor Utama: 3 kolom */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Level Risiko Perilaku */}
                    <div className={`p-3.5 rounded-xl border-2 ${
                      risikoPerilaku.levelRisikoPerilaku === 'Tinggi'
                        ? 'bg-rose-50 border-rose-300'
                        : risikoPerilaku.levelRisikoPerilaku === 'Sedang'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Risiko Perilaku</p>
                      <p className={`text-xl font-black ${
                        risikoPerilaku.levelRisikoPerilaku === 'Tinggi' ? 'text-rose-700'
                        : risikoPerilaku.levelRisikoPerilaku === 'Sedang' ? 'text-amber-700'
                        : 'text-emerald-700'
                      }`}>{risikoPerilaku.levelRisikoPerilaku}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Skor A: {risikoPerilaku.skorDomainA}/108</p>
                    </div>

                    {/* Level Kondisi Keluarga */}
                    <div className={`p-3.5 rounded-xl border-2 ${
                      risikoPerilaku.levelKondisiKeluarga === 'Sangat Perlu Perhatian'
                        ? 'bg-rose-50 border-rose-300'
                        : risikoPerilaku.levelKondisiKeluarga === 'Perlu Perhatian'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Kondisi Keluarga</p>
                      <p className={`text-base font-black leading-tight ${
                        risikoPerilaku.levelKondisiKeluarga === 'Sangat Perlu Perhatian' ? 'text-rose-700'
                        : risikoPerilaku.levelKondisiKeluarga === 'Perlu Perhatian' ? 'text-amber-700'
                        : 'text-emerald-700'
                      }`}>{risikoPerilaku.levelKondisiKeluarga}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Skor B: {risikoPerilaku.skorDomainB}/42</p>
                    </div>

                    {/* Validitas & Confidence */}
                    <div className={`p-3.5 rounded-xl border-2 ${
                      risikoPerilaku.validitasJawaban === 'Rendah'
                        ? 'bg-rose-50 border-rose-300'
                        : risikoPerilaku.validitasJawaban === 'Sedang'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Validitas Jawaban</p>
                      <p className={`text-xl font-black ${
                        risikoPerilaku.validitasJawaban === 'Rendah' ? 'text-rose-700'
                        : risikoPerilaku.validitasJawaban === 'Sedang' ? 'text-amber-700'
                        : 'text-slate-700'
                      }`}>{risikoPerilaku.validitasJawaban}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Confidence: <strong>{risikoPerilaku.confidenceScore}%</strong></p>
                    </div>
                  </div>

                  {/* Sub-domain Perilaku Bermasalah */}
                  {risikoPerilaku.subdominPerilaku && risikoPerilaku.subdominPerilaku.length > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-2">Aspek Perilaku Menonjol:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {risikoPerilaku.subdominPerilaku.map((s: string, i: number) => (
                          <span key={i} className="text-[11px] font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full border border-orange-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ringkasan Otomatis DSS */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Ringkasan Skrining DSS:</p>
                    <p className="text-xs text-slate-700 leading-relaxed italic">&ldquo;{risikoPerilaku.ringkasanOtomatis}&rdquo;</p>
                  </div>

                  {/* Detail Indikator Bermasalah */}
                  {risikoPerilaku.detailMasalah && risikoPerilaku.detailMasalah.length > 0 && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                      <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2">Indikator Perlu Perhatian:</p>
                      <ul className="list-disc list-outside ml-4 text-xs text-rose-900 space-y-1.5 leading-relaxed">
                        {risikoPerilaku.detailMasalah.map((d: string, i: number) => (
                          <li key={i} className="pl-0.5">{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {risikoPerilaku.validitasJawaban === 'Rendah' && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 font-medium">Hasil perlu dikonfirmasi. Terdeteksi kemungkinan <em>social desirability</em> dalam pola jawaban siswa.</p>
                    </div>
                  )}

                  {/* ── PROFIL SITUASI KELUARGA (Q61-Q68) ── */}
                  {risikoPerilaku.statusOrangtua && (
                    <div className="mt-2 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-violet-600 text-white">
                        <div className="flex items-center gap-2">
                          <HomeIcon className="w-4 h-4" />
                          <span className="text-sm font-bold tracking-wide">Profil Situasi Keluarga</span>
                        </div>
                        {risikoPerilaku.perluHomeVisit && (
                          <span className="text-[10px] font-black bg-rose-500 text-white px-2.5 py-1 rounded-full animate-pulse tracking-wider">
                            ⚠ REKOMENDASI HOME VISIT
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Tags Situasi */}
                        {risikoPerilaku.labelSituasiKeluarga && risikoPerilaku.labelSituasiKeluarga.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {risikoPerilaku.labelSituasiKeluarga.map((label: string, i: number) => {
                              const isCritical = ['BROKEN HOME','YATIM PIATU','YATIM / PIATU','KONFLIK KELUARGA','MINIM PENGAWASAN'].includes(label);
                              const isWarning = ['ORANG TUA TIRI','DIASUH WALI','EKONOMI LEMAH','CERAI (BARU)','DUKA CITA (BARU)','KOS / PANTI'].includes(label);
                              return (
                                <span key={i} className={`text-[11px] font-black px-3 py-1.5 rounded-full border tracking-wider ${
                                  isCritical ? 'bg-rose-600 text-white border-rose-600' :
                                  isWarning  ? 'bg-amber-500 text-white border-amber-500' :
                                               'bg-violet-100 text-violet-800 border-violet-300'
                                }`}>{label}</span>
                              );
                            })}
                          </div>
                        )}

                        {/* Grid 4 Fakta Utama */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-white rounded-xl p-3 border border-violet-100 shadow-sm">
                            <p className="text-[9px] font-bold text-violet-500 uppercase tracking-wider mb-1">Status Ortu</p>
                            <p className="text-[11px] font-black text-slate-800 leading-tight">{risikoPerilaku.statusOrangtua}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-violet-100 shadow-sm">
                            <p className="text-[9px] font-bold text-violet-500 uppercase tracking-wider mb-1">Diasuh Oleh</p>
                            <p className="text-[11px] font-black text-slate-800 leading-tight">{risikoPerilaku.figurPengasuh}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-violet-100 shadow-sm">
                            <p className="text-[9px] font-bold text-violet-500 uppercase tracking-wider mb-1">Tempat Tinggal</p>
                            <p className="text-[11px] font-black text-slate-800 leading-tight">{risikoPerilaku.tempatTinggal}</p>
                          </div>
                          <div className={`rounded-xl p-3 border shadow-sm ${
                            risikoPerilaku.kondisiEkonomi === 'Kekurangan' ? 'bg-rose-50 border-rose-200' :
                            risikoPerilaku.kondisiEkonomi === 'Pas-pasan'  ? 'bg-amber-50 border-amber-200' :
                                                                             'bg-emerald-50 border-emerald-200'
                          }`}>
                            <p className="text-[9px] font-bold text-violet-500 uppercase tracking-wider mb-1">Ekonomi</p>
                            <p className={`text-[11px] font-black leading-tight ${
                              risikoPerilaku.kondisiEkonomi === 'Kekurangan' ? 'text-rose-700' :
                              risikoPerilaku.kondisiEkonomi === 'Pas-pasan'  ? 'text-amber-700' :
                                                                               'text-emerald-700'
                            }`}>{risikoPerilaku.kondisiEkonomi}</p>
                          </div>
                        </div>

                        {/* Level Dukungan & Ringkasan */}
                        <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                          risikoPerilaku.levelSituasiKeluarga === 'Sangat Perlu Perhatian' ? 'bg-rose-50 border-rose-200' :
                          risikoPerilaku.levelSituasiKeluarga === 'Perlu Perhatian'        ? 'bg-amber-50 border-amber-200' :
                                                                                             'bg-emerald-50 border-emerald-200'
                        }`}>
                          <div className="shrink-0 mt-0.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              risikoPerilaku.levelSituasiKeluarga === 'Sangat Perlu Perhatian' ? 'bg-rose-600 text-white' :
                              risikoPerilaku.levelSituasiKeluarga === 'Perlu Perhatian'        ? 'bg-amber-500 text-white' :
                                                                                                 'bg-emerald-600 text-white'
                            }`}>{risikoPerilaku.levelSituasiKeluarga}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed italic">{risikoPerilaku.ringkasanSituasiKeluarga}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic font-medium group-hover:text-orange-600 transition-colors">Menunggu siswa mengerjakan asesmen ini...</div>
              )}
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};
