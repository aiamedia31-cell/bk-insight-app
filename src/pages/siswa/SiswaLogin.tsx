import React, { useState, useEffect } from 'react';
import { UserCheck, Calendar, School, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { DataService, StudentData } from '../../services/dataService';

interface SiswaLoginProps {
  onLoginSuccess: (student: StudentData) => void;
}

export const SiswaLogin: React.FC<SiswaLoginProps> = ({ onLoginSuccess }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [birthDay, setBirthDay] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [studentsInClass, setStudentsInClass] = useState<StudentData[]>([]);

  useEffect(() => {
    DataService.getClasses().then((res) => {
      setClasses(res);
      if (res.length > 0 && !selectedClassId) {
        setSelectedClassId(res[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudentsInClass([]);
      return;
    }
    DataService.getStudentsByClass(selectedClassId).then(setStudentsInClass);
  }, [selectedClassId]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedClassId) {
      setErrorMsg('Silakan pilih kelasmu.');
      return;
    }
    if (!selectedStudentId) {
      setErrorMsg('Silakan pilih namamu dari daftar.');
      return;
    }
    if (!birthDay || !birthMonth || !birthYear) {
      setErrorMsg('Silakan pilih tanggal lahirmu dengan lengkap (Hari, Bulan, Tahun).');
      return;
    }
    
    // Format YYYY-MM-DD
    const formattedDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    const verifiedStudent = await DataService.verifyStudentLogin(selectedClassId, selectedStudentId, formattedDate);

    if (verifiedStudent) {
      onLoginSuccess(verifiedStudent);
    } else {
      setErrorMsg('Tanggal lahir tidak sesuai dengan data siswa. Silakan periksa kembali.');
    }
  };

  // Generate options for Date Picker
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' }, { val: '3', label: 'Maret' },
    { val: '4', label: 'April' }, { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
    { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' }, { val: '9', label: 'September' },
    { val: '10', label: 'Oktober' }, { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
  ];
  const currentYear = new Date().getFullYear();
  // For SMP (usually 11-15 years old), let's show years from (currentYear-17) to (currentYear-10)
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 10 - i);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6 animate-slide-up">
      <div className="w-full max-w-md">
        
        {/* Logo & Header */}
        <div className="text-center mb-6 sm:mb-8">
          <img src="/logo.png" alt="BK Insight Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Portal Siswa</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Selamat datang! Yuk, pilih kelas dan namamu untuk mulai.
          </p>
        </div>

        {/* Login Form Container - Android Optimized */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-emerald-100 relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            
            {/* Step 1: Dropdown Kelas */}
            <div>
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                <span>Kelas</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <School className="w-5 h-5" />
                </div>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full pl-11 pr-4 min-h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Kelas {cls.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Dropdown Nama Siswa */}
            <div>
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                <span>Nama Lengkap</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setErrorMsg('');
                  }}
                  disabled={!selectedClassId || studentsInClass.length === 0}
                  className="w-full pl-11 pr-4 min-h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Nama --</option>
                  {studentsInClass.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.nama}
                    </option>
                  ))}
                </select>
              </div>
              {studentsInClass.length === 0 && selectedClassId && (
                <p className="text-xs text-amber-600 mt-1">Belum ada data siswa di kelas ini.</p>
              )}
            </div>

            {/* Step 3: Date Picker Tanggal Lahir */}
            <div>
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                <span>Tanggal Lahir</span>
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Hari */}
                <div className="relative">
                  <select
                    value={birthDay}
                    onChange={(e) => {
                      setBirthDay(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full px-2 min-h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all appearance-none cursor-pointer text-center"
                  >
                    <option value="" disabled>Hari</option>
                    {days.map(d => <option key={d} value={d.toString()}>{d}</option>)}
                  </select>
                </div>

                {/* Bulan */}
                <div className="relative">
                  <select
                    value={birthMonth}
                    onChange={(e) => {
                      setBirthMonth(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full px-2 min-h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all appearance-none cursor-pointer text-center"
                  >
                    <option value="" disabled>Bulan</option>
                    {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                  </select>
                </div>

                {/* Tahun */}
                <div className="relative">
                  <select
                    value={birthYear}
                    onChange={(e) => {
                      setBirthYear(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full px-2 min-h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all appearance-none cursor-pointer text-center"
                  >
                    <option value="" disabled>Tahun</option>
                    {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
                  </select>
                </div>
              </div>

            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Submit Button - Mobile Friendly 54px Touch Height */}
            <button
              type="submit"
              className="w-full min-h-[54px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 active-touch mt-6"
            >
              <span>Masuk</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>



        </div>

      </div>
    </div>
  );
};
