export interface IsNavItemActiveArgs {
  pathname: string;
  href: string;
  locales?: readonly string[];
  defaultLocale?: string;
}

export interface FormatCurrencyArgs {
  amount: number;
  currency?: string;
  locale?: string;
}
