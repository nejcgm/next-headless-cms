export interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

export interface TenantAnalyticsProps {
  tenant: string;
}
