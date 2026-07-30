import React, { useState, useEffect } from 'react';
import { MasterData } from './MasterData';
import { IntegratedProfile } from './IntegratedProfile';
import { SociogramGraph } from '../../components/analytics/SociogramGraph';
import { AssessmentManager } from './AssessmentManager';
import { ClassAnalytics } from './ClassAnalytics';
import { DataService } from '../../services/dataService';
import { Users, Share2, Sparkles, Lock, BarChart3 } from 'lucide-react';

export const DashboardGuru: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kolektif' | 'profil' | 'master' | 'manajemen_asesmen' | 'sosiogram'>('kolektif');
  const [selectedClassId, setSelectedClassId] = useState<string>('class_7a');

  const [classes, setClasses] = useState<any[]>([]);
  useEffect(() => {
    DataService.getClasses().then(setClasses);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('kolektif')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'kolektif'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analitik Kelas (Kolektif)</span>
        </button>

        <button
          onClick={() => setActiveTab('profil')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'profil'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Profil Individual (DSS)</span>
        </button>

        <button
          onClick={() => setActiveTab('master')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'master'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Master Data & Import Excel</span>
        </button>

        <button
          onClick={() => setActiveTab('manajemen_asesmen')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'manajemen_asesmen'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Manajemen Asesmen</span>
        </button>

        <button
          onClick={() => setActiveTab('sosiogram')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'sosiogram'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Visualisasi Sosiogram</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'kolektif' && <ClassAnalytics />}
      {activeTab === 'profil' && <IntegratedProfile />}
      {activeTab === 'master' && <MasterData />}
      {activeTab === 'manajemen_asesmen' && <AssessmentManager />}
      {activeTab === 'sosiogram' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
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

