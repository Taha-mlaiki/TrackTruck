"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { login, clearError, checkAuth } from "@/lib/features/auth/authSlice";
import { loginSchema, validateForm, ValidationErrors } from "@/lib/validations";
import { Truck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated, checkingAuth } = useAppSelector((state) => state.auth);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check auth once to avoid infinite loops after logout
    if (!hasChecked.current && !isAuthenticated) {
      hasChecked.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!checkingAuth && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, checkingAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const validation = validateForm(loginSchema, { email, password });
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }

    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md p-8 space-y-6 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25">
            <Truck className="h-7 w-7 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white">TrackTruck</h1>
          <p className="text-slate-400 mt-2">Fleet Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
              <button
                type="button"
                onClick={() => dispatch(clearError())}
                className="ml-2 underline hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                validationErrors.email ? "border-red-500" : "border-white/10"
              }`}
              placeholder="admin@example.com"
            />
            {validationErrors.email && (
              <p className="text-xs text-red-400">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                validationErrors.password ? "border-red-500" : "border-white/10"
              }`}
              placeholder="••••••••"
            />
            {validationErrors.password && (
              <p className="text-xs text-red-400">{validationErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm">
          Internal use only. Contact admin for access.
        </p>
      </div>
    </div>
  );
}
