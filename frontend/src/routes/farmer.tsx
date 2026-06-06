import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  Sprout,
  TreePine,
  SprayCan,
  Calendar,
  LocateFixed,
  Loader2,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import client from "../api/client";
import type { FarmerDashboardData, RiskLevel } from "@/lib/shambaiq-types";
import { requireDashboardRole } from "@/lib/auth-routes";
import { toast } from "sonner";

export const Route = createFileRoute("/farmer")({
  beforeLoad: ({ context }: any) => {
    requireDashboardRole(context, "farmer");
  },
  loader: async (): Promise<FarmerDashboardData> => {
    const response = await client.get("/weather/farmer-dashboard");
    return response.data;
  },
  pendingComponent: FarmerSkeleton,
  head: () => ({
    meta: [
      { title: "Farmer Dashboard · ShambaIQ" },
      {
        name: "description",
        content:
          "Today's weather, forecast, spray window, crop advisory, and tree health for the farmer.",
      },
    ],
  }),
  component: FarmerPage,
});

function FarmerSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between animate-pulse">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="lg:col-span-8 h-[400px] rounded-3xl" />
        <Skeleton className="lg:col-span-4 h-[400px] rounded-3xl" />
      </div>
    </div>
  );
}

function riskColor(r: RiskLevel) {
  if (r === "low") return "bg-[var(--success)]/15 text-[var(--success)]";
  if (r === "moderate") return "bg-[var(--amber)]/20 text-[var(--amber-foreground)]";
  return "bg-destructive/15 text-destructive";
}

function FarmerPage() {
  const {
    farmer,
    current,
    forecast,
    sprayHours,
    sprayWindowLabel,
    advisory,
    latestScan,
    treeQuota,
    meta,
  } = Route.useLoaderData();

  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("farmerId", farmer.id);
    formData.append("county", farmer.county);
    formData.append("landAcres", farmer.acres.toString());

    try {
      await client.post("/weather/analyze-trees", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Tree scan uploaded and analyzed successfully!");
      router.invalidate();
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || "Failed to analyze tree scan.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />

      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Karibu, {farmer.name.split(" ")[0]}</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Farmer Dashboard</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <LocateFixed className="h-4 w-4" />
            <p className="text-sm font-bold">
              {farmer.ward} · {farmer.acres} acres · {farmer.crop}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="bg-background/50 px-3 py-1 shadow-sm font-bold">
            {meta.source === "live" ? "Live WeatherAI" : "Offline Mode"}
          </Badge>
          <Badge className={`px-3 py-1 shadow-sm font-bold ${riskColor(current.risk)}`}>
            Current risk: {current.risk}
          </Badge>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Thermometer} label="Temperature" value={`${current.tempC}°C`} tone="primary" />
        <StatCard icon={Droplets} label="Humidity" value={`${current.humidity}%`} tone="sky" />
        <StatCard icon={Wind} label="Wind" value={`${current.windKmh} km/h`} tone="sky" />
        <StatCard icon={Cloud} label="Rain" value={current.rainStatus || "0"} tone="amber" />
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <Calendar className="h-5 w-5 text-primary" /> Farmer's Calendar
            </CardTitle>
            <CardDescription className="font-medium">7-day planting and weather outlook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {forecast.map((d) => (
                <div key={d.day} className="flex flex-col items-center rounded-2xl border border-border/50 bg-muted/30 p-3 text-center hover:bg-muted/50 transition-all">
                  <span className="text-xs font-black uppercase text-muted-foreground">{d.day}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{d.date}</span>
                  <div className="my-2 text-xl font-black">{d.tempMax}°</div>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--sky)] font-black">
                    <Droplets className="h-3 w-3" /> {d.rainChance}%
                  </div>
                  <p className="mt-2 text-[10px] leading-tight font-bold text-foreground/70">{d.advice}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <SprayCan className="h-5 w-5 text-primary" /> Safe Spray Guide
            </CardTitle>
            <CardDescription className="font-bold text-primary">{sprayWindowLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {sprayHours?.slice(0, 12).map((h) => (
                  <div key={h.hour} className="flex items-center justify-between rounded-xl border border-border/40 p-2.5 text-xs bg-card/50">
                    <span className="font-black">{h.hour}</span>
                    <div className="flex gap-3 font-bold text-muted-foreground">
                      <span>{h.tempC}°</span>
                      <span>{h.windKmh}km/h</span>
                    </div>
                    <Badge variant="secondary" className={`text-[9px] font-black rounded-lg ${h.good ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-destructive/10 text-destructive"}`}>
                      {h.good ? "GOOD" : "AVOID"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <AlertTriangle className="h-5 w-5 text-[var(--amber)]" /> AI Agronomist Insights
            </CardTitle>
            <CardDescription className="font-medium">{advisory?.weatherExplanation}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl bg-muted/40 p-5 border border-border/40">
              <p className="text-sm text-muted-foreground leading-relaxed font-bold">{advisory?.cropRecommendation}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <TreePine className="h-5 w-5 text-primary" /> Orchard Intelligence
            </CardTitle>
            <CardDescription className="font-medium">Latest scan · {latestScan?.date || "No scans yet"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Trees" value={latestScan?.trees || 0} />
              <MiniStat label="Canopy" value={`${latestScan?.canopyPct || 0}%`} />
            </div>
            <Button 
                className="w-full font-black shadow-lg shadow-primary/20 rounded-xl" 
                size="lg"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : "NEW TREE SCAN"}
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: any) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    sky: "bg-[var(--sky)]/15 text-[var(--sky)]",
    amber: "bg-[var(--amber)]/20 text-[var(--amber-foreground)]",
  };
  return (
    <Card className="overflow-hidden border-border/40 shadow-sm bg-card transition-all">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone as keyof typeof tones]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
          <p className="text-2xl font-black tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: any) {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">{label}</p>
      <p className="text-2xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function FarmerLayout() {
  return <FarmerPage />;
}
