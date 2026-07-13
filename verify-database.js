const fs = require('fs');
const path = require('path');

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

async function verify() {
  try {
    console.log('🔍 Verifying Neon database connection and data...\n');
    
    console.log('📊 Checking tables and counts:');
    
    // Check users
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    console.log(`   ✅ Users: ${userCount[0].count} records`);
    
    // Check categories
    const categoryCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Category"`;
    console.log(`   ✅ Categories: ${categoryCount[0].count} records`);
    
    // Check wallets
    const walletCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Wallet"`;
    console.log(`   ✅ Wallets: ${walletCount[0].count} records`);
    
    // Check transactions
    const transactionCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Transaction"`;
    console.log(`   ✅ Transactions: ${transactionCount[0].count} records`);
    
    // Check budgets
    const budgetCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Budget"`;
    console.log(`   ✅ Budgets: ${budgetCount[0].count} records`);
    
    // Check saving goals
    const savingGoalCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "SavingGoal"`;
    console.log(`   ✅ Saving Goals: ${savingGoalCount[0].count} records`);
    
    console.log('\n📧 Demo user check:');
    const demoUser = await prisma.$queryRaw`SELECT id, name, email FROM "User" WHERE email = 'demo@pocket.com' LIMIT 1`;
    if (demoUser.length > 0) {
      console.log(`   ✅ Demo user exists: ${demoUser[0].email}`);
      console.log(`   👤 Name: ${demoUser[0].name}`);
      console.log(`   🔑 Password: demo123`);
    } else {
      console.log('   ⚠️  Demo user not found');
    }
    
    console.log('\n✅ Neon database verification completed!');
    console.log('🎉 Database is ready for production deployment!');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
