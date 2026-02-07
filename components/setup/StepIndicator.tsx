'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['Focus', 'Template', 'Customize', 'Review'];
const stepIcons = ['&#128301;', '&#128203;', '&#9998;', '&#10004;'];

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="max-w-2xl mx-auto mb-10">
      {/* Progress bar background */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-[var(--cream-dark)] rounded-full mx-12" />
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-[var(--green-dark)] to-[var(--gold)] rounded-full mx-12 transition-all duration-500 ease-out"
          style={{ width: `calc(${(currentStep / (totalSteps - 1)) * 100}% - 6rem)` }}
        />

        <div className="relative flex items-start justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div key={index} className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-lg shadow-[var(--green-dark)]/30 scale-110'
                      : isCompleted
                      ? 'bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] shadow-md shadow-[var(--gold)]/20'
                      : 'bg-white border-2 border-[var(--cream-dark)]'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-bold ${
                        isActive ? 'text-white' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}

                  {/* Active pulse ring */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-[var(--green-dark)]/20 animate-ping" />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`mt-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    isActive
                      ? 'text-[var(--green-dark)]'
                      : isCompleted
                      ? 'text-[var(--gold)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {stepLabels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
