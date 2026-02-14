'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CITIES } from '@/lib/cities';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/login');
          return;
        }

        setEmail(user.email || '');
        setFullName(user.user_metadata?.full_name || '');

        // Get city from user metadata or profile
        let city = user.user_metadata?.city || '';
        let country = user.user_metadata?.country || '';

        if (!city || !country) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('city, country, full_name')
            .eq('id', user.id)
            .single();

          if (profile) {
            city = profile.city || '';
            country = profile.country || '';
            if (!fullName && profile.full_name) {
              setFullName(profile.full_name);
            }
          }
        }

        // Find matching city in our list
        if (city && country) {
          const matchingCity = CITIES.find(c => c.city === city && c.country === country);
          if (matchingCity) {
            setSelectedCity(matchingCity.label);
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load your settings');
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router, supabase]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const cityData = CITIES.find(c => c.label === selectedCity);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          city: cityData?.city || null,
          country: cityData?.country || null,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          city: cityData?.city || null,
          country: cityData?.country || null,
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--cream-dark)]" />
            <p className="text-[var(--text-muted)]">Loading settings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--cream)] px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--green-dark)]">Settings</h1>
            <p className="text-[var(--text-secondary)]">Update your profile and preferences</p>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-[var(--cream-dark)] overflow-hidden">
            {/* Profile Section */}
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-[var(--green-dark)] mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 focus:border-[var(--green-medium)] focus:outline-none transition-colors"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--green-dark)] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/50 text-[var(--text-muted)] cursor-not-allowed"
                  value={email}
                  disabled
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-[var(--green-dark)] mb-2">
                  Your City
                  <span className="text-xs font-normal text-[var(--text-muted)] ml-2">
                    (for accurate prayer times)
                  </span>
                </label>
                <select
                  id="city"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 focus:border-[var(--green-medium)] focus:outline-none transition-colors"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">Select your city...</option>
                  {CITIES.map((city) => (
                    <option key={city.label} value={city.label}>
                      {city.label}
                    </option>
                  ))}
                </select>
                {!selectedCity && (
                  <p className="text-xs text-[var(--gold)] mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Please select your city for accurate prayer times
                  </p>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="px-6 pb-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Success message */}
            {saved && (
              <div className="px-6 pb-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-600 font-medium">Settings saved successfully!</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="px-6 pb-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-[var(--text-secondary)] hover:text-[var(--green-dark)] transition-colors text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
