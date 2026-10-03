"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { EmptyState, PageHeader } from "@repo/ui";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@repo/ui";
import { ColumnDef } from "@tanstack/react-table";

import { Edit3, LucidePlus, LucideTag, Trash2Icon } from "lucide-react";

import { DataTable } from "@repo/ui";
import { TPagination } from "@/app/(dash)/types/pagination";
import { TipTapField } from "@repo/ui";
import { resolveMediaHtml } from "@repo/ui";
import { useSlugAutoFill } from "@repo/ui";

type TagForm = {
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isFeatured: boolean;
  isFeaturedInNav: boolean;
};

export default function Tags() {
  const searchParams = useSearchParams();

  const [tags, setTags] = useState<any[]>([]);
  // The fetch runs on mount, so the first render genuinely is loading. Starting
  // at false showed the empty state for a beat before the rows arrived.
  const [loading, setLoading] = useState(true);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");
  const [pagination, setPagination] = useState<TPagination>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTagSlug, setCurrentTagSlug] = useState<string | null>(null);
  const [currentTagId, setCurrentTagId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, setValue, watch } = useForm<TagForm>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
      isFeatured: false,
      isFeaturedInNav: false,
    },
  });

  useSlugAutoFill(control, setValue, "name", "slug");

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tags?page=${page}&limit=${limit}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setTags(data?.data?.tags ?? []);
      setPagination(data?.data?.pagination);
    } catch {
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [page, limit]);

  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentTagSlug(null);
    setCurrentTagId(null);
    reset({ name: "", slug: "", description: "", sortOrder: 0, isFeatured: false, isFeaturedInNav: false });
    setIsDialogOpen(true);
  };

  const openEditDialog = (tag: any) => {
    setIsEdit(true);
    setCurrentTagSlug(tag.slug);
    setCurrentTagId(tag.id);
    reset({
      name: tag.name,
      slug: tag.slug,
      description: tag.description ?? "",
      sortOrder: tag.sortOrder ?? 0,
      isFeatured: tag.isFeatured ?? false,
      isFeaturedInNav: tag.isFeaturedInNav ?? false,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: TagForm) => {
    const url = isEdit ? `/api/tags/${currentTagSlug}` : `/api/tags`;
    const method = isEdit ? "PATCH" : "POST";

    const payload: any = {
      ...data,
      description: await resolveMediaHtml(data.description || ""),
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();

    if (res.ok) {
      toast.success(
        isEdit ? "Tag updated successfully" : "Tag added successfully",
      );
      setIsDialogOpen(false);
      fetchTags();
    } else {
      toast.error(resJson?.message || "Something went wrong");
    }
  };

  const deleteTag = async (id: string) => {
    const res = await fetch(`/api/tags/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data?.message || "Tag deleted");
      fetchTags();
    } else {
      toast.error(data?.message || "Something went wrong");
    }
  };

  const tagColumns: ColumnDef<any>[] = [
    {
      header: "S.N",
      cell: ({ row }) => row.index + 1,
    },
    {
      header: "Name",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openEditDialog(row.original)}
          className="font-medium hover:underline cursor-pointer text-left"
        >
          {row.original.name}
        </button>
      ),
    },
    { accessorKey: "slug", header: "Slug/URL" },
    {
      header: "Products",
      cell: ({ row }) => row.original._count?.products ?? 0,
    },
    {
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.original.description ? (
            <div
              className="[&_p]:mb-0 [&_p]:inline"
              dangerouslySetInnerHTML={{
                __html: row.original.description,
              }}
            />
          ) : (
            "—"
          )}
        </div>
      ),
    },
    {
      header: "Created At",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-4">
          <Button size="lg" onClick={() => openEditDialog(row.original)}>
            <Edit3 size={12} /> Edit
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              setCurrentTagId(row.original.id);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2Icon size={12} /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          title="Tags"
          description="Curated tags that highlight products"
        >
          <Button size="lg" onClick={openCreateDialog}>
            <LucidePlus className="mr-2" size={18} />
            Add New Tag
          </Button>
        </PageHeader>
      </div>

      <DataTable
        columns={tagColumns}
        data={tags}
        isLoading={loading}
        pagination={pagination}
        emptyState={
          <EmptyState
            icon={LucideTag}
            title="No tags yet"
            description="Tags let customers filter and search across your catalogue."
            action={(
              <Button onClick={openCreateDialog}>
                <LucidePlus className="mr-2" size={18} />
                Add tag
              </Button>
            )}
          />
        }
      />

      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {isEdit ? "Edit Tag" : "Add New Tag"}
            </SheetTitle>
            <SheetDescription>
              {isEdit
                ? "Update the tag details."
                : "Create a new tag."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
              <div className="space-y-2">
                <Label className="flex gap-4 items-center">Tag Name</Label>
                <Input {...register("name")} required />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input {...register("slug")} required />
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <TipTapField
                  control={control}
                  name="description"
                  placeholder="Add a description for this tag/section."
                />
              </div>
              <div className="space-y-2"><Label htmlFor="tagSortOrder">Sort order</Label><Input id="tagSortOrder" type="number" {...register("sortOrder", { valueAsNumber: true })} /></div>
              <div className="flex items-center gap-2"><Checkbox id="tagFeatured" checked={watch("isFeatured")} onCheckedChange={(value) => setValue("isFeatured", value === true)} /><Label htmlFor="tagFeatured">Featured on storefront</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="tagNav" checked={watch("isFeaturedInNav")} onCheckedChange={(value) => setValue("isFeaturedInNav", value === true)} /><Label htmlFor="tagNav">Promote to top-level navigation</Label></div>
            </div>
            <SheetFooter className="flex-row justify-end gap-2">
              <Button type="submit" size="lg">
                {isEdit ? "Update" : "Add"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (currentTagId) deleteTag(currentTagId);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
