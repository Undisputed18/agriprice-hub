// @/components/Footer.tsx - Next.js version
'use client';

import Link from 'next/link';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

export default function Footer() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`py-8 mt-auto text-center border-t ${
      isDarkMode 
        ? 'bg-[#0a2e01] text-white border-white/15' 
        : 'bg-[#1b5e20] text-white border-none'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-6">
        <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
          <Link href="/" className="text-white no-underline hover:underline transition-all">
            Home
          </Link>
          
          {!user ? (
            <>
              <Link href="/about" className="text-white no-underline hover:underline transition-all">
                About
              </Link>
              <Link href="/contact" className="text-white no-underline hover:underline transition-all">
                Contact
              </Link>
              <Link href="/login" className="text-white no-underline hover:underline transition-all">
                Login
              </Link>
              <Link href="/signup" className="text-white no-underline hover:underline transition-all">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user.role === 'officer' && (
                <>
                  <Link href="/officerdashboard" className="text-white no-underline hover:underline transition-all">
                    Dashboard
                  </Link>
                  <Link href="/price-submission" className="text-white no-underline hover:underline transition-all">
                    Price Submission
                  </Link>
                  <Link href="/price-management" className="text-white no-underline hover:underline transition-all">
                    Price Management
                  </Link>
                </>
              )}
              {user.role === 'dealer' && (
                <>
                  <Link href="/agrodealer-dashboard" className="text-white no-underline hover:underline transition-all">
                    Dashboard
                  </Link>
                  <Link href="/agrodealer/profile" className="text-white no-underline hover:underline transition-all">
                    Profile
                  </Link>
                  <Link href="/agrodealer/inventory" className="text-white no-underline hover:underline transition-all">
                    Inventory
                  </Link>
                </>
              )}
              {user.role === 'farmer' && (
                <>
                  <Link href="/farmer/dashboard" className="text-white no-underline hover:underline transition-all">
                    Dashboard
                  </Link>
                  <Link href="/farmer/market-prices" className="text-white no-underline hover:underline transition-all">
                    Market Prices
                  </Link>
                  <Link href="/farmer/suppliers" className="text-white no-underline hover:underline transition-all">
                    Suppliers
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
        <div className="border-t border-white/20 pt-6 opacity-90">
          <div className="mb-4 flex justify-center gap-6 flex-wrap opacity-80">
             <Link href="/about" className="text-white no-underline text-sm hover:underline">About Us</Link>
             <Link href="/contact" className="text-white no-underline text-sm hover:underline">Contact Us</Link>
          </div>
          <p className="m-0 text-sm">
            © {currentYear} AgriPrice Management System. All rights reserved.
          </p>
          <p className="mt-2 text-xs opacity-80 max-w-md mx-auto">
            Streamlining agricultural market transactions and empowering Kenyan farmers
          </p>
        </div>
      </div>
    </footer>
  );
}
