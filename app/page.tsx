'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView(0.15);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrollY > 50 ? 'rgba(253, 246, 227, 0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid var(--card-border)' : 'none',
          boxShadow: scrollY > 50 ? '0 4px 30px rgba(27, 67, 50, 0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center shadow-lg shadow-[var(--green-dark)]/20">
                <span className="text-xl text-white">&#9790;</span>
              </div>
              <span className="text-xl font-bold text-[var(--green-dark)]">
                Ramadan Journal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-[var(--green-dark)] font-medium hover:text-[var(--green-medium)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white font-semibold shadow-lg shadow-[var(--green-dark)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden">
        {/* Gradient background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--cream)] via-[var(--cream)] to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(27,67,50,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08)_0%,transparent_50%)]" />

        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--gold)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--green-dark)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--gold)]/5 rounded-full blur-3xl" />

        {/* Floating stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { top: '15%', left: '10%', size: '1.5rem', delay: 0 },
            { top: '25%', right: '15%', size: '1.25rem', delay: 0.5 },
            { top: '60%', left: '8%', size: '1rem', delay: 1 },
            { top: '45%', right: '10%', size: '1.5rem', delay: 1.5 },
            { top: '80%', right: '25%', size: '1rem', delay: 0.8 },
            { top: '70%', left: '20%', size: '1.25rem', delay: 1.2 },
            { top: '35%', left: '25%', size: '0.75rem', delay: 2 },
            { top: '55%', right: '30%', size: '0.75rem', delay: 2.5 },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute animate-twinkle"
              style={{
                top: star.top,
                left: star.left,
                right: star.right,
                fontSize: star.size,
                color: 'var(--gold)',
                animationDelay: `${star.delay}s`,
                opacity: 0.6,
              }}
            >
              &#10022;
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[var(--gold)]/20 shadow-lg mb-8 animate-fade-in-down">
            <span className="text-lg">&#9790;</span>
            <span className="text-sm font-semibold text-[var(--green-dark)]">
              Your Ramadan Companion
            </span>
            <span className="text-lg">&#9790;</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.1] mb-8">
            <span className="block text-[var(--green-dark)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Transform Your
            </span>
            <span
              className="block mt-2 animate-fade-in-up text-[var(--gold)]"
              style={{ animationDelay: '0.3s' }}
            >
              Ramadan
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            Set meaningful goals, track your daily ibadah, and make every moment of this blessed month count.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white text-lg font-bold shadow-xl shadow-[var(--green-dark)]/30 hover:shadow-2xl hover:shadow-[var(--green-dark)]/40 hover:-translate-y-1 transition-all duration-300"
            >
              Start Your Journey
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-[var(--green-dark)]/20 text-[var(--green-dark)] text-lg font-semibold hover:border-[var(--green-dark)] hover:bg-white transition-all duration-300"
            >
              See How It Works
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>

          {/* Quran Verse - Integrated into Hero */}
          <div className="relative max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--gold)]/20 to-transparent blur-2xl" />
            <div className="relative bg-white/60 backdrop-blur-md rounded-3xl border border-[var(--gold)]/30 p-8 sm:p-10 shadow-xl">
              {/* Decorative corners */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[var(--gold)]/40 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[var(--gold)]/40 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[var(--gold)]/40 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[var(--gold)]/40 rounded-br-lg" />

              {/* Arabic text */}
              <p
                className="text-2xl sm:text-3xl lg:text-4xl leading-loose mb-6 font-amiri"
                style={{
                  fontFamily: "'Amiri', serif",
                  color: 'var(--green-dark)',
                  direction: 'rtl',
                }}
              >
                شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ
              </p>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />
                <span className="text-[var(--gold)] text-xl">&#10022;</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />
              </div>

              {/* Translation */}
              <p className="text-lg sm:text-xl text-[var(--text-secondary)] italic leading-relaxed mb-4">
                &ldquo;The month of Ramadan in which was revealed the Quran, a guidance for the people...&rdquo;
              </p>

              {/* Reference */}
              <p className="text-sm font-semibold text-[var(--gold)]">
                Surah Al-Baqarah 2:185
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Scroll</span>
          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--green-dark)]/10 text-[var(--green-dark)] text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--green-dark)] mb-6">
              Designed for Your
              <br />
              <span className="text-[var(--gold)]">Spiritual Growth</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Everything you need to make this Ramadan your most intentional and rewarding yet.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Smart Goal Distribution',
                description: 'Set a total for Ramadan and let the app calculate your daily targets. Fall behind? It recalculates so you still finish on time.',
                gradient: 'from-emerald-500 to-emerald-600',
                bgGradient: 'from-emerald-50 to-emerald-100/50',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: '30-Day Calendar View',
                description: 'See your entire Ramadan at a glance. Click any day to view and complete your tasks. Watch the calendar fill with green.',
                gradient: 'from-[var(--gold)] to-[var(--gold-light)]',
                bgGradient: 'from-amber-50 to-amber-100/50',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Gentle Encouragement',
                description: 'End-of-day reviews with kind reminders. No guilt, just gentle nudges to keep you motivated throughout the blessed month.',
                gradient: 'from-purple-500 to-purple-600',
                bgGradient: 'from-purple-50 to-purple-100/50',
              },
            ].map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 150}>
                <div className={`group h-full p-8 rounded-3xl bg-gradient-to-br ${feature.bgGradient} border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--green-dark)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-[var(--cream)]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--green-dark)]">
              Three Simple Steps
            </h2>
          </AnimatedSection>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-1 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)] rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: '1',
                  title: 'Choose Your Goals',
                  description: 'Pick from guided templates for Quran, Prayer, Charity, Dhikr, and Fasting — or create your own.',
                  icon: '&#127919;',
                  color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
                },
                {
                  step: '2',
                  title: 'Track Daily',
                  description: 'Each day, check off completed tasks. The app calculates smart targets based on your pace.',
                  icon: '&#10024;',
                  color: 'from-[var(--gold)] to-[var(--gold-light)]',
                },
                {
                  step: '3',
                  title: 'Reflect & Grow',
                  description: 'Review your journey on the 30-day calendar. See your progress fill up day by day.',
                  icon: '&#127769;',
                  color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
                },
              ].map((item, index) => (
                <AnimatedSection key={item.step} delay={index * 200}>
                  <div className="text-center relative">
                    {/* Icon container */}
                    <div className="relative inline-block mb-8">
                      <div className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto">
                        <span className="text-5xl" dangerouslySetInnerHTML={{ __html: item.icon }} />
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--green-dark)] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Testimonial/Quote Section */}
      <section className="py-24 px-4 bg-white">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-8xl text-[var(--gold)]/20">&#10077;</div>
            <blockquote className="relative text-2xl md:text-3xl italic text-[var(--green-dark)] leading-relaxed mb-8 pt-8">
              The most beloved of deeds to Allah are those that are most consistent, even if they are small.
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-px bg-[var(--gold)]" />
              <cite className="text-[var(--text-muted)] font-medium not-italic">
                Prophet Muhammad &#xFDFA;
              </cite>
              <div className="w-12 h-px bg-[var(--gold)]" />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-b from-white to-[var(--cream)]">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)]" />

        <AnimatedSection className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-2xl shadow-[var(--gold)]/30 animate-float">
            <span className="text-5xl">&#9790;</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--green-dark)] mb-6">
            Make This Ramadan
            <br />
            <span className="text-[var(--gold)]">Your Best Yet</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-xl mx-auto">
            Begin your journey with clear intentions and thoughtful tracking.
            Every small step brings you closer to Allah.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white text-xl font-bold shadow-xl shadow-[var(--green-dark)]/30 hover:shadow-2xl hover:shadow-[var(--green-dark)]/40 hover:-translate-y-1 transition-all duration-300"
          >
            Start Your Journey
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[var(--card-border)] bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center">
                <span className="text-xl text-white">&#9790;</span>
              </div>
              <span className="text-xl font-bold text-[var(--green-dark)]">
                Ramadan Journal
              </span>
            </div>
            <p className="text-[var(--text-muted)]">
              Made with sincerity for the blessed month
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
