'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Top Navbar - Desktop */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: 'rgba(253, 246, 227, 0.85)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
              style={{ color: 'var(--green-dark)' }}
            >
              <span className="text-2xl">&#9789;</span>
              <span className="hidden sm:inline">Ramadan Journal</span>
              <span className="sm:hidden">Journal</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                  isActive('/dashboard') ? 'text-[var(--green-dark)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/goals"
                className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                  isActive('/goals') ? 'text-[var(--green-dark)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                Goals
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer text-[var(--text-muted)]"
                style={{ background: 'none', border: 'none' }}
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--cream)] text-[var(--green-dark)]"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[var(--cream-dark)] bg-white/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-[var(--green-dark)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--cream)]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </span>
              </Link>
              <Link
                href="/goals"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive('/goals')
                    ? 'bg-[var(--green-dark)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--cream)]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Goals
                </span>
              </Link>
              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-[var(--text-muted)] hover:bg-[var(--cream)] transition-all"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[var(--cream-dark)] safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-4">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive('/dashboard')
                ? 'text-[var(--green-dark)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isActive('/dashboard') ? 'bg-[var(--green-dark)] text-white' : 'bg-[var(--cream)]'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          <Link
            href="/goals"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive('/goals')
                ? 'text-[var(--green-dark)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isActive('/goals') ? 'bg-[var(--green-dark)] text-white' : 'bg-[var(--cream)]'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold">Goals</span>
          </Link>

          <Link
            href="/review"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive('/review')
                ? 'text-[var(--green-dark)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isActive('/review') ? 'bg-[var(--green-dark)] text-white' : 'bg-[var(--cream)]'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold">Review</span>
          </Link>
        </div>
      </div>

      {/* Spacer for bottom nav on mobile */}
      <div className="sm:hidden h-20" />
    </>
  );
}
