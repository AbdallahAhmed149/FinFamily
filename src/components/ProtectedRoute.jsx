import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

/**
 * بيلف الـ layout routes بتاعة /parent و /child.
 * - لو لسه بيتحقق من التوكن → spinner
 * - لو مش داخل خالص → يرجعه لـ /role-select
 * - لو داخل بس بالـ role الغلط (طفل داخل على /parent مثلاً) → يرجعه لصفحته الصح
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/role-select" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "parent" ? "/parent" : "/child"} replace />;
  }

  return children;
}