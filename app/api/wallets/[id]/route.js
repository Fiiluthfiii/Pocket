import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, type, balance } = await request.json();

    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet || wallet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.wallet.update({
      where: { id },
      data: {
        name,
        type,
        balance: balance !== undefined ? balance : wallet.balance,
      },
    });

    return NextResponse.json({
      ...updated,
      balance: Number(updated.balance),
    });
  } catch (error) {
    console.error('Error updating wallet:', error);
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

    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet || wallet.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Check if this is the last wallet
    const walletCount = await prisma.wallet.count({
      where: { userId: session.user.id },
    });

    if (walletCount <= 1) {
      return NextResponse.json(
        { message: 'Cannot delete last wallet' },
        { status: 400 }
      );
    }

    // Delete wallet and all related transactions
    await prisma.wallet.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Wallet deleted' });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
