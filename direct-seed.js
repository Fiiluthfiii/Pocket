const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

// Dynamically load Prisma Client after env is loaded
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...\n');
  
  // Create default categories for all users
  const defaultCategories = [
    // Expense categories
    { name: 'Makanan & Minuman', type: 'expense', icon: 'utensils', color: '#ef4444', isDefault: true },
    { name: 'Transportasi', type: 'expense', icon: 'car', color: '#f59e0b', isDefault: true },
    { name: 'Belanja', type: 'expense', icon: 'shopping-bag', color: '#8b5cf6', isDefault: true },
    { name: 'Tagihan', type: 'expense', icon: 'file-text', color: '#3b82f6', isDefault: true },
    { name: 'Hiburan', type: 'expense', icon: 'film', color: '#ec4899', isDefault: true },
    { name: 'Kesehatan', type: 'expense', icon: 'heart', color: '#10b981', isDefault: true },
    { name: 'Pendidikan', type: 'expense', icon: 'book', color: '#6366f1', isDefault: true },
    { name: 'Lainnya', type: 'expense', icon: 'more-horizontal', color: '#6b7280', isDefault: true },
    
    // Income categories
    { name: 'Gaji', type: 'income', icon: 'briefcase', color: '#22c55e', isDefault: true },
    { name: 'Bonus', type: 'income', icon: 'gift', color: '#14b8a6', isDefault: true },
    { name: 'Investasi', type: 'income', icon: 'trending-up', color: '#0ea5e9', isDefault: true },
    { name: 'Lainnya', type: 'income', icon: 'plus-circle', color: '#6b7280', isDefault: true },
  ];

  console.log('📝 Creating default categories...');
  // Create default categories using raw SQL
  for (const category of defaultCategories) {
    const id = `default-${category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`;
    try {
      await prisma.$executeRaw`
        INSERT INTO "Category" (id, name, type, icon, color, "isDefault", "userId", "createdAt")
        VALUES (${id}, ${category.name}, ${category.type}, ${category.icon}, ${category.color}, ${category.isDefault}, NULL, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`   ✅ ${category.name}`);
    } catch (error) {
      console.log(`   ⚠️  ${category.name} (already exists or error)`);
    }
  }

  console.log('\n📝 Creating demo user...');
  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const demoUserId = 'demo-user-123456';
  
  try {
    await prisma.$executeRaw`
      INSERT INTO "User" (id, name, email, password, currency, theme, "createdAt", "updatedAt")
      VALUES (${demoUserId}, 'Demo User', 'demo@pocket.com', ${hashedPassword}, 'IDR', 'light', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE SET name = 'Demo User'
      RETURNING id
    `;
    console.log('   ✅ Demo user created (demo@pocket.com / demo123)');
  } catch (error) {
    console.log('   ⚠️  Demo user already exists');
  }

  console.log('\n📝 Creating demo wallet...');
  // Create wallet for demo user
  const walletId = 'demo-wallet-1';
  try {
    await prisma.$executeRaw`
      INSERT INTO "Wallet" (id, "userId", name, type, balance, "createdAt")
      VALUES (${walletId}, ${demoUserId}, 'Dompet Utama', 'cash', 5000000, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('   ✅ Wallet created');
  } catch (error) {
    console.log('   ⚠️  Wallet already exists');
  }

  console.log('\n📝 Creating demo transactions...');
  // Get category IDs
  const foodCategoryId = 'default-makanan-and-minuman';
  const transportCategoryId = 'default-transportasi';
  const salaryCategoryId = 'default-gaji';
  const shoppingCategoryId = 'default-belanja';

  // Create demo transactions
  const now = new Date();
  const demoTransactions = [
    {
      id: 'demo-trans-1',
      userId: demoUserId,
      walletId: walletId,
      categoryId: salaryCategoryId,
      type: 'income',
      amount: 5000000,
      note: 'Gaji bulan ini',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
    },
    {
      id: 'demo-trans-2',
      userId: demoUserId,
      walletId: walletId,
      categoryId: foodCategoryId,
      type: 'expense',
      amount: 50000,
      note: 'Makan siang',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
    },
    {
      id: 'demo-trans-3',
      userId: demoUserId,
      walletId: walletId,
      categoryId: transportCategoryId,
      type: 'expense',
      amount: 100000,
      note: 'Bensin motor',
      date: new Date(now.getFullYear(), now.getMonth(), 7),
    },
    {
      id: 'demo-trans-4',
      userId: demoUserId,
      walletId: walletId,
      categoryId: shoppingCategoryId,
      type: 'expense',
      amount: 250000,
      note: 'Belanja bulanan',
      date: new Date(now.getFullYear(), now.getMonth(), 10),
    },
    {
      id: 'demo-trans-5',
      userId: demoUserId,
      walletId: walletId,
      categoryId: foodCategoryId,
      type: 'expense',
      amount: 75000,
      note: 'Makan malam keluarga',
      date: new Date(now.getFullYear(), now.getMonth(), 12),
    },
  ];

  for (const transaction of demoTransactions) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "Transaction" (id, "userId", "walletId", "categoryId", type, amount, note, date, "createdAt", "updatedAt")
        VALUES (${transaction.id}, ${transaction.userId}, ${transaction.walletId}, ${transaction.categoryId}, 
                ${transaction.type}, ${transaction.amount}, ${transaction.note}, ${transaction.date}, 
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`   ✅ Transaction: ${transaction.note}`);
    } catch (error) {
      console.log(`   ⚠️  Transaction already exists: ${transaction.note}`);
    }
  }

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📧 Demo user credentials:');
  console.log('   Email: demo@pocket.com');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('\n❌ Seeding failed:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
