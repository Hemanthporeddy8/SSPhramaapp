
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth(role?: 'patient' | 'admin') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role && user.role !== role) {
        // If a specific role is required and user doesn't have it,
        // redirect to login page.
        router.push('/login');
      }
      // If user is authenticated and has the correct role (or no specific role is required for the page),
      // no redirect happens here, allowing access.
    }
  }, [user, loading, router, role]);

  return { user, loading };
}

