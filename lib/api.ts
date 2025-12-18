const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function mustBase() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL não definido");
  return API_BASE;
}

export async function apiGet(path: string) {
  const res = await fetch(`${mustBase()}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Erro API GET ${path}`);
  return res.json();
}

export async function apiPost(path: string, body?: any) {
  const res = await fetch(`${mustBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : "{}",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Erro API POST ${path}`);
  return res.json();
}
