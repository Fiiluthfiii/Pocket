import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(name, email, password) {
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Create default wallet for new user
  await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'Dompet Utama',
      type: 'cash',
      balance: 0,
    },
  });

  return user;
}
