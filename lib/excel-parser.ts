import * as XLSX from 'xlsx'
import { SaleItem, getInventoryByName } from './db'

export interface ParsedExcelData {
    dateRange: string
    date: string
    items: SaleItem[]
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalOrders: number
    totalTax: number
    grossRevenue: number
    netMargin: number
}

export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

                // Extract date range from row 1
                let dateRange = ''
                let extractedDate = new Date().toISOString().split('T')[0]

                if (jsonData[1] && jsonData[1][0]) {
                    const headerText = String(jsonData[1][0])
                    const match = headerText.match(/(\d{2}-\d{2}-\d{4})\s+to\s+(\d{2}-\d{2}-\d{4})/)
                    if (match) {
                        dateRange = `${match[1]} to ${match[2]}`
                        const dateParts = match[2].split('-')
                        extractedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
                    }
                }

                const items: SaleItem[] = []
                let currentCategory = ''
                let totalRevenue = 0
                let accumulatedTax = 0

                // Parse items
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i]

                    // Skip empty rows
                    if (!row || row.length === 0) continue

                    const firstCell = row[0]

                    // Skip summary rows (Max/Min/Avg/Total)
                    if (firstCell && ['Max', 'Min', 'Avg', 'Total'].includes(String(firstCell).trim())) continue

                    // Detect category rows: non-null string in col 0, no numeric data in col 2
                    if (firstCell && typeof firstCell === 'string' && !row[2]) {
                        const catName = String(firstCell).trim()
                        if (!catName.includes('Sub Total') && !catName.includes('Round off') &&
                            !catName.includes('Hotel') && !catName.includes('Group Report')) {
                            currentCategory = catName
                        }
                        continue
                    }

                    // Parse item rows: null/undefined in col 0, item name in col 1, numeric quantity in col 2
                    if ((firstCell === null || firstCell === undefined) && row[1] && typeof row[2] === 'number') {
                        const itemName = String(row[1]).trim()
                        const quantity = Number(row[2]) || 0
                        const myAmount = Number(row[3]) || 0
                        const totalDiscount = Number(row[4]) || 0
                        const netAmount = Number(row[5]) || 0
                        const tax = Number(row[6]) || 0
                        const totalSales = Number(row[7]) || 0

                        // Get cost from inventory
                        const inventoryItem = await getInventoryByName(itemName)
                        const costPrice = inventoryItem?.costPrice || 0

                        // Calculate item profit: Net Amount - (Cost × Qty)
                        const itemProfit = netAmount - (costPrice * quantity)
                        const margin = netAmount > 0 ? ((itemProfit / netAmount) * 100) : 0

                        items.push({
                            itemName,
                            category: currentCategory,
                            quantity,
                            costPrice,
                            myAmount,
                            totalDiscount,
                            netAmount,
                            totalTax: tax,
                            totalSales,
                            profit: itemProfit,
                            margin
                        })

                        totalRevenue += netAmount
                        accumulatedTax += tax
                    }
                }

                // Calculate totals
                const calculatedTotalCost = items.reduce((sum, item) => sum + ((item.costPrice || 0) * item.quantity), 0)
                const grossProfit = totalRevenue - calculatedTotalCost

                // Subtract tax from profit
                const netProfit = grossProfit - accumulatedTax
                const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0

                resolve({
                    date: extractedDate,
                    dateRange,
                    items,
                    totalRevenue,
                    totalCost: calculatedTotalCost,
                    totalProfit: netProfit,
                    totalOrders: items.reduce((sum, item) => sum + item.quantity, 0),
                    totalTax: accumulatedTax,
                    grossRevenue: totalRevenue,
                    netMargin
                })
            } catch (error) {
                reject(error)
            }
        }

        reader.onerror = (error) => reject(error)
        reader.readAsBinaryString(file)
    })
}

export function validateExcelFile(file: File): { valid: boolean; error?: string } {
    const validExtensions = ['.xlsx', '.xls']
    const maxSize = 5 * 1024 * 1024

    const fileName = file.name.toLowerCase()
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

    if (!hasValidExtension) {
        return {
            valid: false,
            error: 'Invalid file format. Please upload .xlsx or .xls file.',
        }
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size exceeds 5MB limit.',
        }
    }

    return { valid: true }
}
