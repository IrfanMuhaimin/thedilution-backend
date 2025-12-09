// database/seed.js
/**
 * Database Seeder CLI
 * Usage: node database/seed.js [seeder-name] [options]
 * 
 * Examples:
 *   node database/seed.js              - Run all seeders
 *   node database/seed.js users        - Seed only users
 *   node database/seed.js users 20     - Seed 20 users
 *   node database/seed.js inventory 50 - Seed 50 inventory items
 */

const DatabaseSeeder = require('./seeders/DatabaseSeeder');
const UserSeeder = require('./seeders/UserSeeder');
const InventorySeeder = require('./seeders/InventorySeeder');

const args = process.argv.slice(2);
const seederName = args[0];
const count = parseInt(args[1]) || undefined;

async function runSeeder() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     Database Seeder - TheDilution      ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    switch (seederName) {
      case 'users':
      case 'user':
        console.log('Running User Seeder...\n');
        const userSeeder = new UserSeeder();
        await userSeeder.run(count || 10);
        break;

      case 'inventory':
        console.log('Running Inventory Seeder...\n');
        const inventorySeeder = new InventorySeeder();
        await inventorySeeder.run(count || 20);
        break;

      case 'all':
      case undefined:
        console.log('Running All Seeders...\n');
        const databaseSeeder = new DatabaseSeeder();
        await databaseSeeder.run();
        break;

      default:
        console.log('❌ Unknown seeder:', seederName);
        console.log('\nAvailable seeders:');
        console.log('  - all       : Run all seeders (default)');
        console.log('  - users     : Seed users table');
        console.log('  - inventory : Seed inventory and stock tables');
        console.log('\nUsage: node database/seed.js [seeder-name] [count]');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

runSeeder();
