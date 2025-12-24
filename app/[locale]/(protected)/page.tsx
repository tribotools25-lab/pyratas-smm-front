"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

type Service = {
  service: number;
  name: string;
  category?: string;
  type?: string;
  rate?: string | number;
  min?: number;
  max?: number;
};

export default function Page() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");

  // formulário rápido de pedido
  const [serviceId, setServiceId] = useState<number | "">("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(100);
  const [orderMsg, setOrderMsg] = useState<string>("");

  useEffect(() => {
    apiGet("/api/catalog")
      .then((data) => {
        // seu backend pode retornar array direto ou {services:[...]}
        const list = Array.isArray(data) ? data : (data?.services ?? []);
        setServices(list);
      })
      .catch((err) => {
        setError("Erro ao carregar catálogo");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => s.category && set.add(s.category));
    return Array.from(set).sort();
  }, [services]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return services.filter((s) => {
      const okCat = category ? (s.category || "") === category : true;
      const okQ = qq
        ? String(s.service).includes(qq) ||
          (s.name || "").toLowerCase().includes(qq) ||
          (s.category || "").toLowerCase().includes(qq)
        : true;
      return okCat && okQ;
    });
  }, [services, q, category]);

  const selected = useMemo(() => {
    if (!serviceId) return null;
    return services.find((s) => s.service === serviceId) || null;
  }, [serviceId, services]);

  async function createOrder() {
    setOrderMsg("");
    if (!serviceId) return setOrderMsg("Selecione um serviço.");
    if (!link.trim()) return setOrderMsg("Informe o link.");
    if (!quantity || quantity <= 0) return setOrderMsg("Quantidade inválida.");

    // valida min/max se existir
    const min = selected?.min ?? 0;
    const max = selected?.max ?? 0;
    if (min && quantity < min) return setOrderMsg(`Quantidade mínima: ${min}`);
    if (max && quantity > max) return setOrderMsg(`Quantidade máxima: ${max}`);

    try {
      setBusy(true);
      const resp = await apiPost("/api/order", {
        service: serviceId,
        quantity,
        link: link.trim(),
      });

      setOrderMsg(
        `✅ Pedido criado! Provider order: ${resp?.provider_order_id || "-"}`
      );
    } catch (e: any) {
      console.error(e);
      setOrderMsg(`❌ Falha ao criar pedido: ${e?.message || "erro"}`);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-white">Carregando catálogo...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Catálogo de Serviços</h1>

        <Link
          href="/orders"
          className="px-3 py-2 rounded bg-white/10 text-white hover:bg-white/15"
        >
          Ver pedidos →
        </Link>
      </div>

      {/* filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="w-full rounded bg-white/5 text-white px-3 py-2 outline-none border border-white/10"
          placeholder="Buscar por nome, categoria ou id..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="w-full rounded bg-white/5 text-white px-3 py-2 outline-none border border-white/10"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={async () => {
            setLoading(true);
            try {
              await apiPost("/api/catalog/refresh", {});
              const data = await apiGet("/api/catalog");
              const list = Array.isArray(data) ? data : (data?.services ?? []);
              setServices(list);
            } catch (e) {
              console.error(e);
            } finally {
              setLoading(false);
            }
          }}
          className="rounded bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700"
        >
          Atualizar catálogo
        </button>
      </div>

      {/* criação rápida de pedido */}
      <div className="rounded border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Criar pedido</h2>
          <span className="text-xs text-white/60">
            (precisa estar logado — token no localStorage)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            className="rounded bg-white/5 text-white px-3 py-2 outline-none border border-white/10 md:col-span-2"
            value={serviceId}
            onChange={(e) => setServiceId(Number(e.target.value))}
          >
            <option value="">Selecione um serviço</option>
            {filtered.slice(0, 300).map((s) => (
              <option key={s.service} value={s.service}>
                [{s.service}] {s.category ? `${s.category} — ` : ""}{s.name}
              </option>
            ))}
          </select>

          <input
            className="rounded bg-white/5 text-white px-3 py-2 outline-none border border-white/10"
            placeholder="Quantidade"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <input
            className="rounded bg-white/5 text-white px-3 py-2 outline-none border border-white/10"
            placeholder="Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        {selected && (
          <p className="text-white/70 text-sm">
            Selecionado: <b className="text-white">[{selected.service}]</b>{" "}
            {selected.name}{" "}
            {selected.min ? `• min ${selected.min}` : ""}{" "}
            {selected.max ? `• max ${selected.max}` : ""}{" "}
            {selected.rate ? `• rate ${selected.rate}` : ""}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={createOrder}
            disabled={busy}
            className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Criando..." : "Criar pedido"}
          </button>

          {orderMsg && (
            <span className="text-sm text-white/80">{orderMsg}</span>
          )}
        </div>
      </div>

      {/* tabela */}
      <div className="rounded border border-white/10 overflow-hidden">
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0b1220] text-white/80">
              <tr>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Categoria</th>
                <th className="text-left px-3 py-2">Nome</th>
                <th className="text-right px-3 py-2">Min</th>
                <th className="text-right px-3 py-2">Max</th>
                <th className="text-right px-3 py-2">Rate</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              {filtered.slice(0, 1000).map((s) => (
                <tr
                  key={s.service}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-3 py-2 font-mono">{s.service}</td>
                  <td className="px-3 py-2">{s.category || "-"}</td>
                  <td className="px-3 py-2">{s.name}</td>
                  <td className="px-3 py-2 text-right">{s.min ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{s.max ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{s.rate ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2 text-xs text-white/60 bg-white/5">
          Mostrando {Math.min(filtered.length, 1000)} de {filtered.length} serviços
        </div>
      </div>
    </div>
  );
}
