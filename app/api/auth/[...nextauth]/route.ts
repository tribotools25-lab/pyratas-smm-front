import NextAuth from "next-auth";
import { authConfig } from "./auth";

const { handlers } = NextAuth(authConfig);

export const GET = handlers.GET;
export const POST = handlers.POST;

// (opcional, mas ajuda o Next a não tentar Edge)
export const runtime = "nodejs";
