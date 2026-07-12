import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import WalletsClient from '@/components/wallets/WalletsClient';

export default async function WalletsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <WalletsClient userId={session.user.id} />;
}
