'use client';

import { TemplateCategory } from '@/types';
import { categoryInfo } from '@/lib/goalTemplates';

interface CategoryStepProps {
  onSelect: (category: TemplateCategory) => void;
}

const categories: TemplateCategory[] = ['quran', 'prayer', 'charity', 'dhikr', 'fasting', 'custom'];

const categoryColors: Record<TemplateCategory, { bg: string; border: string; iconBg: string }> = {
  quran: { bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200 hover:border-emerald-400', iconBg: 'from-emerald-500 to-emerald-600' },
  prayer: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200 hover:border-blue-400', iconBg: 'from-blue-500 to-blue-600' },
  charity: { bg: 'from-amber-50 to-amber-100/50', border: 'border-amber-200 hover:border-amber-400', iconBg: 'from-amber-500 to-amber-600' },
  dhikr: { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200 hover:border-purple-400', iconBg: 'from-purple-500 to-purple-600' },
  fasting: { bg: 'from-orange-50 to-orange-100/50', border: 'border-orange-200 hover:border-orange-400', iconBg: 'from-orange-500 to-orange-600' },
  custom: { bg: 'from-[var(--gold)]/10 to-[var(--gold)]/5', border: 'border-[var(--gold)]/30 hover:border-[var(--gold)]', iconBg: 'from-[var(--gold)] to-[var(--gold-light)]' },
};

export default function CategoryStep({ onSelect }: CategoryStepProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] shadow-sm p-8 mb-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)]" />
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--green-dark)] mb-3">
            What would you like to focus on?
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto leading-relaxed">
            Choose a category to begin setting your goals. Every small step counts in this blessed month.
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat, index) => {
          const info = categoryInfo[cat];
          const colors = categoryColors[cat];

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} border-2 ${colors.border} p-6 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl filter drop-shadow-sm">{info.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[var(--green-dark)] mb-2 group-hover:text-[var(--green-medium)] transition-colors">
                {info.label}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {info.description}
              </p>

              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-4 h-4 text-[var(--green-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Decorative corner */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            </button>
          );
        })}
      </div>

      {/* Encouragement */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--text-muted)] italic">
          &ldquo;The best of deeds are those done consistently, even if they are small.&rdquo;
        </p>
      </div>
    </div>
  );
}
