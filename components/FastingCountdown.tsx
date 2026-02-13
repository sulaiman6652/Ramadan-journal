'use client';

import { useState, useEffect } from 'react';

interface PrayerTimesData {
  Fajr: string;
  Maghrib: string;
}

interface FastingCountdownProps {
  compact?: boolean;
  embedded?: boolean; // For embedding inside the green header
}

export default function FastingCountdown({ compact = false, embedded = false }: FastingCountdownProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [status, setStatus] = useState<'fasting' | 'eating' | 'suhoor-ending' | 'iftar-soon'>('fasting');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Fetch prayer times
  useEffect(() => {
    async function fetchPrayerTimes() {
      try {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=London&country=United%20Kingdom&method=3`
        );

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setPrayerTimes({
          Fajr: data.data.timings.Fajr,
          Maghrib: data.data.timings.Maghrib,
        });
      } catch (err) {
        console.error('Failed to fetch prayer times:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrayerTimes();
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCountdown = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();

      const [fajrHours, fajrMins] = prayerTimes.Fajr.split(':').map(Number);
      const [maghribHours, maghribMins] = prayerTimes.Maghrib.split(':').map(Number);

      const fajrMinutes = fajrHours * 60 + fajrMins;
      const maghribMinutes = maghribHours * 60 + maghribMins;
      const currentTotalSeconds = currentMinutes * 60 + currentSeconds;

      let targetMinutes: number;
      let targetLabel: string;
      let newStatus: typeof status;

      if (currentMinutes < fajrMinutes) {
        // Before Fajr - Suhoor time, countdown to Fajr (suhoor ending)
        targetMinutes = fajrMinutes;
        targetLabel = 'Suhoor ends in';
        newStatus = 'suhoor-ending';

        // Progress: how much of the eating window has passed (Maghrib yesterday to Fajr)
        const eatingWindow = (24 * 60 - maghribMinutes) + fajrMinutes;
        const timeSinceMaghrib = (24 * 60 - maghribMinutes) + currentMinutes;
        setProgress(Math.min(100, (timeSinceMaghrib / eatingWindow) * 100));
      } else if (currentMinutes < maghribMinutes) {
        // After Fajr, before Maghrib - Fasting, countdown to Maghrib (Iftar)
        targetMinutes = maghribMinutes;
        targetLabel = 'Iftar in';

        // Check if iftar is soon (within 30 minutes)
        if (maghribMinutes - currentMinutes <= 30) {
          newStatus = 'iftar-soon';
        } else {
          newStatus = 'fasting';
        }

        // Progress: how much of the fasting period has passed
        const fastingWindow = maghribMinutes - fajrMinutes;
        const timeSinceFajr = currentMinutes - fajrMinutes;
        setProgress(Math.min(100, (timeSinceFajr / fastingWindow) * 100));
      } else {
        // After Maghrib - Eating time, countdown to tomorrow's Fajr
        targetMinutes = fajrMinutes + 24 * 60; // Tomorrow's Fajr
        targetLabel = 'Suhoor ends in';
        newStatus = 'eating';

        // Progress: how much of the eating window has passed
        const eatingWindow = (24 * 60 - maghribMinutes) + fajrMinutes;
        const timeSinceMaghrib = currentMinutes - maghribMinutes;
        setProgress(Math.min(100, (timeSinceMaghrib / eatingWindow) * 100));
      }

      setStatus(newStatus);

      // Calculate time remaining
      let remainingMinutes = targetMinutes - currentMinutes;
      if (remainingMinutes < 0) remainingMinutes += 24 * 60;

      const remainingSeconds = (remainingMinutes * 60) - currentSeconds;
      const hours = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      const secs = remainingSeconds % 60;

      if (hours > 0) {
        setCountdown(`${hours}h ${mins}m ${secs}s`);
      } else if (mins > 0) {
        setCountdown(`${mins}m ${secs}s`);
      } else {
        setCountdown(`${secs}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  if (loading) {
    if (embedded) {
      return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20" />
            <div className="flex-1">
              <div className="h-3 bg-white/20 rounded w-20 mb-2" />
              <div className="h-6 bg-white/20 rounded w-28" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={`rounded-2xl bg-white border border-[var(--cream-dark)] shadow-sm overflow-hidden ${compact ? 'p-3' : 'p-4'}`}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--cream-dark)]" />
          <div className="flex-1">
            <div className="h-4 bg-[var(--cream-dark)] rounded w-24 mb-2" />
            <div className="h-6 bg-[var(--cream-dark)] rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!prayerTimes) {
    if (embedded) {
      return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-white/50 text-sm text-center">Unable to load prayer times</p>
        </div>
      );
    }
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'fasting':
        return {
          icon: '🌙',
          label: 'Iftar in',
          sublabel: 'Stay strong!',
          gradient: 'from-[var(--green-dark)] to-[var(--green-medium)]',
          progressColor: 'bg-[var(--gold)]',
        };
      case 'iftar-soon':
        return {
          icon: '🍽️',
          label: 'Iftar in',
          sublabel: 'Almost there!',
          gradient: 'from-[var(--gold)] to-orange-500',
          progressColor: 'bg-[var(--green-medium)]',
        };
      case 'eating':
        return {
          icon: '✨',
          label: 'Suhoor ends in',
          sublabel: 'Enjoy your meal',
          gradient: 'from-purple-600 to-indigo-600',
          progressColor: 'bg-purple-400',
        };
      case 'suhoor-ending':
        return {
          icon: '⏰',
          label: 'Suhoor ends in',
          sublabel: 'Eat well!',
          gradient: 'from-orange-500 to-red-500',
          progressColor: 'bg-orange-400',
        };
    }
  };

  const config = getStatusConfig();

  // Embedded mode - for inside the green header card
  if (embedded) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">{config.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">{config.label}</p>
            <p className="text-white font-bold text-2xl tracking-wide">{countdown}</p>
            <p className="text-white/50 text-xs mt-0.5">{config.sublabel}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[var(--gold)] text-lg font-bold">{Math.round(progress)}%</p>
            <p className="text-white/50 text-xs">complete</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--gold)] rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/40 mt-1.5">
            <span>Fajr {prayerTimes.Fajr}</span>
            <span>Maghrib {prayerTimes.Maghrib}</span>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`rounded-xl bg-gradient-to-r ${config.gradient} p-3 shadow-lg`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs">{config.label}</p>
            <p className="text-white font-bold text-lg tracking-wide">{countdown}</p>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.progressColor} rounded-full transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg overflow-hidden">
      {/* Header gradient */}
      <div className={`bg-gradient-to-r ${config.gradient} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <p className="text-white/80 text-xs font-medium">{config.label}</p>
              <p className="text-white font-bold text-2xl tracking-wide">{countdown}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">{config.sublabel}</p>
            <p className="text-white/80 text-sm font-medium">{Math.round(progress)}% done</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>Fajr: {prayerTimes.Fajr}</span>
          <span>Maghrib: {prayerTimes.Maghrib}</span>
        </div>
        <div className="h-2 bg-[var(--cream)] rounded-full overflow-hidden">
          <div
            className={`h-full ${config.progressColor} rounded-full transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs text-[var(--text-muted)] mt-2">
          {status === 'fasting' || status === 'iftar-soon' ? 'Fasting progress' : 'Time to eat'}
        </p>
      </div>
    </div>
  );
}
