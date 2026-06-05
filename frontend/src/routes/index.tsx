import { createFileRoute, Link } from "@tanstack/react-router";
import { Sprout, Users, Shield, ArrowRight, Cloud, Brain, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShambaIQ — Climate Intelligence for Agriculture" },
      {
        name: "description",
        content: "Transforming climate data into actionable insights for farmers, officers, and administrators.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary/95 to-[oklch(0.32_0.09_150)] p-8 text-primary-foreground sm:p-16">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--sky)]/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">System Live · WeatherAI Integration</Badge>
          <h1 className="text-4xl font-black leading-[1.1] tracking-tighter sm:text-6xl">
            Climate intelligence for every shamba.
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/80 sm:text-xl font-medium leading-relaxed">
            ShambaIQ transforms complex weather data into actionable decisions. Built for the entire agricultural ecosystem in East Africa.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {user ? (
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-12 rounded-xl bg-white px-8 text-base font-bold text-primary hover:bg-white/90 shadow-xl shadow-black/10"
              >
                <Link to={user.role === "admin" ? "/admin" : user.role === "officer" ? "/officer" : "/farmer"}>
                  Go to my Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-12 rounded-xl bg-white px-8 text-base font-bold text-primary hover:bg-white/90 shadow-xl shadow-black/10"
                >
                  <Link to="/farmer">
                    Explore Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-white/20 px-8 text-base font-bold text-white hover:bg-white/30 backdrop-blur-sm border border-white/30"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Role Breakdown Section */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black tracking-tight">One Platform. Three Perspectives.</h2>
          <p className="mt-4 text-muted-foreground font-medium text-lg">Designed for everyone who moves the shamba forward.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Farmer Card */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sprout className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black">For The Farmer</CardTitle>
              <CardDescription className="font-bold text-primary">Daily Decision Support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed font-medium">
              <p>Stop guessing when to work. Use real-time village-level data to protect your investment.</p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-center"><Cloud className="h-4 w-4 text-primary" /> 7-Day Planting Calendar</li>
                <li className="flex gap-2 items-center"><Brain className="h-4 w-4 text-primary" /> AI Crop Advisory</li>
                <li className="flex gap-2 items-center"><TreePine className="h-4 w-4 text-primary" /> Orchard Health Scans</li>
              </ul>
            </CardContent>
          </Card>

          {/* Officer Card */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sky)]/10 text-[var(--sky)]">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black">For The Officer</CardTitle>
              <CardDescription className="font-bold text-[var(--sky)]">Regional Field Management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed font-medium">
              <p>Monitor hundreds of farms from one place. Prioritize visits based on AI-flagged risk levels.</p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-center"><Shield className="h-4 w-4 text-[var(--sky)]" /> Risk Heatmaps</li>
                <li className="flex gap-2 items-center"><ArrowRight className="h-4 w-4 text-[var(--sky)]" /> Farmer Registration</li>
                <li className="flex gap-2 items-center"><Cloud className="h-4 w-4 text-[var(--sky)]" /> Field-Wide Reporting</li>
              </ul>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--amber)]/10 text-[var(--amber-foreground)]">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black">For The Admin</CardTitle>
              <CardDescription className="font-bold text-[var(--amber-foreground)]">System-Wide Control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed font-medium">
              <p>Keep the engine running. Manage API quotas, SMS delivery rates, and global platform health.</p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-center"><Cloud className="h-4 w-4 text-[var(--amber-foreground)]" /> API Quota Tracking</li>
                <li className="flex gap-2 items-center"><Brain className="h-4 w-4 text-[var(--amber-foreground)]" /> Webhook Zone Triggers</li>
                <li className="flex gap-2 items-center"><ArrowRight className="h-4 w-4 text-[var(--amber-foreground)]" /> SMS Reach Analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-20 border-t border-border pt-10 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          Powered by WeatherAI Intelligence Engine
        </p>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
