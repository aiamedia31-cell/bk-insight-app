import React, { useState, useMemo, useEffect } from 'react';
import { Users, FileSpreadsheet, Upload, CheckCircle2, Search, Calendar, UserCheck } from 'lucide-react';
import { DataService, StudentData, ClassData } from '../../services/dataService';
import { parseStudentExcel } from '../../services/excelImporter';

export const MasterData: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    DataService.getClasses().then(setClasses);
    DataService.getStudents().then(setStudents);
  }, []);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClassId === 'all' || s.kelas_id === selectedClassId;
      const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [students, selectedClassId, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImportStatus('Membaca dan memproses file Excel...');

    try {
      const records = await parseStudentExcel(file);
      const importedCount = await DataService.importStudentsFromExcel(records);

      DataService.getClasses().then(setClasses);
      DataService.getStudents().then(setStudents);

      setImportStatus(`Berhasil mengimpor ${importedCount} data siswa baru!`);
    } catch (err) {
      console.error(err);
      setImportStatus('Gagal mengimpor file Excel. Pastikan format kolom: Nama, Jenis Kelamin, Kelas, Tanggal Lahir.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Excel Upload Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-emerald-100 shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Manajemen Master Data</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Siswa & Rombel Kelas</h1>
          <p className="text-slate-500 text-xs mt-1">
            Sistem menyimpan Nama Siswa, Jenis Kelamin, Kelas, dan Tanggal Lahir sebagai PIN verifikasi.
          </p>
        </div>

        {/* Excel Upload Box */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-0 sm:space-x-4 shrink-0">
          <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Import Data Siswa (Excel / CSV)</p>
            <p className="text-[11px] text-emerald-800 font-semibold">Format Kolom: Nama, Jenis Kelamin, Kelas, Tanggal Lahir</p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md">
                <Upload className="w-4 h-4" />
                <span>Impor Data (Excel)</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              <button
                onClick={async () => {
                  if (window.confirm("Yakin ingin menghapus seluruh data siswa, rombel, dan hasil asesmen? Data yang dihapus tidak bisa dikembalikan.")) {
                    await DataService.clearAllData();
                    setClasses([]);
                    setStudents([]);
                    setImportStatus("Semua data berhasil dihapus dari database cloud (Supabase).");
                  }
                }}
                className="cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-sm border border-rose-200"
              >
                <span>Hapus Semua Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {importStatus && (
        <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm font-bold border ${
          importStatus.includes('Gagal') 
            ? 'bg-rose-50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {importStatus.includes('Gagal') ? <Users className="w-5 h-5 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 mt-0.5" />}
          <p>{importStatus}</p>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Class Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600">Filter Kelas:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Semua Kelas ({students.length} Siswa)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Kelas {c.nama} ({students.filter(s => s.kelas_id === c.id).length} Siswa)
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Tanggal Lahir (PIN)</th>
                <th className="px-6 py-4">Jenis Kelamin</th>
                <th className="px-6 py-4 text-center">Status Akses Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs border border-emerald-200">
                      {std.nama.charAt(0)}
                    </div>
                    <span>{std.nama}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      Kelas {std.kelas_nama}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-700 font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{std.tanggal_lahir}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {std.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      <UserCheck className="w-3 h-3" />
                      <span>Siap Masuk Portal</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
