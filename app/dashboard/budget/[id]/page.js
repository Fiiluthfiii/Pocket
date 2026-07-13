import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SavingGoalDetailClient from '@/components/budget/SavingGoalDetailClient';

export const dynamic = 'force-dynamic';

export default async function SavingGoalDetailPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <SavingGoalDetailClient goalId={params.id} userId={session.user.id} />;
}
