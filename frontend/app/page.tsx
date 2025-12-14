"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { checkAuth } from "@/lib/features/auth/authSlice";
import {
  Truck,
  MapPin,
  Shield,
  BarChart3,
  Clock,
  Users,
  ChevronRight,
  Container,
  CircleDot,
  Wrench,
  Route,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
              <Truck className="h-5 w-5 text-slate-900" />
            </div>
            <span className="text-xl font-bold text-white">TrackTruck</span>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-slate-900 transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute top-60 -left-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <Shield className="h-4 w-4" />
              <span>Internal Fleet Management System</span>
            </div>

            <h1 className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent md:text-7xl">
              Your Fleet,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">
                Under Control
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Complete fleet management solution for tracking trucks, trailers, trips,
              and maintenance. Monitor your entire operation from one dashboard.
            </p>

            <div className="mt-10">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:shadow-xl hover:shadow-emerald-500/25"
              >
                Access Dashboard
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
            <div className="relative rounded-xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <Truck className="h-8 w-8 text-emerald-400 mb-3" />
                  <p className="text-2xl font-bold text-white">24</p>
                  <p className="text-sm text-slate-400">Active Trucks</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <Container className="h-8 w-8 text-cyan-400 mb-3" />
                  <p className="text-2xl font-bold text-white">18</p>
                  <p className="text-sm text-slate-400">Trailers</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <Route className="h-8 w-8 text-violet-400 mb-3" />
                  <p className="text-2xl font-bold text-white">156</p>
                  <p className="text-sm text-slate-400">Trips This Month</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <Wrench className="h-8 w-8 text-amber-400 mb-3" />
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-sm text-slate-400">Scheduled Maintenance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Everything You Need</h2>
            <p className="mt-4 text-slate-400">Comprehensive tools to manage your entire fleet operation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group p-6 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 mb-4">
                <Truck className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Truck Management</h3>
              <p className="text-slate-400 text-sm">Track all trucks, monitor odometer readings, fuel capacity, and assign drivers.</p>
            </div>

            <div className="group p-6 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 mb-4">
                <Container className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Trailer Tracking</h3>
              <p className="text-slate-400 text-sm">Manage trailer fleet, track availability, mileage, and maintenance status.</p>
            </div>

            <div className="group p-6 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 mb-4">
                <CircleDot className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Tire Inventory</h3>
              <p className="text-slate-400 text-sm">Monitor tire wear levels, serial numbers, and assignments across your fleet.</p>
            </div>

            <div className="group p-6 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 mb-4">
                <MapPin className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Trip Planning</h3>
              <p className="text-slate-400 text-sm">Plan and track trips with origin, destination, driver assignment, and status.</p>
            </div>

            <div className="group p-6 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10 mb-4">
                <Wrench className="h-6 w-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Maintenance Scheduling</h3>
              <p className="text-slate-400 text-sm">Set up maintenance rules based on mileage or time intervals with alerts.</p>
            </div>

            <div className="group p-6 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-4">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
              <p className="text-slate-400 text-sm">Manage admins and drivers with role-based access control.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <p className="text-4xl font-bold text-white">99.9%</p>
              <p className="text-slate-400 mt-1">System Uptime</p>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 text-cyan-400 mx-auto mb-4" />
              <p className="text-4xl font-bold text-white">Real-time</p>
              <p className="text-slate-400 mt-1">Data Updates</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-violet-400 mx-auto mb-4" />
              <p className="text-4xl font-bold text-white">Secure</p>
              <p className="text-slate-400 mt-1">Access Control</p>
            </div>
            <div className="text-center">
              <Truck className="h-8 w-8 text-amber-400 mx-auto mb-4" />
              <p className="text-4xl font-bold text-white">Unlimited</p>
              <p className="text-slate-400 mt-1">Fleet Size</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Truck className="h-4 w-4 text-slate-900" />
              </div>
              <span className="text-lg font-bold text-white">TrackTruck</span>
            </div>
            <p className="text-sm text-slate-500"> 2025 TrackTruck Fleet Management. Internal Use Only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
