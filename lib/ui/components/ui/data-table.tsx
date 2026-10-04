"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Button } from "./button";
import { Input } from "./input";
import { ChevronLeft, ChevronRight, LucideSearch } from "lucide-react";

export type TPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: TPagination;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  toolbar?: ReactNode;
  /**
   * Rich empty state for a store that has nothing yet. Rendered in place of the
   * whole table — no header, no toolbar, no border — because a first-run table
   * frame around "no products" is chrome around an absence.
   *
   * Falls back to a quiet inline row when a search or filter is active: there
   * the data does exist and the table should stay put while the user narrows it.
   */
  emptyState?: ReactNode;
}

// Stable reference so the useMemo below keeps its identity when a page hands us
// a non-array payload — a fresh `[]` each render would look like changed data.
const NO_ROWS: never[] = [];

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  isLoading,
  searchable = true,
  searchPlaceholder = "Search…",
  emptyMessage = "No results.",
  toolbar,
  emptyState,
}: Readonly<DataTableProps<TData, TValue>>) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const page = pagination?.page ?? Number(searchParams.get("page") ?? "1");
  const limit = pagination?.limit ?? Number(searchParams.get("limit") ?? "10");
  // A page whose fetch handed us a non-array payload used to crash the whole
  // route on `data.length`. Normalise once here so the table degrades to empty
  // instead of taking the app down.
  const rows = Array.isArray(data) ? data : NO_ROWS;
  const filtering = search.trim().length > 0;
  // Nothing at all and no filter: show the page's rich empty state instead of an
  // empty table frame. Gated on !isLoading because rows is empty on the first
  // render too — without this a store full of data flashes "no X yet" until the
  // fetch lands.
  const showEmptyState =
    rows.length === 0 && Boolean(emptyState) && !filtering && !isLoading;
  const totalItems = pagination?.total ?? rows.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(rows.length / limit));
  const safePage = Math.min(page, totalPages);

  // ponytail: slices client-side when the page doesn't do server pagination.
  // useMemo keeps the slice reference stable so TanStack doesn't treat every
  // render as "data changed" and fire its auto-reset (which would loop).
  const tableData = useMemo(
    () =>
      pagination
        ? rows
        : rows.slice((safePage - 1) * limit, safePage * limit),
    [rows, pagination, safePage, limit],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("page", "1");
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");
      router.push(`?${params.toString()}`, { scroll: false });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const updateUrl = (newPage: number, newLimit: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    params.set("limit", String(newLimit));
    if (search.trim()) params.set("search", search.trim());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getRowCanExpand: (row) =>
      !!(row.original as { subRows?: unknown[] })?.subRows?.length,
    state: { expanded },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    autoResetAll: false,
  });

  return (
    <div>
      {showEmptyState ? emptyState : null}
      {!showEmptyState && searchable && (
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="relative">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-md pl-8"
            />
            <LucideSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {toolbar}
        </div>
      )}

      {!showEmptyState ? (
      <div className="overflow-hidden rounded-md border">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-[1] bg-background">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.flatMap((row) => [
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>,
                  row.getIsExpanded() &&
                    row.getLeafRows().map((leaf) => (
                      <TableRow
                        key={leaf.id}
                        className="bg-muted/30"
                      >
                        {leaf.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )),
                ])
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      ) : null}

      {!showEmptyState ? (
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <p className="text-sm text-muted-foreground">
          Showing page {safePage} of {totalPages} · {totalItems} items
        </p>
        <div className="flex items-center gap-3">
          <Select
            value={String(limit)}
            onValueChange={(value) => updateUrl(1, Number(value))}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="lg"
            disabled={safePage <= 1}
            onClick={() => updateUrl(safePage - 1, limit)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Prev</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={safePage >= totalPages}
            onClick={() => updateUrl(safePage + 1, limit)}
          >
            <span className="ml-1 hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      ) : null}
    </div>
  );
}
