import React, { useState, useEffect } from 'react';
import { DataService, ActiveAssessment, ClassData } from '../../services/dataService';
import { Lock, Unlock, ClipboardList } from 'lucide-react';

export const AssessmentManager: React.FC = () => {
  const [assessments, setAssessments] = useState<ActiveAssessment[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);

  const loadData = async () => {
    setAssessments(await DataService.getAssessments());
    setClasses(await DataService.getClasses());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (asmId: string, kelasId: string) => {
    await DataService.toggleAssessmentAssignment(asmId, kelasId);
    loadData(); // Refresh state
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Manajemen Kunci Asesmen</h2>
        <p className="text-xs text-slate-500 mt-1">
          Buka akses asesmen untuk kelas tertentu. Siswa tidak akan bisa mengerjakan jika gembok masih tertutup.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 px-4 text-xs font-bold text-slate-500">Nama Asesmen</th>
              {classes.map(c => (
                <th key={c.id} className="py-3 px-4 text-xs font-bold text-slate-500 text-center">Kelas {c.nama}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assessments.map(asm => (
              <tr key={asm.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">{asm.instrument_nama}</div>
                      <div className="text-[10px] text-slate-400 font-medium">ID: {asm.instrument_id}</div>
                    </div>
                  </div>
                </td>
                {classes.map(c => {
                  const isAssigned = asm.assigned_classes.includes(c.id);
                  return (
                    <td key={c.id} className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggle(asm.id, c.id)}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                          isAssigned
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={isAssigned ? 'Tutup Akses' : 'Buka Akses'}
                      >
                        {isAssigned ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
