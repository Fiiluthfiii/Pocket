const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Step 1: Generating Prisma Client...');
try {
  // Generate Prisma Client using node directly to avoid PowerShell issues
  const prismaPath = path.join(__dirname, 'node_modules', '.bin', 'prisma.cmd');
  execSync(`"${prismaPath}" generate`, { stdio: 'inherit', shell: true });
  console.log('✅ Prisma Client generated');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}

console.log('\n🌱 Step 2: Running seed script...');
try {
  execSync('node prisma/seed.js', { stdio: 'inherit', shell: true });
  console.log('\n✅ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}
