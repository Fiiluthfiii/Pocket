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

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
        wallet: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Convert Decimal to number
    const formattedTransactions = transactions.map(t => ({
      ...t,
      amount: Number(t.amount),
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
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

    const { type, amount, categoryId, walletId, date, note } = await request.json();

    // Validasi
    if (!type || !amount || !categoryId || !walletId || !date) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Parse date and set to noon (12:00) local time to avoid timezone issues
    const transactionDate = new Date(date);
    // If only date is provided (without time), set to noon local time
    if (date.length <= 10) {
      transactionDate.setHours(12, 0, 0, 0);
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type,
        amount,
        categoryId,
        walletId,
        date: transactionDate,
        note: note || null,
      },
      include: {
        category: true,
        wallet: true,
      },
    });

    // Update wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    const newBalance = type === 'income'
      ? Number(wallet.balance) + Number(amount)
      : Number(wallet.balance) - Number(amount);

    await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });

    return NextResponse.json(
      {
        ...transaction,
        amount: Number(transaction.amount),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
