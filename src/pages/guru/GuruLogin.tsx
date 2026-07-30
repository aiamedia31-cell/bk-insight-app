import React, { useState } from 'react';
import { School, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { DataService } from '../../services/dataService';

interface GuruLoginProps {
  onLoginSuccess: (email: string) => void;
}

export const GuruLogin: React.FC<GuruLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await DataService.loginGuru(email, password);
    setLoading(false);
    if (success) {
      onLoginSuccess(email);
    } else {
      setError('Email atau Password salah.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <img src="/logo.png" alt="BK Insight Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Guru BK</h1>
          <p className="text-slate-500 text-sm mt-1">
            Sistem Pendukung Keputusan Terpadu
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-100 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-bold">{error}</div>}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email / Username Guru BK
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Memeriksa...' : 'Masuk Portal Guru BK'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>


        </div>

      </div>
    </div>
  );
};
