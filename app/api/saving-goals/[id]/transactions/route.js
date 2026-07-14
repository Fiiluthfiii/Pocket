import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    console.log('GET /api/saving-goals/[id]/transactions - ID:', id);

    // Try to use Prisma model first, fallback to raw SQL if not available
    try {
      const transactions = await prisma.savingTransaction.findMany({
        where: {
          savingGoalId: id,
        },
        include: {
          wallet: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      console.log('Found', transactions.length, 'transactions');
      return NextResponse.json(transactions);
    } catch (prismaError) {
      // Fallback to raw SQL
      console.log('Falling back to raw SQL for GET:', prismaError.message);
      const transactions = await prisma.$queryRaw`
        SELECT 
          st.*,
          json_build_object(
            'id', w.id,
            'name', w.name,
            'type', w.type,
            'balance', w.balance
          ) as wallet
        FROM "SavingTransaction" st
        LEFT JOIN "Wallet" w ON st."walletId" = w.id
        WHERE st."savingGoalId" = ${id}
        ORDER BY st.date DESC
      `;

      return NextResponse.json(transactions);
    }
  } catch (error) {
    console.error('Error fetching saving transactions:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    console.log('POST /api/saving-goals/[id]/transactions - ID:', id);

    const body = await request.json();
    const { walletId, type, amount, note, date } = body;

    console.log('Transaction data:', { walletId, type, amount, note, date });

    // Verify saving goal belongs to user
    const savingGoal = await prisma.savingGoal.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!savingGoal) {
      console.log('Saving goal not found for ID:', id, 'User:', session.user.id);
      return NextResponse.json({ error: 'Saving goal not found' }, { status: 404 });
    }

    console.log('Saving goal found:', savingGoal.name);

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId: session.user.id,
      },
    });

    if (!wallet) {
      console.log('Wallet not found for ID:', walletId);
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    console.log('Wallet found:', wallet.name, 'Balance:', wallet.balance);

    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Convert Decimal to number for comparison
    const walletBalance = parseFloat(wallet.balance.toString());
    const currentSaved = parseFloat(savingGoal.savedAmount.toString());

    console.log('Validating - Wallet balance:', walletBalance, 'Amount:', numAmount);

    // Check wallet balance for deposit
    if (type === 'deposit' && walletBalance < numAmount) {
      console.log('Insufficient wallet balance');
      return NextResponse.json({ 
        error: 'Insufficient wallet balance',
        walletBalance,
        requested: numAmount
      }, { status: 400 });
    }

    // Check saved amount for withdraw
    if (type === 'withdraw' && currentSaved < numAmount) {
      console.log('Insufficient saved amount');
      return NextResponse.json({ 
        error: 'Insufficient saved amount',
        currentSaved,
        requested: numAmount
      }, { status: 400 });
    }

    console.log('Validation passed, creating transaction...');

    // Get or create savings category
    let savingsCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { id: 'default-investasi' },
          { 
            userId: session.user.id,
            name: { contains: 'Tabung', mode: 'insensitive' }
          }
        ]
      }
    });

    if (!savingsCategory) {
      // Use default investasi category
      savingsCategory = await prisma.category.findUnique({
        where: { id: 'default-investasi' }
      });
    }

    console.log('Using category:', savingsCategory.name);

    // Parse date and set to noon (12:00) local time to avoid timezone issues
    let transactionDate;
    if (date) {
      const [year, month, day] = date.split('-');
      transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0, 0);
    } else {
      transactionDate = new Date();
      transactionDate.setHours(12, 0, 0, 0);
    }
    
    console.log('Transaction date:', transactionDate.toISOString());

    // Try to use Prisma models first, fallback to raw SQL if not available
    let result;
    try {
      // Try using Prisma model
      result = await prisma.$transaction(async (tx) => {
        // Create saving transaction
        const savingTransaction = await tx.savingTransaction.create({
          data: {
            savingGoalId: id,
            walletId,
            type,
            amount: numAmount,
            note: note || null,
            date: transactionDate,
          },
        });

        // Create regular transaction for history
        const transactionType = type === 'deposit' ? 'expense' : 'income';
        const transactionNote = type === 'deposit' 
          ? `Isi Saldo Tabungan: ${savingGoal.name}${note ? ' - ' + note : ''}`
          : `Tarik Saldo Tabungan: ${savingGoal.name}${note ? ' - ' + note : ''}`;

        const regularTransaction = await tx.transaction.create({
          data: {
            userId: session.user.id,
            walletId,
            categoryId: savingsCategory.id,
            type: transactionType,
            amount: numAmount,
            note: transactionNote,
            date: transactionDate,
          },
        });

        console.log('Regular transaction created:', regularTransaction.id);

        // Update wallet balance ONCE
        if (type === 'deposit') {
          await tx.wallet.update({
            where: { id: walletId },
            data: { balance: { decrement: numAmount } },
          });
        } else if (type === 'withdraw') {
          await tx.wallet.update({
            where: { id: walletId },
            data: { balance: { increment: numAmount } },
          });
        }

        // Update saving goal saved amount
        if (type === 'deposit') {
          await tx.savingGoal.update({
            where: { id },
            data: { savedAmount: { increment: numAmount } },
          });
        } else if (type === 'withdraw') {
          await tx.savingGoal.update({
            where: { id },
            data: { savedAmount: { decrement: numAmount } },
          });
        }

        return savingTransaction;
      });
      console.log('Transaction created successfully with Prisma');
    } catch (prismaError) {
      // Fallback to raw SQL if Prisma model not available
      console.log('Falling back to raw SQL:', prismaError.message);
      console.error('Full error:', prismaError);
      
      result = await prisma.$transaction(async (tx) => {
        const transactionId = `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const regularTransactionId = `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create saving transaction
        await tx.$executeRaw`
          INSERT INTO "SavingTransaction" (id, "savingGoalId", "walletId", type, amount, note, date, "createdAt")
          VALUES (${transactionId}, ${id}, ${walletId}, ${type}, ${numAmount}, ${note || null}, ${transactionDate}, CURRENT_TIMESTAMP)
        `;

        // Create regular transaction
        const transactionType = type === 'deposit' ? 'expense' : 'income';
        const transactionNote = type === 'deposit' 
          ? `Isi Saldo Tabungan: ${savingGoal.name}${note ? ' - ' + note : ''}`
          : `Tarik Saldo Tabungan: ${savingGoal.name}${note ? ' - ' + note : ''}`;

        await tx.$executeRaw`
          INSERT INTO "Transaction" (id, "userId", "walletId", "categoryId", type, amount, note, date, "createdAt", "updatedAt")
          VALUES (${regularTransactionId}, ${session.user.id}, ${walletId}, ${savingsCategory.id}, ${transactionType}, ${numAmount}, ${transactionNote}, ${transactionDate}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        // Update wallet balance
        if (type === 'deposit') {
          await tx.$executeRaw`
            UPDATE "Wallet" 
            SET balance = balance - ${numAmount}
            WHERE id = ${walletId}
          `;
        } else if (type === 'withdraw') {
          await tx.$executeRaw`
            UPDATE "Wallet" 
            SET balance = balance + ${numAmount}
            WHERE id = ${walletId}
          `;
        }

        // Update saving goal saved amount
        if (type === 'deposit') {
          await tx.$executeRaw`
            UPDATE "SavingGoal" 
            SET "savedAmount" = "savedAmount" + ${numAmount}
            WHERE id = ${id}
          `;
        } else if (type === 'withdraw') {
          await tx.$executeRaw`
            UPDATE "SavingGoal" 
            SET "savedAmount" = "savedAmount" - ${numAmount}
            WHERE id = ${id}
          `;
        }

        return { id: transactionId, type, amount: numAmount, note, date: new Date() };
      });
      console.log('Transaction created successfully with raw SQL');
    }

    console.log('Transaction result:', result);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating saving transaction:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
