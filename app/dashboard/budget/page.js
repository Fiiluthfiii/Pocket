import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import BudgetClient from '@/components/budget/BudgetClient';

export const dynamic = 'force-dynamic';

export default async function BudgetPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <BudgetClient userId={session.user.id} />;
}
