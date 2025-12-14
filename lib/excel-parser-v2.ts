/**
 * Enhanced Excel Parser v2 - CSV-Based Approach
 * Converts Excel to CSV, parses by category, and calculates profits accurately
 */

import * as XLSX from 'xlsx'

export interface ParsedExcelData {
    dateRange: string
    date: string
    items: SaleItem[]
    categoryGroups: CategoryGroup[]
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

export interface CategoryGroup {
    name: string
    items: SaleItem[]
    subtotalRevenue: number
    subtotalCost: number
    subtotalProfit: number
    subtotalOrders: number
    subtotalTax: number
}

// Default inventory with intelligent pricing based on item type
// Using cost = approximately 40-50% of typical selling price
const DEFAULT_INVENTORY: { [key: string]: { cost: number; category: string } } = {
    // Food Items
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
    'spl non veg fried rice': { cost: 199, category: 'Others' },
    'spl veg fried rice': { cost: 174, category: 'Others' },

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
}

/**
 * Get cost price for an item
 */
function getCostPrice(itemName: string): number {
    const trimmedName = itemName.trim()
    
    // Exact match first
    const item = DEFAULT_INVENTORY[trimmedName]
    if (item) {
        return item.cost
    }
    
    // Fallback: case-insensitive match
    for (const [key, value] of Object.entries(DEFAULT_INVENTORY)) {
        if (key.toLowerCase() === trimmedName.toLowerCase()) {
            return value.cost
        }
    }
    
    // Fallback: partial match (for typos)
    const lowerTrimmed = trimmedName.toLowerCase()
    for (const [key, value] of Object.entries(DEFAULT_INVENTORY)) {
        if (key.toLowerCase().includes(lowerTrimmed) || lowerTrimmed.includes(key.toLowerCase())) {
            return value.cost
        }
    }
    
    // Last resort: estimate cost as ~40% of net amount (typical restaurant margin)
    return 0
}

/**
 * Convert Excel XLSX data to CSV-like rows
 * and parse them with proper category handling
 */
export function parseExcelFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                if (!data) throw new Error('Failed to read file')

                // XLSX is already imported at top level
                const workbook = XLSX.read(data, { type: 'binary' })
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                
                if (!firstSheet) {
                    throw new Error('No sheets found in Excel file')
                }
                
                // Convert to CSV-like array of arrays
                const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

                if (!jsonData || jsonData.length === 0) {
                    throw new Error('Excel file is empty or cannot be read')
                }

                // Extract date range from header
                let dateRange = ''
                let extractedDate = new Date().toISOString().split('T')[0]

                // Look for date pattern in first few rows
                for (let i = 0; i < Math.min(5, jsonData.length); i++) {
                    if (jsonData[i] && jsonData[i][0]) {
                        const headerText = String(jsonData[i][0])
                        const match = headerText.match(/(\d{2})-(\d{2})-(\d{4})\s+to\s+(\d{2})-(\d{2})-(\d{4})/)
                        if (match) {
                            dateRange = `${match[1]}-${match[2]}-${match[3]} to ${match[4]}-${match[5]}-${match[6]}`
                            // Use end date
                            extractedDate = `${match[6]}-${match[5]}-${match[4]}`
                            break
                        }
                    }
                }

                // Parse items with category tracking
                const items: SaleItem[] = []
                const categoryGroups: Map<string, SaleItem[]> = new Map()
                let currentCategory = ''
                let totalRevenue = 0
                let totalTax = 0
                
                // Debug: log first few rows to help troubleshoot
                if (typeof window !== 'undefined') {
                    console.log('[Parser] Total rows:', jsonData.length)
                    console.log('[Parser] First 10 rows:', jsonData.slice(0, 10))
                    console.log('[Parser] Sample row structure:', {
                        row0: jsonData[0],
                        row1: jsonData[1],
                        row2: jsonData[2],
                        row5: jsonData[5]
                    })
                }

