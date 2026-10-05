"use client";
import { PageHeader, Stat, StatRow } from "@repo/ui";
import { Skeleton } from "@repo/ui";
import {
  LucidePackage,
  LucideCheckCircle2,
  LucideClock,
  LucideCircleCheck,
  LucideCircleX,
  LucideBan,
  LucideWallet,
  LucideShoppingBag,
  AlertCircle,
  LucideFileText,
} from "lucide-react";
import { useEffect, useState } from "react";

type Analytics = {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  completedOrders: number;
  failedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Analytics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/analytics`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStats(data?.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const npr = (v?: number) =>
    v != null ? `NPR ${Number(v).toLocaleString()}` : undefined;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Store overview" />
        <StatRow>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3 py-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </StatRow>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your store"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          Failed to load analytics: {error}
        </div>
      )}

      <section>
        <h2 className="mb-4 text-sm text-muted-foreground">Products</h2>
        <StatRow>
          <Stat
            title="Total Products"
            description="Available in catalog"
            value={stats?.totalProducts}
            icon={LucidePackage}
          />
          <Stat
            title="Published"
            description="Live on the storefront"
            value={stats?.publishedProducts}
            icon={LucideCheckCircle2}
          />
          <Stat
            title="Drafts"
            description="Not yet published"
            value={stats?.draftProducts}
            icon={LucideFileText}
          />
        </StatRow>
      </section>

      <section className="border-t border-border pt-6">
        <h2 className="mb-4 text-sm text-muted-foreground">Orders</h2>
        <StatRow>
          <Stat
            title="Total Orders"
            description="All orders"
            value={stats?.totalOrders}
            icon={LucideShoppingBag}
          />
          <Stat
            title="Pending Payment"
            description="Awaiting customer payment"
            value={stats?.pendingOrders}
            icon={LucideClock}
          />
          <Stat
            title="Confirmed"
            description="Paid, ready to fulfil"
            value={stats?.confirmedOrders}
            icon={LucideCircleCheck}
          />
          <Stat
            title="Completed"
            description="Delivered & closed"
            value={stats?.completedOrders}
            icon={LucideCircleCheck}
          />
          <Stat
            title="Failed"
            description="Payment failed"
            value={stats?.failedOrders}
            icon={LucideCircleX}
          />
          <Stat
            title="Cancelled"
            description="Cancelled orders"
            value={stats?.cancelledOrders}
            icon={LucideBan}
          />
        </StatRow>
      </section>

      <section className="border-t border-border pt-6">
        <h2 className="mb-4 text-sm text-muted-foreground">Revenue</h2>
        <StatRow>
          <Stat
            title="Total Revenue"
            description="Successful payments (NPR)"
            value={npr(stats?.totalRevenue)}
            icon={LucideWallet}
          />
        </StatRow>
      </section>
    </div>
  );
}
