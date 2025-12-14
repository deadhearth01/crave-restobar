import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/api-db'

/**
 * GET /api/analytics
 * 
 * Get analytics and insights from sales data
 * 
 * Query params:
 * - type: 'dashboard' | 'categories' | 'top-items' | 'trends' | 'all'
 * - limit: Number of top items to return (default: 10)
 * - startDate: Filter by start date (YYYY-MM-DD)
 * - endDate: Filter by end date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'all'
        const limit = parseInt(searchParams.get('limit') || '10')

        const response: any = { success: true }

        switch (type) {
            case 'dashboard':
                response.dashboard = db.getDashboardStats()
                break

            case 'categories':
                response.categories = db.getCategoryAnalytics()
                break

            case 'top-items':
                response.topItems = db.getTopItems(limit)
                break

            case 'trends':
                response.trends = db.getDailyTrends()
                break

            case 'all':
            default:
                response.dashboard = db.getDashboardStats()
                response.categories = db.getCategoryAnalytics()
                response.topItems = db.getTopItems(limit)
                response.trends = db.getDailyTrends()
                break
        }

        return NextResponse.json(response)

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

/**
 * POST /api/analytics/calculate
 * 
 * Calculate profit analytics for given items
 * Use this when you want to calculate without saving to database
 * 
 * Body: {
 *   items: Array<{ itemName, quantity, netAmount, tax? }>
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { items } = body

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({
                success: false,
                error: 'Missing items array'
            }, { status: 400 })
        }

        // Calculate profits for each item
        const calculatedItems = items.map((item: any) => {
            const { costPrice, marginPercent } = db.getCostPrice(item.itemName)
            const quantity = Number(item.quantity) || 0
            const netAmount = Number(item.netAmount) || 0
            const tax = Number(item.tax) || 0
            
            const totalCost = costPrice * quantity
            const profit = netAmount - totalCost
            const actualMargin = netAmount > 0 ? Math.round((profit / netAmount) * 100 * 10) / 10 : 0

            return {
                itemName: item.itemName,
                quantity,
                netAmount,
                tax,
                costPrice,
                expectedMargin: marginPercent,
                totalCost,
                profit,
                actualMargin,
                marginDiff: actualMargin - marginPercent
            }
        })

        // Summary calculations
        const totalRevenue = calculatedItems.reduce((s: number, i: any) => s + i.netAmount, 0)
        const totalCost = calculatedItems.reduce((s: number, i: any) => s + i.totalCost, 0)
        const totalProfit = totalRevenue - totalCost
        const totalTax = calculatedItems.reduce((s: number, i: any) => s + i.tax, 0)
        const totalOrders = calculatedItems.reduce((s: number, i: any) => s + i.quantity, 0)

        // Find items with margin issues
        const marginIssues = calculatedItems.filter((i: any) => i.marginDiff < -10) // More than 10% below expected

        return NextResponse.json({
            success: true,
            items: calculatedItems,
            summary: {
                totalItems: calculatedItems.length,
                totalOrders,
                totalRevenue,
                totalCost,
                totalProfit,
                totalTax,
                netMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100 * 10) / 10 : 0
            },
            insights: {
                marginIssuesCount: marginIssues.length,
                marginIssues: marginIssues.map((i: any) => ({
                    itemName: i.itemName,
                    expectedMargin: i.expectedMargin,
                    actualMargin: i.actualMargin
                })),
                topProfitItems: calculatedItems
                    .sort((a: any, b: any) => b.profit - a.profit)
                    .slice(0, 5)
                    .map((i: any) => ({ itemName: i.itemName, profit: i.profit, margin: i.actualMargin })),
                lowMarginItems: calculatedItems
                    .filter((i: any) => i.actualMargin < 40)
                    .map((i: any) => ({ itemName: i.itemName, margin: i.actualMargin }))
            }
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
