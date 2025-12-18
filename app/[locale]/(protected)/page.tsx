"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function Page() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet("/api/catalog")
      .then((data) => {
        setServices(data);
      })
      .catch((err) => {
        setError("Erro ao carregar catálogo");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-white">Carregando catálogo...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">
        Catálogo de Serviços
      </h1>

      <pre className="bg-black text-green-400 p-4 rounded">
        {JSON.stringify(services, null, 2)}
      </pre>
    </div>
  );
}
