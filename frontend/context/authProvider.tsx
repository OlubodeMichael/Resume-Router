"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Initial auth check when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(data.user);
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Initial auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [API_BASE_URL]);



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
      value={{ user, loading, error, login, signup, logout, googleLogin }}
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