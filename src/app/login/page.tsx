"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles, UserPlus } from "lucide-react";
import clsx from "clsx";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "client">("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await signup(email, password, name || (selectedRole === "client" ? "Client" : "Admin"), selectedRole);
      } else {
        await login(email, password, selectedRole);
      }
    } catch (err: unknown) {
      console.error(err);
      const appwriteErr = err as { message?: string };
      setError(appwriteErr.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8 w-full">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-100/50">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Content System</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            {isSignUp ? "Create your account to get started" : "Sign in to access your workspace"}
          </p>
        </div>

        {/* Auth Mode Toggle (Sign In vs Sign Up) */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(""); }}
            className={clsx(
              "flex-1 pb-3 text-sm font-bold border-b-2 transition-all",
              !isSignUp ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(""); }}
            className={clsx(
              "flex-1 pb-3 text-sm font-bold border-b-2 transition-all",
              isSignUp ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={clsx(
              "py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              selectedRole === "admin" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Admin
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("client")}
            className={clsx(
              "py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              selectedRole === "client" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <User className="w-4 h-4 text-emerald-600" />
            Client
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-3.5 rounded-xl leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all disabled:opacity-50 mt-6"
          >
            {loading ? "Processing..." : isSignUp ? `Create ${selectedRole === "admin" ? "Admin" : "Client"} Account` : `Sign In as ${selectedRole === "admin" ? "Admin" : "Client"}`}
            {isSignUp ? <UserPlus className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </form>

      </div>
    </div>
  );
}
