'use client';

import React, { useState, useEffect } from 'react';
import { duaCategories, Dua, DuaCategory } from '@/lib/duaCollection';

interface DuaModalProps {
  onClose: () => void;
  initialCategory?: string;
}

function DuaCard({ dua, expanded, onToggle }: { dua: Dua; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        expanded
          ? 'bg-gradient-to-br from-[var(--green-dark)]/5 to-[var(--green-medium)]/5 border-[var(--green-medium)]/30'
          : 'bg-white border-[var(--cream-dark)] hover:border-[var(--green-light)]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-center justify-between gap-4"
      >
        <h4 className="font-semibold text-[var(--green-dark)]">{dua.title}</h4>
        <svg
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {/* Arabic */}
          <div className="p-4 bg-[var(--cream)]/50 rounded-lg">
            <p
              className="text-2xl text-[var(--green-dark)] leading-loose text-right"
              style={{ fontFamily: "'Amiri', serif", direction: 'rtl' }}
            >
              {dua.arabic}
            </p>
          </div>

          {/* Transliteration */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Transliteration
            </p>
            <p className="text-[var(--text-secondary)] italic">{dua.transliteration}</p>
          </div>

          {/* Translation */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Translation
            </p>
            <p className="text-[var(--green-dark)] font-medium">{dua.translation}</p>
          </div>

          {/* Reference */}
          {dua.reference && (
            <p className="text-xs text-[var(--gold)] font-medium">
              Source: {dua.reference}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, expandedDua, onToggleDua }: {
  category: DuaCategory;
  expandedDua: string | null;
  onToggleDua: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center">
          <span className="text-xl">{category.icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-[var(--green-dark)]">{category.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">{category.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {category.duas.map((dua) => (
          <DuaCard
            key={dua.id}
            dua={dua}
            expanded={expandedDua === dua.id}
            onToggle={() => onToggleDua(dua.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function DuaModal({ onClose, initialCategory }: DuaModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [expandedDua, setExpandedDua] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleToggleDua = (duaId: string) => {
    setExpandedDua(expandedDua === duaId ? null : duaId);
  };

  // Filter categories and duas based on search
  const filteredCategories = searchQuery
    ? duaCategories
        .map((cat) => ({
          ...cat,
          duas: cat.duas.filter(
            (dua) =>
              dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              dua.translation.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.duas.length > 0)
    : duaCategories;

  const currentCategory = selectedCategory
    ? filteredCategories.find((cat) => cat.id === selectedCategory)
    : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl animate-scale-in bg-white overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 relative bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🤲</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Dua Collection</h3>
                <p className="text-white/70 text-sm">Supplications for Ramadan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search duas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedCategory(null);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedCategory && !searchQuery ? (
            // Category grid
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {duaCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="p-4 rounded-xl bg-gradient-to-br from-[var(--cream)]/50 to-white border border-[var(--cream-dark)] hover:border-[var(--green-light)] hover:shadow-lg transition-all text-left group"
                >
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <h4 className="font-semibold text-[var(--green-dark)] text-sm mb-1">
                    {category.name}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    {category.duas.length} dua{category.duas.length !== 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            // Search results
            <div className="space-y-6">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🔍</span>
                  <p className="text-[var(--text-muted)]">No duas found for &ldquo;{searchQuery}&rdquo;</p>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    expandedDua={expandedDua}
                    onToggleDua={handleToggleDua}
                  />
                ))
              )}
            </div>
          ) : currentCategory ? (
            // Single category view
            <div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--green-dark)] mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to categories
              </button>

              <CategorySection
                category={currentCategory}
                expandedDua={expandedDua}
                onToggleDua={handleToggleDua}
              />
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[var(--cream-dark)] bg-[var(--cream)]/30 px-6 py-3">
          <p className="text-xs text-center text-[var(--text-muted)]">
            Tap on a dua to see the full text, transliteration, and translation
          </p>
        </div>
      </div>
    </div>
  );
}
