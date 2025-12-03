'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  number: number
  title: string
  description: string
}

interface RegistrationStepsProps {
  currentStep: number
  steps: Step[]
}

export function RegistrationSteps({ currentStep, steps }: RegistrationStepsProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  currentStep > step.number
                    ? 'bg-primary border-primary text-primary-foreground'
                    : currentStep === step.number
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                )}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>
              
              {/* Step info */}
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-medium',
                    currentStep >= step.number
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 flex items-center px-2">
                <div
                  className={cn(
                    'h-0.5 w-full transition-all',
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


