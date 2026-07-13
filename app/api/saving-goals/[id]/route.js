import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    console.log('GET /api/saving-goals/[id]');
    console.log('ID:', id);
    console.log('User ID:', session.user.id);

    const savingGoal = await prisma.savingGoal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        wallet: true,
      },
    });

    if (!savingGoal) {
      console.log('Saving goal not found for ID:', id, 'User:', session.user.id);
      
      // Debug: check if goal exists at all
      const anyGoal = await prisma.savingGoal.findUnique({
        where: { id }
      });
      console.log('Goal exists in DB?', anyGoal ? 'Yes' : 'No');
      if (anyGoal) {
        console.log('Goal belongs to user:', anyGoal.userId);
      }
      
      return NextResponse.json({ error: 'Saving goal not found' }, { status: 404 });
    }

    console.log('Saving goal found:', savingGoal.name);
    return NextResponse.json(savingGoal);
  } catch (error) {
    console.error('Error fetching saving goal:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch saving goal',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    const { name, targetAmount, savedAmount, targetDate, walletId } = body;

    const savingGoal = await prisma.savingGoal.update({
      where: {
        id,
      },
      data: {
        name,
        targetAmount,
        savedAmount,
        targetDate: new Date(targetDate),
        walletId: walletId || null,
      },
    });

    return NextResponse.json(savingGoal);
  } catch (error) {
    console.error('Error updating saving goal:', error);
    return NextResponse.json({ error: 'Failed to update saving goal' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    await prisma.savingGoal.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Saving goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting saving goal:', error);
    return NextResponse.json({ error: 'Failed to delete saving goal' }, { status: 500 });
  }
}
