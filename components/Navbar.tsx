'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: 'rgba(253, 246, 227, 0.85)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: 'var(--green-dark)' }}
          >
            <span className="text-2xl">&#9789;</span>
            <span>Ramadan Journal</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              Dashboard
            </Link>
            <Link
              href="/goals"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              Goals
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
