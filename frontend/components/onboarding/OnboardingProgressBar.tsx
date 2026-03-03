import React from 'react';

interface OnboardingProgressBarProps {
    currentStep: number;
    totalSteps: number;
    stepLabels?: string[];
    onStepClick?: (step: number) => void;
    completedSteps?: number[];
}

export default function OnboardingProgressBar({
    currentStep,
    totalSteps,
    stepLabels,
    onStepClick,
    completedSteps = [],
}: OnboardingProgressBarProps) {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    const isStepAccessible = (step: number) => {
        // Can navigate to:
        // 1. Current step
        // 2. Previous steps (always)
        // 3. Completed steps
        return step <= currentStep || completedSteps.includes(step);
    };

    const handleStepClick = (step: number) => {
        if (onStepClick && isStepAccessible(step)) {
            onStepClick(step);
        }
    };

    return (
        <div className="w-full">
            {/* Progress bars */}
            <div className="flex gap-2">
                {steps.map((step) => {
                    const isAccessible = isStepAccessible(step);
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep || completedSteps.includes(step);

                    return (
                        <button
                            key={step}
                            onClick={() => handleStepClick(step)}
                            disabled={!isAccessible}
                            className={`flex-1 h-2 rounded-full transition-all duration-300 ${isCompleted || isActive
                                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]'
                                    : 'bg-gray-200'
                                } ${isAccessible && onStepClick
                                    ? 'cursor-pointer hover:scale-105 hover:shadow-md'
                                    : isAccessible
                                        ? 'cursor-default'
                                        : 'cursor-not-allowed opacity-50'
                                } ${isActive ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
                            aria-label={`Step ${step}: ${stepLabels?.[step - 1] || `Step ${step}`}`}
                            title={
                                isAccessible
                                    ? `Go to ${stepLabels?.[step - 1] || `Step ${step}`}`
                                    : `Complete previous steps to unlock`
                            }
                        />
                    );
                })}
            </div>

            {/* Step labels */}
            {stepLabels && stepLabels.length === totalSteps && (
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {stepLabels.map((label, index) => {
                        const step = index + 1;
                        const isActive = step === currentStep;
                        const isCompleted = step < currentStep || completedSteps.includes(step);

                        return (
                            <span
                                key={index}
                                className={`transition-colors ${isActive
                                        ? 'text-[#8B5CF6] font-bold'
                                        : isCompleted
                                            ? 'text-gray-700 font-medium'
                                            : ''
                                    }`}
                            >
                                {label}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
