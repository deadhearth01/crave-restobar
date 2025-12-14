/**
 * Inventory Data - Default items with realistic cost margins
 * 
 * Cost Margin Strategy:
 * - High margin items (60-70% profit): Drinks, Mocktails, Sodas
 * - Medium margin items (45-55% profit): Main dishes, Starters
 * - Low margin items (30-40% profit): Premium items, Imported drinks
 * 
 * Formula: Profit Margin = (Selling Price - Cost) / Selling Price × 100
 */

export interface InventoryItemData {
    name: string
    costPrice: number
    category: string
    sellingPrice: number  // Approximate selling price for reference
    marginPercent: number // Target profit margin
}

// Calculate cost from selling price and desired margin
// Cost = Selling Price × (1 - Margin/100)
function calcCost(sellingPrice: number, marginPercent: number): number {
    return Math.round(sellingPrice * (1 - marginPercent / 100))
}

export const DEFAULT_INVENTORY: InventoryItemData[] = [
    // ============================================
    // DINE IN FOOD MENU - Mixed margins (40-55%)
    // ============================================
    
    // Soups - 50% margin
    { name: 'Non Veg Sweet Corn Soup', costPrice: calcCost(199, 50), category: 'Dine In Food Menu', sellingPrice: 199, marginPercent: 50 },
    
    // Starters - 45-55% margin
    { name: 'Crispy Corn', costPrice: calcCost(249, 52), category: 'Dine In Food Menu', sellingPrice: 249, marginPercent: 52 },
    { name: 'Mushroom Salt And Pepper', costPrice: calcCost(299, 50), category: 'Dine In Food Menu', sellingPrice: 299, marginPercent: 50 },
    { name: 'Chilli Chicken', costPrice: calcCost(349, 48), category: 'Dine In Food Menu', sellingPrice: 349, marginPercent: 48 },
    { name: 'Chilli Prawns', costPrice: calcCost(449, 42), category: 'Dine In Food Menu', sellingPrice: 449, marginPercent: 42 },
    { name: 'Dragon Chicken', costPrice: calcCost(349, 48), category: 'Dine In Food Menu', sellingPrice: 349, marginPercent: 48 },
    { name: 'Chilli Egg', costPrice: calcCost(249, 50), category: 'Dine In Food Menu', sellingPrice: 249, marginPercent: 50 },
    { name: 'Chicken Lollipop', costPrice: calcCost(399, 45), category: 'Dine In Food Menu', sellingPrice: 399, marginPercent: 45 },
    { name: 'Chicken Drum Sticks', costPrice: calcCost(399, 45), category: 'Dine In Food Menu', sellingPrice: 399, marginPercent: 45 },
    { name: 'Appolo Fish', costPrice: calcCost(299, 48), category: 'Dine In Food Menu', sellingPrice: 299, marginPercent: 48 },
    { name: 'Pepper Chicken', costPrice: calcCost(399, 47), category: 'Dine In Food Menu', sellingPrice: 399, marginPercent: 47 },
    { name: 'Chilli Loose Prawn', costPrice: calcCost(449, 40), category: 'Dine In Food Menu', sellingPrice: 449, marginPercent: 40 },
    { name: 'Chicken Roast', costPrice: calcCost(349, 48), category: 'Dine In Food Menu', sellingPrice: 349, marginPercent: 48 },
    { name: 'Chicken 65', costPrice: calcCost(349, 48), category: 'Dine In Food Menu', sellingPrice: 349, marginPercent: 48 },
    { name: 'Crunchi Chicken', costPrice: calcCost(399, 47), category: 'Dine In Food Menu', sellingPrice: 399, marginPercent: 47 },
    
    // Sides - 55% margin (low cost items)
    { name: 'Salt French Fries', costPrice: calcCost(199, 60), category: 'Dine In Food Menu', sellingPrice: 199, marginPercent: 60 },
    { name: 'Green Salda', costPrice: calcCost(149, 65), category: 'Dine In Food Menu', sellingPrice: 149, marginPercent: 65 },
    
    // Dry fruits - 35% margin (expensive ingredient)
    { name: 'Kaju Fry', costPrice: calcCost(349, 35), category: 'Dine In Food Menu', sellingPrice: 349, marginPercent: 35 },
    { name: 'kaju chicken', costPrice: calcCost(399, 38), category: 'Dine In Food Menu', sellingPrice: 399, marginPercent: 38 },
    
    // Rice items - 50% margin
    { name: 'Veg Fried Rice', costPrice: calcCost(249, 55), category: 'Dine In Food Menu', sellingPrice: 249, marginPercent: 55 },
    { name: 'Egg Fried Rice', costPrice: calcCost(279, 52), category: 'Dine In Food Menu', sellingPrice: 279, marginPercent: 52 },
    { name: 'spl veg fried rice', costPrice: calcCost(299, 50), category: 'Dine In Food Menu', sellingPrice: 299, marginPercent: 50 },
    { name: 'spl non veg fried rice', costPrice: calcCost(349, 48), category: 'Dine In Food Menu', sellingPrice: 349, marginPercent: 48 },
    { name: 'mixed non veg fried rice', costPrice: calcCost(399, 45), category: 'Dine In Food Menu', sellingPrice: 399, marginPercent: 45 },
    
    // Biriyani - 42% margin (premium item)
    { name: 'Konaseema Boneless Biriyani', costPrice: calcCost(449, 42), category: 'Dine In Food Menu', sellingPrice: 449, marginPercent: 42 },
    
    // Prawns - 38% margin (expensive seafood)
    { name: 'butter garlice prwans', costPrice: calcCost(499, 38), category: 'Dine In Food Menu', sellingPrice: 499, marginPercent: 38 },
    
    // ============================================
    // BAR MENU - Drinks have highest margins (55-70%)
    // ============================================
    
    // Soft Drinks - 70% margin (very low cost)
    { name: 'Coke', costPrice: calcCost(99, 70), category: 'Bar Menu', sellingPrice: 99, marginPercent: 70 },
    { name: 'Thumsup', costPrice: calcCost(99, 70), category: 'Bar Menu', sellingPrice: 99, marginPercent: 70 },
    { name: 'Sprit', costPrice: calcCost(99, 70), category: 'Bar Menu', sellingPrice: 99, marginPercent: 70 },
    { name: 'Fresh Lemon Soda', costPrice: calcCost(129, 72), category: 'Bar Menu', sellingPrice: 129, marginPercent: 72 },
    
    // Mocktails - 65% margin
    { name: 'Blue Lagoon', costPrice: calcCost(199, 65), category: 'Bar Menu', sellingPrice: 199, marginPercent: 65 },
    { name: 'Orange Mojito', costPrice: calcCost(199, 65), category: 'Bar Menu', sellingPrice: 199, marginPercent: 65 },
    { name: 'Mango Mojito', costPrice: calcCost(199, 65), category: 'Bar Menu', sellingPrice: 199, marginPercent: 65 },
    { name: 'Pineapple Mojito', costPrice: calcCost(199, 65), category: 'Bar Menu', sellingPrice: 199, marginPercent: 65 },
    { name: 'Virgin Mojito', costPrice: calcCost(179, 65), category: 'Bar Menu', sellingPrice: 179, marginPercent: 65 },
    { name: 'Mint & Mango', costPrice: calcCost(199, 65), category: 'Bar Menu', sellingPrice: 199, marginPercent: 65 },
    
    // Energy Drinks - 55% margin
    { name: 'Red Bull', costPrice: calcCost(249, 55), category: 'Bar Menu', sellingPrice: 249, marginPercent: 55 },
    
    // Premium Mixers - 45% margin
    { name: 'Cranberry (premium)', costPrice: calcCost(249, 45), category: 'Bar Menu', sellingPrice: 249, marginPercent: 45 },
    
    // Beer - Domestic - 50% margin
    { name: 'Kf Strong', costPrice: calcCost(299, 50), category: 'Bar Menu', sellingPrice: 299, marginPercent: 50 },
    { name: 'Kf Ultra', costPrice: calcCost(349, 48), category: 'Bar Menu', sellingPrice: 349, marginPercent: 48 },
    
    // Beer - Premium/Imported - 40% margin
    { name: 'Heineken Tin', costPrice: calcCost(399, 40), category: 'Bar Menu', sellingPrice: 399, marginPercent: 40 },
    { name: 'Budweiser', costPrice: calcCost(349, 42), category: 'Bar Menu', sellingPrice: 349, marginPercent: 42 },
    { name: 'Budweiser Magnum', costPrice: calcCost(449, 40), category: 'Bar Menu', sellingPrice: 449, marginPercent: 40 },
    { name: 'Budweiser 500ml', costPrice: calcCost(399, 42), category: 'Bar Menu', sellingPrice: 399, marginPercent: 42 },
    
    // Cocktails - 60% margin (high profit on mixed drinks)
    { name: 'Screwdriver', costPrice: calcCost(399, 60), category: 'Bar Menu', sellingPrice: 399, marginPercent: 60 },
    
    // Spirits - 55% margin (30ml pours)
    { name: 'Absolut (30 Ml)', costPrice: calcCost(299, 55), category: 'Bar Menu', sellingPrice: 299, marginPercent: 55 },
    { name: 'Black Dog (30 Ml)', costPrice: calcCost(299, 55), category: 'Bar Menu', sellingPrice: 299, marginPercent: 55 },
    { name: 'M.m Green 30ml', costPrice: calcCost(199, 58), category: 'Bar Menu', sellingPrice: 199, marginPercent: 58 },
    { name: 'MC 1 QUTR', costPrice: calcCost(349, 52), category: 'Bar Menu', sellingPrice: 349, marginPercent: 52 },
    
    // Wine - 45% margin
    { name: 'Jocobs Greek (150 Ml)', costPrice: calcCost(799, 45), category: 'Bar Menu', sellingPrice: 799, marginPercent: 45 },
    
    // ============================================
    // OTHERS - Water, etc.
    // ============================================
    { name: 'Water Bottle', costPrice: calcCost(49, 60), category: 'Others', sellingPrice: 49, marginPercent: 60 },
]

// Helper to get cost by item name (case-insensitive fuzzy match)
export function getItemCost(itemName: string): { costPrice: number; marginPercent: number } | null {
    const name = itemName.trim().toLowerCase()
    
    // Exact match first
    const exactMatch = DEFAULT_INVENTORY.find(
        item => item.name.toLowerCase() === name
    )
    if (exactMatch) {
        return { costPrice: exactMatch.costPrice, marginPercent: exactMatch.marginPercent }
    }
    
    // Partial match
    const partialMatch = DEFAULT_INVENTORY.find(
        item => item.name.toLowerCase().includes(name) || name.includes(item.name.toLowerCase())
    )
    if (partialMatch) {
        return { costPrice: partialMatch.costPrice, marginPercent: partialMatch.marginPercent }
    }
    
    return null
}

// Get all items by category
export function getItemsByCategory(category: string): InventoryItemData[] {
    return DEFAULT_INVENTORY.filter(item => item.category === category)
}

// Get all categories
export function getAllCategories(): string[] {
    return [...new Set(DEFAULT_INVENTORY.map(item => item.category))]
}
