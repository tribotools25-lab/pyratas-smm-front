function mustBase() {
  // sempre same-origin, porque /api/backend faz proxy pro backend real
  return "";
}

async function handle(res: Response, method: string, path: string) {
  if (res.status === 401) {
    // se não autenticado, joga pro login (middleware já faz, mas isso ajuda em chamadas via fetch)
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${method} ${path} failed: ${res.status} ${txt}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function apiGet(path: string) {
  const res = await fetch(`${mustBase()}/api/backend${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" } as Record<string, string>,
    cache: "no-store",
  });
  return handle(res, "GET", path);
}

export async function apiPost(path: string, body?: any) {
  const res = await fetch(`${mustBase()}/api/backend${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" } as Record<string, string>,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  return handle(res, "POST", path);
}
