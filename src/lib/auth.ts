import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      companyId: string;
      accessToken: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    companyId: string;
    accessToken: string;
    name?: string | null;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    companyId: string;
    accessToken: string;
  }
}

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
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        try {
          const API_URL = process.env.CORE_API_URL || "http://localhost:3003";
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              identifier: credentials.email as string,
              password: credentials.password as string,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Email hoặc mật khẩu không đúng");
          }

          const profileRes = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${data.data.accessToken}`,
            },
          });

          if (!profileRes.ok) {
            throw new Error("Không thể lấy thông tin người dùng");
          }

          const profileData = await profileRes.json();
          const userProfile = profileData.data;

          const rawRole = Array.isArray(userProfile.roles)
            ? userProfile.roles[0]
            : userProfile.roles?.[0]?.name;

          const roleString = String(rawRole || "").toLowerCase();
          const roleMap: Record<string, string> = {
            owner: "ADMIN",
            admin: "ADMIN",
            administrator: "ADMIN",
            manager: "MANAGER",
            sales: "EMPLOYEE",
            user: "EMPLOYEE",
            employee: "EMPLOYEE",
          };

          const normalizedRole = roleMap[roleString] || "EMPLOYEE";

          return {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.fullName,
            role: normalizedRole,
            companyId: userProfile.companyId,
            accessToken: data.data.accessToken,
          };
        } catch (error: any) {
          throw new Error(error.message || "Đăng nhập thất bại");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "DafaSecureSecret123!@#",
});
