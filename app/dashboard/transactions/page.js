import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import TransactionsClient from '@/components/transactions/TransactionsClient';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <TransactionsClient userId={session.user.id} />;
}
