import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Save, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataService, StudentData } from '../../services/dataService';

interface QuestionItem {
  id: number;
  pernyataan: string;
  bidang: string;
  pilihan: { label: string; value: number }[];
  inputType?: 'button' | 'dropdown';
}

interface TakeAssessmentProps {
  assessmentId: string;
  instrumentId: string;
  student: StudentData;
  onBack: () => void;
}



export const TakeAssessment: React.FC<TakeAssessmentProps> = ({
  assessmentId,
  instrumentId,
  student,
  onBack,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQ = async () => {
      const qs = await DataService.getQuestions(instrumentId);
      setQuestions(qs);
      setLoading(false);
    };
    loadQ();
  }, [instrumentId]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load existing response
  useEffect(() => {
    DataService.getStudentResponses(student.id).then((responses) => {
      const existing = responses.find(r => r.assessment_id === assessmentId);
      if (existing && existing.jawaban) {
        setAnswers(existing.jawaban);
      }
    });
  }, [assessmentId, student.id]);

  const handleOptionSelect = (qId: number, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setIsSaved(false);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPct = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-pulse font-bold text-emerald-600">Memuat instrumen...</div></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Instrumen tidak ditemukan atau belum ada soal.</h2>
        <button onClick={onBack} className="mt-4 text-emerald-600 font-bold underline">Kembali</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.submitResponse(assessmentId, student.id, instrumentId, answers);
    setIsSaved(true);
    setTimeout(() => {
      onBack();
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-28">
      
      {/* Top Header Navigation */}
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

      {/* Sticky Progress Bar Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 sticky top-16 z-30 shadow-md border border-emerald-100 animate-fade-in">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-800">Progres Pengisian</span>
          <span className="font-extrabold text-emerald-700">{answeredCount} / {totalQuestions} Terisi ({progressPct}%)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Questions List - Android Touch Optimized */}
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                isAnswered
                  ? 'border-emerald-400 shadow-sm shadow-emerald-500/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-2.5 mb-3">
                <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg font-extrabold text-xs shrink-0 ${
                  isAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{q.pernyataan}</p>
                  {q.bidang && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] text-emerald-800 font-bold border border-emerald-200">
                      {q.bidang}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Input Type Renderer */}
              {q.inputType === 'dropdown' ? (
                <div className="mt-2 relative">
                  <select
                    value={answers[q.id] !== undefined ? answers[q.id] : ''}
                    onChange={(e) => handleOptionSelect(q.id, Number(e.target.value))}
                    className={`w-full p-3.5 rounded-xl border appearance-none cursor-pointer text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isAnswered ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="" disabled>-- Pilih Jawaban --</option>
                    {q.pilihan.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {/* Custom Arrow Icon for select */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {q.pilihan.map((opt) => {
                    const isSelected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleOptionSelect(q.id, opt.value)}
                        className={`min-h-[48px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center space-x-1.5 active-touch ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 scale-[1.01]'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Floating Mobile Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-2xl z-40 flex items-center justify-between max-w-3xl mx-auto rounded-t-2xl sm:rounded-2xl sm:mb-4">
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            {answeredCount === totalQuestions ? '✓ Semua soal terisi' : `Sisa ${totalQuestions - answeredCount} soal lagi`}
          </p>

          <button
            type="submit"
            disabled={answeredCount < totalQuestions}
            className="min-h-[48px] py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 active-touch"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Tersimpan!' : 'Simpan & Selesaikan'}</span>
          </button>
        </div>
      </form>

    </div>
  );
};
