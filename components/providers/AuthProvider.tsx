'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initializes auth state globally
  useAuth();
  return <>{children}</>;
}
