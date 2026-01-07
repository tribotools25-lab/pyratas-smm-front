import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const BACKEND_BASE =
  process.env.BACKEND_BASE || "https://pyratas-smm-api.onrender.com";

const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").trim().toLowerCase();
        const password = credentials?.password || "";
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
          role: data.role ?? "user",
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = user.accessToken;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      (session as any).accessToken = token.accessToken;
      (session.user as any).email = token.email;
      (session as any).role = token.role;
      return session;
    },
  },
  pages: { signIn: "/en/login" },
} as const;

const { handlers } = NextAuth(authConfig);

export const GET = handlers.GET;
export const POST = handlers.POST;
