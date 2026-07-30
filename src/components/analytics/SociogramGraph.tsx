import React, { useState, useEffect } from 'react';
import { DataService } from '../../services/dataService';
import { calculateSociometry } from '../../services/engine/ruleEngine';
import { Users, Star, UserX, HeartHandshake } from 'lucide-react';

interface SociogramGraphProps {
  kelasId: string;
}

interface SosiogramNode {
  id: string;
  name: string;
  initial: string;
  kategori: string;
  cs: number;
  received: number;
  x: number;
  y: number;
}

interface SosiogramEdge {
  source: SosiogramNode;
  target: SosiogramNode;
  isMutual: boolean;
}

export const SociogramGraph: React.FC<SociogramGraphProps> = ({ kelasId }) => {
  const [nodes, setNodes] = useState<SosiogramNode[]>([]);
  const [edges, setEdges] = useState<SosiogramEdge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // 1. Bulk Fetch (Hanya 2 query)
      const studentList = await DataService.getStudentsByClass(kelasId);
      const allChoices = await DataService.getSociometricChoices();
      
      // 2. Map choices
      const mappedChoices = allChoices.map(c => ({
        studentId: c.student_id,
        chosenStudentId: c.chosen_student_id,
        peringkat: c.peringkat,
      }));

      // 3. Hitung status sociometri menggunakan Rule Engine
      const rawNodes = studentList.map(s => {
        const res = calculateSociometry(s.id, studentList.length, mappedChoices);
        
        // Buat inisial 2 huruf
        const nameParts = s.nama.split(' ');
        const initial = nameParts.length > 1 
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : s.nama.substring(0, 2).toUpperCase();

        return {
          id: s.id,
          name: s.nama,
          initial,
          kategori: res.kategori,
          cs: res.choiceStatusIndex,
          received: res.totalPilihanDiterima,
          x: 50,
          y: 50
        };
      });

      // 4. Kalkulasi Koordinat Lingkaran (Circular Layout)
      const pop = rawNodes.filter(n => n.kategori.includes('Popular'));
      const norm = rawNodes.filter(n => n.kategori.includes('Normal') || n.kategori.includes('Rejected'));
      const iso = rawNodes.filter(n => n.kategori.includes('Isolated'));
      
      const placeInRing = (group: SosiogramNode[], radiusPct: number) => {
        group.forEach((node, idx) => {
          // Angle in radians. Start at -90deg (top)
          const angle = (idx / group.length) * 2 * Math.PI - (Math.PI / 2);
          // Jika hanya 1 orang di tengah, taruh persis di tengah
          if (radiusPct === 0) {
            node.x = 50;
            node.y = 50;
          } else {
            node.x = 50 + Math.cos(angle) * (radiusPct * 0.7); // scale X so it's not too wide
            node.y = 50 + Math.sin(angle) * radiusPct;
          }
        });
      };

      placeInRing(pop, pop.length > 1 ? 12 : 0);
      placeInRing(norm, 28);
      placeInRing(iso, 42); // Cincin terluar

      setNodes(rawNodes);

      // 5. Generate Edges
      const newEdges: SosiogramEdge[] = [];
      mappedChoices.forEach(c => {
        const source = rawNodes.find(n => n.id === c.studentId);
        const target = rawNodes.find(n => n.id === c.chosenStudentId);
        if (source && target) {
          // Check if mutual
          const isMutual = mappedChoices.some(mc => mc.studentId === target.id && mc.chosenStudentId === source.id);
          // Hindari duplikasi garis mutual agar tidak tumpang tindih berlebihan
          const edgeExists = newEdges.some(e => 
            (e.source.id === source.id && e.target.id === target.id) ||
            (e.source.id === target.id && e.target.id === source.id && isMutual)
          );
          
          if (!edgeExists) {
            newEdges.push({ source, target, isMutual });
          }
        }
      });
      setEdges(newEdges);

      setLoading(false);
    };
    
    loadData();
  }, [kelasId]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Menghitung matriks relasi sosiogram...</div>;

  const popularCount = nodes.filter(d => d.kategori.includes('Popular')).length;
  const isolatedCount = nodes.filter(d => d.kategori.includes('Isolated')).length;

  return (
    <div className="space-y-6">
      
      {/* Sociogram Overview Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Bintang Kelas (Popular)</p>
            <p className="text-lg font-bold text-slate-900">{popularCount} Siswa</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Terisolasi (Isolated)</p>
            <p className="text-lg font-bold text-slate-900">{isolatedCount} Siswa</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Responden Kelas</p>
            <p className="text-lg font-bold text-slate-900">{nodes.length} Siswa</p>
          </div>
        </div>
      </div>

      {/* Visual Sociogram Diagram */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Peta Relasi Jaringan Sosiogram Kelas (Real-Time)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:block">Formula Jacob L. Moreno: CS = Σp / (N-1)</span>
        </div>

        <div className="w-full h-[350px] sm:h-[500px] md:h-[600px] bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden">
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#64748b" />
              </marker>
              <marker id="arrowhead-mutual" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#059669" />
              </marker>
              <marker id="arrowhead-mutual-rev" markerWidth="6" markerHeight="6" refX="-16" refY="3" orient="auto">
                <polygon points="6 0, 0 3, 6 6" fill="#059669" />
              </marker>
            </defs>
            
            {edges.map((edge, idx) => {
              const isMutual = edge.isMutual;
              return (
                <line 
                  key={idx}
                  x1={`${edge.source.x}%`} 
                  y1={`${edge.source.y}%`} 
                  x2={`${edge.target.x}%`} 
                  y2={`${edge.target.y}%`} 
                  stroke={isMutual ? "#059669" : "#64748b"} 
                  strokeWidth={isMutual ? "2.5" : "1.5"} 
                  strokeDasharray={isMutual ? "none" : "4 2"}
                  markerEnd={isMutual ? "url(#arrowhead-mutual)" : "url(#arrowhead)"}
                  markerStart={isMutual ? "url(#arrowhead-mutual-rev)" : "none"}
                  opacity={isMutual ? "1" : "0.7"}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          <div className="relative w-full h-full">
            {nodes.map(node => {
              const isPop = node.kategori.includes('Popular');
              const isIso = node.kategori.includes('Isolated');
              
              const bgColor = isPop ? 'bg-amber-400' : isIso ? 'bg-rose-100' : 'bg-emerald-600';
              const textColor = isPop ? 'text-slate-900' : isIso ? 'text-rose-800' : 'text-white';
              const borderColor = isPop ? 'border-amber-200' : isIso ? 'border-rose-300' : 'border-emerald-400';
              
              return (
                <div 
                  key={node.id} 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center group z-10"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${bgColor} ${textColor} font-bold flex items-center justify-center border-2 ${borderColor} text-xs shadow-md transition-transform hover:scale-110 cursor-pointer`}
                    title={`${node.name}\nCS: ${node.cs}\nDiterima: ${node.received} Pilihan`}
                  >
                    {node.initial}
                  </div>
                  
                  {/* Tooltip Hover Overlay */}
                  <div className="absolute top-14 bg-slate-900 text-white text-[10px] sm:text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
                    <p className="font-bold">{node.name}</p>
                    <p className="text-slate-300">CS: {node.cs} | Pilihan: {node.received}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span className="font-semibold">Bintang Kelas (Popular)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
            <span className="font-semibold">Siswa Normal</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-200 border border-rose-500 inline-block"></span>
            <span className="font-semibold">Siswa Terisolasi</span>
          </div>
          <div className="flex items-center space-x-1.5 ml-4">
            <svg width="30" height="10"><line x1="0" y1="5" x2="30" y2="5" stroke="#059669" strokeWidth="2.5" markerEnd="url(#arrowhead-mutual)" markerStart="url(#arrowhead-mutual-rev)"/></svg>
            <span className="font-semibold">Saling Memilih (Mutual)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <svg width="30" height="10"><line x1="0" y1="5" x2="30" y2="5" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowhead)"/></svg>
            <span className="font-semibold">Pilihan Satu Arah</span>
          </div>
        </div>
      </div>

    </div>
  );
};
