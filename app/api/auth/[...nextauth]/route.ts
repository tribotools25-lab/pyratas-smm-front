import NextAuth from "next-auth";
import { authOptions } from "./auth";

const nextAuthResult = NextAuth(authOptions as any);

// ✅ App Router quer exports diretos de funções GET/POST
export const GET = nextAuthResult.handlers.GET;
export const POST = nextAuthResult.handlers.POST;
