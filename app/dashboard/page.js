import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

async function getDashboardData(userId) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Previous month dates
  const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get all wallets
  const wallets = await prisma.wallet.findMany({
    where: { userId },
  });

  // Calculate total balance
  const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);

  // Get transactions for current month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
    include: {
      category: true,
      wallet: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 10,
  });

  // Calculate income and expenses for current month
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Get previous month transactions for comparison
  const prevMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: firstDayOfPrevMonth,
        lte: lastDayOfPrevMonth,
      },
    },
  });

  const prevMonthIncome = prevMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const prevMonthExpenses = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Get expense by category
  const expensesByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'expense',
      date: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Get category details
  const categoryIds = expensesByCategory.map(e => e.categoryId);
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds,
      },
    },
  });

  const categoryExpenses = expensesByCategory.map(expense => {
    const category = categories.find(c => c.id === expense.categoryId);
    return {
      name: category?.name || 'Unknown',
      value: Number(expense._sum.amount),
      color: category?.color || '#6b7280',
    };
  });

  // Get last 6 months trend
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: sixMonthsAgo,
      },
    },
  });

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = monthDate.toLocaleString('id-ID', { month: 'short' });
    
    const monthIncome = monthlyTransactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === monthDate.getMonth() && 
               tDate.getFullYear() === monthDate.getFullYear() &&
               t.type === 'income';
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthExpense = monthlyTransactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === monthDate.getMonth() && 
               tDate.getFullYear() === monthDate.getFullYear() &&
               t.type === 'expense';
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    monthlyData.push({
      month: monthName,
      income: monthIncome,
      expense: monthExpense,
    });
  }

  // Get budgets with spent amounts
  const budgets = await prisma.budget.findMany({
    where: { 
      userId,
      month: now.getMonth() + 1, // Month is 1-indexed in database
      year: now.getFullYear(),
    },
    include: {
      category: true,
    },
  });

  // Calculate spent for each budget
  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'expense',
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        ...budget,
        spent: Number(spent._sum.amount || 0),
        amount: Number(budget.amount),
      };
    })
  );

  return {
    totalBalance,
    income,
    expenses,
    prevMonthIncome,
    prevMonthExpenses,
    prevMonthBalance: totalBalance, // For simplicity, using current balance
    transactions: transactions.map(t => ({
      ...t,
      amount: Number(t.amount),
    })),
    categoryExpenses,
    monthlyData,
    budgets: budgetsWithSpent,
  };
}

async function getUserName(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  return user?.name || 'User';
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getDashboardData(session.user.id);
  const userName = await getUserName(session.user.id);

  return <DashboardClient data={{ ...data, userName }} />;
}
