import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return Response.json({ message: 'Password diperlukan untuk menghapus akun' }, { status: 400 });
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json({ message: 'Password salah' }, { status: 400 });
    }

    // Delete all user data in order (due to foreign key constraints)
    // 1. Delete transactions
    await prisma.transaction.deleteMany({
      where: { userId: user.id },
    });

    // 2. Delete budgets
    await prisma.budget.deleteMany({
      where: { userId: user.id },
    });

    // 3. Delete saving goals
    await prisma.savingGoal.deleteMany({
      where: { userId: user.id },
    });

    // 4. Delete categories
    await prisma.category.deleteMany({
      where: { userId: user.id },
    });

    // 5. Delete wallets
    await prisma.wallet.deleteMany({
      where: { userId: user.id },
    });

    // 6. Finally delete user
    await prisma.user.delete({
      where: { id: user.id },
    });

    return Response.json({ 
      message: 'Akun berhasil dihapus',
      success: true 
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting account:', error);
    return Response.json({ 
      message: 'Terjadi kesalahan saat menghapus akun',
      error: error.message 
    }, { status: 500 });
  }
}
