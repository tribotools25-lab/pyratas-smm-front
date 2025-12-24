"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

type Order = {
  id: number;
  user_email: string;
  service: number;
  quantity: number;
  link: string;
  provider_order_id: string;
  status: string;
  created_at: string;
  remains?: number | null;
  start_count?: number | null;
  charge?: number | null;
  updated_at?: string | null;
  last_sync_error?: string | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    setLoading(true);
    try {
      const data = await apiGet("/api/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Falha ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function syncOpen() {
    setMsg("");
    setBusy(true);
    try {
      const res = await apiPost("/api/orders/sync", { only_open: true, limit: 50 });
      setMsg(`Sync OK • updated: ${res?.updated ?? 0}`);
      await load();
    } catch (e: any) {
      console.error(e);
      setMsg(`Sync falhou: ${e?.message || "erro"}`);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <Link
          href="/"
          className="px-3 py-2 rounded bg-white/10 text-white hover:bg-white/15"
        >
          ← Voltar
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={load}
          className="rounded bg-white/10 text-white px-4 py-2 hover:bg-white/15"
        >
          Recarregar
        </button>

        <button
          onClick={syncOpen}
          disabled={busy}
          className="rounded bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Sincronizando..." : "Sync (abertos)"}
        </button>

        {msg && <span className="text-white/80 text-sm">{msg}</span>}
      </div>

      {loading ? (
        <p className="text-white">Carregando...</p>
      ) : (
        <div className="rounded border border-white/10 overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0b1220] text-white/80">
                <tr>
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">Serviço</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Provider</th>
                  <th className="text-right px-3 py-2">Qtd</th>
                  <th className="text-left px-3 py-2">Link</th>
                  <th className="text-left px-3 py-2">Criado</th>
                </tr>
              </thead>
              <tbody className="text-white/90">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="px-3 py-2 font-mono">{o.id}</td>
                    <td className="px-3 py-2 font-mono">{o.service}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded bg-white/10">
                        {o.status}
                      </span>
                      {o.last_sync_error ? (
                        <div className="text-xs text-red-300 mt-1">
                          {o.last_sync_error}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {o.provider_order_id || "-"}
                    </td>
                    <td className="px-3 py-2 text-right">{o.quantity}</td>
                    <td className="px-3 py-2">
                      <a
                        href={o.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-300 hover:underline break-all"
                      >
                        abrir
                      </a>
                    </td>
                    <td className="px-3 py-2 text-xs text-white/70">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-3 py-2 text-xs text-white/60 bg-white/5">
            Total: {orders.length}
          </div>
        </div>
      )}
    </div>
  );
}
