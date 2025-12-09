// database/seeders/DatabaseSeeder.js
const db = require('../../models');
const initializeFactories = require('../factories');

/**
 * Main Database Seeder
 * Seeds all tables with sample data
 */
class DatabaseSeeder {
  constructor() {
    this.factories = initializeFactories(db);
  }

  /**
   * Run all seeders
   */
  async run() {
    try {
      console.log('🌱 Starting database seeding...\n');

      // Sync database (be careful in production!)
      await db.sequelize.sync({ force: false });

      // Clear existing data (optional - comment out if you want to keep existing data)
      await this.clearDatabase();

      // Seed in order (respecting foreign key constraints)
      await this.seedUsers();
      await this.seedHardware();
      await this.seedInventory();
      await this.seedFormulas();
      await this.seedDilutions();
      await this.seedPrescriptionDetails();
      await this.seedInventoryStock();
      // Note: Skipping notifications as they require jobcards
      // await this.seedNotifications();

      console.log('\n✅ Database seeding completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      process.exit(1);
    }
  }

  /**
   * Clear all data from database
   */
  async clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    
    // Disable foreign key checks temporarily
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    try {
      // Delete in reverse order of dependencies
      await db.Notification.destroy({ where: {}, force: true });
      await db.InventoryStock.destroy({ where: {}, force: true });
      await db.Report.destroy({ where: {}, force: true });
      await db.Consumption.destroy({ where: {}, force: true });
      await db.Jobcard.destroy({ where: {}, force: true });
      await db.FormulaDetail.destroy({ where: {}, force: true });
      await db.Dilution.destroy({ where: {}, force: true });
      await db.PrescriptionDetail.destroy({ where: {}, force: true });
      await db.Formula.destroy({ where: {}, force: true });
      await db.Inventory.destroy({ where: {}, force: true });
      await db.HardwareLog.destroy({ where: {}, force: true });
      await db.Hardware.destroy({ where: {}, force: true });
      await db.User.destroy({ where: {}, force: true });

      console.log('✓ Database cleared\n');
    } finally {
      // Re-enable foreign key checks
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  }

  /**
   * Seed Users
   */
  async seedUsers() {
    console.log('👥 Seeding users...');
    
    // Create specific admin user
    const admin = await this.factories.User.create({
      username: 'admin',
      role: 'admin',
      department: 'Administration',
      status: 'active'
    });

    // Create random users
    const users = await this.factories.User.createMany(15);

    console.log(`✓ Created ${users.length + 1} users (including 1 admin)`);
    return { admin, users };
  }

  /**
   * Seed Hardware
   */
  async seedHardware() {
    console.log('🔧 Seeding hardware...');
    
    const hardware = await this.factories.Hardware.createMany(10);
    
    console.log(`✓ Created ${hardware.length} hardware items`);
    return hardware;
  }

  /**
   * Seed Inventory
   */
  async seedInventory() {
    console.log('📦 Seeding inventory...');
    
    // Get all users to assign inventory items
    const users = await db.User.findAll();
    const inventory = [];

    // Create inventory items assigned to random users
    for (let i = 0; i < 25; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const item = await this.factories.Inventory.create({
        userId: randomUser.userId
      });
      inventory.push(item);
    }
    
    console.log(`✓ Created ${inventory.length} inventory items`);
    return inventory;
  }

  /**
   * Seed Formulas
   */
  async seedFormulas() {
    console.log('🧪 Seeding formulas...');
    
    const formulas = await this.factories.Formula.createMany(12);
    
    console.log(`✓ Created ${formulas.length} formulas`);
    return formulas;
  }

  /**
   * Seed Dilutions
   */
  async seedDilutions() {
    console.log('💧 Seeding dilutions...');
    
    // Get all formulas
    const formulas = await db.Formula.findAll();
    const dilutions = [];

    // Create 2-3 dilutions per formula
    for (const formula of formulas) {
      const count = Math.floor(Math.random() * 2) + 2; // 2-3 dilutions
      for (let i = 0; i < count; i++) {
        const dilution = await this.factories.Dilution.create({
          formulaId: formula.formulaId
        });
        dilutions.push(dilution);
      }
    }
    
    console.log(`✓ Created ${dilutions.length} dilutions`);
    return dilutions;
  }

  /**
   * Seed Prescription Details
   */
  async seedPrescriptionDetails() {
    console.log('💊 Seeding prescription details...');
    
    const prescriptions = await this.factories.PrescriptionDetail.createMany(30);
    
    console.log(`✓ Created ${prescriptions.length} prescriptions`);
    return prescriptions;
  }

  /**
   * Seed Inventory Stock
   */
  async seedInventoryStock() {
    console.log('📊 Seeding inventory stock records...');
    
    // Get all inventory items
    const inventoryItems = await db.Inventory.findAll();
    const stockRecords = [];

    // Create 3-5 stock records per inventory item
    for (const item of inventoryItems) {
      const count = Math.floor(Math.random() * 3) + 3; // 3-5 records
      for (let i = 0; i < count; i++) {
        const record = await this.factories.InventoryStock.create({
          inventoryId: item.inventoryId
        });
        stockRecords.push(record);
      }
    }
    
    console.log(`✓ Created ${stockRecords.length} inventory stock records`);
    return stockRecords;
  }

  /**
   * Seed Notifications
   */
  async seedNotifications() {
    console.log('🔔 Seeding notifications...');
    
    // Get all users
    const users = await db.User.findAll();
    const notifications = [];

    // Create 3-5 notifications per user
    for (const user of users) {
      const count = Math.floor(Math.random() * 3) + 3; // 3-5 notifications
      for (let i = 0; i < count; i++) {
        const notification = await this.factories.Notification.create({
          userId: user.userId
        });
        notifications.push(notification);
      }
    }
    
    console.log(`✓ Created ${notifications.length} notifications`);
    return notifications;
  }
}

module.exports = DatabaseSeeder;
