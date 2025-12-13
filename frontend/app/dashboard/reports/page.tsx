"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchTrucks } from "@/lib/features/trucks/trucksSlice";
import { fetchTrips } from "@/lib/features/trips/tripsSlice";
import { fetchFuelRecords, fetchFuelStats } from "@/lib/features/fuel/fuelSlice";
import { fetchMaintenanceRules } from "@/lib/features/maintenance/maintenanceSlice";
import {
  BarChart3,
  Fuel,
  TrendingUp,
  Truck,
  Calendar,
  Map,
  Wrench,
} from "lucide-react";

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const { items: trucks } = useAppSelector((state) => state.trucks);
  const { items: trips } = useAppSelector((state) => state.trips);
  const { items: fuelRecords } = useAppSelector((state) => state.fuel);
  const { items: maintenanceRules } = useAppSelector((state) => state.maintenance);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    dispatch(fetchTrucks());
    dispatch(fetchTrips());
    dispatch(fetchFuelRecords());
    dispatch(fetchMaintenanceRules());
    dispatch(fetchFuelStats(undefined));
  }, [dispatch]);

  // Calculate metrics
  const totalKilometers = trucks.reduce((sum, t) => sum + t.odometerKm, 0);
  const completedTrips = trips.filter((t) => t.status === "completed");
  const totalFuelLiters = fuelRecords.reduce((sum, f) => sum + f.liters, 0);
  const totalFuelCost = fuelRecords.reduce((sum, f) => sum + f.totalCost, 0);

  // Calculate trip distance (from odometer readings)
  const tripDistance = completedTrips.reduce((sum, t) => {
    if (t.startOdometer && t.endOdometer) {
      return sum + (t.endOdometer - t.startOdometer);
    }
    return sum;
  }, 0);

  // Average fuel consumption per trip
  const avgFuelPerTrip = completedTrips.length > 0
    ? completedTrips.reduce((sum, t) => sum + (t.fuelConsumedLiters || 0), 0) / completedTrips.length
    : 0;

  // Calculate fuel efficiency (km/L)
  const fuelEfficiency = totalFuelLiters > 0 ? tripDistance / totalFuelLiters : 0;

  // Truck utilization stats
  const activeTrucks = trucks.filter((t) => t.isActive);
  const assignedTrucks = trucks.filter((t) => t.assignedTo);

  // Group fuel by truck for the chart
  const fuelByTruck = trucks.map((truck) => {
    const truckFuel = fuelRecords.filter((f) => {
      const fuelTruckId = typeof f.truck === "object" ? f.truck._id : f.truck;
      return fuelTruckId === truck._id;
    });
    return {
      truck: truck.plateNumber,
      liters: truckFuel.reduce((sum, f) => sum + f.liters, 0),
      cost: truckFuel.reduce((sum, f) => sum + f.totalCost, 0),
    };
  }).filter((t) => t.liters > 0).sort((a, b) => b.liters - a.liters);

  // Trips by status
  const tripsByStatus = {
    pending: trips.filter((t) => t.status === "pending").length,
    in_progress: trips.filter((t) => t.status === "in_progress").length,
    completed: trips.filter((t) => t.status === "completed").length,
    cancelled: trips.filter((t) => t.status === "cancelled").length,
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Access Restricted</h2>
          <p className="text-muted-foreground">Reports are only available for administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Fleet analytics and performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Kilometers</p>
              <p className="text-2xl font-bold">{totalKilometers.toLocaleString()} km</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Fuel className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Fuel</p>
              <p className="text-2xl font-bold">{totalFuelLiters.toFixed(1)} L</p>
              <p className="text-xs text-muted-foreground">{totalFuelCost.toFixed(2)} MAD</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Map className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Trips</p>
              <p className="text-2xl font-bold">{completedTrips.length}</p>
              <p className="text-xs text-muted-foreground">{tripDistance.toLocaleString()} km traveled</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fuel Efficiency</p>
              <p className="text-2xl font-bold">{fuelEfficiency.toFixed(2)} km/L</p>
              <p className="text-xs text-muted-foreground">Avg. {avgFuelPerTrip.toFixed(1)} L/trip</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Fleet Status
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Trucks</span>
              <span className="font-medium">{trucks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Trucks</span>
              <span className="font-medium text-green-600">{activeTrucks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Currently Assigned</span>
              <span className="font-medium text-blue-600">{assignedTrucks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Utilization Rate</span>
              <span className="font-medium">
                {trucks.length > 0 ? ((assignedTrucks.length / trucks.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Trip Status */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Map className="h-5 w-5" />
            Trip Status
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Pending
              </span>
              <span className="font-medium">{tripsByStatus.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                In Progress
              </span>
              <span className="font-medium">{tripsByStatus.in_progress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Completed
              </span>
              <span className="font-medium">{tripsByStatus.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Cancelled
              </span>
              <span className="font-medium">{tripsByStatus.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Fuel Consumption by Truck */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Fuel Consumption by Truck
          </h2>
          <div className="space-y-3">
            {fuelByTruck.length === 0 ? (
              <p className="text-muted-foreground text-sm">No fuel records yet</p>
            ) : (
              fuelByTruck.slice(0, 5).map((item) => (
                <div key={item.truck}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.truck}</span>
                    <span className="font-medium">{item.liters.toFixed(1)} L</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{
                        width: `${(item.liters / fuelByTruck[0].liters) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance Summary */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Rules
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Rules</span>
              <span className="font-medium">{maintenanceRules.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Truck Rules</span>
              <span className="font-medium">
                {maintenanceRules.filter((r) => r.resourceType === "truck").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Trailer Rules</span>
              <span className="font-medium">
                {maintenanceRules.filter((r) => r.resourceType === "trailer").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tire Rules</span>
              <span className="font-medium">
                {maintenanceRules.filter((r) => r.resourceType === "tire").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Completed Trips Table */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Completed Trips
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Reference</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Route</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Distance</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Fuel Used</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {completedTrips.slice(0, 10).map((trip) => (
                <tr key={trip._id} className="border-b last:border-0">
                  <td className="py-2 px-3 text-sm font-medium">{trip.reference}</td>
                  <td className="py-2 px-3 text-sm">{trip.origin} → {trip.destination}</td>
                  <td className="py-2 px-3 text-sm">
                    {trip.startOdometer && trip.endOdometer
                      ? `${(trip.endOdometer - trip.startOdometer).toLocaleString()} km`
                      : "-"}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    {trip.fuelConsumedLiters ? `${trip.fuelConsumedLiters.toFixed(1)} L` : "-"}
                  </td>
                  <td className="py-2 px-3 text-sm text-muted-foreground">
                    {trip.updatedAt ? new Date(trip.updatedAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
              {completedTrips.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground text-sm">
                    No completed trips yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
