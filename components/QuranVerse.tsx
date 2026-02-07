interface QuranVerseProps {
  arabic: string;
  translation: string;
  reference: string;
}

export default function QuranVerse({ arabic, translation, reference }: QuranVerseProps) {
  return (
    <div className="card-gold max-w-2xl mx-auto text-center">
      <p className="text-arabic text-2xl mb-4" style={{ color: 'var(--green-dark)' }}>
        {arabic}
      </p>
      <p className="text-sm italic mb-2" style={{ color: 'var(--text-secondary)' }}>
        &ldquo;{translation}&rdquo;
      </p>
      <p className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
        {reference}
      </p>
    </div>
  );
}
