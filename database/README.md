# Database Factory & Seeder System

This project includes a Laravel-style factory and seeder system for generating fake data in your Node.js/Sequelize backend.

## 📁 Structure

```
database/
├── factories/
│   ├── baseFactory.js              # Base factory helper
│   ├── user.factory.js             # User factory
│   ├── hardware.factory.js         # Hardware factory
│   ├── inventory.factory.js        # Inventory factory
│   ├── formula.factory.js          # Formula factory
│   ├── dilution.factory.js         # Dilution factory
│   ├── prescriptionDetail.factory.js
│   ├── inventoryStock.factory.js
│   ├── notification.factory.js
│   └── index.js                    # Factory registry
├── seeders/
│   ├── DatabaseSeeder.js           # Main seeder (all tables)
│   ├── UserSeeder.js               # User-specific seeder
│   └── InventorySeeder.js          # Inventory-specific seeder
├── seed.js                         # CLI for running seeders
└── clearDatabase.js                # Database cleanup utility
```

## 🚀 Quick Start

### Seed All Tables

```bash
npm run db:seed
```

This will seed all tables with realistic fake data:
- 16 Users (including admin, pharmacist, manager)
- 10 Hardware items
- 25 Inventory items
- 12 Formulas with dilutions
- 30 Prescription details
- Stock records for all inventory
- Notifications for all users

### Seed Specific Tables

```bash
# Seed only users (default: 10 users)
npm run db:seed:users

# Seed custom number of users
node database/seed.js users 20

# Seed inventory items
npm run db:seed:inventory

# Seed custom number of inventory items
node database/seed.js inventory 50
```

### Clear Database

```bash
npm run db:clear
```

**⚠️ Warning:** This will delete ALL data from your database!

## 🏭 Using Factories

Factories allow you to generate fake data programmatically. You can use them in your tests or custom seeders.

### Basic Usage

```javascript
const db = require('./models');
const initializeFactories = require('./database/factories');

// Initialize factories
const factories = initializeFactories(db);

// Create a single user
const user = await factories.User.create();

// Create a user with custom attributes
const admin = await factories.User.create({
  username: 'admin',
  role: 'admin'
});

// Create multiple users
const users = await factories.User.createMany(10);

// Create with overrides for all instances
const activeUsers = await factories.User.createMany(5, {
  status: 'active'
});
```

### Factory Methods

Each factory has these methods:

- **`create(overrides)`** - Create and save one instance
- **`createMany(count, overrides)`** - Create and save multiple instances
- **`make(overrides)`** - Build instance without saving (for testing)
- **`raw(overrides)`** - Get raw attributes object

### Example: Custom Seeder

```javascript
// database/seeders/CustomSeeder.js
const db = require('../../models');
const initializeFactories = require('../factories');

class CustomSeeder {
  constructor() {
    this.factories = initializeFactories(db);
  }

  async run() {
    // Create specific users
    const admin = await this.factories.User.create({
      username: 'admin',
      role: 'admin',
      department: 'Administration',
      status: 'active'
    });

    // Create inventory for this user
    const inventory = await this.factories.Inventory.createMany(5, {
      userId: admin.userId,
      status: 'available'
    });

    // Create stock records for each inventory item
    for (const item of inventory) {
      await this.factories.InventoryStock.create({
        inventoryId: item.inventoryId,
        transactionType: 'incoming',
        quantity: 1000
      });
    }

    console.log('✅ Custom seeding completed!');
  }
}

module.exports = CustomSeeder;
```

## 🔑 Default Test Credentials

The seeder creates these default users for testing:

| Username   | Password    | Role       | Department     |
|------------|-------------|------------|----------------|
| admin      | password123 | admin      | Administration |
| pharmacist | password123 | pharmacist | Pharmacy       |
| manager    | password123 | manager    | Management     |

## 📝 Creating New Factories

To create a factory for a new model:

1. Create a new file in `database/factories/`:

