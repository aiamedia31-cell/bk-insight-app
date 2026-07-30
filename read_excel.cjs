const xlsx = require('xlsx');
try {
  const workbook = xlsx.readFile('SISWA BARU.xlsx');
  console.log('Sheets found:', workbook.SheetNames);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log('\nPreview Data (Top 5 rows):');
  console.log(JSON.stringify(data.slice(0, 5), null, 2));
  console.log('\nTotal rows:', data.length);
} catch (e) {
  console.error('Error reading excel:', e);
}
