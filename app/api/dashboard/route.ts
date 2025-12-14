import { NextResponse } from 'next/server'
import { db } from '@/lib/api-db'

/**
 * GET /api/dashboard
 * 
 * Returns dashboard statistics and recent records
 */
export async function GET() {
    const stats = db.getDashboardStats()
    const records = db.getSalesRecords().slice(0, 5) // Recent 5
    const categoryAnalytics = db.getCategoryAnalytics()
    const topItems = db.getTopItems(5)

    return NextResponse.json({
        success: true,
        stats,
        categoryAnalytics,
        topItems,
        recentRecords: records.map(r => ({
            id: r.id,
            fileName: r.fileName,
            date: r.date,
            restaurantName: r.restaurantName,
            totalRevenue: r.totalRevenue,
            totalProfit: r.totalProfit,
            totalOrders: r.totalOrders,
            netMargin: r.netMargin
        }))
    })
}
