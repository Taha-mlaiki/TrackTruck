"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { checkAuth } from "@/lib/features/auth/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("Admin" | "Driver")[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Only check auth once on initial mount
    if (!hasCheckedAuth.current && !isAuthenticated) {
      hasCheckedAuth.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Redirect to login if not authenticated (after loading finishes)
    if (!loading && !isAuthenticated && hasCheckedAuth.current) {
      router.push("/login");
      return;
    }

  // Redirect if user doesn't have the required role
  if (!loading && allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, allowedRoles, router, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading if not authenticated yet
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't show anything if user doesn't have required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
