export type SearchParamsInput = Record<
  string,
  string | string[] | undefined
>;

export type NormalizedSearchParams = Record<string, string | undefined>;

export function normalizeSearchParams(
  input: SearchParamsInput | null | undefined
): NormalizedSearchParams {
  if (!input) return {};

  const out: NormalizedSearchParams = {};
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      const first = value.find((v) => typeof v === "string" && v.length > 0);
      if (first !== undefined) out[key] = first;
      continue;
    }
    if (typeof value === "string" && value.length > 0) {
      out[key] = value;
    }
  }
  return out;
}

export function pickSearchParams(
  searchParams: NormalizedSearchParams,
  keys: string[]
): Record<string, string> {
  const picked: Record<string, string> = {};
  for (const key of keys) {
    const value = searchParams[key];
    if (typeof value === "string" && value.length > 0) {
      picked[key] = value;
    }
  }
  return picked;
}
