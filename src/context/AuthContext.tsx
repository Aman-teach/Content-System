"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { account } from "@/lib/appwrite";
import { Models, ID } from "appwrite";
import { useRouter, usePathname } from "next/navigation";

export type Role = "admin" | "client";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  role: Role;
  setRole: (role: Role) => void;
  loading: boolean;
  login: (email: string, pass: string, targetRole: Role) => Promise<void>;
  signup: (email: string, pass: string, name: string, targetRole: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [role, setRole] = useState<Role>("admin");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check current logged-in user on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await account.get();
        setUser(currentUser);

        // Determine role based on user preferences or email or labels
        if (currentUser.prefs?.role) {
          setRole(currentUser.prefs.role as Role);
        } else if (currentUser.email.toLowerCase().includes("vidhi") || currentUser.email.toLowerCase().includes("client")) {
          setRole("client");
        } else {
          setRole("admin");
        }
      } catch {
        setUser(null);
        // If not on login or share page, redirect to login
        if (!pathname.startsWith("/login") && !pathname.startsWith("/share")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [pathname, router]);

  const login = async (email: string, pass: string, targetRole: Role) => {
    try {
      await account.deleteSession("current");
    } catch {
      // ignore
    }

    await account.createEmailPasswordSession(email, pass);
    const currentUser = await account.get();
    setUser(currentUser);

    // Save target role into Appwrite user preferences so it persists
    try {
      await account.updatePrefs({ role: targetRole });
    } catch (prefErr) {
      console.warn("Could not save role pref:", prefErr);
    }

    setRole(targetRole);
    router.push("/");
  };

  const signup = async (email: string, pass: string, name: string, targetRole: Role) => {
    try {
      await account.deleteSession("current");
    } catch {
      // ignore
    }

    await account.create(ID.unique(), email, pass, name);
    await account.createEmailPasswordSession(email, pass);
    const currentUser = await account.get();
    setUser(currentUser);

    try {
      await account.updatePrefs({ role: targetRole });
    } catch (prefErr) {
      console.warn("Could not save role pref:", prefErr);
    }

    setRole(targetRole);
    router.push("/");
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
