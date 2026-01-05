// app/login/LoginClient.tsx
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
        credentials: "include", // ✅ cookie HttpOnly
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
    if (!isValidEmail) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Sua senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: e,
          password,
          role: "user",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.detail || "Não foi possível criar a conta.");
        return;
      }

      // Se usuário já existir, seu backend retorna ok True também.
      setSuccess("Conta criada! Agora faça login.");
      setMode("login");
      setPassword("");
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const onPrimary = mode === "login" ? handleLogin : handleRegister;

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Pyratas</h1>
        <p className="text-sm text-neutral-400">
          Acesse sua conta para gerenciar créditos e pedidos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-neutral-800">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
            setSuccess("");
          }}
          className={`w-1/2 py-2 text-sm ${
            mode === "login"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-950 text-neutral-400 hover:text-white"
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
          className={`w-1/2 py-2 text-sm ${
            mode === "register"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-950 text-neutral-400 hover:text-white"
          }`}
        >
          Criar conta
        </button>
      </div>

      {/* Form */}
      <div className="space-y-3">
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

        {success && (
          <p className="text-green-500 text-sm text-center">{success}</p>
        )}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={onPrimary}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white disabled:opacity-50"
        >
          {loading
            ? "Aguarde..."
            : mode === "login"
            ? "Entrar"
            : "Criar conta"}
        </button>

        {mode === "login" && (
          <p className="text-xs text-neutral-500 text-center">
            Ainda não tem conta?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Criar agora
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
