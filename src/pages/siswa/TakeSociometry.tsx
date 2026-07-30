import React, { useState, useMemo } from 'react';
import { ArrowLeft, Users, UserPlus, Save, Sparkles } from 'lucide-react';
import { DataService, StudentData } from '../../services/dataService';

interface TakeSociometryProps {
  assessmentId: string;
  student: StudentData;
  onBack: () => void;
}

export const TakeSociometry: React.FC<TakeSociometryProps> = ({
  assessmentId,
  student,
  onBack,
}) => {
  const [classmates, setClassmates] = useState<StudentData[]>([]);
  React.useEffect(() => {
    DataService.getStudentsByClass(student.kelas_id).then(res => {
      setClassmates(res.filter(s => s.id !== student.id));
    });
  }, [student.kelas_id, student.id]);

  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleFriend = (friendId: string) => {
    setIsSaved(false);
    if (selectedFriendIds.includes(friendId)) {
      setSelectedFriendIds(prev => prev.filter(id => id !== friendId));
    } else {
      if (selectedFriendIds.length >= 3) return; // Max 3
      setSelectedFriendIds(prev => [...prev, friendId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.submitSociometricChoice(assessmentId, student.id, selectedFriendIds);
    setIsSaved(true);
    setTimeout(() => {
      onBack();
    }, 800);
  };

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-28 animate-slide-up">
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm text-xs font-bold active-touch"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="text-right">
          <span className="text-[11px] text-slate-500">Siswa: </span>
          <span className="text-xs font-extrabold text-emerald-700">{student.nama}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
            <Users className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">Asesmen Sosiometri Kelas</h1>
            <p className="text-slate-600 text-xs mt-1">
              Pilih <strong className="text-emerald-700">maksimal 3 teman kelas</strong> yang paling kamu inginkan sebagai teman belajar kelompok.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Friends Badge */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-slate-800">Teman Terpilih:</span>
          <span className="text-xs font-extrabold text-emerald-700">{selectedFriendIds.length} / 3 Orang</span>
        </div>
        {selectedFriendIds.length === 3 && (
          <span className="text-[10px] sm:text-xs text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Maksimal Tercapai
          </span>
        )}
      </div>

      {/* Classmate Selection Grid - Mobile Optimized */}
      <form onSubmit={handleSubmit} className="space-y-4 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classmates.map((mate) => {
            const isSelected = selectedFriendIds.includes(mate.id);
            const rank = selectedFriendIds.indexOf(mate.id) + 1;

            return (
              <div
                key={mate.id}
                onClick={() => handleToggleFriend(mate.id)}
                className={`min-h-[60px] p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between active-touch ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-500/15'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm ${
                    isSelected ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {mate.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs sm:text-sm text-slate-900">{mate.nama}</p>
                    <p className="text-[10px] text-slate-500">{mate.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold shadow-md">
                    #{rank}
                  </span>
                ) : (
                  <UserPlus className="w-5 h-5 text-slate-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-2xl z-40 flex items-center justify-between max-w-3xl mx-auto rounded-t-2xl sm:rounded-2xl sm:mb-4">
          <p className="text-[11px] sm:text-xs text-slate-600 font-bold">
            {selectedFriendIds.length} dari 3 teman terpilih
          </p>

          <button
            type="submit"
            disabled={selectedFriendIds.length === 0}
            className="min-h-[48px] py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 flex items-center space-x-2 active-touch"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Tersimpan!' : 'Simpan Sosiometri'}</span>
          </button>
        </div>
      </form>

    </div>
  );
};
