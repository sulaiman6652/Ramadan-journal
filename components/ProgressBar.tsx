interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  percentage,
  label,
  showPercentage = false,
  size = 'md',
}: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const isComplete = clampedPercentage >= 100;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {Math.round(clampedPercentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar-container ${size}`}>
        <div
          className={`progress-bar-fill ${isComplete ? 'complete' : ''}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}
