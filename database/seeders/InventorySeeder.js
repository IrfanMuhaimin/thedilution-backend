// database/seeders/InventorySeeder.js
const db = require('../../models');
const initializeFactories = require('../factories');

/**
 * Inventory Seeder
 * Seeds inventory and inventory stock tables
 */
class InventorySeeder {
  constructor() {
    this.factories = initializeFactories(db);
  }

  async run(count = 20) {
    try {
      console.log(`🌱 Seeding ${count} inventory items...`);

      // Get users to assign inventory items
      const users = await db.User.findAll();
      if (users.length === 0) {
        console.log('⚠️  No users found. Please run UserSeeder first.');
        return;
      }

      const inventory = [];
      for (let i = 0; i < count; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const item = await this.factories.Inventory.create({
          userId: randomUser.userId
        });
        inventory.push(item);

        // Create stock records for this inventory item
        const stockCount = Math.floor(Math.random() * 3) + 2; // 2-4 records
        for (let j = 0; j < stockCount; j++) {
          await this.factories.InventoryStock.create({
            inventoryId: item.inventoryId
          });
        }
      }

      console.log(`✅ Successfully created ${count} inventory items with stock records`);
      return inventory;
    } catch (error) {
      console.error('❌ Error seeding inventory:', error);
      throw error;
    }
  }
}

module.exports = InventorySeeder;
