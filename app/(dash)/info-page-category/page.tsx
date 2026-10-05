"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { DataTable, type TPagination } from "@repo/ui";
import { PageHeader } from "@repo/ui";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@repo/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import {
  Plus,
  Edit3,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { generateSlug } from "@repo/ui";

interface InfoPageCategory {
  id: string;
  categoryHandle: string;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { infoPages: number; blogs: number };
}

interface FormState {
  categoryHandle: string;
  categoryName: string;
}

export default function InfoPageCategories() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<InfoPageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");
  const [pagination, setPagination] = useState<TPagination>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<InfoPageCategory | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    categoryHandle: "",
    categoryName: "",
  });
  const prevName = useRef("");

  useEffect(() => {
    const generated = generateSlug(form.categoryName);
    const stillAuto =
      !form.categoryHandle || form.categoryHandle === generateSlug(prevName.current);
    if (generated && stillAuto) {
      setForm((f) => ({ ...f, categoryHandle: generated }));
    }
    prevName.current = form.categoryName;
  }, [form.categoryName, form.categoryHandle]);

  const fetchCategories = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(
        `/api/info-page/categories?${params.toString()}`,
        {
          cache: "no-store",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error();
      const data = await res.json().catch(() => null);
      setCategories(data?.categories ?? []);
      setPagination(data?.pagination ?? undefined);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Changing page or search should still show the table's skeleton rows, but the
  // flag cannot be set from inside the effect without cascading a render. This is
  // React's documented alternative: adjust state while rendering.
  const requestKey = `${page}|${limit}`;
  const [lastRequestKey, setLastRequestKey] = useState(requestKey);
  if (lastRequestKey !== requestKey) {
    setLastRequestKey(requestKey);
    setLoading(true);
  }

  useEffect(() => {
    void (async () => {
      await fetchCategories();
    })();
  }, [page, limit]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ categoryHandle: "", categoryName: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: InfoPageCategory) => {
    setEditingId(cat.id);
    setForm({
      categoryHandle: cat.categoryHandle,
      categoryName: cat.categoryName ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.categoryHandle.trim()) {
      toast.error("Handle is required");
      return;
    }
    try {
      setFormLoading(true);
      const endpoint = editingId
        ? `/api/info-page/categories/${editingId}`
        : `/api/info-page/categories`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save");

      toast.success(editingId ? "Category updated!" : "Category created!");
      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const requestDelete = (cat: InfoPageCategory) => {
    setPendingDelete(cat);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const cat = pendingDelete;
    setFormLoading(true);
    try {
      const res = await fetch(
        `/api/info-page/categories/${cat.id}`,
        {
          method: "DELETE",
          cache: "no-store",
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data?.message || "Category deleted");
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        setPendingDelete(null);
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const columns: ColumnDef<InfoPageCategory, unknown>[] = [
    {
      id: "sn",
      header: "S.N",
      cell: ({ row }) => row.index + 1,
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openEdit(row.original)}
          className="font-medium hover:underline cursor-pointer text-left"
        >
          {row.original.categoryName ?? (
            <span className="text-muted-foreground">—</span>
          )}
        </button>
      ),
    },
    {
      id: "handle",
      header: "Handle",
      cell: ({ row }) => row.original.categoryHandle,
    },
    {
      id: "pages",
      header: "Usage",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original._count?.infoPages ?? 0} pages ·{" "}
          {row.original._count?.blogs ?? 0} posts
        </Badge>
      ),
    },
    {
      id: "created",
      header: "Created At",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <div className="flex gap-4">
            <Button size="lg" onClick={() => openEdit(cat)}>
              <Edit3 size={12} /> Edit
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => requestDelete(cat)}
            >
              <Trash2Icon size={12} /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <PageHeader
        title="Content Categories">
          <Button size="lg" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Create New
          </Button>
        </PageHeader>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={categories}
        pagination={pagination}
        isLoading={loading}
        emptyMessage="No categories yet. Create one to get started."
      />

      {/* Create / Edit Sheet */}
      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit Category" : "New Category"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Name</Label>
              <Input
                value={form.categoryName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryName: e.target.value }))
                }
                placeholder="Display name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">
                Handle{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (unique, lowercase, hyphenated)
                </span>
              </Label>
              <Input
                value={form.categoryHandle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryHandle: e.target.value }))
                }
                placeholder="e.g. getting-started"
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={formLoading}>
              {formLoading ? "Saving..." : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              &ldquo;{pendingDelete?.categoryName ?? pendingDelete?.categoryHandle}&rdquo;?
              {(pendingDelete?._count?.infoPages ?? 0) > 0 ||
              (pendingDelete?._count?.blogs ?? 0) > 0
                ? ` It has ${pendingDelete?._count?.infoPages ?? 0} page(s) and ${pendingDelete?._count?.blogs ?? 0} post(s) assigned.`
                : ""}{" "}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPendingDelete(null)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={confirmDelete}
              disabled={formLoading}
            >
              {formLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
