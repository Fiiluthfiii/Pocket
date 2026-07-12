import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { amount, month, year } = await request.json();

    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget || budget.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Budget not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: { amount, month, year },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      ...updated,
      amount: Number(updated.amount),
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget || budget.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Budget not found' },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
