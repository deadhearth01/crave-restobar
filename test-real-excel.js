const XLSX = require('xlsx');
const fs = require('fs');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║       📊 TESTING REAL EXCEL FILE STRUCTURE               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Read the actual Excel file
const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node test-real-excel.js <path-to-excel-file>');
    process.exit(1);
}

console.log('📁 Reading file:', filePath);

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
console.log('📋 Sheet name:', sheetName);

const sheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n📊 Total rows:', jsonData.length);
console.log('\n🔍 First 15 rows:\n');

for (let i = 0; i < Math.min(15, jsonData.length); i++) {
    const row = jsonData[i];
    console.log(`Row ${i}:`, JSON.stringify(row));
}

console.log('\n🔍 Analyzing structure...\n');

// Analyze row types
for (let i = 0; i < Math.min(30, jsonData.length); i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;
    
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    const thirdCell = row[2];
    
    let rowType = 'UNKNOWN';
    
    if (firstCell.includes('Group') || firstCell.includes('Date')) {
        rowType = 'HEADER';
    } else if (firstCell === 'Sl.No' || secondCell === 'Item') {
        rowType = 'COLUMN_HEADER';
    } else if (firstCell.includes('Menu') || firstCell === 'Others') {
        rowType = 'CATEGORY';
    } else if (firstCell === 'Max' || firstCell === 'Min' || firstCell === 'Avg' || firstCell === 'Total') {
        rowType = 'SUMMARY';
    } else if (firstCell === 'Round off' || firstCell === 'Sub Total') {
        rowType = 'SUMMARY';
    } else if (typeof thirdCell === 'number' && thirdCell > 0) {
        rowType = 'DATA_ROW';
    }
    
    console.log(`Row ${i} [${rowType}]: ${firstCell} | ${secondCell} | ${thirdCell}`);
}

console.log('\n✅ Analysis complete\n');
