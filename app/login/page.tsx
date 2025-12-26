"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const sp = useSearchParams();
  const next = sp.get("next") || `/${locale}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!r.ok) {
      setError("Login inválido");
      return;
    }

    window.location.href = next;
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-bold text-white">Login</h1>

      <input className="w-full p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full p-2 rounded" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <p className="text-red-500">{error}</p>}

      <button onClick={handleLogin} className="bg-blue-600 px-4 py-2 rounded text-white">
        Entrar
      </button>
    </div>
  );
}

// app/login/page.tsx
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Carregando...</div>}>
      <LoginClient />
    </Suspense>
  );
}
