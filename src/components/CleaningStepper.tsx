import { Check } from 'lucide-react';

export type CleaningStep = 'structural' | 'quality' | 'review';

interface CleaningStepperProps {
  currentStep: CleaningStep;
  completedSteps: Set<CleaningStep>;
}

const STEPS: { id: CleaningStep; label: string; number: number }[] = [
  { id: 'structural', label: 'Structural Cleaning', number: 1 },
  { id: 'quality', label: 'Quality Cleaning', number: 2 },
  { id: 'review', label: 'Review', number: 3 },
];

export function CleaningStepper({ currentStep, completedSteps }: CleaningStepperProps) {
  const currentStepNumber = STEPS.find((s) => s.id === currentStep)?.number || 1;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.has(step.id);
          const isPast = step.number < currentStepNumber;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : isCompleted || isPast
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isActive ? 'text-gray-900' : isCompleted || isPast ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 mt-[-24px]">
                  <div
                    className={`h-full ${
                      isPast || isCompleted ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
