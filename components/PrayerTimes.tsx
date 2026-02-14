'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface ApiResponse {
  data: {
    timings: PrayerTimesData;
    date: {
      hijri: {
        day: string;
        month: { en: string };
        year: string;
      };
    };
  };
}

interface PrayerTimesProps {
  compact?: boolean;
}

export default function PrayerTimes({ compact = false }: PrayerTimesProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ city: string; country: string }>({
    city: 'London',
    country: 'United Kingdom',
  });

  useEffect(() => {
    async function fetchUserLocationAndPrayerTimes() {
      try {
        // Get user's location from their profile
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let city = 'London';
        let country = 'United Kingdom';

        if (user) {
          // First check user metadata (set during signup)
          if (user.user_metadata?.city && user.user_metadata?.country) {
            city = user.user_metadata.city;
            country = user.user_metadata.country;
          } else {
            // Fallback to profile table
            const { data: profile } = await supabase
              .from('profiles')
              .select('city, country')
              .eq('id', user.id)
              .single();

            if (profile?.city && profile?.country) {
              city = profile.city;
              country = profile.country;
            }
          }
        }

        setUserLocation({ city, country });

        // Fetch prayer times
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        // Select calculation method based on country
        // Method 8 = Gulf Region (UAE, Kuwait, Qatar, Bahrain, Oman)
        // Method 4 = Umm Al-Qura (Saudi Arabia)
        // Method 3 = Muslim World League (default)
        const gulfCountries = ['United Arab Emirates', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'];
        let method = 3; // Default: Muslim World League

        if (gulfCountries.includes(country)) {
          method = 8; // Gulf Region
        } else if (country === 'Saudi Arabia') {
          method = 4; // Umm Al-Qura, Makkah
        }

        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch prayer times');
        }

        const data: ApiResponse = await response.json();
        setPrayerTimes(data.data.timings);

        const hijri = data.data.date.hijri;
        setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year}`);

        calculateNextPrayer(data.data.timings);
      } catch (err) {
        setError('Unable to load prayer times');
        console.error('Prayer times error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserLocationAndPrayerTimes();

    const interval = setInterval(() => {
      if (prayerTimes) {
        calculateNextPrayer(prayerTimes);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const calculateNextPrayer = (times: PrayerTimesData) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: times.Fajr },
      { name: 'Dhuhr', time: times.Dhuhr },
      { name: 'Asr', time: times.Asr },
      { name: 'Maghrib', time: times.Maghrib },
      { name: 'Isha', time: times.Isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        setNextPrayer(prayer);
        return;
      }
    }

    setNextPrayer({ name: 'Fajr', time: times.Fajr });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getTimeUntilNext = () => {
    if (!nextPrayer) return '';
    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(':').map(Number);
    let prayerMinutes = hours * 60 + minutes;
    let currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (prayerMinutes <= currentMinutes) {
      prayerMinutes += 24 * 60;
    }

    const diff = prayerMinutes - currentMinutes;
    const h = Math.floor(diff / 60);
    const m = diff % 60;

    if (h > 0) {
      return `in ${h}h ${m}m`;
    }
    return `in ${m}m`;
  };

  // Compact loading state
  if (loading && compact) {
    return (
      <div className="h-full rounded-2xl bg-white border border-[var(--cream-dark)] shadow-sm overflow-hidden flex items-center justify-center">
        <div className="animate-pulse text-center p-4">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-[var(--cream-dark)]" />
          <div className="h-4 bg-[var(--cream-dark)] rounded w-20 mx-auto" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg overflow-hidden flex flex-col">
        <div className="h-1.5 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)]" />
        <div className="p-6 animate-pulse flex-1">
          <div className="h-6 bg-[var(--cream-dark)] rounded-lg w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-[var(--cream-dark)] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Compact error state
  if ((error || !prayerTimes) && compact) {
    return (
      <div className="h-full rounded-2xl bg-white border border-[var(--cream-dark)] shadow-sm overflow-hidden flex items-center justify-center">
        <p className="text-sm text-[var(--text-muted)] p-4">Unable to load</p>
      </div>
    );
  }

  if (error || !prayerTimes) {
    return (
      <div className="h-full rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg overflow-hidden flex flex-col">
        <div className="h-1.5 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)]" />
        <div className="p-6 flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--text-muted)]">
            {error || 'Unable to load prayer times'}
          </p>
        </div>
      </div>
    );
  }

  const prayers = [
    { name: 'Fajr', time: prayerTimes.Fajr, icon: '🌅', description: 'Dawn' },
    { name: 'Sunrise', time: prayerTimes.Sunrise, icon: '☀️', description: 'Sunrise' },
    { name: 'Dhuhr', time: prayerTimes.Dhuhr, icon: '🌤️', description: 'Noon' },
    { name: 'Asr', time: prayerTimes.Asr, icon: '⛅', description: 'Afternoon' },
    { name: 'Maghrib', time: prayerTimes.Maghrib, icon: '🌅', description: 'Sunset' },
    { name: 'Isha', time: prayerTimes.Isha, icon: '🌙', description: 'Night' },
  ];

  // Compact version - shows next prayer prominently with all times in a grid
  if (compact) {
    return (
      <div className="h-full rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg overflow-hidden flex flex-col">
        {/* Green Header with Next Prayer */}
        <div className="relative bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Prayer Times</p>
                <p className="text-xs text-white/70">{userLocation.city}</p>
              </div>
            </div>
            {nextPrayer && (
              <div className="text-right">
                <p className="text-[9px] text-white/50 uppercase">Next</p>
                <p className="text-sm font-bold text-[var(--gold)]">{nextPrayer.name}</p>
                <p className="text-xs text-white font-semibold">{formatTime(nextPrayer.time)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Prayer times list */}
        <div className="flex-1 p-2 flex flex-col justify-between">
          {prayers.filter(p => p.name !== 'Sunrise').map((prayer) => {
            const isNext = nextPrayer?.name === prayer.name;
            return (
              <div
                key={prayer.name}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  isNext
                    ? 'bg-gradient-to-r from-[var(--gold)]/15 to-[var(--gold)]/5 border border-[var(--gold)]/20'
                    : 'hover:bg-[var(--cream)]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{prayer.icon}</span>
                  <span className={`text-sm font-bold ${isNext ? 'text-[var(--green-dark)]' : 'text-[var(--text-secondary)]'}`}>
                    {prayer.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isNext && (
                    <span className="text-[10px] text-[var(--gold)] font-medium">{getTimeUntilNext()}</span>
                  )}
                  <span className={`text-sm font-bold ${isNext ? 'text-[var(--gold)]' : 'text-[var(--green-dark)]'}`}>
                    {formatTime(prayer.time)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="h-full rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg overflow-hidden flex flex-col">
      {/* Decorative top bar */}
      <div className="h-1.5 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)] flex-shrink-0" />

      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center shadow-lg shadow-[var(--green-dark)]/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--green-dark)]">
                Prayer Times
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {userLocation.city}, {userLocation.country}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-[var(--gold)]/10 to-[var(--gold)]/5 text-[var(--gold)] border border-[var(--gold)]/20">
              {hijriDate}
            </p>
          </div>
        </div>

        {/* Next Prayer Highlight */}
        {nextPrayer && (
          <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-center shadow-lg shadow-[var(--green-dark)]/20 flex-shrink-0">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-1">
              Next Prayer
            </p>
            <p className="text-xl font-bold text-white">
              {nextPrayer.name}
            </p>
            <p className="text-3xl font-bold text-[var(--gold)] mt-1">
              {formatTime(nextPrayer.time)}
            </p>
            <p className="text-xs text-white/60 mt-2">
              {getTimeUntilNext()}
            </p>
          </div>
        )}

        {/* Prayer Times List */}
        <div className="space-y-2 flex-1">
          {prayers.map((prayer) => {
            const isNext = nextPrayer?.name === prayer.name;
            const isSunrise = prayer.name === 'Sunrise';

            return (
              <div
                key={prayer.name}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                  isNext
                    ? 'bg-gradient-to-r from-[var(--gold)]/10 to-[var(--gold)]/5 border border-[var(--gold)]/20'
                    : isSunrise
                    ? 'bg-[var(--cream)]/50 opacity-70'
                    : 'hover:bg-[var(--cream)]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${isSunrise ? 'opacity-50' : ''}`}>{prayer.icon}</span>
                  <div>
                    <span
                      className={`text-sm font-semibold ${
                        isNext
                          ? 'text-[var(--green-dark)]'
                          : isSunrise
                          ? 'text-[var(--text-muted)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {prayer.name}
                    </span>
                    {isSunrise && (
                      <span className="text-xs text-[var(--text-muted)] ml-2">(not a prayer)</span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isNext
                      ? 'text-[var(--gold)]'
                      : isSunrise
                      ? 'text-[var(--text-muted)]'
                      : 'text-[var(--green-dark)]'
                  }`}
                >
                  {formatTime(prayer.time)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[var(--cream-dark)] flex-shrink-0">
          <p className="text-xs text-center text-[var(--text-muted)]">
            {['United Arab Emirates', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'].includes(userLocation.country)
              ? 'Gulf Region method'
              : userLocation.country === 'Saudi Arabia'
              ? 'Umm Al-Qura method'
              : 'Muslim World League method'}
          </p>
        </div>
      </div>
    </div>
  );
}
