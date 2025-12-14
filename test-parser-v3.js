/**
 * Test Excel Parser v3 with actual file
 */

const XLSX = require('xlsx');
const path = require('path');

// Inventory database (same as parser)
const INVENTORY = {
    'Non Veg Sweet Corn Soup': { cost: 100 },
    'Crispy Corn': { cost: 124 },
    'Mushroom Salt And Pepper': { cost: 149 },
    'Chilli Chicken': { cost: 175 },
    'Chilli Prawns': { cost: 224 },
    'Dragon Chicken': { cost: 174 },
    'Chilli Egg': { cost: 124 },
    'Chicken Lollipop': { cost: 200 },
    'Chicken Drum Sticks': { cost: 199 },
    'Appolo Fish': { cost: 149 },
    'Pepper Chicken': { cost: 199 },
    'Chilli Loose Prawn': { cost: 224 },
    'Chicken Roast': { cost: 174 },
    'Chicken 65': { cost: 174 },
    'Salt French Fries': { cost: 124 },
    'Kaju Fry': { cost: 149 },
    'Crunchi Chicken': { cost: 199 },
    'Veg Fried Rice': { cost: 149 },
    'Egg Fried Rice': { cost: 149 },
    'Konaseema Boneless Biriyani': { cost: 199 },
    'Green Salda': { cost: 124 },
    'butter garlice prwans': { cost: 224 },
    'kaju chicken': { cost: 199 },
    'mixed non veg fried rice': { cost: 249 },
    'Coke': { cost: 48 },
    'Screwdriver': { cost: 399 },
    'Kf Strong': { cost: 249 },
    'Kf Ultra': { cost: 274 },
    'Cranberry (premium)': { cost: 158 },
    'Blue Lagoon': { cost: 124 },
    'Orange Mojito': { cost: 124 },
    'Mango Mojito': { cost: 124 },
    'Pineapple Mojito': { cost: 124 },
    'Mint & Mango': { cost: 124 },
    'Fresh Lemon Soda': { cost: 60 },
    'Absolut (30 Ml)': { cost: 174 },
    'Jocobs Greek (150 Ml)': { cost: 649 },
    'Black Dog (30 Ml)': { cost: 174 },
    'MC 1 QUTR': { cost: 150 },
    'Heineken Tin': { cost: 224 },
    'Virgin Mojito': { cost: 124 },
    'M.m Green 30ml': { cost: 99 },
    'Water Bottle': { cost: 30 },
    'Thumsup': { cost: 60 },
    'Sprit': { cost: 60 },
    'Red Bull': { cost: 124 },
    'Budweiser': { cost: 324 },
    'Budweiser Magnum': { cost: 350 },
    'Budweiser 500ml': { cost: 249 },
    'spl non veg fried rice': { cost: 199 },
    'spl veg fried rice': { cost: 174 },
};

function getCostPrice(itemName) {
    const name = itemName.trim();
    if (INVENTORY[name]) return INVENTORY[name].cost;
    
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(INVENTORY)) {
        if (key.toLowerCase() === lowerName) return value.cost;
    }
    return 0;
}

function isSkipRow(col0) {
    // Skip summary rows and header rows
    const skipExact = ['Max', 'Min', 'Avg', 'Total', 'Sub Total', 'Round off', 'Group'];
    if (skipExact.includes(col0)) return true;
    
    // Skip hotel name and date range header rows
    if (col0.toLowerCase().includes('hotel')) return true;
    if (col0.includes('Group Report')) return true;
    
    return false;
}

function isCategoryRow(row) {
    const col0 = row[0];
    const col1 = row[1];
    return (
        col0 !== null && col0 !== undefined && 
        typeof col0 === 'string' && col0.trim() !== '' &&
        (col1 === null || col1 === undefined || col1 === '')
    );
}

