// app/login/LoginClient.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const BACKEND_URL = "https://pyratas-smm-api.onrender.com";

export default function LoginClient() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/auth/login-json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 🔥 O MAIS IMPORTANTE
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Credenciais inválidas");
      }

      // backend já seta o cookie HttpOnly
      // NÃO precisa salvar token em localStorage
      window.location.href = next;
    } catch (err) {
      setError("Login inválido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-bold text-white text-center">
        Login
      </h1>

      <input
        className="w-full p-2 rounded bg-neutral-900 text-white border border-neutral-700"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full p-2 rounded bg-neutral-900 text-white border border-neutral-700"
        type="password"
        placeholder="Senha"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </div>
  );
}