                // Process all rows
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i]
                    if (!row || row.length < 3) continue

                    const firstCell = String(row[0] || '').trim()
                    const secondCell = String(row[1] || '').trim()
                    const thirdCell = row[2]

                    // Skip header rows and summary rows
                    if (
                        firstCell === 'Max' || firstCell === 'Min' || 
                        firstCell === 'Avg' || firstCell === 'Total' ||
                        firstCell === 'Group' || firstCell === 'Item' ||
                        firstCell === 'Round off' || firstCell === 'Sub Total' ||
                        firstCell === 'Qty.' || firstCell === 'My Amount' ||
                        firstCell.toLowerCase() === 'sl.no' ||
                        secondCell === 'Qty.' ||
                        secondCell === 'My Amount' ||
                        secondCell === 'Item' ||
                        firstCell.includes('Hotel') ||
                        firstCell.includes('Report')
                    ) {
                        continue
                    }

                    // Detect category rows: column 0 has value, column 1 is empty/null, column 2 is not a number
                    // Format: ["Category Name", null, undefined, ...]
                    const firstCellHasValue = firstCell && firstCell.length > 0
                    const secondCellEmpty = !secondCell || secondCell.length === 0
                    const thirdCellNotNumber = !thirdCell || typeof thirdCell !== 'number'
                    
                    if (firstCellHasValue && secondCellEmpty && thirdCellNotNumber) {
                        // This is likely a category row
                        const potentialCategory = firstCell
                        if (
                            potentialCategory.includes('Menu') ||
                            potentialCategory === 'Others' ||
                            potentialCategory.toLowerCase().includes('dine') ||
                            potentialCategory.toLowerCase().includes('bar') ||
                            potentialCategory.toLowerCase().includes('food')
                        ) {
                            currentCategory = potentialCategory
                            if (!categoryGroups.has(currentCategory)) {
                                categoryGroups.set(currentCategory, [])
                            }
                            if (typeof window !== 'undefined') {
                                console.log(`[Parser] Row ${i} - Category detected:`, currentCategory)
                            }
                            continue
                        }
                    }

                    // Parse item rows: column 0 is null/empty, column 1 has item name, column 2 has quantity
                    // Format: [null, "Item Name", qty, my_amount, discount, net_amount, tax, total_sales]
                    const firstCellEmpty = !firstCell || firstCell.length === 0
                    const secondCellHasValue = secondCell && secondCell.length > 0
                    const qty = typeof thirdCell === 'number' ? thirdCell : (thirdCell ? Number(thirdCell) : 0)
                    
                    if (firstCellEmpty && secondCellHasValue && qty > 0 && !isNaN(qty)) {
                        const itemName = secondCell
                        const myAmount = Number(row[3]) || 0
                        const totalDiscount = Number(row[4]) || 0
                        const netAmount = Number(row[5]) || 0
                        const tax = Number(row[6]) || 0
                        const totalSales = Number(row[7]) || 0

                        if (typeof window !== 'undefined' && i < 20) {
                            console.log(`[Parser] Row ${i} - Item found:`, {
                                itemName,
                                qty,
                                netAmount,
                                category: currentCategory
                            })
                        }

                        // Accept if netAmount is positive (otherwise might be header/summary)
                        if (netAmount > 0) {
                            // Get cost price
                            const costPrice = getCostPrice(itemName)
                            const totalCost = costPrice * qty

                            // Calculate profit
                            const itemProfit = netAmount - totalCost
                            const margin = netAmount > 0 ? ((itemProfit / netAmount) * 100) : 0

                            const saleItem: SaleItem = {
                                itemName,
                                category: currentCategory || 'Uncategorized',
                                quantity: qty,
                                costPrice,
                                netAmount,
                                tax,
                                profit: itemProfit,
                                margin: Math.round(margin * 10) / 10
                            }

                            items.push(saleItem)
                            
                            // Add to category group
                            if (!categoryGroups.has(currentCategory)) {
                                categoryGroups.set(currentCategory, [])
                            }
                            categoryGroups.get(currentCategory)!.push(saleItem)

                            totalRevenue += netAmount
                            totalTax += tax
                        }
                    }
                }

                if (items.length === 0) {
                    // Debug: provide more helpful error message
                    if (typeof window !== 'undefined') {
                        console.error('[Parser] No items found. Debug info:')
                        console.error('[Parser] Total rows processed:', jsonData.length)
                        console.error('[Parser] Categories found:', Array.from(categoryGroups.keys()))
                        console.error('[Parser] Total revenue accumulated:', totalRevenue)
                    }
                    throw new Error(`No items found in Excel file. File may have incorrect format. Processed ${jsonData.length} rows, found ${Array.from(categoryGroups.keys()).length} categories.`)
                }

                // Calculate totals
                const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)
                const grossProfit = totalRevenue - totalCost
                const netProfit = grossProfit - totalTax
                const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
                const totalOrders = items.reduce((sum, item) => sum + item.quantity, 0)

                // Build category groups with subtotals
                const categoryGroupsArray: CategoryGroup[] = []
                for (const [categoryName, categoryItems] of categoryGroups.entries()) {
                    const subtotalRevenue = categoryItems.reduce((sum, item) => sum + item.netAmount, 0)
                    const subtotalCost = categoryItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)
                    const subtotalProfit = subtotalRevenue - subtotalCost
                    const subtotalOrders = categoryItems.reduce((sum, item) => sum + item.quantity, 0)
                    const subtotalTax = categoryItems.reduce((sum, item) => sum + item.tax, 0)

                    categoryGroupsArray.push({
                        name: categoryName,
                        items: categoryItems,
                        subtotalRevenue,
                        subtotalCost,
                        subtotalProfit,
                        subtotalOrders,
                        subtotalTax
                    })
                }

                resolve({
                    dateRange,
                    date: extractedDate,
                    items,
                    categoryGroups: categoryGroupsArray,
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

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 10MB' }
    }

    return { valid: true }
}

/**
 * Get inventory item cost price
 */
export function getInventoryItem(itemName: string): { cost: number; category: string } | null {
    const item = DEFAULT_INVENTORY[itemName.trim()]
    return item || null
}

/**
 * Get all inventory items
 */
export function getAllInventoryItems(): Array<{ name: string; cost: number; category: string }> {
    return Object.entries(DEFAULT_INVENTORY).map(([name, data]) => ({
        name,
        cost: data.cost,
        category: data.category
    }))
}
