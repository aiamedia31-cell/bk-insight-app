import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { SiswaLogin } from './pages/siswa/SiswaLogin';
import { DashboardSiswa } from './pages/siswa/DashboardSiswa';
import { TakeAssessment } from './pages/siswa/TakeAssessment';
import { TakeSociometry } from './pages/siswa/TakeSociometry';
import { GuruLogin } from './pages/guru/GuruLogin';
import { DashboardGuru } from './pages/guru/DashboardGuru';
import { StudentData } from './services/dataService';

export function App() {
  const [currentRole, setCurrentRole] = useState<'siswa' | 'guru'>(() => {
    return (localStorage.getItem('bk_currentRole') as 'siswa' | 'guru') || 'siswa';
  });
  
  const [activeStudent, setActiveStudent] = useState<StudentData | null>(() => {
    const saved = localStorage.getItem('bk_activeStudent');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeGuruEmail, setActiveGuruEmail] = useState<string | null>(() => {
    return localStorage.getItem('bk_activeGuruEmail') || null;
  });

  // Active Assessment State for Siswa
  const [currentAssessment, setCurrentAssessment] = useState<{ id: string; instrumentId: string } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bk_currentRole', currentRole);
  }, [currentRole]);

  useEffect(() => {
    if (activeStudent) localStorage.setItem('bk_activeStudent', JSON.stringify(activeStudent));
    else localStorage.removeItem('bk_activeStudent');
  }, [activeStudent]);

  useEffect(() => {
    if (activeGuruEmail) localStorage.setItem('bk_activeGuruEmail', activeGuruEmail);
    else localStorage.removeItem('bk_activeGuruEmail');
  }, [activeGuruEmail]);

  const handleLogout = () => {
    setActiveStudent(null);
    setActiveGuruEmail(null);
    setCurrentAssessment(null);
    localStorage.removeItem('bk_activeStudent');
    localStorage.removeItem('bk_activeGuruEmail');
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans">
      
      {/* 🌟 Premium Background Pattern & Mesh Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Grid Pattern (Enterprise/Big Company Style) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Ambient Mesh Glow - Top Right */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-400/15 blur-[100px]"></div>
        
        {/* Ambient Mesh Glow - Bottom Left */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-[120px]"></div>
      </div>
      
      {/* Top Navbar */}
      <div className="relative z-50">
        <Navbar
          currentRole={currentRole}
          activeStudent={activeStudent}
          activeGuruEmail={activeGuruEmail}
          onSelectRole={(role) => {
            setCurrentRole(role);
            setCurrentAssessment(null);
          }}
          onLogout={handleLogout}
        />
      </div>

      {/* Main View Area */}
      <main className="flex-1 relative z-10">
        {currentRole === 'siswa' ? (
          !activeStudent ? (
            <SiswaLogin onLoginSuccess={(student) => setActiveStudent(student)} />
          ) : currentAssessment ? (
            currentAssessment.instrumentId === 'sosiometri' ? (
              <TakeSociometry
                assessmentId={currentAssessment.id}
                student={activeStudent}
                onBack={() => setCurrentAssessment(null)}
              />
            ) : (
              <TakeAssessment
                assessmentId={currentAssessment.id}
                instrumentId={currentAssessment.instrumentId}
                student={activeStudent}
                onBack={() => setCurrentAssessment(null)}
              />
            )
          ) : (
            <DashboardSiswa
              student={activeStudent}
              onStartAssessment={(asmId, instId) => setCurrentAssessment({ id: asmId, instrumentId: instId })}
            />
          )
        ) : !activeGuruEmail ? (
          <GuruLogin onLoginSuccess={(email) => setActiveGuruEmail(email)} />
        ) : (
          <DashboardGuru />
        )}
      </main>

    </div>
  );
}

export default App;
