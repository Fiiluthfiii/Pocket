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
    const { type, amount, categoryId, walletId, date, note } = await request.json();

    // Get old transaction
    const oldTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!oldTransaction || oldTransaction.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Parse date and set to noon (12:00) local time to avoid timezone issues
    const transactionDate = new Date(date);
    // If only date is provided (without time), set to noon local time
    if (date.length <= 10) {
      transactionDate.setHours(12, 0, 0, 0);
    }

    // Revert old transaction from wallet
    if (oldTransaction.walletId === walletId) {
      const wallet = await prisma.wallet.findUnique({
        where: { id: walletId },
      });

      let newBalance = Number(wallet.balance);
      
      // Revert old transaction
      if (oldTransaction.type === 'income') {
        newBalance -= Number(oldTransaction.amount);
      } else {
        newBalance += Number(oldTransaction.amount);
      }

      // Apply new transaction
      if (type === 'income') {
        newBalance += Number(amount);
      } else {
        newBalance -= Number(amount);
      }

      await prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });
    } else {
      // Handle wallet change
      // Revert from old wallet
      const oldWallet = await prisma.wallet.findUnique({
        where: { id: oldTransaction.walletId },
      });

      const oldWalletNewBalance = oldTransaction.type === 'income'
        ? Number(oldWallet.balance) - Number(oldTransaction.amount)
        : Number(oldWallet.balance) + Number(oldTransaction.amount);

      await prisma.wallet.update({
        where: { id: oldTransaction.walletId },
        data: { balance: oldWalletNewBalance },
      });

      // Apply to new wallet
      const newWallet = await prisma.wallet.findUnique({
        where: { id: walletId },
      });

      const newWalletNewBalance = type === 'income'
        ? Number(newWallet.balance) + Number(amount)
        : Number(newWallet.balance) - Number(amount);

      await prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newWalletNewBalance },
      });
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
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

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
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

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { id: transaction.walletId },
    });

    const newBalance = transaction.type === 'income'
      ? Number(wallet.balance) - Number(transaction.amount)
      : Number(wallet.balance) + Number(transaction.amount);

    await prisma.wallet.update({
      where: { id: transaction.walletId },
      data: { balance: newBalance },
    });

    // Delete transaction
    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
