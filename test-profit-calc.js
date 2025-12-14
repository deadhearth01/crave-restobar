// Test script to validate Excel parsing and profit calculations locally
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Sample inventory with 40-50% profit margin (cost = selling price * 0.5-0.6)
const sampleInventory = {
    'Chilli Chicken': { costPrice: 175, margin: 0.5 },
    'Chicken Lollipop': { costPrice: 200, margin: 0.5 },
    'Budweiser Magnum': { costPrice: 350, margin: 0.44 },
    'Honey Chilli Potato': { costPrice: 140, margin: 0.5 },
    'Paneer Tikka': { costPrice: 160, margin: 0.5 },
    'Veg Spring Roll': { costPrice: 120, margin: 0.5 },
    'Chicken Wings': { costPrice: 180, margin: 0.5 },
    'Fish Finger': { costPrice: 190, margin: 0.5 },
    'Prawns Fry': { costPrice: 220, margin: 0.6 },
    'Tandoori Chicken': { costPrice: 165, margin: 0.5 },
};

function parseExcelFile(filePath) {
    console.log('\\n📁 Reading Excel file:', filePath);

    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    // Extract date
    let extractedDate = new Date().toISOString().split('T')[0];
    let dateRange = '';

    if (jsonData[1] && jsonData[1][0]) {
        const headerText = String(jsonData[1][0]);
        const match = headerText.match(/(\\d{2}-\\d{2}-\\d{4})\\s+to\\s+(\\d{2}-\\d{2}-\\d{4})/);
        if (match) {
            dateRange = `${match[1]} to ${match[2]}`;
            const dateParts = match[2].split('-');
            extractedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            console.log('📅 Date Range:', dateRange);
            console.log('📅 Extracted Date:', extractedDate);
        }
    }

    const items = [];
    let currentCategory = '';
    let totalTax = 0;
    let grossRevenue = 0;

    console.log('\n📊 Parsing items:');
    console.log('─'.repeat(100));

    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];

        // Skip empty rows
        if (!row || row.length === 0) continue;

        const firstCell = row[0];

        // Skip summary rows (Max/Min/Avg/Total)
        if (firstCell && ['Max', 'Min', 'Avg', 'Total'].includes(String(firstCell).trim())) continue;

        // Detect category rows (non-null string in col 0, typically section headers)
        if (firstCell && typeof firstCell === 'string' && !row[2]) {
            currentCategory = String(firstCell).trim();
            if (!currentCategory.includes('Sub Total') && !currentCategory.includes('Round off')) {
                console.log(`\n📂 Category: ${currentCategory}`);
            }
            continue;
        }

        // Parse item rows: null/undefined in col 0, item name in col 1, quantity in col 2
        if ((firstCell === null || firstCell === undefined) && row[1] && typeof row[2] === 'number') {
            const itemName = String(row[1]).trim();
            const quantity = Number(row[2]) || 0;
            const netAmount = Number(row[5]) || 0;  // Net Amount column
            const tax = Number(row[6]) || 0;        // Tax column

            // Get cost from inventory
            const inventoryItem = sampleInventory[itemName];
            const costPrice = inventoryItem ? inventoryItem.costPrice : 0;
            const totalCost = costPrice * quantity;

            // Calculate item profit: Net Amount - (Cost Price × Quantity)
            const itemProfit = netAmount - totalCost;
            const margin = netAmount > 0 ? ((itemProfit / netAmount) * 100) : 0;

            grossRevenue += netAmount;
            totalTax += tax;

            items.push({
                itemName,
                category: currentCategory,
                quantity,
                netAmount,
                tax,
                costPrice,
                totalCost,
                profit: itemProfit,  // Individual item profit
                margin
            });

            const profitColor = itemProfit > 0 ? '💰' : '⚠️';
            console.log(`  ${profitColor} ${itemName.padEnd(35)} | Qty: ${String(quantity).padStart(3)} | Net: ₹${String(netAmount.toFixed(2)).padStart(8)} | Cost: ₹${String(costPrice).padStart(4)} × ${quantity} = ₹${String(totalCost).padStart(6)} | Profit: ₹${String(itemProfit.toFixed(2)).padStart(8)} | Margin: ${margin.toFixed(1)}%`);
        }
    }

    // Calculate totals
    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalRevenue = items.reduce((sum, item) => sum + item.netAmount, 0);
    const grossProfit = totalRevenue - totalCost;

    // Subtract tax from profit
    const netProfit = grossProfit - totalTax;
    const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    console.log('\\n' + '='.repeat(100));
    console.log('📈 SUMMARY:');
    console.log('='.repeat(100));
    console.log(`Total Items Sold: ${items.reduce((sum, item) => sum + item.quantity, 0)}`);
    console.log(`Gross Revenue: ₹${totalRevenue.toFixed(2)}`);
    console.log(`Total Cost (COGS): ₹${totalCost.toFixed(2)}`);
    console.log(`Gross Profit (before tax): ₹${grossProfit.toFixed(2)}`);
    console.log(`Total Tax: ₹${totalTax.toFixed(2)}`);
    console.log(`Net Profit (after tax): ₹${netProfit.toFixed(2)}`);
    console.log(`Net Margin: ${netMargin.toFixed(2)}%`);
    console.log('='.repeat(100));

    return {
        date: extractedDate,
        dateRange,
        items,
        totalRevenue,
        totalCost,
        totalProfit: netProfit,  // Net profit after tax
        grossProfit,
        totalTax,
        totalOrders: items.reduce((sum, item) => sum + item.quantity, 0),
        grossRevenue: totalRevenue,
        netMargin
    };
}

// Test with the Excel file
const excelPath = path.join(__dirname, '../test-sample-sales.xlsx');

if (fs.existsSync(excelPath)) {
    try {
        const result = parseExcelFile(excelPath);

        console.log('\\n✅ Parsing completed successfully!');
        console.log('\\n💾 Export inventory items for pre-population:');
        console.log(JSON.stringify(Object.keys(sampleInventory).map(name => ({
            name,
            costPrice: sampleInventory[name].costPrice,
            category: 'Food'
        })), null, 2));

    } catch (error) {
        console.error('\\n❌ Error:', error.message);
        console.error(error.stack);
    }
} else {
    console.error('❌ Excel file not found:', excelPath);
    console.log('\\nPlease ensure test-sample-sales.xlsx exists in:', path.dirname(excelPath));
}
