"use client";

import type { ReactNode } from "react";
import type { ServiceProcessProps, ProcessStep } from "./types";

const stepIcons: Record<string, ReactNode> = {
  contact: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  bike: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 17.5h2l4-8h3l2 4h2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 9.5l-3 8" />
    </svg>
  ),
  tools: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  check: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function StepCard({ step, index, isLast }: { step: ProcessStep; index: number; isLast: boolean }) {
  const iconContent = step.icon && stepIcons[step.icon] ? (
    stepIcons[step.icon]
  ) : (
    <span className="font-bold text-lg">{index + 1}</span>
  );

  return (
    <div className="relative flex gap-6">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-[var(--color-border)] hidden md:block" />
      )}

      {/* Step Number/Icon */}
      <div className="relative z-10 flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg">
          {iconContent}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-12">
        <div className="bg-[var(--color-muted)] rounded-[var(--radius)] p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-heading text-xl font-bold text-[var(--color-foreground)]">
              {step.title}
            </h3>
            {step.duration && (
              <span className="text-sm px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full font-medium">
                {step.duration}
              </span>
            )}
          </div>
          <p className="text-[var(--color-muted-foreground)] mb-4">
            {step.description}
          </p>

          {/* Details List */}
          {step.details && step.details.length > 0 && (
            <ul className="space-y-2">
              {step.details.map((detail, i) => (
                <li key={`${detail}-${i}`} className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                  <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function ServiceProcess({ heading, subheading, steps }: ServiceProcessProps) {
  return (
    <section className="py-20 px-4 bg-[var(--color-background)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
            {heading}
          </h2>
          {subheading && (
            <p className="text-[var(--color-muted-foreground)] text-lg">
              {subheading}
            </p>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-0">
          {steps.map((step, index) => (
            <StepCard
              key={`${step.title}-${index}`}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
