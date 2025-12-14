/**
 * Enhanced Excel Parser using pure JavaScript
 * Parses sales data from Excel files with proper error handling and validation
 */

export interface ParsedExcelData {
    dateRange: string
    date: string
    items: SaleItem[]
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalOrders: number
    totalTax: number
    grossRevenue: number
    netMargin: number
}

export interface SaleItem {
    itemName: string
    category: string
    quantity: number
    costPrice: number
    netAmount: number
    tax: number
    profit: number
    margin: number
}

interface InventoryItem {
    name: string
    costPrice: number
    category?: string
}

// Default inventory with proper cost prices
const DEFAULT_INVENTORY: InventoryItem[] = [
    { name: 'Non Veg Sweet Corn Soup', costPrice: 100, category: 'Soup' },
    { name: 'Crispy Corn', costPrice: 124, category: 'Appetizer' },
    { name: 'Mushroom Salt And Pepper', costPrice: 149, category: 'Appetizer' },
    { name: 'Chilli Chicken', costPrice: 175, category: 'Food' },
    { name: 'Chilli Prawns', costPrice: 224, category: 'Seafood' },
    { name: 'Dragon Chicken', costPrice: 174, category: 'Food' },
    { name: 'Chilli Egg', costPrice: 124, category: 'Food' },
    { name: 'Chicken Lollipop', costPrice: 200, category: 'Food' },
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
    { name: 'Budweiser Magnum', costPrice: 350, category: 'Beer' },
    { name: 'Budweiser 500ml', costPrice: 249, category: 'Beer' },
]

function getCostPrice(itemName: string): number {
    const item = DEFAULT_INVENTORY.find(
        i => i.name.toLowerCase() === itemName.toLowerCase()
    )
    return item?.costPrice || 0
}

/**
 * Parse Excel file from client using XLSX library
 * Handles the specific format used by the restaurant sales system
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                const data = e.target?.result
                if (!data) throw new Error('Failed to read file')

                // Dynamically import XLSX
                const XLSX = await import('xlsx')
                
                const workbook = XLSX.read(data, { type: 'binary' })
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

                // Extract date range from row 1
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

                const items: SaleItem[] = []
                let currentCategory = ''
                let totalRevenue = 0
                let totalTax = 0

                // Parse items
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i]

                    if (!row || row.length === 0) continue

                    const firstCell = row[0]

                    // Skip summary rows
                    if (firstCell && ['Max', 'Min', 'Avg', 'Total'].includes(String(firstCell).trim())) {
                        continue
                    }

                    // Detect category rows
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

                        // Get cost from inventory
                        const costPrice = getCostPrice(itemName)
                        const totalCost = costPrice * quantity

                        // Calculate profit: Net Amount - (Cost × Qty)
                        const itemProfit = netAmount - totalCost
                        const margin = netAmount > 0 ? ((itemProfit / netAmount) * 100) : 0

                        items.push({
                            itemName,
                            category: currentCategory,
                            quantity,
                            costPrice,
                            netAmount,
                            tax,
                            profit: itemProfit,
                            margin: Math.round(margin * 10) / 10
                        })

                        totalRevenue += netAmount
                        totalTax += tax
                    }
                }

                if (items.length === 0) {
                    throw new Error('No items found in Excel file. Please check the format.')
                }

                // Calculate totals
                const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)
                const grossProfit = totalRevenue - totalCost
                const netProfit = grossProfit - totalTax
                const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
                const totalOrders = items.reduce((sum, item) => sum + item.quantity, 0)

                resolve({
                    dateRange,
                    date: extractedDate,
                    items,
                    totalRevenue,
                    totalCost,
                    totalProfit: netProfit,
                    totalOrders,
                    totalTax,
                    grossRevenue: totalRevenue,
                    netMargin
                })
            } catch (error) {
                reject(error)
            }
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsBinaryString(file)
    })
}

/**
 * Validate Excel file before parsing
 */
export function validateExcelFile(file: File): { valid: boolean; error?: string } {
    const validExtensions = ['.xlsx', '.xls']
    const fileName = file.name.toLowerCase()
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

    if (!hasValidExtension) {
        return { valid: false, error: 'Only Excel files (.xlsx, .xls) are supported' }
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 5MB' }
    }

    return { valid: true }
}
