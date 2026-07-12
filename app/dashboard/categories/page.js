import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import CategoriesClient from '@/components/categories/CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <CategoriesClient userId={session.user.id} />;
}
