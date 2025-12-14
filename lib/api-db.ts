/**
 * API Database - Server-side in-memory database
 * 
 * In production, replace with PostgreSQL/MongoDB
 * For now, this provides a clean API for:
 * - Inventory management (with realistic margins)
 * - Sales records storage
 * - Analytics calculations
 */

import { DEFAULT_INVENTORY, InventoryItemData } from './inventory-data'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface InventoryItem {
    id: number
    name: string
    costPrice: number
    sellingPrice: number
    marginPercent: number
    category: string
    updatedAt: Date
}

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
    itemCount: number
    totalQuantity: number
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalTax: number
    avgMargin: number
}

export interface SalesRecord {
    id: number
    fileName: string
    date: string
    dateRange: string
    restaurantName: string
    items: SaleItem[]
    categories: CategorySummary[]
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalTax: number
    totalOrders: number
    netMargin: number
    createdAt: Date
}

// ============================================
// IN-MEMORY DATABASE
// ============================================

// Initialize inventory from default data
const inventory: InventoryItem[] = DEFAULT_INVENTORY.map((item, index) => ({
    id: index + 1,
    name: item.name,
    costPrice: item.costPrice,
    sellingPrice: item.sellingPrice,
    marginPercent: item.marginPercent,
    category: item.category,
    updatedAt: new Date()
}))

const salesRecords: SalesRecord[] = []

let inventoryIdCounter = inventory.length + 1
let salesIdCounter = 1

// ============================================
// DATABASE OPERATIONS
// ============================================

