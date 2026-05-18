import type { FooterCopy, NavItem } from "@core/types/navigation";
import type { TenantContact } from "@core/types/tenant";
import { isExternalHref } from "@shared/utils/url";

interface FooterProps {
  tenantName: string;
  navigation: NavItem[];
  contact?: TenantContact | null;
  copy: FooterCopy;
}

export function Footer({ tenantName, navigation, contact, copy }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-muted)] border-t border-[var(--color-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-foreground)] mb-4">
              {tenantName}
            </h3>
            <p className="text-[var(--color-muted-foreground)] text-sm">
              {copy.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-[var(--color-foreground)] mb-4">{copy.linksHeading}</h4>
            <ul className="space-y-2">
              {navigation.map((item) => {
                const external = isExternalHref(item.href);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] text-sm transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[var(--color-foreground)] mb-4">{copy.contactHeading}</h4>
            {contact ? (
              <div className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                <p>{contact.addressLine}</p>
                <p>
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-[var(--color-primary)] transition-colors">
                    {contact.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${contact.email}`} className="hover:text-[var(--color-primary)] transition-colors">
                    {contact.email}
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-[var(--color-muted-foreground)] text-sm">
                {copy.contactPlaceholder}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] mt-8 pt-8 text-center">
          <p className="text-[var(--color-muted-foreground)] text-sm">
            &copy; {currentYear} {tenantName}. {copy.copyrightReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
