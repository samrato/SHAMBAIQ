import { createFileRoute } from "@tanstack/react-router";
import { Activity, Brain, TreePine, Webhook, MessageSquare, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import client from "../api/client";
import type { AdminDashboardData, UsageOverview, QuotaMetric } from "@/lib/shambaiq-types";
import { requireDashboardRole } from "@/lib/auth-routes";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }: any) => {
    requireDashboardRole(context, "admin");
  },
  loader: async (): Promise<AdminDashboardData> => {
    const response = await client.get("/weather/admin-dashboard");
    return response.data;
  },
  pendingComponent: AdminSkeleton,
  head: () => ({
    meta: [
      { title: "Admin Dashboard · ShambaIQ" },
      {
        name: "description",
        content: "Platform health and WeatherAI usage monitoring.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between animate-pulse">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}

function quotaPct(m: QuotaMetric) {
  if (m.unlimited || m.limit === 0) return 0;
  return Math.min(100, Math.round((m.used / m.limit) * 100));
}

function AdminPage() {
  const { usage, webhookZones, smsStats, throttle, meta } = Route.useLoaderData();
  
  const requests = usage?.requests || { used: 0, limit: 0, remaining: 0, unlimited: false };
  const aiRequests = usage?.aiRequests || { used: 0, limit: 0, remaining: 0, unlimited: false };
  const treeScans = usage?.treeScans || { used: 0, limit: 0, remaining: 0, unlimited: false };

  const reqPct = quotaPct(requests);
  const aiPct = quotaPct(aiRequests);
  const treePct = quotaPct(treeScans);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl uppercase">Admin Dashboard</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Platform health, WeatherAI usage, and SMS reach.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-bold">
            {meta.source === "live" ? "Live WeatherAI" : "Backend fallback"}
          </Badge>
          <Badge className="border-transparent bg-primary text-primary-foreground font-black">
            Plan: {usage?.plan || "unknown"}
          </Badge>
        </div>
      </header>

      {throttle && (
        <div className="rounded-xl border border-[var(--amber)] bg-[var(--amber)]/10 px-4 py-3 text-sm font-bold text-[var(--amber-foreground)]">
          <strong>Auto-throttle active:</strong> AI quota below 50. All non-premium calls are
          switching to <code>ai=false</code>.
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <QuotaCard
          icon={Activity}
          title="API Requests"
          metric={requests}
          pct={reqPct}
          reset={usage?.periodEnd || "N/A"}
        />
        <QuotaCard
          icon={Brain}
          title="AI Requests"
          metric={aiRequests}
          pct={aiPct}
          reset={usage?.periodEnd || "N/A"}
        />
        <QuotaCard
          icon={TreePine}
          title="Tree Scans"
          metric={treeScans}
          pct={treePct}
          reset={usage?.periodEnd || "N/A"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <Webhook className="h-5 w-5 text-primary" /> Webhook Zones
            </CardTitle>
            <CardDescription className="font-medium text-xs uppercase font-bold text-muted-foreground">
              {webhookZones.length} active monitoring zones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {webhookZones.map((z) => (
              <div key={z.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-background p-2 border border-border/50">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-black">{z.zone}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{z.farmers} farmers monitored</p>
                  </div>
                </div>
                <Badge variant={z.active ? "secondary" : "outline"} className="font-black text-[10px] rounded-lg">
                   {z.active ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
            ))}
            {webhookZones.length === 0 && (
               <div className="py-10 text-center text-xs font-bold text-muted-foreground italic uppercase">No active webhook zones</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <MessageSquare className="h-5 w-5 text-primary" /> SMS Reach
            </CardTitle>
            <CardDescription className="font-medium text-xs uppercase font-bold text-muted-foreground">
              Monthly delivery statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end border-b border-border/40 pb-4">
               <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Total Sent</p>
                  <p className="text-4xl font-black">{smsStats.total.toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Delivery Rate</p>
                  <p className="text-xl font-black text-[var(--success)]">{(smsStats.deliveryRate * 100).toFixed(1)}%</p>
               </div>
            </div>
            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Reach by County</p>
               {smsStats.byCounty.map(c => (
                  <div key={c.county} className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                     <span className="text-xs font-black uppercase tracking-tight">{c.county}</span>
                     <span className="text-xs font-black">{c.sent.toLocaleString()} alerts</span>
                  </div>
               ))}
               {smsStats.byCounty.length === 0 && (
                  <div className="py-6 text-center text-[10px] font-bold text-muted-foreground italic uppercase">No regional SMS data</div>
               )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function QuotaCard({ icon: Icon, title, metric, pct, reset }: any) {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <Badge className="bg-primary/10 text-primary border-transparent font-black text-[10px] uppercase">
            {metric.unlimited ? "Unlimited" : `${pct}% Used`}
          </Badge>
        </div>
        <CardTitle className="text-base font-black uppercase mt-3">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-3xl font-black">{metric.used.toLocaleString()}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase">
             / {metric.unlimited ? "∞" : metric.limit.toLocaleString()}
          </p>
        </div>
        <Progress value={pct} className="h-2 rounded-full" />
        <p className="mt-3 text-[10px] font-bold text-muted-foreground uppercase italic">
          Resets: {reset?.slice(0, 10)}
        </p>
      </CardContent>
    </Card>
  );
}
