"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { logout } from "@/lib/features/auth/authSlice";
import {
  Truck,
  Container,
  CircleDot,
  Map,
  Wrench,
  Users,
  LayoutDashboard,
  LogOut,
  Fuel,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "./notification-center";

// Admin navigation items
const adminNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/trucks", label: "Trucks", icon: Truck },
  { href: "/dashboard/trailers", label: "Trailers", icon: Container },
  { href: "/dashboard/tires", label: "Tires", icon: CircleDot },
  { href: "/dashboard/trips", label: "Trips", icon: Map },
  { href: "/dashboard/fuel", label: "Fuel", icon: Fuel },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/users", label: "Users", icon: Users },
];

// Driver navigation items
const driverNavItems = [
  { href: "/dashboard/driver", label: "Mes Trajets", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin";

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/login");
  };

  // Show different nav items based on role
  const navItems = isAdmin ? adminNavItems : driverNavItems;

  return (
    <div className="w-64 bg-card border-r flex flex-col h-screen">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
              <Truck className="h-4 w-4 text-slate-900" />
            </div>
            <h1 className="text-xl font-bold">TrackTruck</h1>
          </div>
          <NotificationCenter />
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{user?.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
            {user?.role}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-500 text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
