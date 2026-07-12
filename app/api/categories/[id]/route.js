import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, type, color } = await request.json();

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || (category.userId !== session.user.id && !category.isDefault)) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.isDefault) {
      return NextResponse.json(
        { message: 'Cannot edit default category' },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        type,
        color: color || '#6b7280',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
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

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.isDefault) {
      return NextResponse.json(
        { message: 'Cannot delete default category' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
