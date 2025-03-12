"use client"
// contexts/CreditsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CreditsContextType {
  credits: number | null;
  fetchCredits: () => Promise<void>;
  setCredits: (credits: number) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/credits/getcredits');
      const data = await res.json();
      if (res.ok) {
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Fetch credits when the provider mounts
  useEffect(() => {
    fetchCredits();
  }, []);

  return (
    <CreditsContext.Provider value={{ credits, fetchCredits, setCredits }}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};
