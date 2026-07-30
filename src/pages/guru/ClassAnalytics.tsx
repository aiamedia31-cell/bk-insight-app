import React, { useState, useEffect } from 'react';
import { DataService } from '../../services/dataService';
import {
  Users,
  Activity,
  AlertTriangle,
  BrainCircuit,
  Shield,
  ClipboardList
} from 'lucide-react';

export const ClassAnalytics: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => {
    DataService.getClassAnalyticsSummary().then(setSummary);
  }, []);

  if (!summary) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

  // Helpers to calculate percentages for our CSS bars
  const totalWithAKPD = Object.values(summary.akpdPrioritas).reduce((a: any, b: any) => a + b, 0) as number;
  const totalWithAUM = Object.values(summary.aumKedaruratan).reduce((a: any, b: any) => a + b, 0) as number;
  const totalWithMI = Object.values(summary.miDomains).reduce((a: any, b: any) => a + b, 0) as number;

  const getPct = (val: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Populasi</p>
            <h3 className="text-3xl font-black text-slate-900">{summary.totalSiswa} <span className="text-sm font-medium text-slate-500">Siswa</span></h3>
          </div>
          <div className="absolute right-0 top-0 mt-4 mr-4 text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
            {summary.totalKelas} Kelas
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4 relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risiko DSS Sangat Tinggi</p>
            <h3 className="text-3xl font-black text-slate-900">{summary.riskLevels['Sangat Tinggi'] || 0} <span className="text-sm font-medium text-slate-500">Siswa</span></h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risiko DSS Sedang</p>
            <h3 className="text-3xl font-black text-slate-900">{summary.riskLevels['Sedang'] || 0} <span className="text-sm font-medium text-slate-500">Siswa</span></h3>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 2. AKPD Priority Distribution */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ClipboardList className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Distribusi Kebutuhan Layanan (AKPD)</h2>
              <p className="text-xs text-slate-500 font-medium">Berdasarkan {totalWithAKPD} siswa yang telah mengisi</p>
            </div>
          </div>

          {totalWithAKPD > 0 ? (
            <div className="space-y-5">
              {['Pribadi', 'Sosial', 'Belajar', 'Karier'].map(bidang => {
                const count = summary.akpdPrioritas[bidang] || 0;
                const pct = getPct(count, totalWithAKPD);
                return (
                  <div key={bidang}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-slate-700">{bidang}</span>
                      <span className="font-bold text-emerald-700">{pct}% ({count} Siswa)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
             <div className="py-10 text-center text-slate-400 italic text-sm">Belum ada data AKPD.</div>
          )}
        </div>


        {/* 3. AUM Risk Distribution */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Activity className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Peta Kedaruratan Masalah (AUM)</h2>
              <p className="text-xs text-slate-500 font-medium">Berdasarkan {totalWithAUM} siswa yang telah mengisi</p>
            </div>
          </div>

          {totalWithAUM > 0 ? (
            <div className="space-y-5">
              {[
                { label: 'Tinggi (Masalah Berat)', key: 'Tinggi', color: 'bg-rose-500' },
                { label: 'Sedang (Perlu Perhatian)', key: 'Sedang', color: 'bg-amber-500' },
                { label: 'Rendah (Relatif Aman)', key: 'Rendah', color: 'bg-emerald-500' },
              ].map(item => {
                const count = summary.aumKedaruratan[item.key] || 0;
                const pct = getPct(count, totalWithAUM);
                return (
                  <div key={item.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-slate-700">{item.label}</span>
                      <span className="font-bold text-slate-900">{pct}% ({count} Siswa)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`${item.color} h-full rounded-full transition-all duration-1000`} 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 italic text-sm">Belum ada data AUM.</div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 4. Multiple Intelligence */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><BrainCircuit className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Dominasi Kecerdasan Majemuk</h2>
              <p className="text-xs text-slate-500 font-medium">Rekomendasi untuk pendekatan guru mata pelajaran</p>
            </div>
          </div>

          {totalWithMI > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(summary.miDomains as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .map(([domain, count], idx) => {
                  const pct = getPct(count, totalWithMI);
                  return (
                    <div key={domain} className="flex-1 min-w-[120px] bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Peringkat {idx + 1}</p>
                      <h4 className="text-lg font-black text-purple-700 capitalize">{domain}</h4>
                      <p className="text-sm font-bold text-slate-900 mt-2">{pct}% <span className="text-slate-500 font-medium">({count} Siswa)</span></p>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 italic text-sm">Belum ada data Multiple Intelligence.</div>
          )}
        </div>


        {/* 5. Bullying */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Shield className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Peta Kerawanan Bullying</h2>
              <p className="text-xs text-slate-500 font-medium">Klasifikasi korban dan pelaku perundungan kelas</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 bg-rose-50 border border-rose-100 p-5 rounded-2xl flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-2">Korban Sangat Rentan</span>
                <span className="text-4xl font-black text-rose-700">{summary.bullyingRoles['Korban Sangat Rentan'] || 0}</span>
                <span className="text-[10px] font-medium text-rose-600 mt-1 uppercase">Siswa Terindikasi</span>
             </div>
             
             <div className="flex-1 bg-amber-50 border border-amber-100 p-5 rounded-2xl flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2">Korban Ringan</span>
                <span className="text-4xl font-black text-amber-700">{summary.bullyingRoles['Korban Ringan'] || 0}</span>
                <span className="text-[10px] font-medium text-amber-600 mt-1 uppercase">Siswa Terindikasi</span>
             </div>

             <div className="flex-1 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-2">Relasi Aman</span>
                <span className="text-4xl font-black text-emerald-700">{summary.bullyingRoles['Aman'] || 0}</span>
                <span className="text-[10px] font-medium text-emerald-600 mt-1 uppercase">Siswa Terindikasi</span>
             </div>
          </div>

        </div>

      </div>

    </div>
  );
};
