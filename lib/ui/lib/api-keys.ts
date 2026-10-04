import { apiFetch } from "./api";

export type ApiKeyScope = "read" | "write";

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: ApiKeyScope[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

const BASE = "/api-keys";

export async function listApiKeys(): Promise<ApiKey[]> {
  const res = await apiFetch<{ data: ApiKey[] }>(BASE);
  return Array.isArray(res?.data) ? res.data : [];
}

/** The plaintext is only ever present in this response. */
export async function createApiKey(input: {
  name: string;
  scopes: ApiKeyScope[];
  expiresInDays?: number | null;
}): Promise<ApiKey & { secret: string }> {
  const res = await apiFetch<{ data: ApiKey & { secret: string } }>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function updateApiKey(
  id: string,
  patch: { name?: string; scopes?: ApiKeyScope[] },
): Promise<ApiKey> {
  const res = await apiFetch<{ data: ApiKey }>(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return res.data;
}

export async function revokeApiKey(id: string): Promise<void> {
  await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
}