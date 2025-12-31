"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";

const API_BASE = "https://pyratas-smm-api.onrender.com";

export default function SetPasswordClient() {
  const searchParams = useSearchParams();
  const params = useParams() as { locale?: string };

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const locale = params?.locale || "en";

  async function handleSubmit() {
    setMsg("");
    if (!token) return setMsg("Token ausente no link.");
    if (!newPassword || newPassword.length < 6) return setMsg("Senha precisa ter no mínimo 6 caracteres.");
    if (newPassword !== confirm) return setMsg("As senhas não conferem.");

    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMsg(data?.detail || "Não foi possível definir a senha.");
        setLoading(false);
        return;
      }

      setMsg("Senha definida com sucesso! Redirecionando para login...");
      setTimeout(() => {
        window.location.href = `/${locale}/login`;
      }, 900);
    } catch (e) {
      setMsg("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-bold text-white">Definir nova senha</h1>

      {!token && (
        <div className="text-red-400 text-sm">
          Token não encontrado na URL. Use o link enviado pra você.
        </div>
      )}

      <input
        className="w-full p-2 rounded"
        type="password"
        placeholder="Nova senha"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        className="w-full p-2 rounded"
        type="password"
        placeholder="Confirmar senha"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      {msg && <p className={msg.includes("sucesso") ? "text-green-400" : "text-red-400"}>{msg}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 px-4 py-2 rounded text-white disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar senha"}
      </button>
    </div>
  );
}