function isItemRow(row) {
    const col0 = row[0];
    const col1 = row[1];
    const col2 = row[2];
    return (
        (col0 === null || col0 === undefined) &&
        col1 !== null && col1 !== undefined && 
        typeof col1 === 'string' && col1.trim() !== '' &&
        typeof col2 === 'number' && col2 > 0
    );
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║         📊 EXCEL PARSER V3 - LOCAL FILE TEST            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Read the actual Excel file
const filePath = path.join(__dirname, 'Group Summary Oct 18 2025.xlsx');
console.log('📁 File:', filePath);

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('📋 Total rows:', rows.length);
console.log('');

// Extract metadata
const restaurantName = rows[0]?.[0] || 'Unknown';
const dateRangeMatch = (rows[1]?.[0] || '').match(/(\d{2})-(\d{2})-(\d{4})\s+to\s+(\d{2})-(\d{2})-(\d{4})/);
const dateRange = dateRangeMatch ? `${dateRangeMatch[1]}-${dateRangeMatch[2]}-${dateRangeMatch[3]} to ${dateRangeMatch[4]}-${dateRangeMatch[5]}-${dateRangeMatch[6]}` : '';

console.log('🏪 Restaurant:', restaurantName);
console.log('📅 Date Range:', dateRange);
console.log('');

// Parse items
const items = [];
const categoryMap = new Map();
let currentCategory = 'Uncategorized';

console.log('🔄 PARSING ROWS:\n');

for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const col0 = String(row[0] || '').trim();

    // Skip summary rows
    if (isSkipRow(col0)) {
        continue;
    }

    // Check for category row
    if (isCategoryRow(row)) {
        currentCategory = col0;
        if (!categoryMap.has(currentCategory)) {
            categoryMap.set(currentCategory, []);
        }
        console.log(`  ✓ Category: "${currentCategory}"`);
        continue;
    }

    // Check for item row
    if (isItemRow(row)) {
        const itemName = String(row[1]).trim();
        const quantity = Number(row[2]) || 0;
        const myAmount = Number(row[3]) || 0;
        const discount = Number(row[4]) || 0;
        const netAmount = Number(row[5]) || 0;
        const tax = Number(row[6]) || 0;
        const totalSales = Number(row[7]) || 0;

        const costPrice = getCostPrice(itemName);
        const totalCost = costPrice * quantity;
        const profit = netAmount - totalCost;
        const margin = netAmount > 0 ? (profit / netAmount) * 100 : 0;

        items.push({
            itemName,
            category: currentCategory,
            quantity,
            netAmount,
            costPrice,
            totalCost,
            profit,
            margin: Math.round(margin * 10) / 10,
            tax
        });

        if (!categoryMap.has(currentCategory)) {
            categoryMap.set(currentCategory, []);
        }
        categoryMap.get(currentCategory).push(items[items.length - 1]);
    }
}

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                      PARSING RESULTS                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (items.length === 0) {
    console.log('❌ NO ITEMS PARSED!');
    process.exit(1);
}

console.log(`✅ Total items parsed: ${items.length}\n`);

// Category breakdown
console.log('📂 CATEGORY BREAKDOWN:\n');
for (const [catName, catItems] of categoryMap.entries()) {
    const catRevenue = catItems.reduce((s, i) => s + i.netAmount, 0);
    const catCost = catItems.reduce((s, i) => s + i.totalCost, 0);
    const catProfit = catRevenue - catCost;
    const catOrders = catItems.reduce((s, i) => s + i.quantity, 0);
    const catTax = catItems.reduce((s, i) => s + i.tax, 0);
    const catMargin = ((catProfit / catRevenue) * 100).toFixed(1);

    console.log(`  📦 ${catName}`);
    console.log(`     Items: ${catItems.length} | Orders: ${catOrders}`);
    console.log(`     Revenue: ₹${catRevenue.toLocaleString()}`);
    console.log(`     Cost: ₹${catCost.toLocaleString()}`);
    console.log(`     Profit: ₹${catProfit.toLocaleString()} (${catMargin}%)`);
    console.log(`     Tax: ₹${catTax.toFixed(2)}`);
    console.log('');
}

// Overall summary
const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
const totalRevenue = items.reduce((s, i) => s + i.netAmount, 0);
const totalCost = items.reduce((s, i) => s + i.totalCost, 0);
const grossProfit = totalRevenue - totalCost;
const totalTax = items.reduce((s, i) => s + i.tax, 0);
const netMargin = ((grossProfit / totalRevenue) * 100).toFixed(2);

console.log('📊 OVERALL SUMMARY:\n');
console.log(`   Restaurant: ${restaurantName}`);
console.log(`   Date Range: ${dateRange}`);
console.log(`   Total Items: ${items.length}`);
console.log(`   Total Orders: ${totalQuantity}`);
console.log(`   Total Revenue: ₹${totalRevenue.toLocaleString()}`);
console.log(`   Total Cost: ₹${totalCost.toLocaleString()}`);
console.log(`   Gross Profit: ₹${grossProfit.toLocaleString()}`);
console.log(`   Total Tax: ₹${totalTax.toFixed(2)}`);
console.log(`   Net Margin: ${netMargin}%`);
console.log('');

// Item details
console.log('📋 ITEM DETAILS (first 10):\n');
items.slice(0, 10).forEach((item, i) => {
    console.log(`   ${i+1}. ${item.itemName}`);
    console.log(`      Category: ${item.category} | Qty: ${item.quantity}`);
    console.log(`      Revenue: ₹${item.netAmount} | Cost: ₹${item.totalCost} | Profit: ₹${item.profit.toFixed(2)} (${item.margin}%)`);
});

console.log('');
console.log('🚀 PARSER V3 TEST: PASSED\n');
