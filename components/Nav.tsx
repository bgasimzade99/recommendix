"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ShoppingBag, Users, BarChart3, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuthStore();

  if (pathname === "/") return null; // Hide nav on login page

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl w-full">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-full">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">RGR-RECO</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                pathname === "/dashboard"
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              )}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/recommend"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                pathname === "/recommend"
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              )}
            >
              <Users className="h-4 w-4" />
              Recommendations
            </Link>
            <Link
              href="/metrics"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                pathname === "/metrics"
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Metrics
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <span className="text-sm text-zinc-400">
              {currentUser.name}
            </span>
          )}
          <button
            onClick={logout}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

