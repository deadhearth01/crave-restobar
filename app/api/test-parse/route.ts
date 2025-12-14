import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

// Inventory with 40-50% cost margins
const inventoryData = [
    { name: 'Chilli Chicken', costPrice: 175, category: 'Food' },
    { name: 'Chicken Lollipop', costPrice: 200, category: 'Food' },
    { name: 'Budweiser Magnum', costPrice: 350, category: 'Beverage' },
    { name: 'Non Veg Sweet Corn Soup', costPrice: 100, category: 'Soup' },
    { name: 'Crispy Corn', costPrice: 124, category: 'Appetizer' },
    { name: 'Mushroom Salt And Pepper', costPrice: 149, category: 'Appetizer' },
    { name: 'Chilli Prawns', costPrice: 224, category: 'Seafood' },
    { name: 'Dragon Chicken', costPrice: 174, category: 'Food' },
    { name: 'Chilli Egg', costPrice: 124, category: 'Food' },
    { name: 'Chicken Drum Sticks', costPrice: 199, category: 'Food' },
    { name: 'Appolo Fish', costPrice: 149, category: 'Seafood' },
    { name: 'Pepper Chicken', costPrice: 199, category: 'Food' },
    { name: 'Chilli Loose Prawn', costPrice: 224, category: 'Seafood' },
    { name: 'Chicken Roast', costPrice: 174, category: 'Food' },
    { name: 'Chicken 65', costPrice: 174, category: 'Food' },
    { name: 'Salt French Fries', costPrice: 124, category: 'Sides' },
    { name: 'Kaju Fry', costPrice: 149, category: 'Appetizer' },
    { name: 'Crunchi Chicken', costPrice: 199, category: 'Food' },
    { name: 'Veg Fried Rice', costPrice: 149, category: 'Rice' },
    { name: 'Egg Fried Rice', costPrice: 149, category: 'Rice' },
    { name: 'Konaseema Boneless Biriyani', costPrice: 199, category: 'Biriyani' },
    { name: 'Green Salda', costPrice: 124, category: 'Salad' },
    { name: 'butter garlice prwans', costPrice: 224, category: 'Seafood' },
    { name: 'kaju chicken', costPrice: 199, category: 'Food' },
    { name: 'mixed non veg fried rice', costPrice: 249, category: 'Rice' },
    { name: 'spl non veg fried rice', costPrice: 199, category: 'Rice' },
    { name: 'spl veg fried rice', costPrice: 174, category: 'Rice' },
    { name: 'Coke', costPrice: 48, category: 'Beverage' },
    { name: 'Screwdriver', costPrice: 399, category: 'Cocktail' },
    { name: 'Kf Strong', costPrice: 249, category: 'Beer' },
    { name: 'Kf Ultra', costPrice: 274, category: 'Beer' },
    { name: 'Cranberry (premium)', costPrice: 158, category: 'Mocktail' },
    { name: 'Blue Lagoon', costPrice: 124, category: 'Mocktail' },
    { name: 'Orange Mojito', costPrice: 124, category: 'Mocktail' },
    { name: 'Mango Mojito', costPrice: 124, category: 'Mocktail' },
    { name: 'Pineapple Mojito', costPrice: 124, category: 'Mocktail' },
    { name: 'Mint & Mango', costPrice: 124, category: 'Mocktail' },
    { name: 'Fresh Lemon Soda', costPrice: 60, category: 'Beverage' },
    { name: 'Absolut (30 Ml)', costPrice: 174, category: 'Spirits' },
    { name: 'Jocobs Greek (150 Ml)', costPrice: 649, category: 'Wine' },
    { name: 'Black Dog (30 Ml)', costPrice: 174, category: 'Whisky' },
    { name: 'MC 1 QUTR', costPrice: 150, category: 'Spirits' },
    { name: 'Heineken Tin', costPrice: 224, category: 'Beer' },
    { name: 'Virgin Mojito', costPrice: 124, category: 'Mocktail' },
    { name: 'M.m Green 30ml', costPrice: 99, category: 'Spirits' },
    { name: 'Water Bottle', costPrice: 30, category: 'Beverage' },
    { name: 'Thumsup', costPrice: 60, category: 'Beverage' },
    { name: 'Sprit', costPrice: 60, category: 'Beverage' },
    { name: 'Red Bull', costPrice: 124, category: 'Energy Drink' },
    { name: 'Budweiser', costPrice: 324, category: 'Beer' },
    { name: 'Budweiser 500ml', costPrice: 249, category: 'Beer' },
]

