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

    // Use raw SQL to fetch data to ensure we get phone and bio
    const users = await prisma.$queryRawUnsafe(`
      SELECT id, name, email, phone, bio, "avatarUrl"
      FROM "User" 
      WHERE id = '${session.user.id}'
    `);

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Return user with all fields
    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, bio } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { message: 'Nama dan email harus diisi' },
        { status: 400 }
      );
    }

    // Check if email already exists for another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { message: 'Email sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // FIRST: Ensure columns exist
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT;`);
    } catch (alterError) {
      console.log('Columns might already exist:', alterError.message);
    }

    // SECOND: Update using raw SQL to be absolutely sure
    const escapedName = (name || '').replace(/'/g, "''");
    const escapedEmail = (email || '').replace(/'/g, "''");
    const escapedPhone = (phone || '').replace(/'/g, "''");
    const escapedBio = (bio || '').replace(/'/g, "''");

    await prisma.$executeRawUnsafe(`
      UPDATE "User" 
      SET 
        name = '${escapedName}',
        email = '${escapedEmail}',
        phone = '${escapedPhone}',
        bio = '${escapedBio}'
      WHERE id = '${session.user.id}'
    `);

    // THIRD: Fetch the updated user to confirm
    const updatedUser = await prisma.$queryRawUnsafe(`
      SELECT id, name, email, phone, bio 
      FROM "User" 
      WHERE id = '${session.user.id}'
    `);

    const user = updatedUser[0];

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Error: ' + error.message },
      { status: 500 }
    );
  }
}

