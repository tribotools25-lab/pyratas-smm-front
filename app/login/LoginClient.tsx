// app/login/LoginClient.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function LoginClient() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      const res = await apiPost("/api/auth/login-json", { email, password });

      // se você ainda usa localStorage:
      localStorage.setItem("token", res.access_token);

      window.location.href = next;
    } catch (e) {
      setError("Login inválido");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-bold text-white">Login</h1>

      <input
        className="w-full p-2 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full p-2 rounded"
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleLogin}
        className="bg-blue-600 px-4 py-2 rounded text-white"
      >
        Entrar
      </button>
    </div>
  );
}