function getCostPrice(itemName: string): number {
    const item = inventoryData.find(i =>
        i.name.toLowerCase() === itemName.toLowerCase()
    )
    return item?.costPrice || 0
}

export async function GET(request: NextRequest) {
    try {
        // Read Excel file from public folder
        const excelPath = path.join(process.cwd(), '..', 'test-sample-sales.xlsx')

        if (!fs.existsSync(excelPath)) {
            return NextResponse.json({
                error: 'Excel file not found',
                path: excelPath
            }, { status: 404 })
        }

        const buffer = fs.readFileSync(excelPath)
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        // Extract date
        let dateRange = ''
        let extractedDate = new Date().toISOString().split('T')[0]

        if (jsonData[1] && jsonData[1][0]) {
            const headerText = String(jsonData[1][0])
            const match = headerText.match(/(\d{2}-\d{2}-\d{4})\s+to\s+(\d{2}-\d{2}-\d{4})/)
            if (match) {
                dateRange = `${match[1]} to ${match[2]}`
                const dateParts = match[2].split('-')
                extractedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
            }
        }

        const items: any[] = []
        let currentCategory = ''
        let totalRevenue = 0
        let totalTax = 0

        // Parse items
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i]

            if (!row || row.length === 0) continue

            const firstCell = row[0]

            // Skip summary rows
            if (firstCell && ['Max', 'Min', 'Avg', 'Total'].includes(String(firstCell).trim())) continue

            // Detect category
            if (firstCell && typeof firstCell === 'string' && !row[2]) {
                const catName = String(firstCell).trim()
                if (!catName.includes('Sub Total') && !catName.includes('Round off') &&
                    !catName.includes('Hotel') && !catName.includes('Group Report')) {
                    currentCategory = catName
                }
                continue
            }

            // Parse item rows: null in col 0, item name in col 1, qty in col 2
            if ((firstCell === null || firstCell === undefined) && row[1] && typeof row[2] === 'number') {
                const itemName = String(row[1]).trim()
                const quantity = Number(row[2]) || 0
                const netAmount = Number(row[5]) || 0
                const tax = Number(row[6]) || 0

                const costPrice = getCostPrice(itemName)
                const totalCost = costPrice * quantity

                // Profit = Net Amount - (Cost × Qty)
                const itemProfit = netAmount - totalCost
                const margin = netAmount > 0 ? ((itemProfit / netAmount) * 100) : 0

                items.push({
                    itemName,
                    category: currentCategory,
                    quantity,
                    netAmount,
                    tax,
                    costPrice,
                    totalCost,
                    profit: itemProfit,
                    margin: Math.round(margin * 10) / 10
                })

                totalRevenue += netAmount
                totalTax += tax
            }
        }

        // Calculate totals
        const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0)
        const grossProfit = totalRevenue - totalCost
        const netProfit = grossProfit - totalTax
        const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0

        return NextResponse.json({
            success: true,
            date: extractedDate,
            dateRange,
            summary: {
                totalItems: items.length,
                totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
                grossRevenue: totalRevenue,
                totalCost,
                grossProfit,
                totalTax,
                netProfit,
                netMargin: Math.round(netMargin * 100) / 100
            },
            items: items.slice(0, 10), // First 10 items for preview
            allItems: items
        })

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
