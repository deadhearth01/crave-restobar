import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/api-db'

/**
 * GET /api/sales
 * 
 * Get all sales records (summary view)
 * 
 * Query params:
 * - full: If 'true', include all items in response
 * - startDate: Filter by start date (YYYY-MM-DD)
 * - endDate: Filter by end date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const full = searchParams.get('full') === 'true'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let records = db.getSalesRecords()

        // Filter by date range if provided
        if (startDate && endDate) {
            records = records.filter(r => r.date >= startDate && r.date <= endDate)
        }

        // Return full records or summary
        const responseRecords = full ? records : records.map(r => ({
            id: r.id,
            fileName: r.fileName,
            date: r.date,
            dateRange: r.dateRange,
            restaurantName: r.restaurantName,
            totalRevenue: r.totalRevenue,
            totalCost: r.totalCost,
            totalProfit: r.totalProfit,
            totalTax: r.totalTax,
            totalOrders: r.totalOrders,
            netMargin: r.netMargin,
            itemCount: r.items.length,
            categoryCount: r.categories?.length || 0,
            createdAt: r.createdAt
        }))

        return NextResponse.json({
            success: true,
            count: records.length,
            records: responseRecords
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

/**
 * POST /api/sales
 * 
 * Save parsed sales data to database
 * 
 * Body: {
 *   fileName: string
 *   restaurantName: string
 *   date: string (YYYY-MM-DD)
 *   dateRange: string
 *   items: SaleItem[]
 *   categories: CategorySummary[]
 *   summary: { ... }
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { fileName, restaurantName, date, dateRange, items, categories, summary } = body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No items to save'
            }, { status: 400 })
        }

        const record = db.addSalesRecord({
            fileName: fileName || 'Unknown',
            restaurantName: restaurantName || 'Unknown Restaurant',
            date: date || new Date().toISOString().split('T')[0],
            dateRange: dateRange || '',
            items,
            categories: categories || [],
            totalRevenue: summary?.totalRevenue || items.reduce((s: number, i: any) => s + (i.netAmount || 0), 0),
            totalCost: summary?.totalCost || items.reduce((s: number, i: any) => s + (i.totalCost || 0), 0),
            totalProfit: summary?.totalProfit || 0,
            totalTax: summary?.totalTax || items.reduce((s: number, i: any) => s + (i.tax || 0), 0),
            totalOrders: summary?.totalOrders || items.reduce((s: number, i: any) => s + (i.quantity || 0), 0),
            netMargin: summary?.netMargin || 0
        })

        return NextResponse.json({
            success: true,
            message: 'Sales record saved',
            record: {
                id: record.id,
                date: record.date,
                itemCount: record.items.length,
                totalRevenue: record.totalRevenue,
                totalProfit: record.totalProfit,
                netMargin: record.netMargin
            }
        }, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

/**
 * DELETE /api/sales?id={id}
 * 
 * Delete a sales record
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Missing id parameter'
            }, { status: 400 })
        }

        const deleted = db.deleteSalesRecord(Number(id))

        if (deleted) {
            return NextResponse.json({
                success: true,
                message: 'Record deleted'
            })
        } else {
            return NextResponse.json({
                success: false,
                error: 'Record not found'
            }, { status: 404 })
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
