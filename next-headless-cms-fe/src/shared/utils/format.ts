import type { FormatCurrencyArgs } from "./types";

export function formatCurrency({
  amount,
  currency = "EUR",
  locale = "en-US",
}: FormatCurrencyArgs): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
