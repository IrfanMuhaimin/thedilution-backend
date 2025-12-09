# 🚀 Quick Start - Database Seeding

## Installation

The faker library has already been installed. If you need to reinstall:

```bash
npm install --save-dev @faker-js/faker
```

## Running Seeders

### 1. Seed Everything (Recommended for first time)

```bash
npm run db:seed
```

This will create:
- ✅ 16 Users (admin, pharmacist, manager + 13 random)
- ✅ 10 Hardware items
- ✅ 25 Inventory items with stock records
- ✅ 12 Formulas with dilutions
- ✅ 30 Prescription details
- ✅ Notifications for all users

### 2. Seed Specific Tables

```bash
# Seed 10 users
npm run db:seed:users

# Seed 20 users
node database/seed.js users 20

# Seed inventory
npm run db:seed:inventory

# Seed 50 inventory items
node database/seed.js inventory 50
```

### 3. Clear Database

```bash
npm run db:clear
```

## Test Credentials

After seeding, you can login with:

| Username   | Password    | Role       |
|------------|-------------|------------|
| admin      | password123 | admin      |
| pharmacist | password123 | pharmacist |
| manager    | password123 | manager    |

## Using Factories in Your Code

```javascript
const db = require('./models');
const initializeFactories = require('./database/factories');

const factories = initializeFactories(db);

// Create a user
const user = await factories.User.create();

// Create with custom data
const admin = await factories.User.create({
  username: 'myAdmin',
  role: 'admin'
});

// Create multiple
const users = await factories.User.createMany(10);
```

## Folder Structure

```
database/
├── factories/       # Data generators for each model
├── seeders/         # Seeder classes
├── seed.js          # CLI runner
└── README.md        # Full documentation
```

## Next Steps

1. **First time**: Run `npm run db:seed` to populate your database
2. **Testing**: Use factories in your test files
3. **Custom data**: Modify factories in `database/factories/`
4. **More info**: Read `database/README.md` for detailed documentation

## Common Issues

**Q: Foreign key constraint errors?**
A: Run `npm run db:clear` first, then seed again.

**Q: Connection errors?**
A: Check your `.env` file for correct database credentials.

**Q: Want to keep existing data?**
A: Comment out `clearDatabase()` in `database/seeders/DatabaseSeeder.js`

---

Happy Seeding! 🌱
