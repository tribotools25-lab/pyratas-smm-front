import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

const BACKEND_BASE =
  process.env.BACKEND_BASE || "https://pyratas-smm-api.onrender.com";

export const authConfig: NextAuthConfig = {
  trustHost: true, // 🔴 OBRIGATÓRIO NO RENDER

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        const res = await fetch(`${BACKEND_BASE}/api/auth/login-json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return null;

        const data = await res.json();

        return {
          id: email,
          email,
          accessToken: data.access_token,
          isAdmin: data.is_admin === true,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).isAdmin = token.isAdmin;
      return session;
    },
  },

  pages: {
    signIn: "/pt/login",
  },
};
