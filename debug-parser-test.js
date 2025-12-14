/**
 * Debug test to verify parser with enhanced logging
 */

// Mock XLSX for testing
const mockXLSX = {
    read: (data, options) => ({
        SheetNames: ['Sheet1'],
        Sheets: {
            'Sheet1': mockData
        }
    }),
    utils: {
        sheet_to_json: (sheet, options) => {
            // Return test data in array format
            return [
                ['Group Report', '', '', '', '', '', '', ''],
                ['Date Range: 17-10-2025 to 18-10-2025', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['Dine In Food Menu', '', '', '', '', '', '', ''],
                ['Sl.No', 'Item', 'Qty.', 'My Amount', 'Discount', 'Net Amount', 'Tax', 'Total Sales'],
                [1, 'Chilli Chicken', 3, 1100, 53, 1047, 52.38, 1099.38],
                [2, 'Crispy Corn', 4, 1040, 44, 996, 49.84, 1045.84],
                [3, 'Chicken Lollipop', 2, 840, 42, 798, 39.92, 837.92],
                ['Max', '3', '840', '53', '', '', '52.38', '1099.38'],
                ['Min', '1', '1040', '42', '', '', '39.92', '837.92'],
                ['Avg', '2', '993.33', '46.33', '', '', '47.38', '994.71'],
                ['Total', '', '9', '2980', '139', '2841', '142.14', '2983.14'],
                ['Round off', '', '', '', '', '-4.16', '', ''],
                ['Sub Total', '', '', '', '', '2841', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['Bar Menu', '', '', '', '', '', '', ''],
                ['Sl.No', 'Item', 'Qty.', 'My Amount', 'Discount', 'Net Amount', 'Tax', 'Total Sales'],
                [1, 'Blue Lagoon', 4, 1040, 44, 996, 49.8, 1045.8],
                [2, 'Kf Strong', 16, 8392, 408, 7984, 0, 7984],
                [3, 'Budweiser Magnum', 9, 6615, 324, 6291, 0, 6291],
                ['Max', '16', '8392', '408', '', '', '49.8', '7984'],
                ['Min', '4', '6615', '44', '', '', '0', '1045.8'],
                ['Avg', '9.67', '5349', '258.67', '', '', '16.6', '5106.93'],
                ['Total', '', '29', '16047', '776', '15271', '49.8', '15320.8'],
                ['Round off', '', '', '', '', '0', '', ''],
                ['Sub Total', '', '', '', '', '15271', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['Others', '', '', '', '', '', '', ''],
                ['Sl.No', 'Item', 'Qty.', 'My Amount', 'Discount', 'Net Amount', 'Tax', 'Total Sales'],
                [1, 'spl veg fried rice', 1, 366, 17, 349, 17.46, 366.46],
                ['Max', '1', '366', '17', '', '', '17.46', '366.46'],
                ['Min', '1', '366', '17', '', '', '17.46', '366.46'],
                ['Avg', '1', '366', '17', '', '', '17.46', '366.46'],
                ['Total', '', '1', '366', '17', '349', '17.46', '366.46'],
                ['Round off', '', '', '', '', '0', '', ''],
                ['Sub Total', '', '', '', '', '349', '', ''],
            ]
        }
    }
}

const mockData = {}

console.log('\n╔════════════════════════════════════════════════════════════╗')
console.log('║          📊 PARSER DEBUG TEST - SIMULATED EXCEL         ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

// Inventory lookup
const DEFAULT_INVENTORY = {
    'Chilli Chicken': { cost: 175, category: 'Dine In Food Menu' },
    'Crispy Corn': { cost: 124, category: 'Dine In Food Menu' },
    'Chicken Lollipop': { cost: 200, category: 'Dine In Food Menu' },
    'Blue Lagoon': { cost: 124, category: 'Bar Menu' },
    'Kf Strong': { cost: 249, category: 'Bar Menu' },
    'Budweiser Magnum': { cost: 350, category: 'Bar Menu' },
    'spl veg fried rice': { cost: 174, category: 'Others' },
}

function getCostPrice(itemName) {
    const trimmedName = itemName.trim()
    
    // Exact match first
    const item = DEFAULT_INVENTORY[trimmedName]
    if (item) return item.cost
    
    // Case-insensitive match
    for (const [key, value] of Object.entries(DEFAULT_INVENTORY)) {
        if (key.toLowerCase() === trimmedName.toLowerCase()) {
            return value.cost
        }
    }
    
    // Partial match
    const lowerTrimmed = trimmedName.toLowerCase()
    for (const [key, value] of Object.entries(DEFAULT_INVENTORY)) {
        if (key.toLowerCase().includes(lowerTrimmed) || lowerTrimmed.includes(key.toLowerCase())) {
            return value.cost
        }
    }
    
    return 0
}

console.log('🔍 PARSING SIMULATED EXCEL DATA...\n')

// Simulate parsing
const jsonData = mockXLSX.utils.sheet_to_json(mockData, { header: 1 })

console.log(`📋 Total rows in sheet: ${jsonData.length}`)
console.log(`📏 Expected data structure: [index, item, qty, my_amount, discount, net_amount, tax, total]`)
console.log()

let currentCategory = ''
const items = []
const categoryGroups = new Map()
let totalRevenue = 0
let totalTax = 0

console.log('🔄 PROCESSING ROWS:\n')

for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i]
    if (!row || row.length < 3) continue

    const firstCell = String(row[0] || '').trim()
    const secondCell = String(row[1] || '').trim()
    const thirdCell = row[2]

    // Check row type
    let rowType = 'DATA'
    
    if (firstCell === 'Max' || firstCell === 'Min' || firstCell === 'Avg' || firstCell === 'Total' || 
        firstCell === 'Round off' || firstCell === 'Sub Total') {
        rowType = 'SUMMARY'
        continue
    }
    
    if (firstCell === 'Sl.No' || secondCell === 'Item' || firstCell === 'Group' || firstCell === 'Qty.') {
        rowType = 'HEADER'
        continue
    }

    // Check if category
    const thirdCellIsNumber = typeof thirdCell === 'number' || (typeof thirdCell === 'string' && !isNaN(Number(thirdCell)) && thirdCell !== '')
    
    if (!thirdCellIsNumber && (firstCell || secondCell)) {
        const potentialCategory = firstCell || secondCell
        if (potentialCategory.includes('Menu') || potentialCategory === 'Others') {
            currentCategory = potentialCategory
            if (!categoryGroups.has(currentCategory)) {
                categoryGroups.set(currentCategory, [])
            }
            console.log(`  ✓ Category detected: "${currentCategory}"`)
            continue
        }
    }

    // Parse item row
    const qty = thirdCell ? Number(thirdCell) : 0
    const itemName = secondCell || firstCell
    
    if (itemName && qty > 0 && !isNaN(qty)) {
        const netAmount = Number(row[5]) || 0
        
        if (netAmount > 0) {
            const myAmount = Number(row[3]) || 0
            const tax = Number(row[6]) || 0
            
            const costPrice = getCostPrice(itemName)
            const totalCost = costPrice * qty
            const profit = netAmount - totalCost
            const margin = ((profit / netAmount) * 100)

            console.log(`  📦 Item: "${itemName}"`)
            console.log(`     Qty: ${qty} | Net: ₹${netAmount} | Cost/Unit: ₹${costPrice}`)
            console.log(`     Total Cost: ₹${totalCost} | Profit: ₹${profit.toFixed(2)} | Margin: ${margin.toFixed(1)}%`)
            console.log()

            items.push({
                itemName,
                category: currentCategory,
                quantity: qty,
                costPrice,
                netAmount,
                tax,
                profit,
                margin: Math.round(margin * 10) / 10
            })

            if (!categoryGroups.has(currentCategory)) {
                categoryGroups.set(currentCategory, [])
            }
            categoryGroups.get(currentCategory).push(items[items.length - 1])

            totalRevenue += netAmount
            totalTax += tax
        }
    }
}

console.log('\n╔════════════════════════════════════════════════════════════╗')
console.log('║                      PARSING RESULTS                      ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

if (items.length === 0) {
    console.log('❌ NO ITEMS PARSED!')
} else {
    console.log(`✅ Total items parsed: ${items.length}\n`)

    // Category breakdown
    for (const [catName, catItems] of categoryGroups.entries()) {
        const catRevenue = catItems.reduce((s, i) => s + i.netAmount, 0)
        const catCost = catItems.reduce((s, i) => s + (i.costPrice * i.quantity), 0)
        const catProfit = catRevenue - catCost
        const catOrders = catItems.reduce((s, i) => s + i.quantity, 0)

        console.log(`📂 ${catName}`)
        console.log(`   Items: ${catItems.length} | Orders: ${catOrders} | Revenue: ₹${catRevenue}`)
        console.log(`   Cost: ₹${catCost} | Profit: ₹${catProfit} (${((catProfit/catRevenue)*100).toFixed(1)}%)\n`)
    }

    // Overall summary
    const totalCost = items.reduce((s, i) => s + (i.costPrice * i.quantity), 0)
    const grossProfit = totalRevenue - totalCost
    const netProfit = grossProfit - totalTax
    const netMargin = (netProfit / totalRevenue) * 100
    const totalOrders = items.reduce((s, i) => s + i.quantity, 0)

    console.log('📊 OVERALL SUMMARY:')
    console.log(`   Total Items: ${items.length}`)
    console.log(`   Total Orders: ${totalOrders}`)
    console.log(`   Total Revenue: ₹${totalRevenue}`)
    console.log(`   Total Cost: ₹${totalCost}`)
    console.log(`   Gross Profit: ₹${grossProfit}`)
    console.log(`   Total Tax: ₹${totalTax}`)
    console.log(`   Net Profit: ₹${netProfit}`)
    console.log(`   Net Margin: ${netMargin.toFixed(2)}%`)
    console.log()

    // Expected values
    console.log('✅ EXPECTED VALUES:')
    console.log(`   Total Revenue: ₹18,461 (Actual: ₹${totalRevenue})`)
    console.log(`   Total Cost: ₹9,225 (Actual: ₹${totalCost.toFixed(0)})`)
    console.log(`   Gross Profit: ₹9,236 (Actual: ₹${grossProfit.toFixed(0)})`)
    console.log(`   Net Margin: 48.90% (Actual: ${netMargin.toFixed(2)}%)`)
    console.log()

    // Validation
    console.log('🔍 VALIDATION:')
    const revenueMatch = Math.abs(totalRevenue - 18461) < 1
    const costMatch = Math.abs(totalCost - 9225) < 50
    const profitMatch = Math.abs(grossProfit - 9236) < 50

    console.log(`   Revenue Check: ${revenueMatch ? '✓' : '✗'} ₹${totalRevenue} vs ₹18,461`)
    console.log(`   Cost Check: ${costMatch ? '✓' : '✗'} ₹${totalCost.toFixed(0)} vs ₹9,225`)
    console.log(`   Profit Check: ${profitMatch ? '✓' : '✗'} ₹${grossProfit.toFixed(0)} vs ₹9,236`)

    if (revenueMatch && costMatch && profitMatch) {
        console.log('\n🚀 PARSER VALIDATION: PASSED\n')
    } else {
        console.log('\n⚠️  PARSER VALIDATION: FAILED\n')
    }
}
