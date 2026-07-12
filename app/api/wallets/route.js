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

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
    });

    // Convert Decimal to number
    const formattedWallets = wallets.map(w => ({
      ...w,
      balance: Number(w.balance),
    }));

    return NextResponse.json(formattedWallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
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

    const { name, type, balance } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { message: 'Nama dan tipe dompet wajib diisi' },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.create({
      data: {
        userId: session.user.id,
        name,
        type,
        balance: balance || 0,
      },
    });

    return NextResponse.json(
      {
        ...wallet,
        balance: Number(wallet.balance),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
