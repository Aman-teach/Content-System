"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ShieldCheck, User } from "lucide-react";
import { Instrument_Serif } from "next/font/google";
import clsx from "clsx";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
});

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
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-4 sm:p-8 font-['Helvetica',sans-serif]">
      <div className="max-w-[1000px] w-full bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-stone-200/60 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Image Showcase */}
        <div className="md:w-[45%] relative overflow-hidden flex flex-col justify-between hidden md:flex bg-[url('/login-bg.jpg')] bg-cover bg-center">
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/35 pointer-events-none" />
          
          <div className="relative z-10 p-10">
            <Sparkles className="w-10 h-10 text-white opacity-90 drop-shadow-md" />
          </div>
          
          <div className="relative z-10 p-10 mt-20">
            <p className="text-white font-medium text-sm mb-2 drop-shadow-md tracking-wide">Effortlessly review & collaborate</p>
            <h2 className={clsx(instrumentSerif.className, "text-4xl lg:text-5xl text-white leading-[1.1] tracking-wide drop-shadow-lg")}>
              Streamline your content pipeline, approvals, and creative ideas
            </h2>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden mb-8 flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className={clsx(instrumentSerif.className, "text-3xl text-gray-900")}>Content System</h2>
            </div>

            <div className="mb-8">
              <div className="hidden md:flex items-center mb-6">
                <Sparkles className="w-8 h-8 text-[#2C3E50]" />
              </div>
              <h1 className={clsx(instrumentSerif.className, "text-4xl lg:text-5xl text-gray-900 tracking-tight mb-3")}>
                {isSignUp ? "Create an account" : "Welcome back"}
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed font-normal">
                Access your content pipeline, review assets, and keep everything flowing in one place.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium p-3 mb-6 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Role Selection Tabs with Smooth Sliding Pill */}
              <div className="relative grid grid-cols-2 p-1 bg-gray-100/70 rounded-xl mb-2">
                {/* Animated Background Pill */}
                <div 
                  className={clsx(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-gray-200/50 transition-all duration-300 ease-out",
                    selectedRole === "admin" ? "left-1" : "left-[calc(50%+2px)]"
                  )}
                />

                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={clsx(
                    "relative z-10 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2",
                    selectedRole === "admin" 
                      ? "text-gray-900" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <ShieldCheck className={clsx("w-4 h-4 transition-colors duration-200", selectedRole === "admin" ? "text-[#2C3E50]" : "text-gray-400")} />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("client")}
                  className={clsx(
                    "relative z-10 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2",
                    selectedRole === "client" 
                      ? "text-gray-900" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <User className={clsx("w-4 h-4 transition-colors duration-200", selectedRole === "client" ? "text-[#4CA1AF]" : "text-gray-400")} />
                  Client
                </button>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4CA1AF] focus:border-[#4CA1AF] text-sm font-normal transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                  Your email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4CA1AF] focus:border-[#4CA1AF] text-sm font-normal transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4CA1AF] focus:border-[#4CA1AF] text-sm font-normal transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none tracking-widest"
                />
              </div>

              {/* Polar Night Gradient Button (#2C3E50 | #4CA1AF) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2C3E50] to-[#4CA1AF] hover:opacity-95 shadow-md shadow-[#2C3E50]/20 transition-all disabled:opacity-50 mt-4 active:scale-[0.98]"
              >
                {loading ? "Processing..." : (isSignUp ? "Create Account" : "Get Started")}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-normal text-gray-500">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="text-[#2C3E50] font-semibold hover:text-[#4CA1AF] transition-colors"
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
