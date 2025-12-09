// database/clearDatabase.js
/**
 * Clear Database Script
 * Removes all data from the database
 * Usage: node database/clearDatabase.js
 */

const db = require('../models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function clearDatabase() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║        Clear Database Utility          ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  
  rl.question('\nAre you sure you want to continue? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes') {
      try {
        console.log('\n🗑️  Clearing database...\n');

        // Disable foreign key checks temporarily
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Delete in reverse order of dependencies
        await db.Notification.destroy({ where: {}, force: true });
        console.log('✓ Cleared Notifications');

        await db.InventoryStock.destroy({ where: {}, force: true });
        console.log('✓ Cleared Inventory Stock');

        await db.Report.destroy({ where: {}, force: true });
        console.log('✓ Cleared Reports');

        await db.Consumption.destroy({ where: {}, force: true });
        console.log('✓ Cleared Consumption');

        await db.Jobcard.destroy({ where: {}, force: true });
        console.log('✓ Cleared Jobcards');

        await db.FormulaDetail.destroy({ where: {}, force: true });
        console.log('✓ Cleared Formula Details');

        await db.Dilution.destroy({ where: {}, force: true });
        console.log('✓ Cleared Dilutions');

        await db.PrescriptionDetail.destroy({ where: {}, force: true });
        console.log('✓ Cleared Prescription Details');

        await db.Formula.destroy({ where: {}, force: true });
        console.log('✓ Cleared Formulas');

        await db.Inventory.destroy({ where: {}, force: true });
        console.log('✓ Cleared Inventory');

        await db.HardwareLog.destroy({ where: {}, force: true });
        console.log('✓ Cleared Hardware Logs');

        await db.Hardware.destroy({ where: {}, force: true });
        console.log('✓ Cleared Hardware');

        await db.User.destroy({ where: {}, force: true });
        console.log('✓ Cleared Users');

        // Re-enable foreign key checks
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n✅ Database cleared successfully!');
        process.exit(0);
      } catch (error) {
        console.error('\n❌ Error clearing database:', error);
        process.exit(1);
      }
    } else {
      console.log('\n❌ Operation cancelled.');
      process.exit(0);
    }
    rl.close();
  });
}

clearDatabase();
