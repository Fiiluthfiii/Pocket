import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savingGoals = await prisma.savingGoal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(savingGoals);
  } catch (error) {
    console.error('Error fetching saving goals:', error);
    // Return empty array if table doesn't exist yet
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, targetAmount, savedAmount, targetDate } = body;

    console.log('Creating saving goal with data:', {
      name,
      targetAmount,
      savedAmount,
      targetDate,
      userId: session.user.id
    });

    const savingGoal = await prisma.savingGoal.create({
      data: {
        userId: session.user.id,
        name: String(name),
        targetAmount: Number(targetAmount),
        savedAmount: Number(savedAmount || 0),
        targetDate: new Date(targetDate),
      },
    });

    console.log('Saving goal created successfully:', savingGoal);

    return NextResponse.json(savingGoal, { status: 201 });
  } catch (error) {
    console.error('Detailed error creating saving goal:', error);
    return NextResponse.json({ 
      error: 'Failed to create saving goal',
      message: error.message,
      code: error.code
    }, { status: 500 });
  }
}

