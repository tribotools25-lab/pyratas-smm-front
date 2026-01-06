import { NextResponse } from "next/server";

export async function GET() {
  // Retorna "não logado" de forma válida (JSON), evita o erro do NextAuth tentando parsear HTML
  return NextResponse.json(null, { status: 200 });
}
