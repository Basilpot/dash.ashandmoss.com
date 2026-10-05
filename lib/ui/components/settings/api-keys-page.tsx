"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { EmptyState } from "../empty-state";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type ApiKey,
  type ApiKeyScope,
} from "../../lib/api-keys";

// Read straight from process.env rather than via the app's lib/env module: that
// module validates server-side config at import time and throws, which would take
// this client component down with it. NEXT_PUBLIC_* has to stay a literal
// expression anyway so Next can inline it at build.
const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "";

const SCOPES: { value: ApiKeyScope; label: string; help: string }[] = [
  {
    value: "read",
    label: "Read",
    help: "Fetch products, categories, pages and site config for this store.",
  },
  {
    value: "write",
    label: "Write",
    help: "Create orders through the API.",
  },
];

function relative(value: string | null, fallback: string) {
  if (!value) return fallback;
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = async () => {
    try {
      setKeys(await listApiKeys());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, []);

  const confirmRevoke = async () => {
    if (!pendingRevoke) return;
    setRevoking(true);
    try {
      await revokeApiKey(pendingRevoke.id);
      toast.success(`${pendingRevoke.name} revoked`);
      setPendingRevoke(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke key");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" /> Create key
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading keys…</p>
      ) : keys.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No API keys yet"
          description="Create a key to connect a custom site to this store's catalogue."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" /> Create your first key
            </Button>
          }
        />
      ) : (
        <ul className="border-t border-border">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center gap-4 border-b border-border py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{key.name}</span>
                  <code className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {key.prefix}…
                  </code>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {key.scopes.join(" · ")} · created {relative(key.createdAt, "")} · last
                  used {relative(key.lastUsedAt, "never")}
                  {key.expiresAt ? ` · expires ${new Date(key.expiresAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Revoke ${key.name}`}
                onClick={() => setPendingRevoke(key)}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <CreateKeySheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />

      <AlertDialog
        open={pendingRevoke !== null}
        onOpenChange={(open: boolean) => !open && setPendingRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke {pendingRevoke?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Requests using this key will stop working immediately. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={revoking} onClick={confirmRevoke}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CreateKeySheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<ApiKeyScope[]>(["read"]);
  const [expiry, setExpiry] = useState("");
  const [saving, setSaving] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setName("");
    setScopes(["read"]);
    setExpiry("");
    setSecret(null);
    setCopied(false);
  };

  const toggle = (scope: ApiKeyScope) =>
    setScopes((current) =>
      current.includes(scope)
        ? current.filter((s) => s !== scope)
        : // read is the floor — a key with neither scope could do nothing.
          scope === "write" && current.length === 0
          ? ["read", "write"]
          : [...current, scope],
    );

  const submit = async () => {
    if (!name.trim() || scopes.length === 0) return;
    setSaving(true);
    try {
      const created = await createApiKey({
        name: name.trim(),
        scopes,
        expiresInDays: expiry ? Number(expiry) : null,
      });
      setSecret(created.secret);
      await onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      toast.error("Could not copy — select the key and copy manually");
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{secret ? "Save your key" : "Create API key"}</SheetTitle>
          <SheetDescription>
            {secret
              ? "This is the only time it will be shown."
              : "Connect a custom site to this store."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4">
          {secret ? (
            <>
              <div className="flex gap-3 rounded-md bg-muted p-3 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  Copy this now — only a hash is stored, so it cannot be shown
                  again. If you lose it, revoke this key and create another.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-key">Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-key"
                    readOnly
                    value={secret}
                    className="font-mono text-xs"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Copy key"
                    onClick={copy}
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
              {apiBase ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Send it as a bearer token:</p>
                  <code className="block overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                    curl -H &quot;Authorization: Bearer {secret.slice(0, 12)}…&quot;{" "}
                    {apiBase}/products
                  </code>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="key-name">Name</Label>
                  <span className="text-xs text-muted-foreground">{name.length}/80</span>
                </div>
                <Input
                  id="key-name"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Production storefront"
                />
                <p className="text-sm text-muted-foreground">
                  Something you&apos;ll recognise in this list later.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Scopes</Label>
                <div className="grid gap-2">
                  {SCOPES.map((scope) => {
                    const on = scopes.includes(scope.value);
                    return (
                      <button
                        key={scope.value}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggle(scope.value)}
                        className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${
                          on ? "border-primary" : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                            on ? "bg-primary text-primary-foreground" : "border"
                          }`}
                        >
                          {on ? <Check className="size-3" /> : null}
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{scope.label}</span>
                          <span className="block text-sm text-muted-foreground">
                            {scope.help}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-expiry">Expires</Label>
                <Input
                  id="key-expiry"
                  type="number"
                  min={1}
                  max={3650}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="Never"
                />
                <p className="text-sm text-muted-foreground">
                  Leave blank for a key that does not expire.
                </p>
              </div>
            </>
          )}
        </div>

        <SheetFooter>
          {secret ? (
            <Button
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={saving || !name.trim() || scopes.length === 0}
              >
                {saving ? "Creating…" : "Create key"}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}