import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users, AlertTriangle, TreePine, FileText, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import client from "../api/client";
import type { OfficerDashboardData, RiskLevel } from "@/lib/shambaiq-types";
import { requireDashboardRole } from "@/lib/auth-routes";

export const Route = createFileRoute("/officer")({
  beforeLoad: ({ context }: any) => {
    requireDashboardRole(context, "officer");
  },
  loader: async (): Promise<OfficerDashboardData> => {
    const response = await client.get("/weather/officer-dashboard");
    return response.data;
  },
  head: () => ({
    meta: [
      { title: "Officer Dashboard · ShambaIQ" },
      {
        name: "description",
        content:
          "Assigned farmers, risk levels, AI advisory, and tree scans for agricultural officers.",
      },
      { property: "og:title", content: "Officer Dashboard · ShambaIQ" },
      { property: "og:description", content: "Field tools for agricultural officers." },
    ],
  }),
  component: OfficerPage,
});

function riskBadge(r: RiskLevel) {
  const map = {
    low: "bg-[var(--success)]/15 text-[var(--success)]",
    moderate: "bg-[var(--amber)]/20 text-[var(--amber-foreground)]",
    high: "bg-destructive/15 text-destructive",
  } as const;
  return map[r];
}

function OfficerPage() {
  const { farmers = [], counts, advisory, treeHistory = [], meta } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(farmers[0]?.id ?? "");
  const filtered = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(q.toLowerCase()) ||
      f.county.toLowerCase().includes(q.toLowerCase()),
  );
  const selected = farmers.find((f) => f.id === selectedId) ?? farmers[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Officer Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor assigned farmers, generate reports, run tree scans.
          </p>
        </div>
        <Badge variant="outline">
          {meta.source === "live" ? "Live WeatherAI" : "Backend fallback"}
        </Badge>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Users} label="Assigned farmers" value={counts?.total || 0} tone="primary" />
        <Kpi icon={AlertTriangle} label="High risk" value={counts?.high || 0} tone="destructive" />
        <Kpi icon={AlertTriangle} label="Needs attention" value={counts?.moderate || 0} tone="amber" />
        <Kpi icon={TreePine} label="Healthy" value={counts?.low || 0} tone="success" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Farmers</CardTitle>
                <CardDescription>Data from backend API</CardDescription>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or county"
                  className="pl-8"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead className="text-right">Acres</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className={`cursor-pointer ${selectedId === f.id ? "bg-accent" : ""}`}
                  >
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.county}</TableCell>
                    <TableCell>{f.crop}</TableCell>
                    <TableCell className="text-right">{f.acres}</TableCell>
                    <TableCell>
                      <Badge className={riskBadge(f.risk)}>{f.risk}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No farmers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{selected?.name || "No farmer selected"}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs">
              <MapPin className="h-3 w-3" /> {selected?.ward || "Unknown ward"} · {selected?.acres || 0} acres ·{" "}
              {selected?.crop || "Unknown crop"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                {selected?.phone || "No phone"}
              </span>
              <Badge className={riskBadge(selected?.risk || "low")}>{selected?.risk || "low"} risk</Badge>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                AI Advisory
              </p>
              <p className="mt-1 text-sm">{advisory?.cropRecommendation || "No advisory available"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Latest tree scan
              </p>
              <p className="mt-1 text-sm">
                {treeHistory.length > 0 ? (
                  `${treeHistory.at(-1)?.trees} trees · ${treeHistory.at(-1)?.canopyPct}% canopy · ${treeHistory.at(-1)?.healthy} healthy`
                ) : (
                  "No scans found"
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="flex-1">
                <FileText className="mr-1 h-3 w-3" />
                Generate report
              </Button>
              <Button size="sm" variant="secondary" className="flex-1">
                <TreePine className="mr-1 h-3 w-3" />
                New tree scan
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "primary" | "destructive" | "amber" | "success";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/15 text-destructive",
    amber: "bg-[var(--amber)]/20 text-[var(--amber-foreground)]",
    success: "bg-[var(--success)]/15 text-[var(--success)]",
  } as const;
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
