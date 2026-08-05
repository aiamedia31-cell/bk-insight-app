import React, { useState, useEffect } from 'react';
import { MasterData } from './MasterData';
import { IntegratedProfile } from './IntegratedProfile';
import { SociogramGraph } from '../../components/analytics/SociogramGraph';
import { AssessmentManager } from './AssessmentManager';
import { ClassAnalytics } from './ClassAnalytics';
import { DataService } from '../../services/dataService';
import { Users, Share2, Sparkles, Lock, BarChart3 } from 'lucide-react';

type Tab = 'kolektif' | 'profil' | 'master' | 'manajemen_asesmen' | 'sosiogram';

export const DashboardGuru: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('kolektif');
  const [selectedClassId, setSelectedClassId] = useState<string>('class_7a');
  const [profileStudentId, setProfileStudentId] = useState<string | undefined>(undefined);
  const [profileKelasId, setProfileKelasId] = useState<string | undefined>(undefined);

  const [classes, setClasses] = useState<any[]>([]);
  useEffect(() => {
    DataService.getClasses().then(setClasses);
  }, []);

  // Navigate to Profil tab with a specific student pre-selected
  // kelasId diteruskan agar IntegratedProfile bisa auto-set filter kelas
  const handleNavigateToProfile = (studentId: string, kelasId?: string) => {
    setProfileStudentId(studentId);
    setProfileKelasId(kelasId);
    setActiveTab('profil');
  };

  // Reset profileStudentId after IntegratedProfile has consumed it
  const handleProfileStudentConsumed = () => {
    setProfileStudentId(undefined);
    setProfileKelasId(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8 space-y-4 md:space-y-6">
      
      {/* Navigation Tabs */}
      <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto gap-1">
        {[
          { tab: 'kolektif' as Tab, icon: <BarChart3 className="w-4 h-4" />, label: 'Analitik Kelas' },
          { tab: 'profil' as Tab, icon: <Sparkles className="w-4 h-4 text-amber-300" />, label: 'Profil Individual' },
          { tab: 'master' as Tab, icon: <Users className="w-4 h-4" />, label: 'Master Data' },
          { tab: 'manajemen_asesmen' as Tab, icon: <Lock className="w-4 h-4" />, label: 'Manajemen Asesmen' },
          { tab: 'sosiogram' as Tab, icon: <Share2 className="w-4 h-4" />, label: 'Sosiogram' },
        ].map(({ tab, icon, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            title={label}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${
              activeTab === tab
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'kolektif' && (
        <ClassAnalytics onNavigateToProfile={handleNavigateToProfile} />
      )}
      {activeTab === 'profil' && (
        <IntegratedProfile
          initialStudentId={profileStudentId}
          initialKelasId={profileKelasId}
          onStudentIdConsumed={handleProfileStudentConsumed}
        />
      )}
      {activeTab === 'master' && <MasterData />}
      {activeTab === 'manajemen_asesmen' && <AssessmentManager />}
      {activeTab === 'sosiogram' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-700">Pilih Kelas Sosiogram:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Kelas {c.nama}</option>
              ))}
            </select>
          </div>
          <SociogramGraph kelasId={selectedClassId} />
        </div>
      )}

    </div>
  );
};
