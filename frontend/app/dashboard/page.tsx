"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchTrucks } from "@/lib/features/trucks/trucksSlice";
import { fetchTrailers } from "@/lib/features/trailers/trailersSlice";
import { fetchTrips } from "@/lib/features/trips/tripsSlice";
import { fetchMaintenanceRules } from "@/lib/features/maintenance/maintenanceSlice";
import { Truck, Container, Map, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: trucks } = useAppSelector((state) => state.trucks);
  const { items: trailers } = useAppSelector((state) => state.trailers);
  const { items: trips } = useAppSelector((state) => state.trips);
  const { items: maintenanceRules } = useAppSelector((state) => state.maintenance);
  const { user } = useAppSelector((state) => state.auth);

  // Redirect drivers to their dedicated dashboard
  useEffect(() => {
    if (user?.role === "Driver") {
      router.replace("/dashboard/driver");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "Admin") {
      dispatch(fetchTrucks());
      dispatch(fetchTrailers());
      dispatch(fetchTrips());
      dispatch(fetchMaintenanceRules());
    }
  }, [dispatch, user]);

  // Show loading while redirecting drivers
  if (user?.role === "Driver") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeTrucks = trucks.filter((t) => t.isActive).length;
  const availableTrailers = trailers.filter((t) => t.status === "available").length;
  const activeTrips = trips.filter((t) => t.status === "in_progress").length;
  const pendingTrips = trips.filter((t) => t.status === "pending").length;

  const stats = [
    {
      label: "Total Trucks",
      value: trucks.length,
      subLabel: `${activeTrucks} active`,
      icon: Truck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Total Trailers",
      value: trailers.length,
      subLabel: `${availableTrailers} available`,
      icon: Container,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Active Trips",
      value: activeTrips,
      subLabel: `${pendingTrips} pending`,
      icon: Map,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Maintenance Rules",
      value: maintenanceRules.length,
      subLabel: "Configured",
      icon: Wrench,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to TrackTruck Fleet Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.subLabel}</p>
                </div>
                <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                  <Icon className={cn("h-8 w-8", stat.color)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Recent Trips</h2>
          {trips.slice(0, 5).map((trip) => (
            <div
              key={trip._id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium">{trip.reference}</p>
                <p className="text-sm text-muted-foreground">
                  {trip.origin} → {trip.destination}
                </p>
              </div>
              <span
                className={cn(
                  "px-2 py-1 text-xs rounded-full font-medium",
                  trip.status === "completed" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                  trip.status === "in_progress" && "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
                  trip.status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  trip.status === "cancelled" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {trip.status.replace("_", " ")}
              </span>
            </div>
          ))}
          {trips.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No trips yet</p>
          )}
        </div>

        <div className="p-6 bg-card rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Fleet Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Trucks Active</span>
                <span className="font-medium">
                  {activeTrucks}/{trucks.length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{
                    width: `${trucks.length ? (activeTrucks / trucks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Trailers Available</span>
                <span className="font-medium">
                  {availableTrailers}/{trailers.length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{
                    width: `${trailers.length ? (availableTrailers / trailers.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Trips In Progress</span>
                <span className="font-medium">
                  {activeTrips}/{trips.length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all"
                  style={{
                    width: `${trips.length ? (activeTrips / trips.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
