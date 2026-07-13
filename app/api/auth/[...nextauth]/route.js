import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getUserByEmail, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        const user = await getUserByEmail(credentials.email);

        if (!user) {
          throw new Error('Email atau password salah');
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Email atau password salah');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user for Google sign-in
            const newUser = await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                password: '', // No password for OAuth users
                avatarUrl: user.image,
              },
            });

            // Create default wallet
            await prisma.wallet.create({
              data: {
                userId: newUser.id,
                name: 'Dompet Utama',
                type: 'cash',
                balance: 0,
              },
            });

            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          // ALLOW LOGIN anyway, just log error
          // User will still be authenticated via JWT
          // Database will be synced later
          if (!user.id) {
            user.id = user.email; // Use email as temporary ID
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
