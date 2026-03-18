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
    <footer style={{
      backgroundColor: isDarkMode ? '#0a2e01' : '#1b5e20',
      color: 'white',
      padding: '2rem',
      marginTop: 'auto',
      textAlign: 'center',
      borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
        }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
            Home
          </Link>
          
          {!user ? (
            <>
              <Link href="/about" style={{ color: 'white', textDecoration: 'none' }}>
                About
              </Link>
              <Link href="/contact" style={{ color: 'white', textDecoration: 'none' }}>
                Contact
              </Link>
              <Link href="/login" style={{ color: 'white', textDecoration: 'none' }}>
                Login
              </Link>
              <Link href="/signup" style={{ color: 'white', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user.role === 'officer' && (
                <>
                  <Link href="/officerdashboard" style={{ color: 'white', textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                  <Link href="/price-submission" style={{ color: 'white', textDecoration: 'none' }}>
                    Price Submission
                  </Link>
                  <Link href="/price-management" style={{ color: 'white', textDecoration: 'none' }}>
                    Price Management
                  </Link>
                </>
              )}
              {user.role === 'dealer' && (
                <>
                  <Link href="/agrodealer-dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                  <Link href="/agrodealer/profile" style={{ color: 'white', textDecoration: 'none' }}>
                    Profile
                  </Link>
                  <Link href="/agrodealer/inventory" style={{ color: 'white', textDecoration: 'none' }}>
                    Inventory
                  </Link>
                </>
              )}
              {user.role === 'farmer' && (
                <>
                  <Link href="/farmer/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                  <Link href="/farmer/market-prices" style={{ color: 'white', textDecoration: 'none' }}>
                    Market Prices
                  </Link>
                  <Link href="/farmer/suppliers" style={{ color: 'white', textDecoration: 'none' }}>
                    Suppliers
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '1.5rem',
          fontSize: '0.9rem',
          opacity: 0.9,
        }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', opacity: 0.8 }}>
             <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '0.85rem' }}>About Us</Link>
             <Link href="/contact" style={{ color: 'white', textDecoration: 'none', fontSize: '0.85rem' }}>Contact Us</Link>
          </div>
          <p style={{ margin: 0 }}>
            © {currentYear} AgriPrice Management System. All rights reserved.
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
            Streamlining agricultural market transactions and empowering Kenyan farmers
          </p>
        </div>
      </div>
    </footer>
  );
}