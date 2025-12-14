import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { db, SaleItem, CategorySummary } from '@/lib/api-db'

/**
 * POST /api/parse
 * 
 * Parse Excel file and return structured data
 * Does NOT save to database - use /api/sales for that
 * 
 * Body: FormData with 'file' field
 * 
 * Returns: {
 *   success: boolean
 *   data: {
 *     restaurantName: string
 *     dateRange: string
 *     date: string
 *     items: SaleItem[]
 *     categories: CategorySummary[]
 *     summary: { ... }
 *   }
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({
                success: false,
                error: 'No file uploaded'
            }, { status: 400 })
        }

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ]
        if (!validTypes.includes(file.type) && !file.name.match(/\.xlsx?$/i)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)'
            }, { status: 400 })
        }

        // Read file
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        
        if (!sheet) {
            return NextResponse.json({
                success: false,
                error: 'No sheets found in Excel file'
            }, { status: 400 })
        }

        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        
        if (!rows || rows.length < 5) {
            return NextResponse.json({
                success: false,
                error: 'Excel file is empty or has insufficient data'
            }, { status: 400 })
        }

        // Extract metadata
        const restaurantName = String(rows[0]?.[0] || 'Unknown Restaurant')
        const { dateRange, date } = extractDateRange(String(rows[1]?.[0] || ''))

        // Parse items
        const items: SaleItem[] = []
        const categoryMap = new Map<string, SaleItem[]>()
        let currentCategory = 'Uncategorized'

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            if (!row || row.length === 0) continue

            const col0 = String(row[0] || '').trim()

            // Skip header/summary rows
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

                // Get cost from inventory
                const { costPrice } = db.getCostPrice(itemName)
                const totalCost = costPrice * quantity
                const profit = netAmount - totalCost
                const margin = netAmount > 0 ? Math.round((profit / netAmount) * 100 * 10) / 10 : 0

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
                    margin
                }

                items.push(saleItem)

                if (!categoryMap.has(currentCategory)) {
                    categoryMap.set(currentCategory, [])
                }
                categoryMap.get(currentCategory)!.push(saleItem)
            }
        }

        if (items.length === 0) {
            // Enhanced debugging info
            const sampleRows = rows.slice(0, 10).map((r, i) => `Row ${i}: ${JSON.stringify(r)}`).join('\n')
            console.log('DEBUG: No items found. Sample rows:')
            console.log(sampleRows)
            console.log('Total rows:', rows.length)
            
            return NextResponse.json({
                success: false,
                error: `No items found in Excel file. Total rows: ${rows.length}. File: ${file.name}. Please check the file format.`,
                debug: {
                    totalRows: rows.length,
                    fileName: file.name,
                    fileSize: file.size,
                    sampleFirstRow: rows[0] || null,
                    sampleRow3: rows[3] || null,
                    sampleRow10: rows[10] || null
                }
            }, { status: 400 })
        }

        // Build category summaries
        const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(([name, catItems]) => {
            const totalRevenue = catItems.reduce((s, i) => s + i.netAmount, 0)
            const totalCost = catItems.reduce((s, i) => s + i.totalCost, 0)
            const totalProfit = totalRevenue - totalCost
            
            return {
                name,
                itemCount: catItems.length,
                totalQuantity: catItems.reduce((s, i) => s + i.quantity, 0),
                totalRevenue,
                totalCost,
                totalProfit,
                totalTax: catItems.reduce((s, i) => s + i.tax, 0),
                avgMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100 * 10) / 10 : 0
            }
        })

        // Build summary
        const totalRevenue = items.reduce((s, i) => s + i.netAmount, 0)
        const totalCost = items.reduce((s, i) => s + i.totalCost, 0)
        const totalProfit = totalRevenue - totalCost
        const totalTax = items.reduce((s, i) => s + i.tax, 0)
        const totalOrders = items.reduce((s, i) => s + i.quantity, 0)

        const summary = {
            totalItems: items.length,
            totalOrders,
            totalRevenue,
            totalCost,
            totalProfit,
            totalTax,
            netMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100 * 10) / 10 : 0
        }

        return NextResponse.json({
            success: true,
            data: {
                fileName: file.name,
                restaurantName,
                dateRange,
                date,
                items,
                categories,
                summary
            }
        })

    } catch (error: any) {
        console.error('Parse error:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to parse Excel file'
        }, { status: 500 })
    }
}

// Helper functions
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
    const skipExact = ['Max', 'Min', 'Avg', 'Total', 'Sub Total', 'Round off', 'Group']
    if (skipExact.includes(col0)) return true
    if (col0.toLowerCase().includes('hotel')) return true
    if (col0.includes('Group Report')) return true
    return false
}

function isCategoryRow(row: any[]): boolean {
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
