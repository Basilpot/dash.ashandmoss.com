import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const API = (process.env.API_BASE_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const cookieStore = await cookies();
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("cookie", cookieStore.toString());

  const storeId = cookieStore.get("store_id")?.value;
  if (storeId) headers.set("X-Store-Id", storeId);
  else headers.set("X-Store-Slug", process.env.DEFAULT_STORE_SLUG ?? "ash-and-moss");

  const url = new URL(`${API}/${path.join("/")}`);
  url.search = request.nextUrl.search;
  const response = await fetch(url, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
