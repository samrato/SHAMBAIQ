import { createFileRoute } from "@tanstack/react-router";
import { Activity, Brain, TreePine, Webhook, MessageSquare, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import client from "../api/client";
import type { AdminDashboardData, QuotaMetric } from "@/lib/shambaiq-types";
import { requireDashboardRole } from "@/lib/auth-routes";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }: any) => {
    requireDashboardRole(context, "admin");
  },
  loader: async (): Promise<AdminDashboardData> => {
    const response = await client.get("/weather/admin-dashboard");
    return response.data;
  },
  head: () => ({
    meta: [
      { title: "Admin Dashboard · ShambaIQ" },
      {
        name: "description",
        content:
          "API quota, webhook zones, SMS reach, and platform health for ShambaIQ administrators.",
      },
      { property: "og:title", content: "Admin Dashboard · ShambaIQ" },
      { property: "og:description", content: "Platform-wide admin controls." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { usage, webhookZones, smsStats, throttle, meta } = Route.useLoaderData();
  
  const requests = usage?.requests || { used: 0, limit: 0, remaining: 0, unlimited: false };
  const aiRequests = usage?.aiRequests || { used: 0, limit: 0, remaining: 0, unlimited: false };
  const treeScans = usage?.treeScans || { used: 0, limit: 0, remaining: 0, unlimited: false };

  const reqPct = quotaPct(requests);
  const aiPct = quotaPct(aiRequests);
  const treePct = quotaPct(treeScans);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Platform health, WeatherAI usage, webhook zones, SMS reach.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {meta.source === "live" ? "Live WeatherAI" : "Backend fallback"}
          </Badge>
          <Badge className="border-transparent bg-primary text-primary-foreground">
            Plan: {usage?.plan || "unknown"}
          </Badge>
        </div>
      </header>

      {throttle && (
        <div className="rounded-lg border border-[var(--amber)] bg-[var(--amber)]/10 px-4 py-3 text-sm">
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Webhook className="h-4 w-4 text-primary" /> Webhook zones
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                Pro: up to 10
              </Badge>
            </div>
            <CardDescription>One webhook per zone. Triggers per backend config.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {webhookZones.map((z) => (
              <div key={z.zone} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-3 w-3 text-primary" />
                    {z.zone}
                  </div>
                  <Badge
                    className={
                      z.active
                        ? "bg-[var(--success)]/15 text-[var(--success)]"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {z.active ? "Active" : "Paused"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{z.farmers} farmers covered</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {z.triggers.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-[var(--sky)]" /> SMS reach
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                Scale plan
              </Badge>
            </div>
            <CardDescription>Stats from backend API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Tile label="Total SMS" value={smsStats.total.toLocaleString()} />
              <Tile
                label="Delivery"
                value={`${(smsStats.deliveryRate * 100).toFixed(1)}%`}
                tone="success"
              />
              <Tile
                label="Opt-out"
                value={`${(smsStats.optOutRate * 100).toFixed(1)}%`}
                tone="amber"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                By county
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>County</TableHead>
                    <TableHead className="text-right">Messages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smsStats.byCounty.map((c) => (
                    <TableRow key={c.county}>
                      <TableCell>{c.county}</TableCell>
                      <TableCell className="text-right font-mono">
                        {c.sent.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function quotaPct(metric: QuotaMetric) {
  if (metric.unlimited || metric.limit <= 0) return 0;
  return (metric.used / metric.limit) * 100;
}

function QuotaCard({
  icon: Icon,
  title,
  metric,
  pct,
  reset,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  metric: QuotaMetric;
  pct: number;
  reset: string;
}) {
  const danger = pct > 80;
  const warn = pct > 60;
  const color = danger ? "destructive" : warn ? "amber" : "primary";
  const tones = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-[var(--amber)]/20 text-[var(--amber-foreground)]",
    destructive: "bg-destructive/15 text-destructive",
  } as const;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${tones[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {metric.used.toLocaleString()}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            / {metric.unlimited ? "unlimited" : metric.limit.toLocaleString()}
          </span>
        </p>
        <Progress value={pct} className="mt-3" />
        <p className="mt-2 text-xs text-muted-foreground">Resets {reset}</p>
      </CardContent>
    </Card>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "amber";
}) {
  const color =
    tone === "success"
      ? "text-[var(--success)]"
      : tone === "amber"
        ? "text-[var(--amber-foreground)]"
        : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
