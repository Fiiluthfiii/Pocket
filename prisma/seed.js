const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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

  // Create default categories
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { 
        id: `default-${category.name.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: {},
      create: {
        id: `default-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...category,
        userId: null, // null for default categories
      },
    });
  }

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@pocket.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@pocket.com',
      password: hashedPassword,
      currency: 'IDR',
      theme: 'light',
    },
  });

  // Create wallet for demo user
  const wallet = await prisma.wallet.upsert({
    where: { id: 'demo-wallet-1' },
    update: {},
    create: {
      id: 'demo-wallet-1',
      userId: demoUser.id,
      name: 'Dompet Utama',
      type: 'cash',
      balance: 5000000,
    },
  });

  // Get categories for demo transactions
  const foodCategory = await prisma.category.findFirst({
    where: { name: 'Makanan & Minuman', isDefault: true },
  });
  const transportCategory = await prisma.category.findFirst({
    where: { name: 'Transportasi', isDefault: true },
  });
  const salaryCategory = await prisma.category.findFirst({
    where: { name: 'Gaji', isDefault: true },
  });
  const shoppingCategory = await prisma.category.findFirst({
    where: { name: 'Belanja', isDefault: true },
  });

  // Create demo transactions
  const now = new Date();
  const demoTransactions = [
    {
      userId: demoUser.id,
      walletId: wallet.id,
      categoryId: salaryCategory.id,
      type: 'income',
      amount: 5000000,
      note: 'Gaji bulan ini',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
    },
    {
      userId: demoUser.id,
      walletId: wallet.id,
      categoryId: foodCategory.id,
      type: 'expense',
      amount: 50000,
      note: 'Makan siang',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
    },
    {
      userId: demoUser.id,
      walletId: wallet.id,
      categoryId: transportCategory.id,
      type: 'expense',
      amount: 100000,
      note: 'Bensin motor',
      date: new Date(now.getFullYear(), now.getMonth(), 7),
    },
    {
      userId: demoUser.id,
      walletId: wallet.id,
      categoryId: shoppingCategory.id,
      type: 'expense',
      amount: 250000,
      note: 'Belanja bulanan',
      date: new Date(now.getFullYear(), now.getMonth(), 10),
    },
    {
      userId: demoUser.id,
      walletId: wallet.id,
      categoryId: foodCategory.id,
      type: 'expense',
      amount: 75000,
      note: 'Makan malam keluarga',
      date: new Date(now.getFullYear(), now.getMonth(), 12),
    },
  ];

  for (const transaction of demoTransactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('📧 Demo user: demo@pocket.com');
  console.log('🔑 Password: demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
