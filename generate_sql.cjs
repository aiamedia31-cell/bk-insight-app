const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'siswa', 'TakeAssessment.tsx'), 'utf-8');
const match = content.match(/const SAMPLE_QUESTIONS_BANK: Record<string, QuestionItem\[\]> = (\{[\s\S]*?\n\});/);

if (!match) {
  console.error('Could not find SAMPLE_QUESTIONS_BANK');
  process.exit(1);
}

// We need to evaluate the matched object string
// But it's typescript with type annotations, no wait, the object itself doesn't have type annotations inside it.
const objStr = match[1];

// Evaluate safely
const SAMPLE_QUESTIONS_BANK = eval('(' + objStr + ')');

let sql = `-- Add password column\n`;
sql += `ALTER TABLE public.users_guru ADD COLUMN IF NOT EXISTS password VARCHAR(100);\n\n`;
sql += `-- Add Guru\n`;
sql += `INSERT INTO public.users_guru (nama, email, role, password)\n`;
sql += `VALUES ('Admin BK', 'masukbk', 'guru_bk', 'masukbk')\n`;
sql += `ON CONFLICT (email) DO UPDATE SET password = 'masukbk';\n\n`;

sql += `-- Seed Instruments\n`;
sql += `INSERT INTO public.instruments (id, nama, deskripsi, kategori, total_soal) VALUES\n`;
sql += `('akpd_7', 'AKPD Kelas 7', 'Angket Kebutuhan Peserta Didik untuk Kelas 7', 'Kebutuhan', 40),\n`;
sql += `('aum', 'AUM Umum', 'Alat Ungkap Masalah Umum', 'Masalah', 40),\n`;
sql += `('bullying', 'Asesmen Bullying', 'Deteksi Risiko dan Peran Bullying', 'Sosial', 10),\n`;
sql += `('self_esteem', 'Self Esteem', 'Tingkat Harga Diri', 'Pribadi', 10),\n`;
sql += `('sosiometri', 'Sosiometri', 'Pemetaan Relasi Sosial Kelas', 'Sosial', 0)\n`;
sql += `ON CONFLICT (id) DO NOTHING;\n\n`;

sql += `-- Seed Questions\n`;
sql += `INSERT INTO public.questions (instrument_id, no_urut, pernyataan, bidang, pilihan_jawaban) VALUES\n`;

const values = [];
for (const instrumentId of Object.keys(SAMPLE_QUESTIONS_BANK)) {
  const questions = SAMPLE_QUESTIONS_BANK[instrumentId];
  for (const q of questions) {
    const pernyataan = q.pernyataan.replace(/'/g, "''");
    const bidang = q.bidang ? q.bidang.replace(/'/g, "''") : '';
    const pilihan = JSON.stringify(q.pilihan || []).replace(/'/g, "''");
    values.push(`('${instrumentId}', ${q.id}, '${pernyataan}', '${bidang}', '${pilihan}')`);
  }
}

sql += values.join(',\n') + ';\n';

fs.writeFileSync(path.join(__dirname, 'supabase', '02_seed_real_instruments.sql'), sql);
console.log('SQL Generated');
