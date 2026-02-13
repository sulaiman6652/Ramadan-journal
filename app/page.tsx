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

// Typewriter effect component
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [text, started]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Floating journal page component
function FloatingPage({ delay, rotate, x, y, size = 'md' }: { delay: number; rotate: number; x: string; y: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-16 h-20', md: 'w-24 h-32', lg: 'w-32 h-40' };

  return (
    <div
      className={`absolute ${sizes[size]} pointer-events-none`}
      style={{
        left: x,
        top: y,
        animation: `floatPage 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div className="w-full h-full bg-white rounded-sm shadow-lg border border-[var(--cream-dark)] relative overflow-hidden">
        {/* Page lines */}
        <div className="absolute inset-2 flex flex-col gap-1">
          {[85, 72, 95, 78, 88, 70].map((width, i) => (
            <div key={i} className="h-px bg-[var(--cream-dark)]" style={{ width: `${width}%` }} />
          ))}
        </div>
        {/* Page fold */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-[var(--cream)] to-[var(--cream-dark)]"
          style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
      </div>
    </div>
  );
}

// Interactive journal book component
function JournalBook() {
  const [isHovered, setIsHovered] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setShowText(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowText(false);
    }
  }, [isHovered]);

  return (
    <Link
      href="/signup"
      className="relative w-72 h-80 cursor-pointer block group"
      style={{ perspective: '1200px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Book shadow */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 bg-black/30 rounded-[50%] blur-lg transition-all duration-700"
        style={{ width: isHovered ? '90%' : '70%' }}
      />

      {/* Book container with 3D transform */}
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered ? 'rotateY(-25deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Back cover */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] rounded-r-xl rounded-l-sm shadow-xl"
          style={{ transform: 'translateZ(-8px)' }}
        >
          <div className="absolute inset-2 border border-[var(--gold)]/30 rounded-lg" />
        </div>

        {/* Page edges (spine side) */}
        <div
          className="absolute left-0 top-2 bottom-2 w-2 bg-gradient-to-r from-[#E8E0D0] to-[#F5F0E6]"
          style={{ transform: 'translateZ(-4px)' }}
        />

        {/* Pages stack */}
        <div
          className="absolute inset-y-1 left-2 right-1 bg-[#FFFEF8] rounded-r-lg shadow-inner"
          style={{ transform: 'translateZ(-2px)' }}
        >
          {/* Page texture lines */}
          <div className="absolute inset-4 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-px bg-[#E8E8E8] mb-6" />
            ))}
          </div>

          {/* Red margin line */}
          <div className="absolute left-8 top-2 bottom-2 w-px bg-red-200/50" />

          {/* Writing on page when open */}
          <div
            className={`absolute inset-0 flex flex-col justify-center px-12 py-8 transition-all duration-500 ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          >
            <p
              className="text-[var(--green-dark)] text-2xl font-bold mb-2"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              Assalamualaikum!
            </p>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
              Let&apos;s start your<br />Ramadan journey...
            </p>
            <div className="inline-flex items-center gap-2 text-[var(--green-dark)] bg-[var(--green-dark)]/5 px-3 py-2 rounded-lg w-fit">
              <span className="text-xs font-bold uppercase tracking-wide">Click to begin</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Front cover - the part that opens */}
        <div
          className="absolute inset-0 rounded-r-xl rounded-l-sm shadow-2xl transition-transform duration-700 ease-out origin-left"
          style={{
            transformStyle: 'preserve-3d',
            transform: isHovered ? 'rotateY(-160deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of cover */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[var(--green-dark)] via-[var(--green-medium)] to-[var(--green-dark)] rounded-r-xl rounded-l-sm"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Embossed border */}
            <div className="absolute inset-3 border-2 border-[var(--gold)]/40 rounded-lg" />

            {/* Inner decorative frame */}
            <div className="absolute inset-6 border border-[var(--gold)]/20 rounded-md flex items-center justify-center">
              <div className="text-center">
                {/* Crescent moon */}
                <div className="text-5xl text-[var(--gold)] mb-3 drop-shadow-lg">&#9790;</div>
                <p className="text-white font-bold text-base tracking-widest">RAMADAN</p>
                <p className="text-[var(--gold)] text-xs tracking-[0.3em] mt-1">JOURNAL</p>
                <div className="mt-3 w-12 h-px bg-[var(--gold)]/40 mx-auto" />
                <p className="text-white/50 text-[10px] mt-2 tracking-wider">2026</p>
              </div>
            </div>

            {/* Spine detail */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#0F2E1F] to-[var(--green-dark)] rounded-l-sm" />

            {/* Spine lines */}
            <div className="absolute left-1 top-8 bottom-8 w-px bg-[var(--gold)]/30" />
            <div className="absolute left-2.5 top-8 bottom-8 w-px bg-[var(--gold)]/20" />
          </div>

          {/* Back of cover (inside) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#1a3d2a] to-[#0F2E1F] rounded-r-xl rounded-l-sm"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Inside cover pattern */}
            <div className="absolute inset-4 border border-[var(--gold)]/10 rounded-lg opacity-50"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.03) 10px, rgba(212,175,55,0.03) 20px)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.3), 0 0 80px rgba(27, 67, 50, 0.2)'
        }}
      />
    </Link>
  );
}

