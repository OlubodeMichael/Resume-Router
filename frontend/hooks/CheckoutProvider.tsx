"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CheckoutContextType {
  checkoutUrl: string | null;
  loading: boolean;
  error: string | null;
  setCheckoutUrl: (url: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  startCheckout: (plan: 'credits' | 'pass3') => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const startCheckout = async (plan: 'credits' | 'pass3') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Payment failed' }));
        throw new Error(errorData.message || 'Payment failed');
      }

      const data = await response.json();
      
      if (data.url) {
        setCheckoutUrl(data.url);
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutContext.Provider value={{ 
      checkoutUrl, 
      loading, 
      error, 
      setCheckoutUrl, 
      setLoading, 
      setError,
      startCheckout 
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};