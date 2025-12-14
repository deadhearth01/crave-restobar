// Script to pre-populate inventory with items from Excel
// Run this once: node scripts/populate-inventory.js

const { db } = require('../lib/db');

const inventoryItems = [
    // Items found in test Excel with 40-50% margin pricing
    { name: 'Chilli Chicken', costPrice: 175, category: 'Food' },
    { name: 'Chicken Lollipop', costPrice: 200, category: 'Food' },
    { name: 'Budweiser Magnum', costPrice: 350, category: 'Beverage' },

    // Additional common items with ~50% margin
    { name: 'Non Veg Sweet Corn Soup', costPrice: 100, category: 'Soup' },
    { name: 'Crispy Corn', costPrice: 124, category: 'Appetizer' },
    { name: 'Mushroom Salt And Pepper', costPrice: 149, category: 'Appetizer' },
    { name: 'Chilli Prawns', costPrice: 224, category: 'Seafood' },
    { name: 'Dragon Chicken', costPrice: 174, category: 'Food' },
    { name: 'Chilli Egg', costPrice: 124, category: 'Food' },
    { name: 'Chicken Drum Sticks', costPrice: 199, category: 'Food' },
    { name: 'Appolo Fish', costPrice: 149, category: 'Seafood' },
    { name: 'Pepper Chicken', costPrice: 199, category: 'Food' },
    { name: 'Chilli Loose Prawn', costPrice: 224, category: 'Seafood' },
    { name: 'Chicken Roast', costPrice: 174, category: 'Food' },
    { name: 'Chicken 65', costPrice: 174, category: 'Food' },
    { name: 'Salt French Fries', costPrice: 124, category: 'Sides' },
    { name: 'Kaju Fry', costPrice: 149, category: 'Appetizer' },
    { name: 'Crunchi Chicken', costPrice: 199, category: 'Food' },
    { name: 'Veg Fried Rice', costPrice: 149, category: 'Rice' },
    { name: 'Egg Fried Rice', costPrice: 149, category: 'Rice' },
    { name: 'Konaseema Boneless Biriyani', costPrice: 199, category: 'Biriyani' },
    { name: 'Green Salda', costPrice: 124, category: 'Salad' },
    { name: 'butter garlice prwans', costPrice: 224, category: 'Seafood' },
    { name: 'kaju chicken', costPrice: 199, category: 'Food' },
    { name: 'mixed non veg fried rice', costPrice: 249, category: 'Rice' },
    { name: 'spl non veg fried rice', costPrice: 199, category: 'Rice' },
    { name: 'spl veg fried rice', costPrice: 174, category: 'Rice' },

    // Beverages
    { name: 'Coke', costPrice: 48, category: 'Beverage' },
    { name: 'Screwdriver', costPrice: 399, category: 'Cocktail' },
    { name: 'Kf Strong', costPrice: 249, category: 'Beer' },
    { name: 'Kf Ultra', costPrice: 274, category: 'Beer' },
    { name: 'Cranberry (premium)', costPrice: 158, category: 'Mocktail' },
    { name: 'Blue Lagoon', costPrice: 124, category: 'Mocktail' },
    { name: 'Orange Mojito', costPrice: 124, category: 'Mocktail' },
    { name: 'Mango Mojito', costPrice: 124, category: 'Mocktail' },
    { name: 'Pineapple Mojito', costPrice: 124, category: 'Mocktail' },
    { name: 'Mint & Mango', costPrice: 124, category: 'Mocktail' },
    { name: 'Fresh Lemon Soda', costPrice: 60, category: 'Beverage' },
    { name: 'Absolut (30 Ml)', costPrice: 174, category: 'Spirits' },
    { name: 'Jocobs Greek (150 Ml)', costPrice: 649, category: 'Wine' },
    { name: 'Black Dog (30 Ml)', costPrice: 174, category: 'Whisky' },
    { name: 'MC 1 QUTR', costPrice: 150, category: 'Spirits' },
    { name: 'Heineken Tin', costPrice: 224, category: 'Beer' },
    { name: 'Virgin Mojito', costPrice: 124, category: 'Mocktail' },
    { name: 'M.m Green 30ml', costPrice: 99, category: 'Spirits' },
    { name: 'Water Bottle', costPrice: 30, category: 'Beverage' },
    { name: 'Thumsup', costPrice: 60, category: 'Beverage' },
    { name: 'Sprit', costPrice: 60, category: 'Beverage' },
    { name: 'Red Bull', costPrice: 124, category: 'Energy Drink' },
    { name: 'Budweiser', costPrice: 324, category: 'Beer' },
    { name: 'Budweiser 500ml', costPrice: 249, category: 'Beer' },
];

async function populateInventory() {
    console.log('🌱 Populating inventory with', inventoryItems.length, 'items...');

    try {
        // Clear existing inventory (optional)
        // await db.inventory.clear();

        for (const item of inventoryItems) {
            await db.inventory.add({
                ...item,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`  ✓ Added: ${item.name} (₹${item.costPrice})`);
        }

        console.log('\n✅ Inventory populated successfully!');
        console.log('\n📊 Summary:');
        console.log(`  Total items: ${inventoryItems.length}`);
        console.log(`  Categories: ${[...new Set(inventoryItems.map(i => i.category))].join(', ')}`);

    } catch (error) {
        console.error('❌ Error populating inventory:', error);
    }
}

// Run if called directly
if (require.main === module) {
    populateInventory();
}

module.exports = { populateInventory, inventoryItems };
