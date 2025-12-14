/**
 * Excel Parser v3 - Clean, Robust Implementation
 * 
 * WORKFLOW:
 * 1. User uploads Excel file (.xlsx/.xls)
 * 2. FileReader reads file as binary
 * 3. XLSX library parses to array of arrays
 * 4. Parser detects structure:
 *    - Row 0: Restaurant name
 *    - Row 1: Date range "Group Report : DD-MM-YYYY to DD-MM-YYYY"
 *    - Row 3: Header row (Group, Item, Qty, etc.)
 *    - Row 4-7: Summary stats (Max, Min, Avg, Total) - SKIP
 *    - Row 8+: Categories and items
 * 5. Category detection: Column 0 has text, Column 1 is null/empty
 * 6. Item detection: Column 0 is null, Column 1 has item name
 * 7. Sub Total rows: Column 0 = "Sub Total" - SKIP
 * 8. Round off row: Column 0 = "Round off" - SKIP
 * 9. Calculate profits using inventory costs
 * 10. Return structured data for API/database
 */

import * as XLSX from 'xlsx'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SaleItem {
    itemName: string
    category: string
    quantity: number
    myAmount: number
    discount: number
    netAmount: number
    tax: number
    totalSales: number
    costPrice: number
    totalCost: number
    profit: number
    margin: number
}

export interface CategorySummary {
    name: string
    items: SaleItem[]
    totalQuantity: number
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalTax: number
    avgMargin: number
}

export interface ParsedExcelData {
    restaurantName: string
    dateRange: string
    date: string
    categories: CategorySummary[]
    items: SaleItem[]
    summary: {
        totalItems: number
        totalQuantity: number
        totalRevenue: number
        totalCost: number
        grossProfit: number
        totalTax: number
        netProfit: number
        netMargin: number
    }
}

// ============================================
// INVENTORY DATABASE
// ============================================

const INVENTORY: Record<string, { cost: number; category: string }> = {
    // Dine In Food Menu - ~50% cost margin
    'Non Veg Sweet Corn Soup': { cost: 100, category: 'Dine In Food Menu' },
    'Crispy Corn': { cost: 124, category: 'Dine In Food Menu' },
    'Mushroom Salt And Pepper': { cost: 149, category: 'Dine In Food Menu' },
    'Chilli Chicken': { cost: 175, category: 'Dine In Food Menu' },
    'Chilli Prawns': { cost: 224, category: 'Dine In Food Menu' },
    'Dragon Chicken': { cost: 174, category: 'Dine In Food Menu' },
    'Chilli Egg': { cost: 124, category: 'Dine In Food Menu' },
    'Chicken Lollipop': { cost: 200, category: 'Dine In Food Menu' },
    'Chicken Drum Sticks': { cost: 199, category: 'Dine In Food Menu' },
    'Appolo Fish': { cost: 149, category: 'Dine In Food Menu' },
    'Pepper Chicken': { cost: 199, category: 'Dine In Food Menu' },
    'Chilli Loose Prawn': { cost: 224, category: 'Dine In Food Menu' },
    'Chicken Roast': { cost: 174, category: 'Dine In Food Menu' },
    'Chicken 65': { cost: 174, category: 'Dine In Food Menu' },
    'Salt French Fries': { cost: 124, category: 'Dine In Food Menu' },
    'Kaju Fry': { cost: 149, category: 'Dine In Food Menu' },
    'Crunchi Chicken': { cost: 199, category: 'Dine In Food Menu' },
    'Veg Fried Rice': { cost: 149, category: 'Dine In Food Menu' },
    'Egg Fried Rice': { cost: 149, category: 'Dine In Food Menu' },
    'Konaseema Boneless Biriyani': { cost: 199, category: 'Dine In Food Menu' },
    'Green Salda': { cost: 124, category: 'Dine In Food Menu' },
    'butter garlice prwans': { cost: 224, category: 'Dine In Food Menu' },
    'kaju chicken': { cost: 199, category: 'Dine In Food Menu' },
    'mixed non veg fried rice': { cost: 249, category: 'Dine In Food Menu' },

    // Bar Menu - Beverages
    'Coke': { cost: 48, category: 'Bar Menu' },
    'Screwdriver': { cost: 399, category: 'Bar Menu' },
    'Kf Strong': { cost: 249, category: 'Bar Menu' },
    'Kf Ultra': { cost: 274, category: 'Bar Menu' },
    'Cranberry (premium)': { cost: 158, category: 'Bar Menu' },
    'Blue Lagoon': { cost: 124, category: 'Bar Menu' },
    'Orange Mojito': { cost: 124, category: 'Bar Menu' },
    'Mango Mojito': { cost: 124, category: 'Bar Menu' },
    'Pineapple Mojito': { cost: 124, category: 'Bar Menu' },
    'Mint & Mango': { cost: 124, category: 'Bar Menu' },
    'Fresh Lemon Soda': { cost: 60, category: 'Bar Menu' },
    'Absolut (30 Ml)': { cost: 174, category: 'Bar Menu' },
    'Jocobs Greek (150 Ml)': { cost: 649, category: 'Bar Menu' },
    'Black Dog (30 Ml)': { cost: 174, category: 'Bar Menu' },
    'MC 1 QUTR': { cost: 150, category: 'Bar Menu' },
    'Heineken Tin': { cost: 224, category: 'Bar Menu' },
    'Virgin Mojito': { cost: 124, category: 'Bar Menu' },
    'M.m Green 30ml': { cost: 99, category: 'Bar Menu' },
    'Water Bottle': { cost: 30, category: 'Bar Menu' },
    'Thumsup': { cost: 60, category: 'Bar Menu' },
    'Sprit': { cost: 60, category: 'Bar Menu' },
    'Red Bull': { cost: 124, category: 'Bar Menu' },
    'Budweiser': { cost: 324, category: 'Bar Menu' },
    'Budweiser Magnum': { cost: 350, category: 'Bar Menu' },
    'Budweiser 500ml': { cost: 249, category: 'Bar Menu' },

    // Others
    'spl non veg fried rice': { cost: 199, category: 'Others' },
    'spl veg fried rice': { cost: 174, category: 'Others' },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCostPrice(itemName: string): number {
    const name = itemName.trim()
    
    // Exact match
    if (INVENTORY[name]) return INVENTORY[name].cost
    
    // Case-insensitive match
    const lowerName = name.toLowerCase()
    for (const [key, value] of Object.entries(INVENTORY)) {
        if (key.toLowerCase() === lowerName) return value.cost
    }
    
    // Partial match
    for (const [key, value] of Object.entries(INVENTORY)) {
        if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
            return value.cost
        }
    }
    
    // Default: estimate 50% of sale price
    return 0
}

