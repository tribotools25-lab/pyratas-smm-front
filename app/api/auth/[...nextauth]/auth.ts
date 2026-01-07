import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const BACKEND_BASE =
  process.env.BACKEND_BASE || "https://pyratas-smm-api.onrender.com";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const c = (credentials ?? {}) as Record<string, string>;
        const email = (c.email ?? "").trim().toLowerCase();
        const password = c.password ?? "";

        if (!email || !password) return null;

        const res = await fetch(`${BACKEND_BASE}/api/auth/login-json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return null;

        const data = await res.json().catch(() => ({} as any));

        return {
          id: email,
          email,
          accessToken: data.access_token,
          isAdmin: false,
        } as any;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.email = (user as any).email;
        token.isAdmin = (user as any).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      if (session.user) (session.user as any).email = token.email;
      (session as any).isAdmin = token.isAdmin;
      return session;
    },
  },

  pages: { signIn: "/en/login" },
};
