// app/api/auth/[...nextauth]/auth.ts
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_BASE =
  process.env.BACKEND_BASE || "https://pyratas-smm-api.onrender.com";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = String((credentials as any)?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String((credentials as any)?.password ?? "");

        if (!email || !password) return null;

        const res = await fetch(`${BACKEND_BASE}/api/auth/login-json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return null;

        const data = await res.json().catch(() => ({}));

        return {
          id: email,
          email,
          accessToken: data?.access_token,
          isAdmin: data?.role === "admin" || data?.is_admin === true,
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
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken;
      (session.user as any).email = (token as any).email;
      (session as any).isAdmin = (token as any).isAdmin;
      return session;
    },
  },

  pages: {
    signIn: "/en/login",
  },
};

export const authConfig: NextAuthConfig = {
  trustHost: true, // ✅ ESSENCIAL NO RENDER
  providers: [
    // ...
  ],
  // resto igual
};

