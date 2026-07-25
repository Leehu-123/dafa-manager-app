import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            userRoles: {
              include: { role: true }
            }
          }
        });

        if (!user || !user.passwordHash || !user.isActive) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }
        
        let primaryRole = 'EMPLOYEE';
        if (user.userRoles) {
          const roleNames = user.userRoles.map(ur => ur.role.name.toUpperCase());
          if (roleNames.includes('DAFA_ADMIN')) primaryRole = 'ADMIN';
          else if (roleNames.includes('DAFA_MANAGER')) primaryRole = 'MANAGER';
          else if (roleNames.includes('DAFA_ACCOUNTANT')) primaryRole = 'ACCOUNTANT';
          else if (roleNames.includes('ADMIN') && !roleNames.some(r => r.startsWith('DAFA_'))) primaryRole = 'ADMIN'; // Fallback for old seeds if no DAFA role exists
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: primaryRole,
          companyId: user.companyId
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
});
