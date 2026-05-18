import type { ThemeTokens } from "@core/types/tenant";

interface ThemeProviderProps {
  tokens: ThemeTokens;
  children: React.ReactNode;
}

export function ThemeProvider({ tokens, children }: ThemeProviderProps) {
  const cssVars: React.CSSProperties = {
    "--color-primary": tokens.colors.primary,
    "--color-secondary": tokens.colors.secondary,
    "--color-accent": tokens.colors.accent,
    "--color-background": tokens.colors.background,
    "--color-foreground": tokens.colors.foreground,
    "--color-muted": tokens.colors.muted,
    "--color-border": tokens.colors.border,
    "--color-text-primary": tokens.colors.textPrimary,
    "--font-heading": tokens.fonts.heading,
    "--font-body": tokens.fonts.body,
    "--radius": tokens.borderRadius,
  } as React.CSSProperties;

  return (
    <div style={cssVars} className="contents">
      {children}
    </div>
  );
}
