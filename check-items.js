const XLSX = require('xlsx');
const workbook = XLSX.readFile('Group Summary Oct 18 2025.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Extract all item names from the Excel
const items = [];
for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    // Item rows have null in col 0, item name in col 1
    if ((row[0] === null || row[0] === undefined) && row[1] && typeof row[2] === 'number' && row[2] > 0) {
        items.push(row[1]);
    }
}

console.log('Items in Excel (' + items.length + '):');
items.forEach((item, i) => console.log((i+1) + '. ' + item));