```javascript
// database/factories/myModel.factory.js
const { defineFactory } = require('./baseFactory');

const MyModelFactory = (db) => {
  return defineFactory(db.MyModel, (faker) => {
    return {
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      createdAt: faker.date.past()
    };
  });
};

module.exports = MyModelFactory;
```

2. Register it in `database/factories/index.js`:

```javascript
const MyModelFactory = require('./myModel.factory');

const initializeFactories = (db) => {
  return {
    // ... other factories
    MyModel: MyModelFactory(db)
  };
};
```

3. Use it in your seeders:

```javascript
const items = await this.factories.MyModel.createMany(10);
```

## 🎲 Faker.js

This system uses [@faker-js/faker](https://fakerjs.dev/) to generate realistic fake data. You have access to many data generators:

```javascript
faker.person.fullName()           // "John Doe"
faker.internet.email()            // "john@example.com"
faker.date.past()                 // Random past date
faker.number.int({ min: 1, max: 100 })  // Random number
faker.helpers.arrayElement(['a', 'b', 'c'])  // Random array element
faker.lorem.sentence()            // "Lorem ipsum dolor sit amet"
faker.commerce.productName()      // "Ergonomic Steel Chair"
```

See the [Faker.js documentation](https://fakerjs.dev/api/) for all available methods.

## 🛠️ Advanced Usage

### Relationships & Foreign Keys

When seeding models with relationships:

```javascript
// Get existing records to create relationships
const users = await db.User.findAll();
const formulas = await db.Formula.findAll();

// Create related records
for (const formula of formulas) {
  // Create 2-3 dilutions per formula
  await this.factories.Dilution.createMany(3, {
    formulaId: formula.formulaId
  });
}
```

### Conditional Data

```javascript
// Create users with different roles
const admins = await this.factories.User.createMany(2, {
  role: 'admin',
  status: 'active'
});

const pharmacists = await this.factories.User.createMany(5, {
  role: 'pharmacist',
  department: 'Pharmacy'
});
```

### Seeding with Transactions

For better performance and data integrity:

```javascript
const transaction = await db.sequelize.transaction();

try {
  const users = await this.factories.User.createMany(100);
  const hardware = await this.factories.Hardware.createMany(50);
  
  await transaction.commit();
  console.log('✅ Data seeded successfully');
} catch (error) {
  await transaction.rollback();
  console.error('❌ Seeding failed:', error);
}
```

## 📋 CLI Commands Reference

```bash
# Seed all tables
npm run db:seed
node database/seed.js
node database/seed.js all

# Seed specific tables
npm run db:seed:users
npm run db:seed:inventory
node database/seed.js users 20
node database/seed.js inventory 50

# Clear database
npm run db:clear
node database/clearDatabase.js
```

## 🔒 Production Warning

**⚠️ IMPORTANT:** Never run seeders in production! Seeders are for development and testing only.

- Comment out `clearDatabase()` if you want to preserve existing data
- Adjust `force: false` in sync options
- Use environment checks before seeding:

```javascript
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cannot run seeders in production!');
  process.exit(1);
}
```

## 🐛 Troubleshooting

### Foreign Key Constraint Errors

If you get foreign key errors, ensure you're seeding in the correct order:
1. Users
2. Hardware
3. Inventory
4. Formulas
5. Dilutions
6. Prescription Details
7. Related records (Stock, Notifications, etc.)

### Duplicate Key Errors

If you get duplicate key errors:
1. Run `npm run db:clear` first
2. Or use `{ force: true }` in sync (⚠️ deletes all data)

### Connection Errors

Ensure your database is running and `.env` is configured correctly:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=thedilution
DB_PORT=3306
```

## 📚 Learn More

- [Faker.js Documentation](https://fakerjs.dev/)
- [Sequelize Documentation](https://sequelize.org/)
- [Laravel Factories](https://laravel.com/docs/database-testing#defining-model-factories) (inspiration)

---

Made with ❤️ for TheDilution Backend
