"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

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
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyUrl =
      "http://localhost:8000/api/auth/verify";

    fetch(verifyUrl, {
      credentials: "include", // Include cookies
    })
      .then((response) => {
        if (!response.ok) throw new Error("Token verification failed");
        return response.json();
      })
      .then((data: { user: User }) => {
        setUser(data.user);
      })
      .catch((err: Error) => {
        Cookies.remove("authToken");
        setUser(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    const url =
      "http://localhost:8000/api/auth/login";

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
      "http://localhost:8000/api/auth/register";

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
        "http://localhost:8000/api/auth/google";
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