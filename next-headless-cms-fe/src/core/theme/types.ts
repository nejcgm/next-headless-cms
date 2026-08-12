import type { ThemeTokens } from "@core/types/tenant";

export interface ThemeProviderProps {
  tokens: ThemeTokens;
  children: React.ReactNode;
}
