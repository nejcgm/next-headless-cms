export interface PageProps {
  params: Promise<{ domain: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
