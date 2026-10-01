"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ShieldCheck, User } from "lucide-react";
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
    <div className="min-h-screen bg-[#F4F5FB] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-[1000px] w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Left Side: Image Showcase */}
        <div className="md:w-[45%] relative overflow-hidden flex flex-col justify-between hidden md:flex bg-[url('/login-bg.jpg')] bg-cover bg-center">
          {/* Subtle overlay to ensure text remains readable */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          
          <div className="relative z-10 p-10">
            <Sparkles className="w-10 h-10 text-white opacity-90 drop-shadow-md" />
          </div>
          
          <div className="relative z-10 p-10 mt-20">
            <p className="text-white font-semibold text-sm mb-3 drop-shadow-md">You can easily</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-[1.15] tracking-tight drop-shadow-lg">
              Get access to your personal hub for clarity and productivity
            </h2>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden mb-8 flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Content System</h2>
            </div>

            <div className="mb-8">
              <div className="hidden md:flex items-center mb-6">
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                {isSignUp ? "Create an account" : "Welcome back"}
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Access your content pipeline, review assets, and keep everything flowing in one place.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 mb-6 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100/70 rounded-xl mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={clsx(
                    "py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                    selectedRole === "admin" 
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" 
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
                    "py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                    selectedRole === "client" 
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  Client
                </button>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Your email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 mt-4 active:scale-[0.98]"
              >
                {loading ? "Processing..." : (isSignUp ? "Create Account" : "Get Started")}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-500">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                >
                  {isSignUp ? "Log in" : "Sign up"}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
