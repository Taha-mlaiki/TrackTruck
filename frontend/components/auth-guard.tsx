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
  const { isAuthenticated, user, checkingAuth } = useAppSelector((state) => state.auth);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Only check auth once on initial mount, not on every render
    if (!hasCheckedAuth.current && !isAuthenticated) {
      hasCheckedAuth.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Only redirect after we've finished checking auth
    if (!checkingAuth && !isAuthenticated && hasCheckedAuth.current) {
      router.push("/login");
      return;
    }

    if (!checkingAuth && allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, allowedRoles, router, checkingAuth]);

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
