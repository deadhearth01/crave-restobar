import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/api-db'

/**
 * GET /api/inventory
 * 
 * Query params:
 * - category: Filter by category
 * - name: Search by item name
 * - stats: If 'true', return inventory statistics
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const name = searchParams.get('name')
        const stats = searchParams.get('stats')

        // Return stats if requested
        if (stats === 'true') {
            const inventoryStats = db.getInventoryStats()
            return NextResponse.json({
                success: true,
                ...inventoryStats
            })
        }

        // Search by name
        if (name) {
            const item = db.getInventoryByName(name)
            if (item) {
                return NextResponse.json({
                    success: true,
                    item
                })
            }
            return NextResponse.json({
                success: false,
                error: 'Item not found'
            }, { status: 404 })
        }

        // Filter by category
        if (category) {
            const items = db.getInventoryByCategory(category)
            return NextResponse.json({
                success: true,
                count: items.length,
                category,
                items
            })
        }

        // Return all inventory
        const items = db.getInventory()
        const categories = db.getInventoryCategories()
        
        return NextResponse.json({
            success: true,
            count: items.length,
            categories,
            items
        })
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 })
    }
}

/**
 * POST /api/inventory
 * Add new inventory item
 * 
 * Body: { name, costPrice, sellingPrice, marginPercent, category }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, costPrice, sellingPrice, marginPercent, category } = body

        if (!name || costPrice === undefined) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: name, costPrice'
            }, { status: 400 })
        }

        // Check if item already exists
        const existing = db.getInventoryByName(name)
        if (existing) {
            return NextResponse.json({
                success: false,
                error: 'Item already exists',
                existingItem: existing
            }, { status: 409 })
        }

        const newItem = db.addInventoryItem({
            name,
            costPrice: Number(costPrice),
            sellingPrice: Number(sellingPrice) || 0,
            marginPercent: Number(marginPercent) || 0,
            category: category || 'General'
        })

        return NextResponse.json({
            success: true,
            item: newItem
        }, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 })
    }
}

/**
 * PUT /api/inventory
 * Update inventory item
 * 
 * Body: { id, name?, costPrice?, sellingPrice?, marginPercent?, category? }
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing id' 
            }, { status: 400 })
        }

        // Convert numeric fields
        if (updates.costPrice !== undefined) {
            updates.costPrice = Number(updates.costPrice)
        }
        if (updates.sellingPrice !== undefined) {
            updates.sellingPrice = Number(updates.sellingPrice)
        }
        if (updates.marginPercent !== undefined) {
            updates.marginPercent = Number(updates.marginPercent)
        }

        const updated = db.updateInventoryItem(Number(id), updates)

        if (updated) {
            return NextResponse.json({ 
                success: true, 
                item: updated 
            })
        } else {
            return NextResponse.json({ 
                success: false, 
                error: 'Item not found' 
            }, { status: 404 })
        }

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 })
    }
}

/**
 * DELETE /api/inventory?id={id}
 * Remove inventory item
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

        const deleted = db.deleteInventoryItem(Number(id))

        if (deleted) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ 
                success: false, 
                error: 'Item not found' 
            }, { status: 404 })
        }

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 })
    }
}
