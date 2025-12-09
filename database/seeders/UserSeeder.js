// database/seeders/UserSeeder.js
const db = require('../../models');
const initializeFactories = require('../factories');

/**
 * User Seeder
 * Seeds only users table
 */
class UserSeeder {
  constructor() {
    this.factories = initializeFactories(db);
  }

  async run(count = 10) {
    try {
      console.log(`🌱 Seeding ${count} users...`);

      // Create admin user
      const admin = await this.factories.User.create({
        username: 'admin',
        role: 'admin',
        department: 'Administration',
        status: 'active'
      });
      console.log('✓ Created admin user (username: admin, password: password123)');

      // Create pharmacist user
      const pharmacist = await this.factories.User.create({
        username: 'pharmacist',
        role: 'pharmacist',
        department: 'Pharmacy',
        status: 'active'
      });
      console.log('✓ Created pharmacist user (username: pharmacist, password: password123)');

      // Create manager user
      const manager = await this.factories.User.create({
        username: 'manager',
        role: 'manager',
        department: 'Management',
        status: 'active'
      });
      console.log('✓ Created manager user (username: manager, password: password123)');

      // Create random users
      const users = await this.factories.User.createMany(count - 3);

      console.log(`✅ Successfully created ${count} users`);
      return { admin, pharmacist, manager, users };
    } catch (error) {
      console.error('❌ Error seeding users:', error);
      throw error;
    }
  }
}

module.exports = UserSeeder;
