
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: 'patient' | 'admin') => void;
  logout: () => void;
  register: (name: string, email: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockAdmin: User = { id: 'admin1', email: 'admin@example.com', name: 'Admin User', role: 'admin' };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for persisted user session (simplified)
    try {
      const storedUser = localStorage.getItem('pathassist-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('pathassist-user');
    }
    setLoading(false);
  }, []);

  const login = (email: string, role: 'patient' | 'admin') => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let loggedInUser: User;
      if (role === 'admin') {
        // Simulate admin login
        loggedInUser = { ...mockAdmin, email, name: email.split('@')[0] || "Admin User" };
      } else {
        // This branch is not expected to be hit from the modified login page
        // but kept for completeness or if login is called from elsewhere.
        // It will redirect to /login as /dashboard is removed.
        loggedInUser = { id: `patient-${Date.now()}`, email, name: email.split('@')[0] || "Patient User", role: 'patient' };
      }
      setUser(loggedInUser);
      localStorage.setItem('pathassist-user', JSON.stringify(loggedInUser));
      setLoading(false);
      // Redirect logic: admin to /admin/dashboard, others (patients) to /login as /dashboard is removed.
      router.push(loggedInUser.role === 'admin' ? '/admin/dashboard' : '/login');
    }, 500);
  };

  const register = (name: string, email: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newUser: User = { id: `user-${Date.now()}`, email, name, role: 'patient' };
      setUser(newUser);
      localStorage.setItem('pathassist-user', JSON.stringify(newUser));
      setLoading(false);
      // New registered users are 'patient' role. They will be redirected to /login
      // as /dashboard (their intended destination) is removed.
      router.push('/login');
    }, 500);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pathassist-user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