// Animated quill/pen component
function AnimatedQuill() {
  return (
    <div className="relative w-12 h-12 animate-writing">
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path
          d="M8 40L12 28L36 4C38 2 42 2 44 4C46 6 46 10 44 12L20 36L8 40Z"
          fill="var(--gold)"
          stroke="var(--green-dark)"
          strokeWidth="1"
        />
        <path d="M8 40L12 28L14 30L10 42L8 40Z" fill="var(--green-dark)" />
        <path d="M36 4L38 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {/* Ink drop */}
      <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[var(--green-dark)] animate-ping" />
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
      {/* Custom styles for animations */}
      <style jsx global>{`
        @keyframes floatPage {
          0%, 100% { transform: translateY(0) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(-20px) rotate(calc(var(--rotate, 0deg) + 5deg)); }
        }
        @keyframes writing {
          0%, 100% { transform: rotate(-45deg) translateX(0); }
          50% { transform: rotate(-45deg) translateX(5px); }
        }
        .animate-writing {
          animation: writing 1s ease-in-out infinite;
        }
        @keyframes inkSpread {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes pageFlip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
        @keyframes handwrite {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .handwrite-animate {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: handwrite 3s ease forwards;
        }
      `}</style>

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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center shadow-lg">
                <span className="text-lg text-white">&#9790;</span>
              </div>
              <span className="text-lg font-bold text-[var(--green-dark)]">
                Ramadan Journal
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm text-[var(--green-dark)] font-medium hover:text-[var(--green-medium)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Journal Theme */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden">
        {/* Paper texture background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFEF8] via-[var(--cream)] to-white" />

        {/* Subtle grid lines like notebook paper */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, var(--green-dark) 0px, var(--green-dark) 1px, transparent 1px, transparent 32px)`,
        }} />

        {/* Floating journal pages */}
        <FloatingPage delay={0} rotate={-15} x="5%" y="20%" size="md" />
        <FloatingPage delay={1} rotate={10} x="85%" y="25%" size="lg" />
        <FloatingPage delay={2} rotate={-8} x="10%" y="65%" size="sm" />
        <FloatingPage delay={0.5} rotate={20} x="80%" y="60%" size="md" />
        <FloatingPage delay={1.5} rotate={-5} x="15%" y="40%" size="sm" />
        <FloatingPage delay={2.5} rotate={12} x="75%" y="45%" size="sm" />

        {/* Floating stars with parallax */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { top: '15%', left: '20%', size: '1.5rem', delay: 0 },
            { top: '25%', right: '20%', size: '1.25rem', delay: 0.5 },
            { top: '60%', left: '12%', size: '1rem', delay: 1 },
            { top: '45%', right: '15%', size: '1.5rem', delay: 1.5 },
            { top: '75%', right: '30%', size: '1rem', delay: 0.8 },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute animate-twinkle text-[var(--gold)] transition-transform duration-200"
              style={{
                top: star.top,
                left: star.left,
                right: star.right,
                fontSize: star.size,
                animationDelay: `${star.delay}s`,
              }}
            >
              &#10022;
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div className="text-center lg:text-left">
              {/* Badge with quill */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 border border-[var(--gold)]/30 shadow-lg mb-6 animate-fade-in-down">
                <AnimatedQuill />
                <span className="text-sm font-semibold text-[var(--green-dark)]">
                  Your Ramadan Companion
                </span>
              </div>

              {/* Main heading with handwritten feel */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                <span className="block text-[var(--green-dark)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  Write Your
                </span>
                <span
                  className="block mt-2 animate-fade-in-up bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] bg-clip-text text-transparent"
                  style={{ animationDelay: '0.3s', fontFamily: "'Amiri', serif" }}
                >
                  Ramadan Story
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed animate-fade-in-up max-w-md mx-auto lg:mx-0" style={{ animationDelay: '0.5s' }}>
                Set meaningful goals, track your daily ibadah, and make every moment of this blessed month count.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white font-bold shadow-xl shadow-[var(--green-dark)]/30 hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  Open Your Journal
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-[var(--green-dark)]/20 text-[var(--green-dark)] font-semibold hover:border-[var(--green-dark)] transition-all"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            {/* Right side - Interactive Journal */}
            <div className="flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <JournalBook />
            </div>
          </div>

          {/* Quran Verse Card - Like a journal entry */}
          <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <div className="relative max-w-2xl mx-auto">
              {/* Paper clip decoration */}
              <div className="absolute -top-3 left-8 w-8 h-12 bg-gradient-to-b from-gray-300 to-gray-400 rounded-sm transform -rotate-12 shadow-md" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 80% 100%, 50% 85%, 20% 100%)' }} />

              <div className="bg-white rounded-lg shadow-xl p-8 border border-[var(--cream-dark)] relative">
                {/* Torn paper edge effect at top */}
                <div className="absolute -top-1 left-0 right-0 h-2 bg-white" style={{
                  maskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 5 0, 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10 V 0 H 0 Z' fill='black'/%3E%3C/svg%3E")`,
                  WebkitMaskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 5 0, 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10 V 0 H 0 Z' fill='black'/%3E%3C/svg%3E")`,
                }} />

                {/* Red margin line */}
                <div className="absolute left-12 top-0 bottom-0 w-px bg-red-200" />

                {/* Content with lined paper effect */}
                <div className="pl-8 relative" style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E8E8E8 31px, #E8E8E8 32px)',
                }}>
                  <p
                    className="text-xl sm:text-2xl leading-[32px] mb-4"
                    style={{
                      fontFamily: "'Amiri', serif",
                      color: 'var(--green-dark)',
                      direction: 'rtl',
                    }}
                  >
                    شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ
                  </p>

                  <p className="text-[var(--text-secondary)] italic leading-[32px]">
                    &ldquo;The month of Ramadan in which was revealed the Quran, a guidance for the people...&rdquo;
                  </p>

                  <p className="text-sm font-semibold text-[var(--gold)] mt-4 leading-[32px]">
                    — Surah Al-Baqarah 2:185
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-6 h-10 rounded-full border-2 border-[var(--green-dark)]/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-[var(--green-dark)] animate-bounce" />
          </div>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Scroll</span>
        </div>
      </section>

      {/* Features Section - Journal Pages Style */}
      <section id="features" className="py-24 px-4 bg-white relative">
        {/* Decorative corner */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[var(--gold)]/20 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[var(--gold)]/20 rounded-tr-lg" />

        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--green-dark)]/10 text-[var(--green-dark)] text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Journal Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--green-dark)] mb-4" style={{ fontFamily: "'Amiri', serif" }}>
              Your Story, Your Way
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Everything you need to make this Ramadan your most intentional and rewarding yet.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '&#128221;',
                title: 'Smart Goal Tracking',
                description: 'Set a total for Ramadan and the journal calculates your daily targets. Fall behind? It recalculates so you finish on time.',
                color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
              },
              {
                icon: '&#128197;',
                title: '30-Day Calendar',
                description: 'See your entire Ramadan at a glance. Click any day to view and complete your tasks. Watch the calendar fill with green.',
                color: 'from-[var(--gold)] to-[var(--gold-light)]',
              },
              {
                icon: '&#128156;',
                title: 'Gentle Reminders',
                description: 'End-of-day reviews with kind encouragement. No guilt, just gentle nudges to keep you motivated throughout the month.',
                color: 'from-purple-500 to-purple-600',
              },
            ].map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 150}>
                <div className="group h-full relative">
                  {/* Journal page card */}
                  <div className="bg-[#FFFEF8] rounded-lg shadow-lg p-6 border border-[var(--cream-dark)] h-full relative overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    {/* Page lines */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--green-dark) 27px, var(--green-dark) 28px)',
                    }} />

                    {/* Folded corner */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-[var(--cream)] to-[var(--cream-dark)] shadow-inner"
                      style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

                    <div className="relative">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                        <span dangerouslySetInnerHTML={{ __html: feature.icon }} />
                      </div>
                      <h3 className="text-xl font-bold text-[var(--green-dark)] mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Like filling in a journal */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-[var(--cream)] relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] text-sm font-semibold mb-4">
              &#9998; How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--green-dark)]" style={{ fontFamily: "'Amiri', serif" }}>
              Three Simple Steps
            </h2>
          </AnimatedSection>

          <div className="relative">
            {/* Connecting dotted line like pen stroke */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] border-t-2 border-dashed border-[var(--gold)]/40" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: '1',
                  title: 'Choose Your Goals',
                  description: 'Pick from guided templates for Quran, Prayer, Charity, Dhikr — or write your own.',
                  icon: '&#127919;',
                },
                {
                  step: '2',
                  title: 'Track Daily',
                  description: 'Each day, check off completed tasks. The journal adjusts targets based on your pace.',
                  icon: '&#10004;',
                },
                {
                  step: '3',
                  title: 'Reflect & Grow',
                  description: 'Review your journey. See your progress fill up the calendar day by day.',
                  icon: '&#127775;',
                },
              ].map((item, index) => (
                <AnimatedSection key={item.step} delay={index * 200}>
                  <div className="text-center relative group">
                    {/* Circular step indicator */}
                    <div className="relative inline-block mb-6">
                      <div className="w-28 h-28 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto border-4 border-[var(--cream)] group-hover:border-[var(--gold)] transition-colors">
                        <span className="text-4xl" dangerouslySetInnerHTML={{ __html: item.icon }} />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center text-white font-bold shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--green-dark)] mb-2">
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

      {/* Hadith Quote - Journal Entry Style */}
      <section className="py-24 px-4 bg-white">
        <AnimatedSection className="max-w-3xl mx-auto">
          <div className="relative bg-[#FFFEF8] rounded-lg shadow-xl p-8 md:p-12 border border-[var(--cream-dark)]">
            {/* Bookmark ribbon */}
            <div className="absolute -top-2 right-12 w-8 h-16 bg-gradient-to-b from-[var(--gold)] to-[var(--gold-light)] shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }} />

            {/* Quote marks */}
            <div className="absolute top-4 left-6 text-6xl text-[var(--gold)]/20 font-serif">&ldquo;</div>

            <div className="relative text-center pt-8">
              <blockquote className="text-2xl md:text-3xl text-[var(--green-dark)] leading-relaxed mb-6" style={{ fontFamily: "'Amiri', serif" }}>
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
          </div>
        </AnimatedSection>
      </section>

      {/* Final CTA - Open the Journal */}
      <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-b from-white to-[var(--cream)]">
        <AnimatedSection className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-2xl shadow-[var(--gold)]/30 animate-float">
            <span className="text-4xl">&#128214;</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-[var(--green-dark)] mb-4" style={{ fontFamily: "'Amiri', serif" }}>
            Ready to Begin?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
            Open your journal and start writing your Ramadan story. Every page is a new opportunity.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white text-lg font-bold shadow-xl shadow-[var(--green-dark)]/30 hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            Open Your Journal
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--card-border)] bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center">
                <span className="text-sm text-white">&#9790;</span>
              </div>
              <span className="font-bold text-[var(--green-dark)]">
                Ramadan Journal
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Made with sincerity for the blessed month
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
