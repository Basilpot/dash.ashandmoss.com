import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { API_BASE_URL, DEFAULT_STORE_SLUG } from "@/lib/env";

const API = API_BASE_URL;

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const cookieStore = await cookies();
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("cookie", cookieStore.toString());

  const storeId = cookieStore.get("store_id")?.value;
  if (storeId) headers.set("X-Store-Id", storeId);
  else headers.set("X-Store-Slug", DEFAULT_STORE_SLUG);

  const url = new URL(`${API}/${path.join("/")}`);
  url.search = request.nextUrl.search;
  const response = await fetch(url, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  // Do not forward content-encoding/content-length. The upstream can advertise
  // an encoding its body was not actually compressed with (wrangler dev does
  // exactly this), and passing the header through alongside an already-decoded
  // stream makes every browser request fail with ERR_CONTENT_DECODING_FAILED.
  // Re-encoding is the runtime's job, not the proxy's.
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (key === "content-encoding" || key === "content-length") return;
    responseHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
