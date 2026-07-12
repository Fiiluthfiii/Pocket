// Script untuk cek dan menambahkan kolom phone dan bio
// Jalankan: node check-and-add-columns.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Mengecek struktur tabel User...\n');
  
  try {
    // Cek apakah kolom sudah ada
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('phone', 'bio');
    `;
    
    console.log('Kolom yang sudah ada:', result);
    
    const hasPhone = result.some(col => col.column_name === 'phone');
    const hasBio = result.some(col => col.column_name === 'bio');
    
    console.log(`\nStatus:`);
    console.log(`- Kolom phone: ${hasPhone ? '✅ Sudah ada' : '❌ Belum ada'}`);
    console.log(`- Kolom bio: ${hasBio ? '✅ Sudah ada' : '❌ Belum ada'}\n`);
    
    if (!hasPhone || !hasBio) {
      console.log('⚙️  Menambahkan kolom yang belum ada...\n');
      
      if (!hasPhone) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "phone" TEXT;`);
        console.log('✅ Kolom phone berhasil ditambahkan');
      }
      
      if (!hasBio) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "bio" TEXT;`);
        console.log('✅ Kolom bio berhasil ditambahkan');
      }
      
      console.log('\n🎉 Selesai! Sekarang refresh browser dan coba simpan lagi.');
    } else {
      console.log('✅ Semua kolom sudah ada! Jika masih error, coba restart development server.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Jika error "relation User does not exist", coba:');
    console.log('   Jalankan query SQL ini manual di Supabase SQL Editor:');
    console.log('   ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone TEXT;');
    console.log('   ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT;');
  } finally {
    await prisma.$disconnect();
  }
}

main();
