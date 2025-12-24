"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@teste.com");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onLogin() {
    setMsg("");
    setBusy(true);
    try {
      await login(email, password);
      setMsg("✅ Logado!");
      router.push("/");
    } catch (e: any) {
      console.error(e);
      setMsg(`❌ Falha: ${e?.message || "erro"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-white">Login</h1>

      <input
        className="w-full rounded bg-white/5 text-white px-3 py-2 outline-none border border-white/10"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded bg-white/5 text-white px-3 py-2 outline-none border border-white/10"
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={onLogin}
        disabled={busy}
        className="w-full rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Entrando..." : "Entrar"}
      </button>

      {msg && <p className="text-white/80 text-sm">{msg}</p>}
    </div>
  );
}
