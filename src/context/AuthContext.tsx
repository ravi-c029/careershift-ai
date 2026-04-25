"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  emailVerified: boolean;
  currentJobTitle?: string | null;
  skills?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getHeaders = useCallback(
    (t?: string) => ({
      Authorization: `Bearer ${t || token}`,
    }),
    [token]
  );

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem("accessToken");
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${stored}` },
      });
      setUser(res.data.user);
      setToken(stored);
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setUser(user);
    router.push("/dashboard");
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await axios.post("/api/auth/signup", { name, email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setUser(user);
    router.push("/dashboard");
  };

  const logout = async () => {
    await axios.post("/api/auth/logout");
    localStorage.removeItem("accessToken");
    setUser(null);
    setToken(null);
    router.push("/");
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, updateUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
