export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const apiBase = "/api";
  const url = `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {};

  if (
    options?.body instanceof FormData ||
    options?.headers instanceof Headers ||
    (options?.headers && "get" in options.headers)
  ) {
    // Let browser set Content-Type for FormData
  } else if (options?.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    credentials: "include",
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
    ...options,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return new Promise(() => {});
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Something went wrong");
  }

  const body = await res.json().catch(() => undefined);
  // The API answers with { message, data } (see api/src/lib/http.ts ok()).
  // Unwrap it here so callers get the payload rather than having to remember
  // the envelope — otherwise every `apiFetch<T>` whose T is the payload
  // silently returns the wrapper instead.
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body;
}
