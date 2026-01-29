"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ENV } from "@/config/env";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "@/shared/authStorage";

type User = {
  id: string;
  email: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Load token from localStorage on mount
  // Intentionally using setState in effect to load from localStorage on initial mount
  /* eslint-disable */
  useEffect(() => {
    if (!isInitialized) {
      const stored = getStoredAuth();
      if (stored) {
        setToken(stored.token);
        setUser(stored.user);
      }
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [isInitialized]);
  /* eslint-enable */

  const login = async (email: string, password: string) => {
    const response = await fetch(`${ENV.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();

    setStoredAuth(data.token, data.user);

    setToken(data.token);
    setUser(data.user);

    router.push("/chat");
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
