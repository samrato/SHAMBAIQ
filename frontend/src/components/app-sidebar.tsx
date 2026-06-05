import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sprout,
  Cloud,
  Home,
  Calendar,
  SprayCan,
  Brain,
  TreePine,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  
  const isActive = (url: string) => path === url;
  
  const mainItems = [{ title: "Overview", url: "/" as const, icon: Home }];
  
  const farmerItems = user?.role === "farmer" ? [
    { title: "My Dashboard", url: "/farmer" as const, icon: Sprout },
    { title: "Farmer's Calendar", url: "/farmer/calendar" as const, icon: Calendar },
    { title: "Safe Spray Guide", url: "/farmer/spray" as const, icon: SprayCan },
    { title: "AI Agronomist", url: "/farmer/ai" as const, icon: Brain },
    { title: "Orchard Intel", url: "/farmer/orchard" as const, icon: TreePine },
  ] : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Shamba<span className="text-sidebar-primary">IQ</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                Farmer Intelligence
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && <span>Menu</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Farmer Specific Menu */}
        {user?.role === "farmer" && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {!collapsed && <span>My Farm</span>}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {farmerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!collapsed && (
          <div className="mt-auto px-3 py-4 text-xs text-sidebar-foreground/70">
            <div className="flex items-center gap-2">
              <Cloud className="h-3 w-3" />
              <span>WeatherAI Live</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
