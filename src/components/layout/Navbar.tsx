import React from 'react';
import { ShieldCheck, UserCheck, School, LogOut, BookOpen, Sparkles } from 'lucide-react';
import { StudentData } from '../../services/dataService';

interface NavbarProps {
  currentRole: 'siswa' | 'guru' | 'guest';
  activeStudent: StudentData | null;
  activeGuruEmail: string | null;
  onSelectRole: (role: 'siswa' | 'guru') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeStudent,
  activeGuruEmail,
  onSelectRole,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer active-touch" onClick={() => onSelectRole('siswa')}>
          <img src="/logo.png" alt="BK Insight Logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-lg shrink-0" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                BK <span className="text-emerald-600">Insight</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation & Active Session Status */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Active User Status Badge */}
          {currentRole === 'siswa' && activeStudent && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] sm:text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="truncate max-w-[120px] sm:max-w-none">
                <span className="font-semibold text-slate-900">{activeStudent.nama}</span>
                <span className="text-emerald-700 font-bold ml-1">({activeStudent.kelas_nama})</span>
              </div>
            </div>
          )}

          {currentRole === 'guru' && activeGuruEmail && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] sm:text-xs">
              <School className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-emerald-800 font-bold">Guru BK</span>
              </div>
            </div>
          )}

          {/* Role Switcher Buttons (Hanya jika belum login) */}
          {!activeStudent && !activeGuruEmail && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onSelectRole('siswa')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center space-x-1 transition-all active-touch ${
                  currentRole === 'siswa'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Siswa</span>
              </button>
              <button
                onClick={() => onSelectRole('guru')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center space-x-1 transition-all active-touch ${
                  currentRole === 'guru'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                <span>Guru BK</span>
              </button>
            </div>
          )}

          {/* Logout button */}
          {(activeStudent || activeGuruEmail) && (
            <button
              onClick={onLogout}
              title="Keluar"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active-touch"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
