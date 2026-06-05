import { redirect } from "@tanstack/react-router";

export type UserRole = "farmer" | "officer" | "admin";

export const dashboardPathByRole: Record<UserRole, "/farmer" | "/officer" | "/admin"> = {
  farmer: "/farmer",
  officer: "/officer",
  admin: "/admin",
};

export function requireDashboardRole(context: any, role: UserRole) {
  const user = context.auth?.user;

  if (!user) {
    throw redirect({ to: "/login" });
  }

  if (user.role !== role) {
    throw redirect({ to: dashboardPathByRole[user.role as UserRole] ?? "/" });
  }
}
