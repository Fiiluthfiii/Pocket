// Script untuk menambahkan kolom phone dan bio ke tabel User
// Jalankan dengan: node scripts/add-user-columns.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Menambahkan kolom phone dan bio ke tabel User...');
    
    // Menambahkan kolom phone
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "phone" TEXT;
    `);
    
    console.log('✅ Kolom phone berhasil ditambahkan');
    
    // Menambahkan kolom bio
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "bio" TEXT;
    `);
    
    console.log('✅ Kolom bio berhasil ditambahkan');
    
    console.log('\n🎉 Semua kolom berhasil ditambahkan!');
    console.log('Sekarang Anda bisa menyimpan nomor telepon dan bio di halaman Pengaturan.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
