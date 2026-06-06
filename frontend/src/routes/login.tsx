import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sprout, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const destination =
      user.role === "admin"
        ? "/admin"
        : user.role === "officer"
          ? "/officer"
          : "/farmer";

    void navigate({ to: destination, replace: true });
  }, [navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await client.post("/auth/login", { username, password });
      login(response.data.token, response.data.user);
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-muted/30 px-4 py-12">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-[var(--sky)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link 
          to="/" 
          className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
        </Link>
        
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-4 pt-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Sprout className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome to ShambaIQ</CardTitle>
              <CardDescription>
                Farmer Intelligence for data-driven agriculture.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="username">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="joseph_kiprono"
                  value={username}
                  className="bg-muted/50 focus:bg-background"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-muted/50 focus:bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full shadow-lg shadow-primary/20 font-black uppercase" type="submit" disabled={isLoading} size="lg">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-8 space-y-4">
              <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 text-center">Test Credentials (Pass: 123456789)</p>
                <div className="grid grid-cols-3 gap-2">
                  <Badge variant="outline" className="justify-center py-1 font-bold text-[10px]">admin</Badge>
                  <Badge variant="outline" className="justify-center py-1 font-bold text-[10px]">officer</Badge>
                  <Badge variant="outline" className="justify-center py-1 font-bold text-[10px]">farmer</Badge>
                </div>
              </div>
              
              <div className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                Contact your local agricultural officer for account issues.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
