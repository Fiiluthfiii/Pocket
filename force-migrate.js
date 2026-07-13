const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  // Skip comments and empty lines
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove surrounding quotes if present
    value = value.replace(/^["']|["']$/g, '');
    if (!process.env[key]) {  // Don't override existing env vars
      process.env[key] = value;
    }
  }
});

console.log('🔍 Using DATABASE_URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Not found');

// Dynamically load Prisma Client after env is loaded
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forceMigrate() {
  try {
    console.log('\n🔌 Connecting to Neon database...');
    
    // Test connection
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connected successfully!\n');
    
    // Read migration SQL
    const migrationPath = path.join(__dirname, 'prisma', 'migrations', '20260713000000_init', 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing migration statements...\n');
    
    // Split SQL into individual statements - more robust parsing
    const lines = migrationSQL.split('\n');
    const statements = [];
    let currentStatement = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and standalone comments
      if (!trimmed || trimmed.startsWith('--')) continue;
      
      currentStatement += ' ' + line;
      
      // Check if line ends with semicolon
      if (trimmed.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    console.log(`📦 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await prisma.$executeRawUnsafe(statement);
          
          // Extract table/object name from statement for better logging
          let objectName = 'unknown';
          if (statement.includes('CREATE TABLE')) {
            objectName = statement.match(/CREATE TABLE "(\w+)"/)?.[1] || 'table';
            console.log(`   ✅ Created table: ${objectName}`);
          } else if (statement.includes('CREATE INDEX') || statement.includes('CREATE UNIQUE INDEX')) {
            objectName = statement.match(/CREATE .*INDEX "(\w+)"/)?.[1] || 'index';
            console.log(`   ✅ Created index: ${objectName}`);
          } else if (statement.includes('ALTER TABLE') && statement.includes('ADD CONSTRAINT')) {
            const tableName = statement.match(/ALTER TABLE "(\w+)"/)?.[1] || 'table';
            const constraintName = statement.match(/CONSTRAINT "(\w+)"/)?.[1] || 'constraint';
            console.log(`   ✅ Added constraint ${constraintName} to ${tableName}`);
          }
          successCount++;
        } catch (error) {
          if (error.message.includes('already exists')) {
            skipCount++;
            if (statement.includes('CREATE TABLE')) {
              const tableName = statement.match(/CREATE TABLE "(\w+)"/)?.[1] || 'object';
              console.log(`   ⚠️  Table ${tableName} already exists, skipping...`);
            } else {
              console.log(`   ⚠️  Object already exists, skipping...`);
            }
          } else {
            console.error(`   ❌ Failed: ${error.message}`);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
            throw error;
          }
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully executed: ${successCount} statements`);
    console.log(`   ⚠️  Skipped (already exists): ${skipCount} statements`);
    console.log(`\n✅ Migration completed!`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

forceMigrate();