function extractDateRange(text: string): { dateRange: string; date: string } {
    const match = text.match(/(\d{2})-(\d{2})-(\d{4})\s+to\s+(\d{2})-(\d{2})-(\d{4})/)
    if (match) {
        return {
            dateRange: `${match[1]}-${match[2]}-${match[3]} to ${match[4]}-${match[5]}-${match[6]}`,
            date: `${match[6]}-${match[5]}-${match[4]}` // End date in YYYY-MM-DD
        }
    }
    return { dateRange: '', date: new Date().toISOString().split('T')[0] }
}

function isSkipRow(col0: string): boolean {
    // Skip summary rows and header rows
    const skipExact = ['Max', 'Min', 'Avg', 'Total', 'Sub Total', 'Round off', 'Group']
    if (skipExact.includes(col0)) return true
    
    // Skip hotel name and date range header rows
    if (col0.toLowerCase().includes('hotel')) return true
    if (col0.includes('Group Report')) return true
    
    return false
}

function isCategoryRow(row: any[]): boolean {
    // Category: Column 0 has text, Column 1 is null/empty
    const col0 = row[0]
    const col1 = row[1]
    return (
        col0 !== null && 
        col0 !== undefined && 
        typeof col0 === 'string' && 
        col0.trim() !== '' &&
        (col1 === null || col1 === undefined || col1 === '')
    )
}

function isItemRow(row: any[]): boolean {
    // Item: Column 0 is null, Column 1 has text, Column 2 is a number (quantity)
    const col0 = row[0]
    const col1 = row[1]
    const col2 = row[2]
    return (
        (col0 === null || col0 === undefined) &&
        col1 !== null && 
        col1 !== undefined && 
        typeof col1 === 'string' && 
        col1.trim() !== '' &&
        typeof col2 === 'number' &&
        col2 > 0
    )
}

// ============================================
// MAIN PARSER
// ============================================

