"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { loadAllData } from "@/lib/data-loader";
import type { Customer } from "@/types";
import { LogIn, Mail, KeyRound } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    // Mock login: find customer by email domain or use first customer
    const { customers } = loadAllData();
    const customer = Array.from(customers.values())[0]; // For demo, just pick first

    login(customer as Customer);
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-8">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20" />
      
      {/* Floating orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl animate-pulse" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
      
      <div className="relative w-full max-w-lg space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-12 shadow-2xl backdrop-blur-2xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/50">
            <LogIn className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            RGR-RECO
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Sign in to access the recommender system
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-sm font-semibold text-zinc-300"
            >
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-lg text-white placeholder-zinc-500 transition-all hover:border-purple-500/50 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-sm font-semibold text-zinc-300"
            >
              <KeyRound className="h-4 w-4" />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-lg text-white placeholder-zinc-500 transition-all hover:border-purple-500/50 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900 text-purple-500" />
              <span>Remember me</span>
            </label>
            <Link href="#" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/50 p-4 text-sm font-medium text-red-400 border border-red-800">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            Sign In
          </button>
        </div>

        <div className="text-center space-y-3">
          <div className="text-sm text-zinc-500">
            Demo mode: Any credentials work
          </div>
          <div className="text-sm text-zinc-600">
            Don&rsquo;t have an account?{" "}
            <Link href="#" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
