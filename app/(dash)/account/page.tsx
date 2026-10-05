"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import { FormSkeleton } from "@repo/ui";
import { KeyRound, Loader2 } from "lucide-react";

async function apiMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return body?.message ?? fallback;
}

type Admin = {
  username: string;
  email: string;
  role: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Admin | null>(null);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [busy, setBusy] = useState<"profile" | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const admin = data?.data?.admin;
        if (!admin) return;
        setMe(admin);
        setProfile((p) => ({
          ...p,
          username: admin.username,
          email: admin.email,
        }));
      })
      .catch(() => toast.error("Failed to load account"));
  }, []);

  const saveProfile = async () => {
    if (profile.newPassword !== profile.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    const payload: Record<string, string> = {
      username: profile.username,
      email: profile.email,
    };
    if (profile.currentPassword) payload.currentPassword = profile.currentPassword;
    if (profile.newPassword) payload.newPassword = profile.newPassword;

    setBusy("profile");
    try {
      const res = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await apiMessage(res, `HTTP ${res.status}`));
      setProfile((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
      toast.success("Profile updated");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message ?? `Save failed: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  if (!me)
    return (
      <div className="max-w-3xl">
        <FormSkeleton />
      </div>
    );

  return (
    <div className="max-w-3xl space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">Username</Label>
          <Input
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">Login email</Label>
          <Input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <KeyRound className="size-4 shrink-0" aria-hidden />
          To change your password, enter your current password and a new one. Leave blank to keep it.
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Current password</Label>
            <Input
              type="password"
              value={profile.currentPassword}
              onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">New password</Label>
            <Input
              type="password"
              value={profile.newPassword}
              onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Confirm new password</Label>
            <Input
              type="password"
              value={profile.confirmPassword}
              onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <Button onClick={saveProfile} disabled={busy === "profile"}>
        {busy === "profile" && <Loader2 className="mr-1 size-4 animate-spin" />}
        Save profile
      </Button>
    </div>
  );
}