export function parseExcelFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                if (!data) throw new Error('Failed to read file')

                // Parse Excel
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheet = workbook.Sheets[workbook.SheetNames[0]]
                if (!sheet) throw new Error('No sheets found in Excel file')

                const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
                if (!rows || rows.length === 0) throw new Error('Excel file is empty')

                // Extract metadata
                const restaurantName = rows[0]?.[0] || 'Unknown'
                const { dateRange, date } = extractDateRange(rows[1]?.[0] || '')

                // Parse items
                const items: SaleItem[] = []
                const categoryMap = new Map<string, SaleItem[]>()
                let currentCategory = 'Uncategorized'

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i]
                    if (!row || row.length === 0) continue

                    const col0 = String(row[0] || '').trim()

                    // Skip summary rows
                    if (isSkipRow(col0)) continue

                    // Check for category row
                    if (isCategoryRow(row)) {
                        currentCategory = col0
                        if (!categoryMap.has(currentCategory)) {
                            categoryMap.set(currentCategory, [])
                        }
                        continue
                    }

                    // Check for item row
                    if (isItemRow(row)) {
                        const itemName = String(row[1]).trim()
                        const quantity = Number(row[2]) || 0
                        const myAmount = Number(row[3]) || 0
                        const discount = Number(row[4]) || 0
                        const netAmount = Number(row[5]) || 0
                        const tax = Number(row[6]) || 0
                        const totalSales = Number(row[7]) || 0

                        const costPrice = getCostPrice(itemName)
                        const totalCost = costPrice * quantity
                        const profit = netAmount - totalCost
                        const margin = netAmount > 0 ? (profit / netAmount) * 100 : 0

                        const saleItem: SaleItem = {
                            itemName,
                            category: currentCategory,
                            quantity,
                            myAmount,
                            discount,
                            netAmount,
                            tax,
                            totalSales,
                            costPrice,
                            totalCost,
                            profit,
                            margin: Math.round(margin * 10) / 10
                        }

                        items.push(saleItem)

                        if (!categoryMap.has(currentCategory)) {
                            categoryMap.set(currentCategory, [])
                        }
                        categoryMap.get(currentCategory)!.push(saleItem)
                    }
                }

                if (items.length === 0) {
                    throw new Error('No items found in Excel file. Please check the file format.')
                }

                // Build category summaries
                const categories: CategorySummary[] = []
                for (const [name, catItems] of categoryMap.entries()) {
                    const totalQuantity = catItems.reduce((s, i) => s + i.quantity, 0)
                    const totalRevenue = catItems.reduce((s, i) => s + i.netAmount, 0)
                    const totalCost = catItems.reduce((s, i) => s + i.totalCost, 0)
                    const totalProfit = totalRevenue - totalCost
                    const totalTax = catItems.reduce((s, i) => s + i.tax, 0)
                    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

                    categories.push({
                        name,
                        items: catItems,
                        totalQuantity,
                        totalRevenue,
                        totalCost,
                        totalProfit,
                        totalTax,
                        avgMargin: Math.round(avgMargin * 10) / 10
                    })
                }

                // Calculate totals
                const totalQuantity = items.reduce((s, i) => s + i.quantity, 0)
                const totalRevenue = items.reduce((s, i) => s + i.netAmount, 0)
                const totalCost = items.reduce((s, i) => s + i.totalCost, 0)
                const grossProfit = totalRevenue - totalCost
                const totalTax = items.reduce((s, i) => s + i.tax, 0)
                const netProfit = grossProfit
                const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

                resolve({
                    restaurantName,
                    dateRange,
                    date,
                    categories,
                    items,
                    summary: {
                        totalItems: items.length,
                        totalQuantity,
                        totalRevenue,
                        totalCost,
                        grossProfit,
                        totalTax,
                        netProfit,
                        netMargin: Math.round(netMargin * 10) / 10
                    }
                })

            } catch (error: any) {
                reject(error)
            }
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsBinaryString(file)
    })
}

// ============================================
// FILE VALIDATION
// ============================================

export function validateExcelFile(file: File): { valid: boolean; error?: string } {
    const validExtensions = ['.xlsx', '.xls']
    const fileName = file.name.toLowerCase()
    
    if (!validExtensions.some(ext => fileName.endsWith(ext))) {
        return { valid: false, error: 'Only Excel files (.xlsx, .xls) are supported' }
    }

    if (file.size > 10 * 1024 * 1024) {
        return { valid: false, error: 'File size must be less than 10MB' }
    }

    return { valid: true }
}

// ============================================
// EXPORTS FOR INVENTORY MANAGEMENT
// ============================================

export function getAllInventoryItems(): Array<{ name: string; cost: number; category: string }> {
    return Object.entries(INVENTORY).map(([name, data]) => ({
        name,
        cost: data.cost,
        category: data.category
    }))
}

export function getInventoryItem(name: string): { cost: number; category: string } | null {
    return INVENTORY[name] || null
}
