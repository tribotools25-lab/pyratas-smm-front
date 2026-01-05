"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const BACKEND_URL = "https://pyratas-smm-api.onrender.com";

type Mode = "login" | "register";

export default function LoginClient() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = useMemo(() => {
    const v = email.trim().toLowerCase();
    return v.includes("@") && v.includes(".");
  }, [email]);

  async function handleLogin() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login-json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Credenciais inválidas");
      window.location.href = next;
    } catch {
      setError("Login inválido");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError("");
    setSuccess("");

    const e = email.trim().toLowerCase();
    if (!isValidEmail) return setError("Digite um e-mail válido.");
    if (!password || password.length < 6)
      return setError("Senha mínima: 6 caracteres.");

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: e, password, role: "user" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data?.detail || "Erro ao criar conta.");

      setSuccess("Conta criada! Agora faça login.");
      setMode("login");
      setPassword("");
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold text-white text-center">Pyratas</h1>

      {/* Botões bem explícitos */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
            setSuccess("");
          }}
          className={`w-1/2 px-4 py-2 rounded text-white ${
            mode === "login" ? "bg-blue-600" : "bg-neutral-800"
          }`}
        >
          Entrar
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
            setSuccess("");
          }}
          className={`w-1/2 px-4 py-2 rounded text-white ${
            mode === "register" ? "bg-green-600" : "bg-neutral-800"
          }`}
        >
          Criar conta
        </button>
      </div>

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
        placeholder={mode === "login" ? "Senha" : "Crie uma senha (mín. 6)"}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {success && <p className="text-green-500 text-sm">{success}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={mode === "login" ? handleLogin : handleRegister}
        disabled={loading}
        className="w-full bg-neutral-950 border border-neutral-700 px-4 py-2 rounded text-white disabled:opacity-60"
      >
        {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar minha conta"}
      </button>
    </div>
  );
}
