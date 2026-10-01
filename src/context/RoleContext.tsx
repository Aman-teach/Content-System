"use client";

import { createContext, ReactNode } from "react";
import { useAuth, Role } from "./AuthContext";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { role, setRole } = useAuth();

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const { role, setRole } = useAuth();
  return { role, setRole };
}
