// @/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import NotificationsBell from './NotificationsBell';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-green-700 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold flex items-center space-x-2">
              <span>🌾</span>
              <span>Agri Price</span>
            </Link>

            {/* Public Navigation Links - Only visible when NOT logged in */}
            {!user && (
              <div className="hidden md:flex items-center space-x-2">
                <Link 
                  href="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-green-800 text-white' 
                      : 'text-green-100 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/about" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/about') 
                      ? 'bg-green-800 text-white' 
                      : 'text-green-100 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/contact') 
                      ? 'bg-green-800 text-white' 
                      : 'text-green-100 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  Contact
                </Link>
              </div>
            )}

            {/* Navigation Links - Only show when logged in */}
            {user && (
              <div className="hidden md:flex items-center space-x-2">
                {/* Home link for logged in users */}
                <Link 
                  href="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-green-800 text-white' 
                      : 'text-green-100 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  Home
                </Link>

                {/* Officer Links - Dashboard, Price Submission, Price Management, Officer Market Prices */}
                {user.role === 'officer' && (
                  <>
                    <Link 
                      href="/officerdashboard" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/officerdashboard') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/price-submission" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/price-submission') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Price Submission
                    </Link>
                    <Link 
                      href="/price-management" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/price-management') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Price Management
                    </Link>
                  </>
                )}

                {/* Dealer Links */}
                {user.role === 'dealer' && (
                  <>
                    <Link 
                      href="/agrodealer-dashboard" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/agrodealer-dashboard') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/agrodealer/profile" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/agrodealer/profile') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/agrodealer/inventory" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/agrodealer/inventory') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Inventory
                    </Link>
                  </>
                )}

                {/* Farmer Links - Dashboard, Farmer Market Prices, Suppliers */}
                {user.role === 'farmer' && (
                  <>
                    <Link 
                      href="/farmer/dashboard" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/farmer/dashboard') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/farmer/market-prices" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/farmer/market-prices') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Market Prices
                    </Link>
                    <Link 
                      href="/farmer/suppliers" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/farmer/suppliers') 
                          ? 'bg-green-800 text-white' 
                          : 'text-green-100 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      Suppliers
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Menu and Auth Buttons */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationsBell />
                  <div className="text-sm text-green-100">
                    <span>Welcome, </span>
                    <span className="font-semibold text-white">
                      {user.full_name || user.email}
                    </span>
                    <span className="ml-1 text-xs bg-green-600 px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <div className="md:hidden flex items-center">
              {user && <div className="mr-2"><NotificationsBell /></div>}
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-green-100 hover:text-white hover:bg-green-600 focus:outline-none"
              >
                <svg
                  className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-green-800 border-t border-green-600`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {/* Public Links */}
          {!user && (
            <>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/about') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/contact') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                }`}
              >
                Contact
              </Link>
            </>
          )}

          {/* Logged In Links */}
          {user && (
            <>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                }`}
              >
                Home
              </Link>

              {user.role === 'officer' && (
                <>
                  <Link
                    href="/officerdashboard"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/officerdashboard') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/price-submission"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/price-submission') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Price Submission
                  </Link>
                  <Link
                    href="/price-management"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/price-management') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Price Management
                  </Link>
                </>
              )}

              {user.role === 'dealer' && (
                <>
                  <Link
                    href="/agrodealer-dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/agrodealer-dashboard') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/agrodealer/profile"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/agrodealer/profile') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/agrodealer/inventory"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/agrodealer/inventory') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Inventory
                  </Link>
                </>
              )}

              {user.role === 'farmer' && (
                <>
                  <Link
                    href="/farmer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/farmer/dashboard') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/farmer/market-prices"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/farmer/market-prices') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Market Prices
                  </Link>
                  <Link
                    href="/farmer/suppliers"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/farmer/suppliers') ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    Suppliers
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile User/Auth section */}
        <div className="pt-4 pb-3 border-t border-green-600">
          <div className="px-5">
            {user ? (
              <div className="space-y-3">
                <div className="text-base font-medium text-white">{user.full_name || user.email}</div>
                <div className="text-sm font-medium text-green-300 capitalize">{user.role}</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-green-100 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-md text-base font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}