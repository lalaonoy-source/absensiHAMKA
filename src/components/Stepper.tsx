import React from 'react';
import { Check } from 'lucide-react';
import { StepId } from '../types';

interface StepperProps {
  currentStep: StepId;
  onStepClick?: (step: StepId) => void;
  canNavigateTo?: (step: StepId) => boolean;
}

const STEPS: { id: StepId; number: string; title: string }[] = [
  { id: 'welcome', number: '01', title: 'Selamat datang' },
  { id: 'login', number: '02', title: 'Masuk' },
  { id: 'form', number: '03', title: 'Isi absensi' },
  { id: 'success', number: '04', title: 'Selesai' },
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onStepClick,
  canNavigateTo,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4 sm:px-6">
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isClickable = canNavigateTo ? canNavigateTo(step.id) : idx <= currentIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.id);
                  }
                }}
                className={`flex items-center gap-2 group ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Circle Icon */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#0f274a] text-white'
                      : isActive
                      ? 'bg-[#0f274a] text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span className="text-[11px]">{step.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-xs sm:text-sm font-medium tracking-tight select-none transition-colors ${
                    isActive
                      ? 'text-[#0f274a] font-semibold'
                      : isCompleted
                      ? 'text-slate-700 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting Line between steps */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 h-[1px] bg-slate-200 relative">
                  <div
                    className="h-full bg-[#0f274a] transition-all duration-300"
                    style={{
                      width: idx < currentIndex ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
