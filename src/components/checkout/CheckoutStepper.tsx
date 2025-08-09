'use client';

import { cn } from '@/lib/utils';
import { MapPin, CreditCard, Eye, CheckCircle } from 'lucide-react';

interface CheckoutStepperProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
}

const steps = [
  {
    number: 1,
    title: 'Address',
    description: 'Shipping & Billing',
    icon: MapPin,
  },
  {
    number: 2,
    title: 'Payment',
    description: 'Payment Method',
    icon: CreditCard,
  },
  {
    number: 3,
    title: 'Review',
    description: 'Order Review',
    icon: Eye,
  },
  {
    number: 4,
    title: 'Complete',
    description: 'Order Placed',
    icon: CheckCircle,
  },
];

export function CheckoutStepper({ currentStep, onStepChange }: CheckoutStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-0.5 z-0">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ 
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepChange && currentStep > step.number;

          return (
            <div 
              key={step.number}
              className="relative z-10 flex flex-col items-center group"
            >
              {/* Step Circle */}
              <button
                onClick={isClickable ? () => onStepChange!(step.number) : undefined}
                disabled={!isClickable}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-2',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  isCompleted && 'bg-primary text-primary-foreground shadow-lg',
                  isCurrent && 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-4',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground border-2 border-muted',
                  isClickable && 'hover:bg-primary/10 cursor-pointer',
                )}
              >
                <step.icon className="h-5 w-5" />
              </button>

              {/* Step Info */}
              <div className="text-center min-w-0">
                <h3 className={cn(
                  'font-medium text-sm transition-colors',
                  (isCompleted || isCurrent) && 'text-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}>
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>

              {/* Mobile step indicator */}
              {index < steps.length - 1 && (
                <div className="sm:hidden absolute -right-6 top-6 w-12 h-0.5">
                  <div 
                    className={cn(
                      'w-full h-full transition-colors duration-300',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Progress */}
      <div className="sm:hidden mt-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ 
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
