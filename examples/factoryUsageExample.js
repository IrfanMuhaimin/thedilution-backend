// examples/factoryUsageExample.js
/**
 * Example: Using Factories in Your Code
 * 
 * This file demonstrates various ways to use the factory system
 * for testing, seeding, or any other data generation needs.
 */

const db = require('../models');
const initializeFactories = require('../database/factories');

async function exampleUsage() {
  try {
    // Initialize factories
    const factories = initializeFactories(db);

    console.log('=== Factory Usage Examples ===\n');

    // --- Example 1: Create a single user ---
    console.log('1. Creating a single user...');
    const user = await factories.User.create();
    console.log('Created user:', user.username);

    // --- Example 2: Create user with custom attributes ---
    console.log('\n2. Creating admin user with custom attributes...');
    const admin = await factories.User.create({
      username: 'custom_admin',
      role: 'admin',
      department: 'IT',
      status: 'active'
    });
    console.log('Created admin:', admin.username);

    // --- Example 3: Create multiple users ---
    console.log('\n3. Creating 5 users at once...');
    const users = await factories.User.createMany(5);
    console.log(`Created ${users.length} users`);

    // --- Example 4: Create users with same override ---
    console.log('\n4. Creating 3 active pharmacists...');
    const pharmacists = await factories.User.createMany(3, {
      role: 'pharmacist',
      status: 'active',
      department: 'Pharmacy'
    });
    console.log(`Created ${pharmacists.length} pharmacists`);

    // --- Example 5: Create related data ---
    console.log('\n5. Creating inventory for a user...');
    const inventory = await factories.Inventory.create({
      userId: user.userId,
      name: 'Aspirin',
      quantity: 1000,
      status: 'available'
    });
    console.log('Created inventory:', inventory.name);

    // --- Example 6: Create stock records for inventory ---
    console.log('\n6. Creating stock records for inventory...');
    const stockRecords = await factories.InventoryStock.createMany(3, {
      inventoryId: inventory.inventoryId
    });
    console.log(`Created ${stockRecords.length} stock records`);

    // --- Example 7: Make without saving (for testing) ---
    console.log('\n7. Making user instance without saving...');
    const userInstance = factories.User.make({
      username: 'test_user'
    });
    console.log('Made user (not saved):', userInstance.username);

    // --- Example 8: Get raw attributes ---
    console.log('\n8. Getting raw user attributes...');
    const rawAttributes = factories.User.raw({
      username: 'raw_user'
    });
    console.log('Raw attributes:', rawAttributes);

    // --- Example 9: Complex relationship ---
    console.log('\n9. Creating formula with dilutions...');
    const formula = await factories.Formula.create({
      name: 'Custom Pain Relief Formula'
    });
    
    // Create 3 dilutions for this formula
    const dilutions = await factories.Dilution.createMany(3, {
      formulaId: formula.formulaId
    });
    console.log(`Created formula with ${dilutions.length} dilutions`);

    // --- Example 10: Bulk operation with loop ---
    console.log('\n10. Creating hardware with maintenance logs...');
    const hardware = await factories.Hardware.create({
      name: 'Automated Dispenser X1',
      status: true
    });
    console.log('Created hardware:', hardware.name);

    console.log('\n=== All examples completed successfully! ===');
    
  } catch (error) {
    console.error('Error in example:', error);
  } finally {
    // Close database connection
    await db.sequelize.close();
  }
}

// Uncomment to run examples
// exampleUsage();

module.exports = exampleUsage;
