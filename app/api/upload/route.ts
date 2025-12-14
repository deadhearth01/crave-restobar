import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { db, SaleItem, CategorySummary } from '@/lib/api-db'

/**
 * POST /api/upload
 * 
 * Combined endpoint: Parse Excel + Calculate Profits + Save to Database
 * This is the all-in-one endpoint for quick uploads
 * 
 * For more control, use:
 * - /api/parse - Parse only
 * - /api/analytics - Calculate only
 * - /api/sales - Save only
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ 
                success: false, 
                error: 'No file provided' 
            }, { status: 400 })
        }

        // Parse Excel file
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

            if (isSkipRow(col0)) continue

            if (isCategoryRow(row)) {
                currentCategory = col0
                if (!categoryMap.has(currentCategory)) {
                    categoryMap.set(currentCategory, [])
                }
                continue
            }

            if (isItemRow(row)) {
                const itemName = String(row[1]).trim()
                const quantity = Number(row[2]) || 0
                const myAmount = Number(row[3]) || 0
                const discount = Number(row[4]) || 0
                const netAmount = Number(row[5]) || 0
                const tax = Number(row[6]) || 0
                const totalSales = Number(row[7]) || 0

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
            return NextResponse.json({ 
                success: false, 
                error: 'No items found in Excel file' 
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

        // Calculate totals
        const totalRevenue = items.reduce((s, i) => s + i.netAmount, 0)
        const totalCost = items.reduce((s, i) => s + i.totalCost, 0)
        const totalProfit = totalRevenue - totalCost
        const totalTax = items.reduce((s, i) => s + i.tax, 0)
        const totalOrders = items.reduce((s, i) => s + i.quantity, 0)
        const netMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100 * 10) / 10 : 0

        // Save to database
        const record = db.addSalesRecord({
            fileName: file.name,
            restaurantName,
            dateRange,
            date,
            items,
            categories,
            totalRevenue,
            totalCost,
            totalProfit,
            totalTax,
            totalOrders,
            netMargin
        })

        return NextResponse.json({
            success: true,
            record: {
                id: record.id,
                fileName: record.fileName,
                restaurantName: record.restaurantName,
                dateRange: record.dateRange,
                date: record.date,
                categories,
                summary: {
                    totalItems: items.length,
                    totalQuantity: totalOrders,
                    totalRevenue,
                    totalCost,
                    totalProfit,
                    totalTax,
                    netMargin
                }
            }
        })

    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

// Helper functions
function extractDateRange(text: string): { dateRange: string; date: string } {
    const match = text.match(/(\d{2})-(\d{2})-(\d{4})\s+to\s+(\d{2})-(\d{2})-(\d{4})/)
    if (match) {
        return {
            dateRange: `${match[1]}-${match[2]}-${match[3]} to ${match[4]}-${match[5]}-${match[6]}`,
            date: `${match[6]}-${match[5]}-${match[4]}`
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
