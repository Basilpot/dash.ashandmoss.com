import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { storeId } = (await request.json().catch(() => ({}))) as { storeId?: string };
  if (!storeId || !/^[0-9a-f-]{36}$/i.test(storeId)) {
    return Response.json({ message: "Invalid store" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("store_id", storeId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return new Response(null, { status: 204 });
}
