import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, targetAmount, savedAmount, targetDate } = body;

    const savingGoal = await prisma.savingGoal.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name,
        targetAmount,
        savedAmount,
        targetDate: new Date(targetDate),
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

    const { id } = params;

    await prisma.savingGoal.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Saving goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting saving goal:', error);
    return NextResponse.json({ error: 'Failed to delete saving goal' }, { status: 500 });
  }
}
