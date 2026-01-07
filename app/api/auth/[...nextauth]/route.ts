import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
        const email = (credentials?.email || "").trim().toLowerCase();
        const password = credentials?.password || "";

        if (!email || !password) return null;

        const res = await fetch(`${BACKEND_BASE}/api/auth/login-json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // importante: sempre JSON
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return null;

        // backend retorna { access_token, token_type }
        const data = await res.json();

        const accessToken = data?.access_token;
        if (!accessToken) return null;

        return {
          id: email,
          email,
          accessToken,
          // se você quiser controlar admin por role depois:
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
      // garante que session.user exista
      if (!session.user) session.user = {} as any;

      (session as any).accessToken = token.accessToken;
      (session as any).isAdmin = token.isAdmin;

      (session.user as any).email = token.email;
      (session.user as any).accessToken = token.accessToken;

      return session;
    },
  },

  // ⚠️ Isso aqui evita alguns loops dependendo do locale
  pages: { signIn: "/en/login" },

  // Ajuda MUITO a debugar no Render
  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