export const db = {
    // ==========================================
    // INVENTORY OPERATIONS
    // ==========================================
    
    getInventory: (): InventoryItem[] => [...inventory],

    getInventoryByName: (name: string): InventoryItem | undefined => {
        const lowerName = name.toLowerCase().trim()
        
        // Exact match
        let item = inventory.find(i => i.name.toLowerCase() === lowerName)
        if (item) return item
        
        // Partial match
        item = inventory.find(i => 
            i.name.toLowerCase().includes(lowerName) || 
            lowerName.includes(i.name.toLowerCase())
        )
        return item
    },

    getInventoryByCategory: (category: string): InventoryItem[] => {
        return inventory.filter(i => i.category === category)
    },

    getCostPrice: (itemName: string): { costPrice: number; marginPercent: number } => {
        const item = db.getInventoryByName(itemName)
        if (item) {
            return { costPrice: item.costPrice, marginPercent: item.marginPercent }
        }
        // Default: estimate 45% margin on unknown items
        return { costPrice: 0, marginPercent: 45 }
    },

    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'updatedAt'>): InventoryItem => {
        const newItem: InventoryItem = { 
            ...item, 
            id: inventoryIdCounter++,
            updatedAt: new Date()
        }
        inventory.push(newItem)
        return newItem
    },

    updateInventoryItem: (id: number, updates: Partial<InventoryItem>): InventoryItem | null => {
        const index = inventory.findIndex(i => i.id === id)
        if (index >= 0) {
            inventory[index] = { 
                ...inventory[index], 
                ...updates,
                updatedAt: new Date()
            }
            return inventory[index]
        }
        return null
    },

    deleteInventoryItem: (id: number): boolean => {
        const index = inventory.findIndex(i => i.id === id)
        if (index >= 0) {
            inventory.splice(index, 1)
            return true
        }
        return false
    },

    getInventoryCategories: (): string[] => {
        return [...new Set(inventory.map(i => i.category))]
    },

    getInventoryStats: () => {
        const categories = db.getInventoryCategories()
        return {
            totalItems: inventory.length,
            categories: categories.map(cat => ({
                name: cat,
                count: inventory.filter(i => i.category === cat).length,
                avgMargin: Math.round(
                    inventory
                        .filter(i => i.category === cat)
                        .reduce((sum, i) => sum + i.marginPercent, 0) / 
                    inventory.filter(i => i.category === cat).length
                )
            }))
        }
    },

    // ==========================================
    // SALES RECORDS OPERATIONS
    // ==========================================
    
    getSalesRecords: (): SalesRecord[] => [...salesRecords].reverse(),

    getSalesRecordById: (id: number): SalesRecord | undefined => {
        return salesRecords.find(r => r.id === id)
    },

    getSalesRecordsByDateRange: (startDate: string, endDate: string): SalesRecord[] => {
        return salesRecords.filter(r => r.date >= startDate && r.date <= endDate)
    },

    addSalesRecord: (record: Omit<SalesRecord, 'id' | 'createdAt'>): SalesRecord => {
        const newRecord: SalesRecord = {
            ...record,
            id: salesIdCounter++,
            createdAt: new Date()
        }
        salesRecords.push(newRecord)
        return newRecord
    },

    deleteSalesRecord: (id: number): boolean => {
        const index = salesRecords.findIndex(r => r.id === id)
        if (index >= 0) {
            salesRecords.splice(index, 1)
            return true
        }
        return false
    },

    // ==========================================
    // ANALYTICS OPERATIONS
    // ==========================================
    
    getDashboardStats: () => {
        if (salesRecords.length === 0) {
            return {
                totalRevenue: 0,
                totalProfit: 0,
                totalOrders: 0,
                avgMargin: 0,
                recordCount: 0
            }
        }

        const totals = salesRecords.reduce((acc, record) => ({
            revenue: acc.revenue + record.totalRevenue,
            profit: acc.profit + record.totalProfit,
            orders: acc.orders + record.totalOrders,
            tax: acc.tax + record.totalTax
        }), { revenue: 0, profit: 0, orders: 0, tax: 0 })

        return {
            totalRevenue: totals.revenue,
            totalProfit: totals.profit,
            totalOrders: totals.orders,
            totalTax: totals.tax,
            avgMargin: totals.revenue > 0 
                ? Math.round((totals.profit / totals.revenue) * 100 * 10) / 10 
                : 0,
            recordCount: salesRecords.length
        }
    },

    getCategoryAnalytics: () => {
        const categoryTotals = new Map<string, {
            revenue: number
            cost: number
            profit: number
            orders: number
            tax: number
        }>()

        salesRecords.forEach(record => {
            record.items.forEach(item => {
                const cat = item.category
                const current = categoryTotals.get(cat) || { revenue: 0, cost: 0, profit: 0, orders: 0, tax: 0 }
                categoryTotals.set(cat, {
                    revenue: current.revenue + item.netAmount,
                    cost: current.cost + item.totalCost,
                    profit: current.profit + item.profit,
                    orders: current.orders + item.quantity,
                    tax: current.tax + item.tax
                })
            })
        })

        return Array.from(categoryTotals.entries()).map(([name, data]) => ({
            name,
            ...data,
            margin: data.revenue > 0 ? Math.round((data.profit / data.revenue) * 100 * 10) / 10 : 0
        }))
    },

    getTopItems: (limit: number = 10) => {
        const itemTotals = new Map<string, {
            quantity: number
            revenue: number
            profit: number
        }>()

        salesRecords.forEach(record => {
            record.items.forEach(item => {
                const current = itemTotals.get(item.itemName) || { quantity: 0, revenue: 0, profit: 0 }
                itemTotals.set(item.itemName, {
                    quantity: current.quantity + item.quantity,
                    revenue: current.revenue + item.netAmount,
                    profit: current.profit + item.profit
                })
            })
        })

        return Array.from(itemTotals.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit)
    },

    getDailyTrends: () => {
        const dailyData = new Map<string, {
            revenue: number
            profit: number
            orders: number
        }>()

        salesRecords.forEach(record => {
            const current = dailyData.get(record.date) || { revenue: 0, profit: 0, orders: 0 }
            dailyData.set(record.date, {
                revenue: current.revenue + record.totalRevenue,
                profit: current.profit + record.totalProfit,
                orders: current.orders + record.totalOrders
            })
        })

        return Array.from(dailyData.entries())
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date))
    }
}
