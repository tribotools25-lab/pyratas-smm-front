// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth";

const auth = NextAuth(authConfig);

export const GET = auth.handlers.GET;
export const POST = auth.handlers.POST;
