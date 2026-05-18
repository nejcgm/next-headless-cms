interface DetailTemplateProps {
  children: React.ReactNode;
}

export default function DetailTemplate({ children }: DetailTemplateProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <main className="min-w-0">{children}</main>
        <aside className="hidden lg:block">
          {/* Sidebar content populated by blocks */}
        </aside>
      </div>
    </div>
  );
}
