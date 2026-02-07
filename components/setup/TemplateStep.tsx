'use client';

import { GoalTemplate, TemplateCategory } from '@/types';
import { goalTemplates, categoryInfo } from '@/lib/goalTemplates';

interface TemplateStepProps {
  category: TemplateCategory;
  onSelectTemplate: (template: GoalTemplate) => void;
  onCustom: () => void;
  onBack: () => void;
}

export default function TemplateStep({ category, onSelectTemplate, onCustom, onBack }: TemplateStepProps) {
  const filtered = goalTemplates.filter((t) => t.category === category);
  const info = categoryInfo[category];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] shadow-sm p-8 mb-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)]" />

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center shadow-lg">
            <span className="text-3xl">{info.icon}</span>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--green-dark)]">
              {info.label} Goals
            </h2>
            <p className="text-[var(--text-secondary)]">
              Choose a template or create your own
            </p>
          </div>
        </div>
      </div>

      {/* Template Cards */}
      <div className="space-y-4 mb-6">
        {filtered.map((template, index) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="group w-full relative overflow-hidden rounded-2xl bg-white border-2 border-[var(--cream-dark)] hover:border-[var(--green-light)] p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Content */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-[var(--green-dark)] group-hover:text-[var(--green-medium)] transition-colors">
                    {template.title}
                  </h3>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[var(--cream)] text-[var(--text-secondary)]">
                    {template.goal_type === 'divisible' ? 'Total Goal' :
                     template.goal_type === 'daily' ? 'Daily' :
                     template.goal_type === 'weekly' ? 'Weekly' : 'One-time'}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] mb-3 leading-relaxed">
                  {template.description}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--gold)]">&#10024;</span>
                  <p className="text-[var(--gold)] italic">
                    &ldquo;{template.prompt}&rdquo;
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--cream)] flex items-center justify-center group-hover:bg-[var(--green-dark)] transition-colors">
                <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--green-dark)]/0 via-[var(--green-dark)]/0 to-[var(--green-dark)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        ))}

        {/* Custom Goal Option */}
        <button
          onClick={onCustom}
          className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--gold)]/5 to-[var(--gold)]/10 border-2 border-dashed border-[var(--gold)]/40 hover:border-[var(--gold)] p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in"
          style={{ animationDelay: `${filtered.length * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--gold)] group-hover:text-[var(--gold-light)] transition-colors">
                  Create Your Own
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Have something unique in mind? Define a custom goal that fits your personal journey and spiritual aspirations.
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center group-hover:bg-[var(--gold)] transition-colors">
              <svg className="w-5 h-5 text-[var(--gold)] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[var(--text-secondary)] hover:text-[var(--green-dark)] font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to categories
        </button>
      </div>
    </div>
  );
}
