'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Routes that don't need navbar
  const noNavRoutes = ['/login', '/signup'];
  const shouldShowNav = !noNavRoutes.includes(pathname);

  // Routes that need full layout (with navbar)
  const fullLayoutRoutes = ['/catalog', '/dashboard', '/inventory', '/shops'];
  const needsFullLayout = fullLayoutRoutes.some(route => pathname.startsWith(route));

  if (needsFullLayout && shouldShowNav) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
