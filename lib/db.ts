import Dexie, { Table } from 'dexie'

// Database schema types
export interface InventoryItem {
    id?: number
    name: string
    costPrice: number
    category: string
    createdAt: Date
    updatedAt: Date
}

export interface SaleItem {
    itemName: string
    quantity: number
    myAmount: number
    totalDiscount: number
    netAmount: number
    totalTax: number
    totalSales: number
    category?: string
    costPrice?: number
    profit?: number
    margin?: number
}

export interface SalesRecord {
    id?: number
    date: string // YYYY-MM-DD format
    dateRange?: string // Original date range from Excel
    fileName: string
    items: SaleItem[]
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalOrders: number
    totalTax: number
    grossRevenue: number
    netMargin: number
    processedAt: Date
}

// Dexie database
class RestoBarDB extends Dexie {
    inventory!: Table<InventoryItem, number>
    salesRecords!: Table<SalesRecord, number>

    constructor() {
        super('RestoBarDB')
        this.version(1).stores({
            inventory: '++id, name, category, createdAt',
            salesRecords: '++id, date, processedAt',
        })
    }
}

export const db = new RestoBarDB()

// Inventory operations
export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    return await db.inventory.add({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
}

export async function updateInventoryItem(id: number, updates: Partial<InventoryItem>) {
    return await db.inventory.update(id, {
        ...updates,
        updatedAt: new Date(),
    })
}

export async function deleteInventoryItem(id: number) {
    return await db.inventory.delete(id)
}

export async function getAllInventoryItems(): Promise<InventoryItem[]> {
    return await db.inventory.toArray()
}

export async function getInventoryByName(name: string): Promise<InventoryItem | undefined> {
    return await db.inventory.where('name').equalsIgnoreCase(name).first()
}

// Sales operations
export async function addSalesRecord(record: Omit<SalesRecord, 'id' | 'processedAt'>) {
    return await db.salesRecords.add({
        ...record,
        processedAt: new Date(),
    })
}

export async function getAllSalesRecords(): Promise<SalesRecord[]> {
    return await db.salesRecords.orderBy('date').reverse().toArray()
}

export async function getSalesRecordById(id: number): Promise<SalesRecord | undefined> {
    return await db.salesRecords.get(id)
}

export async function getSalesRecordsByDateRange(startDate: string, endDate: string): Promise<SalesRecord[]> {
    return await db.salesRecords
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray()
}

export async function deleteSalesRecord(id: number) {
    return await db.salesRecords.delete(id)
}
