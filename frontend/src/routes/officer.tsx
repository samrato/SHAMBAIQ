import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users, AlertTriangle, TreePine, FileText, Phone, MapPin, UserPlus, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import client from "../api/client";
import type { OfficerDashboardData, RiskLevel } from "@/lib/shambaiq-types";
import { requireDashboardRole } from "@/lib/auth-routes";
import { toast } from "sonner";

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
  return map[r] || map.low;
}

function OfficerPage() {
  const { farmers = [], counts, advisory, treeHistory = [], meta } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(farmers[0]?.id ?? "");
  const [isAddingFarmer, setIsAddingFarmer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [newFarmer, setNewFarmer] = useState({
    username: "",
    password: "password123", // Default password
    name: "",
    phone: "",
    county: "Bomet",
    ward: "",
    crop: "Maize",
    acres: ""
  });

  const filtered = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(q.toLowerCase()) ||
      f.county.toLowerCase().includes(q.toLowerCase()),
  );
  
  const selected = farmers.find((f) => f.id === selectedId) ?? farmers[0];

  const handleAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await client.post("/auth/register", {
        username: newFarmer.username,
        password: newFarmer.password,
        role: "farmer",
        profileData: {
          name: newFarmer.name,
          phone: newFarmer.phone,
          county: newFarmer.county,
          ward: newFarmer.ward,
          crop: newFarmer.crop,
          acres: Number(newFarmer.acres),
          lat: -0.7829, // Default for demo
          lon: 35.3447,
          timezone: "Africa/Nairobi"
        }
      });
      toast.success("Farmer registered successfully!");
      setIsAddingFarmer(false);
      setNewFarmer({ username: "", password: "password123", name: "", phone: "", county: "Bomet", ward: "", crop: "Maize", acres: "" });
      router.invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register farmer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Officer Dashboard</h1>
          <p className="text-muted-foreground font-medium">
            Monitor assigned farmers, generate reports, run tree scans.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-bold">
            {meta.source === "live" ? "Live WeatherAI" : "Standard Mode"}
          </Badge>
          
          <Dialog open={isAddingFarmer} onOpenChange={setIsAddingFarmer}>
            <DialogTrigger asChild>
              <Button className="font-black rounded-xl shadow-lg shadow-primary/20">
                <UserPlus className="mr-2 h-4 w-4" /> ADD FARMER
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-black text-2xl uppercase">Register Farmer</DialogTitle>
                <DialogDescription className="font-medium">
                  Add a new farmer to the system to start monitoring their shamba.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddFarmer} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-xs font-bold uppercase">Username</label>
                  <Input className="col-span-3" value={newFarmer.username} onChange={e => setNewFarmer({...newFarmer, username: e.target.value})} required placeholder="joseph_k" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-xs font-bold uppercase">Full Name</label>
                  <Input className="col-span-3" value={newFarmer.name} onChange={e => setNewFarmer({...newFarmer, name: e.target.value})} required placeholder="Joseph Kiprono" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-xs font-bold uppercase">Phone</label>
                  <Input className="col-span-3" value={newFarmer.phone} onChange={e => setNewFarmer({...newFarmer, phone: e.target.value})} required placeholder="+254..." />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-xs font-bold uppercase">Ward</label>
                  <Input className="col-span-3" value={newFarmer.ward} onChange={e => setNewFarmer({...newFarmer, ward: e.target.value})} required placeholder="Bomet Central" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-xs font-bold uppercase">Acres</label>
                  <Input className="col-span-3" type="number" value={newFarmer.acres} onChange={e => setNewFarmer({...newFarmer, acres: e.target.value})} required placeholder="3.2" />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" className="w-full font-black uppercase" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Farmer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Users} label="Assigned farmers" value={counts?.total || 0} tone="primary" />
        <Kpi icon={AlertTriangle} label="High risk" value={counts?.high || 0} tone="destructive" />
        <Kpi icon={AlertTriangle} label="Needs attention" value={counts?.moderate || 0} tone="amber" />
        <Kpi icon={TreePine} label="Healthy" value={counts?.low || 0} tone="success" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tight">Farmer Management</CardTitle>
                <CardDescription className="font-medium">Active registrations in your region</CardDescription>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or county..."
                  className="pl-8 rounded-xl bg-muted/30"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 pt-6">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase">Farmer</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">County</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Crop</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Acres</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className={`cursor-pointer transition-colors ${selectedId === f.id ? "bg-primary/5" : "hover:bg-muted/30"}`}
                  >
                    <TableCell className="font-bold text-sm">{f.name}</TableCell>
                    <TableCell className="text-sm font-medium">{f.county}</TableCell>
                    <TableCell className="text-sm font-medium">{f.crop}</TableCell>
                    <TableCell className="text-right font-black text-sm">{f.acres}</TableCell>
                    <TableCell>
                      <Badge className={`font-bold text-[10px] rounded-lg ${riskBadge(f.risk)}`}>{f.risk}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm font-medium text-muted-foreground italic">
                      No farmers found in this region.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm h-fit">
          <CardHeader className="bg-muted/10 border-b border-border/40 mb-4">
            <CardTitle className="text-lg font-black uppercase tracking-tight">{selected?.name || "No farmer selected"}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs font-bold">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {selected?.ward || "Unknown ward"} · {selected?.acres || 0} acres ·{" "}
              {selected?.crop || "Unknown crop"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-black text-primary">
                <Phone className="h-4 w-4" />
                {selected?.phone || "No phone"}
              </span>
              <Badge className={`font-black text-[10px] uppercase rounded-lg ${riskBadge(selected?.risk || "low")}`}>{selected?.risk || "low"} risk</Badge>
            </div>
            
            <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">AI Regional Advisory</p>
              <p className="text-sm font-bold text-foreground leading-relaxed">
                {advisory?.cropRecommendation || "Consult local officer for specific field advice."}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Regional Actions</p>
              <div className="space-y-2">
                {advisory?.actions?.slice(0, 2).map(a => (
                   <div key={a} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/40 bg-card/50">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-xs font-bold text-muted-foreground">{a}</span>
                   </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
              <Button className="font-black text-[10px] uppercase rounded-xl" size="sm">
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Report
              </Button>
              <Button variant="secondary" className="font-black text-[10px] uppercase rounded-xl border-border/60" size="sm">
                <TreePine className="mr-1.5 h-3.5 w-3.5" /> New Scan
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
    <Card className="border-none shadow-sm bg-card overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
          <p className="text-3xl font-black tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
