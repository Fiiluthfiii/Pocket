import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });

    const formattedBudgets = budgets.map(b => ({
      ...b,
      amount: Number(b.amount),
    }));

    return NextResponse.json(formattedBudgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId, amount, month, year } = await request.json();

    if (!categoryId || !amount || !month || !year) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Check if budget already exists for this category, month, and year
    const existing = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId,
        month,
        year,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Anggaran untuk kategori ini sudah ada di bulan tersebut' },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        categoryId,
        amount,
        month,
        year,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        ...budget,
        amount: Number(budget.amount),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
