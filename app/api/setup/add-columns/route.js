import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    console.log('Starting to add columns...');
    
    // Add phone column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone TEXT;
    `);
    
    console.log('Phone column added');
    
    // Add bio column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT;
    `);
    
    console.log('Bio column added');
    
    return NextResponse.json({
      success: true,
      message: 'Kolom phone dan bio berhasil ditambahkan!',
    });
  } catch (error) {
    console.error('Error adding columns:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error: ' + error.message 
      },
      { status: 500 }
    );
  }
}
