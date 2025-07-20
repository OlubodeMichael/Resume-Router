"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  googleLogin: () => void;
  verifyAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


  const verifyAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        router.push('/auth/signin');
        return;
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Auth verification failed:', error);
      router.push('/auth/signin');
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    const url =
      `${API_BASE_URL}/api/auth/login`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json();
      setUser(data.user);
      Cookies.set("authToken", data.token, { expires: 1 }); // 1 day
    } catch (err) {
      setError((err as Error).message);
      Cookies.remove("authToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, name: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    const url =
      `${API_BASE_URL}/api/auth/register`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, name, password }),
      });
      if (!response.ok) throw new Error("Signup failed");
      const data = await response.json();
      setUser(data.user);
      Cookies.set("authToken", data.token, { expires: 1 }); // 1 day
    } catch (err) {
      setError((err as Error).message);
      Cookies.remove("authToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    try {
      setLoading(true);
      setError(null);
      const authUrl =
        `${API_BASE_URL}/api/auth/google`;
      window.location.href = authUrl;
    } catch (error) {
      setError((error as Error).message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    Cookies.remove("authToken");
    setUser(null);
    setError(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, signup, logout, googleLogin, verifyAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};