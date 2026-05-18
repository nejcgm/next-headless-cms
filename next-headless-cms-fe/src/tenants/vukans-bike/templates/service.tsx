interface ServiceTemplateProps {
  children: React.ReactNode;
}

/**
 * Service Template - Specialized layout for bike service/repair pages
 * Features a full-width hero area and sticky booking sidebar on desktop
 */
export default function ServiceTemplate({ children }: ServiceTemplateProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Service pages get a subtle workshop-themed background */}
      <div className="flex-1 bg-[var(--color-background)]">
        {children}
      </div>
    </div>
  );
}
