"use client";

import { useEffect, useState } from "react";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { PageHeader } from "@repo/ui";
import { Textarea } from "@repo/ui";
import { Label } from "@repo/ui";
import { toast } from "sonner";
import { LucideMailPlus, LucideSend, LucideUserPlus, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@repo/ui";

import { DataTable } from "@repo/ui";
import { createColumns, Subscriber } from "./columns";

const API = "/api";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");

  const [blastOpen, setBlastOpen] = useState(false);
  const [blastSubject, setBlastSubject] = useState("");
  const [blastContent, setBlastContent] = useState("");
  const [sending, setSending] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/newsletter`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setSubscribers(json.data ?? []);
    } catch {
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleAdd = async () => {
    if (!addEmail) return;
    const res = await fetch(`${API}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: addEmail }),
    });
    const json = await res.json();
    if (res.ok) {
      toast.success(json?.message || "Subscribed");
      setAddOpen(false);
      setAddEmail("");
      fetchSubscribers();
    } else {
      toast.error(json?.message || "Failed to subscribe");
    }
  };

  const handleBlast = async () => {
    if (!blastSubject || !blastContent) return;
    setSending(true);
    const res = await fetch(`${API}/newsletter/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ subject: blastSubject, content: blastContent }),
    });
    const json = await res.json();
    setSending(false);
    if (res.ok) {
      toast.success("Newsletter sent!");
      setBlastOpen(false);
      setBlastSubject("");
      setBlastContent("");
    } else {
      toast.error(json?.message || "Failed to send");
    }
  };

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          title="Newsletter Subscribers"
          description={`${activeCount} active / ${subscribers.length} total`}
        >
          <Button size="lg" variant="secondary" onClick={() => setAddOpen(true)}>
            <LucideUserPlus className="mr-2 h-4 w-4" />
            Add
          </Button>
          <Button size="lg" onClick={() => setBlastOpen(true)}>
            <LucideSend className="mr-2 h-4 w-4" />
            Send Blast
          </Button>
        </PageHeader>
      </div>

      <DataTable columns={createColumns(fetchSubscribers)} data={subscribers} isLoading={loading} />

      {/* Add Subscriber */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Subscriber</SheetTitle>
            <SheetDescription>
              Manually subscribe an email address.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
            <div className="space-y-3">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2">
            <Button size="lg" onClick={handleAdd}>
              <LucideUserPlus className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Send Blast */}
      <Sheet open={blastOpen} onOpenChange={setBlastOpen}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Send Newsletter Blast</SheetTitle>
            <SheetDescription>
              Sends to all {activeCount} active subscribers.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Newsletter subject"
                value={blastSubject}
                onChange={(e) => setBlastSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Email body text..."
                rows={6}
                value={blastContent}
                onChange={(e) => setBlastContent(e.target.value)}
              />
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2">
            <Button size="lg" onClick={handleBlast} disabled={sending}>
              {sending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LucideMailPlus className="mr-2 h-4 w-4" />
              )}
              {sending ? "Sending..." : "Send"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
