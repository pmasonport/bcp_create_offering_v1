import React from 'react'

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center mt-4 mb-6 p-4 bg-white border border-g-200 rounded-md">
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep
        const isPending = stepNum > currentStep

        return (
          <React.Fragment key={stepNum}>
            <div className="flex items-center gap-2.5">
              <div
                className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0
                  ${isActive ? 'bg-blue text-white' : ''}
                  ${isDone ? 'bg-green text-white' : ''}
                  ${isPending ? 'bg-g-100 text-g-400 border border-g-200' : ''}
                `}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <div
                className={`
                  text-[13px]
                  ${isActive ? 'font-semibold text-g-900' : ''}
                  ${isDone ? 'font-medium text-green' : ''}
                  ${isPending ? 'font-normal text-g-400' : ''}
                `}
              >
                {step}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-px mx-4
                  ${isDone ? 'bg-green' : 'bg-g-200'}
                `}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
