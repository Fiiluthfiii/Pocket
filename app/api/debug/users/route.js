import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all users (without password for security)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ 
      success: true,
      count: users.length,
      users: users,
      message: `Found ${users.length} users in database`
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      message: 'Database connection failed'
    }, { status: 500 });
  }
}
