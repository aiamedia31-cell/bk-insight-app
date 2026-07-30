// =======================================================
// BK INSIGHT MVP - PDF & EXCEL REPORT GENERATOR
// =======================================================
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DataService } from './dataService';

export async function exportIntegratedProfilePDF(studentId: string) {
  const data = await DataService.getIntegratedStudentProfile(studentId);
  if (!data) return;

  const doc = new jsPDF();
  const { student, dss, akpd, sosiometri } = data;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('LAPORAN PROFIL BK TERPADU & RECOMMENDATION DSS', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('SMP BK Insight - Sistem Asesmen & Decision Support System', 14, 26);
  doc.line(14, 30, 196, 30);

  // Student Identity Box
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('INFORMASI SISWA', 14, 38);

  const studentInfo = [
    ['Nama Siswa', student.nama, 'Kelas', student.kelas_nama],
    ['Tanggal Lahir', student.tanggal_lahir, 'Jenis Kelamin', student.gender === 'L' ? 'Laki-laki' : 'Perempuan'],
    ['Status', 'Aktif', 'Tingkat Risiko', dss.tingkatRisikoGlobal],
  ];

  autoTable(doc, {
    startY: 42,
    body: studentInfo,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  // Section 2: Ringkasan Diagnostik DSS
  const currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('RINGKASAN DIAGNOSTIK & REKOMENDASI DSS', 14, currentY);

  const dssSummary = [
    ['Status Evaluasi', dss.ringkasanStatus],
    ['Prioritas Masalah', dss.prioritasMasalah.join('\n') || '-'],
    ['Faktor Risiko', dss.faktorRisiko.join('\n') || '-'],
    ['Faktor Pendukung', dss.faktorPendukung.join('\n') || '-'],
  ];

  autoTable(doc, {
    startY: currentY + 4,
    body: dssSummary,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 4 },
  });

  // Section 3: Rekomendasi Layanan BK
  const serviceY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('REKOMENDASI INTERVENSI LAYANAN BK', 14, serviceY);

  const serviceTableData = dss.layananRekomendasi.map((r: any) => [
    r.jenisLayanan,
    r.prioritas,
    r.topikLayanan,
    r.tujuanLayanan,
  ]);

  autoTable(doc, {
    startY: serviceY + 4,
    head: [['Jenis Layanan', 'Prioritas', 'Topik Bimbingan', 'Tujuan']],
    body: serviceTableData,
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  doc.save(`Profil_BK_${student.nama.replace(/\s+/g, '_')}.pdf`);
}

export async function exportClassSummaryExcel(kelasId: string) {
  const students = await DataService.getStudentsByClass(kelasId);
  
  const rows = [];
  for (const s of students) {
    const profile = await DataService.getIntegratedStudentProfile(s.id);
    rows.push({
      'Nama Siswa': s.nama,
      'Kelas': s.kelas_nama,
      'Tanggal Lahir': s.tanggal_lahir,
      'Gender': s.gender,
      'AKPD Kebutuhan Utama': profile?.akpd?.prioritasUtama || 'Belum Mengisi',
      'Tingkat Self Esteem': profile?.selfEsteem?.tingkat || 'Belum Mengisi',
      'Sosiometri Status': profile?.sosiometri?.kategori || 'Belum Mengisi',
      'Bullying Peran': profile?.bullying?.peran || 'Aman',
      'Risiko Global DSS': profile?.dss?.tingkatRisikoGlobal || 'Rendah',
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Kelas');

  XLSX.writeFile(workbook, `Rekap_Asesmen_BK_Kelas_${kelasId}.xlsx`);
}
