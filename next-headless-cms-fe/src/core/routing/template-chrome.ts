import tenantConfig from "@tenant/config";

export function templateUsesSiteChrome(templateName: string): boolean {
  const entry = tenantConfig.templates?.[templateName];
  if (entry) return entry.usesSiteChrome !== false;
  return true;
}
