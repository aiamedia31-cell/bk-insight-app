import * as XLSX from 'xlsx';

export interface StudentImportRecord {
  nama: string;
  kelas: string;
  tanggal_lahir: string; // Format YYYY-MM-DD
  gender?: 'L' | 'P';
}

export function parseStudentExcel(file: File): Promise<StudentImportRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const records: StudentImportRecord[] = jsonRows.map((row) => {
          // Normalisasi header kolom
          const namaKey = Object.keys(row).find(k => /nama|student|siswa/i.test(k)) || 'nama';
          const kelasKey = Object.keys(row).find(k => /kelas|class|rombel/i.test(k)) || 'kelas';
          const tglKey = Object.keys(row).find(k => /tgl|tanggal|birth|dob|lahir/i.test(k)) || 'tanggal_lahir';
          const genderKey = Object.keys(row).find(k => /gender|jk|kelamin|jenis|sex/i.test(k)) || 'jenis_kelamin';

          let rawDate = row[tglKey];
          let formattedDate = '2010-01-01'; // Fallback default

          if (rawDate instanceof Date) {
            formattedDate = rawDate.toISOString().split('T')[0];
          } else if (typeof rawDate === 'string') {
            const cleanDate = rawDate.trim();
            // Coba parse format teks Indonesia (contoh: "Tanah Bumbu, 09 Februari 2014")
            const indoDateMatch = cleanDate.match(/(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+(\d{4})/i);
            
            if (indoDateMatch) {
              const day = indoDateMatch[1].padStart(2, '0');
              const monthStr = indoDateMatch[2].toLowerCase();
              const year = indoDateMatch[3];
              
              const monthMap: Record<string, string> = {
                'januari': '01', 'jan': '01',
                'februari': '02', 'feb': '02',
                'maret': '03', 'mar': '03',
                'april': '04', 'apr': '04',
                'mei': '05',
                'juni': '06', 'jun': '06',
                'juli': '07', 'jul': '07',
                'agustus': '08', 'agu': '08',
                'september': '09', 'sep': '09',
                'oktober': '10', 'okt': '10',
                'november': '11', 'nov': '11',
                'desember': '12', 'des': '12'
              };
              
              const month = monthMap[monthStr] || '01';
              formattedDate = `${year}-${month}-${day}`;
            } else {
              // Coba parse string DD/MM/YYYY atau YYYY-MM-DD
              const parts = cleanDate.split(/[-/.]/);
              if (parts.length === 3) {
                if (parts[0].length === 4) {
                  formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                } else if (parts[2].length === 4) {
                  formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
              }
            }
          }

          let gender: 'L' | 'P' = 'L';
          const rawGender = String(row[genderKey] || '').toUpperCase().trim();
          if (rawGender.startsWith('P') || rawGender.includes('PEREMPUAN') || rawGender.includes('WANITA') || rawGender === 'FEMALE') {
            gender = 'P';
          }

          return {
            nama: String(row[namaKey] || 'Siswa Tanpa Nama').trim(),
            kelas: String(row[kelasKey] || 'VII A').trim(),
            tanggal_lahir: formattedDate,
            gender,
          };
        });

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
