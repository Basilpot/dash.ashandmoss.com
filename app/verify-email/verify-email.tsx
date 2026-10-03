"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function VerifyEmail({ token }: { token: string }) {
  const [message, setMessage] = useState(token ? "Verifying your email…" : "Invalid verification link.");
  useEffect(() => {
    if (!token) return;
    fetch("/api/platform/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then(async (response) => ({ ok: response.ok, payload: await response.json().catch(() => ({})) }))
      .then(async ({ ok, payload }) => {
        if (!ok) { setMessage(payload.message ?? "Verification failed."); return; }
        await fetch("/api/store-selection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId: payload.data.storeId }) });
        window.location.assign("/store-setup");
      })
      .catch(() => setMessage("Verification failed."));
  }, [token]);
  return <div className="space-y-4 text-center"><h1 className="text-2xl">Email verification</h1><p className="text-muted-foreground">{message}</p><Link href="/login" className="text-sm underline">Back to login</Link></div>;
}
