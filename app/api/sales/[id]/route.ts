import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/api-db'

// GET single sales record with full items
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const record = db.getSalesRecordById(Number(id))

        if (!record) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 })
        }

        // Get top performers (sorted by profit)
        const topPerformers = [...record.items]
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 5)

        return NextResponse.json({
            success: true,
            record: {
                id: record.id,
                fileName: record.fileName,
                date: record.date,
                dateRange: record.dateRange,
                summary: {
                    totalRevenue: record.totalRevenue,
                    totalCost: record.totalCost,
                    totalProfit: record.totalProfit,
                    totalTax: record.totalTax,
                    totalOrders: record.totalOrders,
                    netMargin: record.netMargin,
                    itemCount: record.items.length
                },
                topPerformers,
                items: record.items
            }
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE single record
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const deleted = db.deleteSalesRecord(Number(id))

        if (deleted) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 })
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
