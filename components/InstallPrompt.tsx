'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    setIsIOS(isIOSDevice);

    // Don't show if already installed
    if (isInStandaloneMode) return;

    // For iOS, check if we should show manual instructions
    if (isIOSDevice) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        // Show after a delay
        setTimeout(() => setShowPrompt(true), 3000);
      }
      return;
    }

    // For Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-[var(--cream-dark)] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)]" />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl text-white">&#9790;</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[var(--green-dark)] mb-1">
                Install Ramadan Journal
              </h3>
              {isIOS ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  Tap <span className="inline-flex items-center"><svg className="w-4 h-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span>
                  then &quot;Add to Home Screen&quot;
                </p>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">
                  Add to your home screen for quick access
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--green-dark)] transition-colors"
            >
              Not now
            </button>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] rounded-xl hover:shadow-lg transition-all"
              >
                Install
              </button>
            )}
            {isIOS && (
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] rounded-xl hover:shadow-lg transition-all"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
