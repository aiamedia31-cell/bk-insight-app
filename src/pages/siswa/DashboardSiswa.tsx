import React, { useMemo, useState, useEffect } from 'react';
import { StudentData, DataService, ActiveAssessment, StudentResponseRecord } from '../../services/dataService';
import { ClipboardList, CheckCircle2, Clock, PlayCircle, Shield, Users, Brain, Heart, AlertCircle, Award, Lock } from 'lucide-react';

interface DashboardSiswaProps {
  student: StudentData;
  onStartAssessment: (assessmentId: string, instrumentId: string) => void;
}

export const DashboardSiswa: React.FC<DashboardSiswaProps> = ({ student, onStartAssessment }) => {
  const [activeAssessments, setActiveAssessments] = useState<ActiveAssessment[]>([]);
  const [studentResponses, setStudentResponses] = useState<StudentResponseRecord[]>([]);

  useEffect(() => {
    DataService.getAssessments().then(setActiveAssessments);
    DataService.getStudentResponses(student.id).then(setStudentResponses);
  }, [student.id]);

  const completedAssessmentIds = useMemo(() => {
    return new Set(studentResponses.map(r => r.assessment_id));
  }, [studentResponses]);

  const getInstrumentIcon = (instrumentId: string) => {
    switch (instrumentId) {
      case 'akpd_7': return <ClipboardList className="w-6 h-6 text-emerald-600" />;
      case 'aum': return <AlertCircle className="w-6 h-6 text-amber-600" />;
      case 'bullying': return <Shield className="w-6 h-6 text-rose-600" />;
      case 'motivasi': return <Award className="w-6 h-6 text-teal-600" />;
      case 'self_esteem': return <Heart className="w-6 h-6 text-pink-600" />;
      case 'sosiometri': return <Users className="w-6 h-6 text-sky-600" />;
      case 'multiple_intelligence': return <Brain className="w-6 h-6 text-purple-600" />;
      default: return <ClipboardList className="w-6 h-6 text-emerald-600" />;
    }
  };

  const progressCount = completedAssessmentIds.size;
  const totalCount = activeAssessments.length;
  const progressPct = totalCount > 0 ? Math.round((progressCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Welcome Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 mb-3">
              <span>Selamat Datang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Halo, {student.nama}!
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Siswa Kelas <strong className="text-emerald-700">{student.kelas_nama}</strong> • Mari isi instrumen asesmen BK untuk pemetaan pengembangan dirimu.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:w-64 border border-slate-200 shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
              <span className="font-semibold">Progres Pengerjaan</span>
              <span className="font-bold text-emerald-700">{progressCount} / {totalCount} Selesai</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment List Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Asesmen BK Aktif</h2>
            <p className="text-slate-500 text-xs mt-0.5">Pilih instrumen yang tersedia di bawah ini untuk dikerjakan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAssessments.map((asm) => {
            const isCompleted = completedAssessmentIds.has(asm.id);
            const isLocked = !asm.assigned_classes.includes(student.kelas_id);

            return (
              <div
                key={asm.id}
                className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between border border-slate-200 relative"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                      {getInstrumentIcon(asm.instrument_id)}
                    </div>
                    {isLocked ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Terkunci</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Belum Diisi</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-2">{asm.instrument_nama}</h3>
                  <p className="text-slate-700 text-xs leading-relaxed mb-4 font-medium">
                    {isLocked ? 'Menunggu akses (assign) dari Guru BK untuk dapat dikerjakan.' : 'Asesmen ini terbuka dan siap untuk dikerjakan.'}
                  </p>
                </div>

                <button
                  onClick={() => !isLocked && onStartAssessment(asm.id, asm.instrument_id)}
                  disabled={isLocked}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    isLocked
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  <span>{isLocked ? 'Terkunci' : isCompleted ? 'Lihat / Edit Jawaban' : 'Mulai Kerjakan'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
