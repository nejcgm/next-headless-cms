# Multi-Tenant Headless CMS Frontend — Architecture Guide

**Stack:** Next.js 15 (App Router) · React 19 Server Components · TypeScript (strict) · TailwindCSS 4 · Strapi v5 (future backend)

**Goal:** Build a fully dynamic, multi-tenant CMS frontend where each tenant (site) has isolated blocks, templates, themes, integrations, and i18n — while sharing a single CMS engine. Start with mock data; swap to Strapi with zero template/block changes.

---

## 1. Project Initialisation

```bash
npx create-next-app@latest next-headless-cms \
  --typescript --app --tailwind --eslint --src-dir
```

Required dependencies:

```bash
npm install zod clsx tailwind-merge
npm install -D @types/node
```

Optional (add when needed):

```bash
npm install next-intl           # i18n
npm install @tanstack/react-query # client-side caching
npm install sharp               # image optimisation
```

TypeScript config — enable strict mode and path aliases:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@tenants/*": ["./src/tenants/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

---

## 2. Folder Structure

```
src/
├── app/                              ← Next.js App Router (routing only)
│   ├── [domain]/                     ← Tenant resolved via middleware rewrite
│   │   ├── [[...slug]]/              ← Catch-all dynamic pages
│   │   │   ├── page.tsx              ← Page renderer
│   │   │   ├── loading.tsx           ← Streaming skeleton
│   │   │   ├── error.tsx             ← Error boundary (client)
│   │   │   └── not-found.tsx         ← Tenant-aware 404
│   │   └── layout.tsx                ← Per-tenant shell (header/footer/theme)
│   ├── api/
│   │   ├── revalidate/route.ts       ← On-demand ISR webhook
│   │   ├── preview/route.ts          ← Draft/preview toggle
│   │   └── webhooks/
│   │       └── strapi/route.ts       ← Strapi webhook handler
│   ├── layout.tsx                    ← Root layout (html, body, fonts)
│   ├── globals.css                   ← Tailwind directives + CSS custom props
│   └── not-found.tsx                 ← Global fallback 404
│
├── core/                             ← CMS engine (shared, tenant-agnostic)
│   ├── blocks/
│   │   ├── registry.ts              ← Block type → component map builder
│   │   ├── renderer.tsx             ← Iterates blocks array, resolves + renders
│   │   └── types.ts                 ← BlockDefinition, BlockProps, BlockMeta
│   ├── data/
│   │   ├── contracts.ts             ← DataContract<T> interface
│   │   ├── fetcher.ts               ← Adapter-pattern data fetcher
│   │   ├── adapters/
│   │   │   ├── mock.adapter.ts      ← Reads from @mock-data (core/mock-data.ts/{tenant}/)
│   │   │   └── strapi.adapter.ts    ← Calls Strapi REST/GraphQL
│   │   └── cache.ts                 ← Fetch deduplication + revalidation config
│   ├── routing/
│   │   ├── resolver.ts              ← slug → page data resolution
│   │   └── redirects.ts             ← Per-tenant redirect rules
│   ├── seo/
│   │   ├── metadata.ts              ← generateMetadata() helpers
│   │   └── json-ld.ts               ← Structured data builders
│   ├── theme/
│   │   ├── provider.tsx             ← Injects CSS custom properties per tenant
│   │   ├── tokens.ts                ← Token type definitions
│   │   └── resolver.ts              ← Merges base tokens + tenant overrides
│   ├── i18n/
│   │   ├── config.ts                ← Locale definitions, default locale
│   │   └── provider.tsx             ← Translation context (next-intl ready)
│   ├── preview/
│   │   └── draft-mode.ts            ← Preview/draft mode utilities
│   └── types/
│       ├── page.ts                  ← PageData, PageMeta, SlugParams
│       ├── tenant.ts                ← TenantConfig, TenantFeatures
│       ├── block.ts                 ← Block, BlockType (union), BlockProps
│       ├── navigation.ts            ← NavItem, Menu, Breadcrumb
│       └── index.ts                 ← Barrel re-exports
│
├── tenants/                          ← Per-tenant isolated code
│   ├── registry.ts                  ← Tenant config map + lookup
│   ├── resort-example/
│   │   ├── config.ts                ← TenantConfig (domains, theme, features, locales)
│   │   ├── blocks/
│   │   │   ├── index.ts             ← Block registry for this tenant
│   │   │   ├── hero/
│   │   │   │   ├── hero.tsx         ← Component
│   │   │   │   └── schema.ts        ← Zod props validation
│   │   │   ├── room-list/
│   │   │   │   ├── room-list.tsx
│   │   │   │   └── schema.ts
│   │   │   └── booking-widget/
│   │   │       ├── booking-widget.tsx
│   │   │       └── schema.ts
│   │   ├── templates/
│   │   │   ├── landing.tsx          ← Full-page template
│   │   │   ├── detail.tsx           ← Detail page template
│   │   │   └── index.ts            ← Template registry
│   │   ├── integrations/
│   │   │   ├── booking/
│   │   │   │   ├── client.ts        ← API client
│   │   │   │   ├── types.ts         ← Request/response types
│   │   │   │   └── mock.ts          ← Mock responses
│   │   │   └── reviews/
│   │   │       ├── client.ts
│   │   │       ├── types.ts
│   │   │       └── mock.ts
│   │   ├── theme/
│   │   │   └── tokens.ts           ← Design token overrides
│   │   └── i18n/
│   │       ├── en.json
│   │       └── sl.json
│   └── vukans-bike/
│       └── ...                      ← Same structure (blocks, integrations, templates, config)
│
├── core/mock-data.ts/               ← Per-tenant mock data (@mock-data alias)
│   ├── resort/                      ← resort-example (pages/, collections/, navigation.json)
│   └── vukans-bike/                 ← vukans-bike (pages/, collections/, navigation.json)
│
├── shared/                           ← Shared UI & utilities (tenant-agnostic)
│   ├── components/
│   │   ├── ui/                      ← Primitives: Button, Input, Card, Modal, Badge
│   │   ├── blocks/                  ← Default/fallback block implementations
│   │   └── layout/                  ← Header, Footer, Navigation, Sidebar
│   ├── hooks/
│   │   ├── use-tenant.ts            ← Access current tenant context
│   │   ├── use-breakpoint.ts        ← Responsive helpers
│   │   └── use-intersection.ts      ← Lazy loading
│   ├── utils/
│   │   ├── cn.ts                    ← clsx + tailwind-merge helper
│   │   ├── url.ts                   ← Slug/URL builders
│   │   └── format.ts               ← Date, currency, number formatters
│   └── lib/
│       ├── api-client.ts            ← Base fetch wrapper (timeout, retry, auth)
│       └── logger.ts               ← Structured logging
│
├── middleware.ts                     ← Tenant resolution from hostname/path
├── env.ts                            ← Zod-validated environment variables
│
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### Architecture Principles

1. **`app/` is routing only** — no business logic, no utilities. Pages are thin shells that call into `core/`.
2. **`core/` is the CMS engine** — tenant-agnostic. It never imports from `tenants/`. It defines interfaces that tenants implement.
3. **`tenants/` implement the interfaces** — blocks, templates, themes, integrations. Each tenant is a self-contained module.
4. **`shared/` is the UI library** — reusable primitives and default block implementations. Both `core/` and `tenants/` can import from `shared/`.
5. **Dependency direction:** `app/ → core/ → shared/` and `app/ → tenants/ → shared/`. Never `core/ → tenants/`. Never `shared/ → core/`.

---

## 3. Tenant Resolution (Middleware)

The middleware maps incoming requests to a tenant identifier using hostname, subdomain, or path prefix. This is the entry point of multi-tenancy.

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveTenantFromHost } from "@core/routing/resolver";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const tenant = resolveTenantFromHost(hostname);

  if (!tenant) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${tenant.id}${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

```ts
// src/core/routing/resolver.ts
import { tenantRegistry } from "@tenants/registry";

export function resolveTenantFromHost(hostname: string) {
  return Object.values(tenantRegistry).find((t) =>
    t.domains.some((d) => hostname.includes(d))
  );
}
```

This keeps the real URL clean (user sees `/about`, not `/resort-example/about`) while Next.js internally routes to `app/[domain]/[[...slug]]/page.tsx`.

---

## 4. Tenant Registry & Configuration

Each tenant exports a strongly-typed config. The registry aggregates them.

```ts
// src/core/types/tenant.ts
export interface TenantConfig {
  id: string;
  name: string;
  domains: string[];
  defaultLocale: string;
  locales: string[];
  features: TenantFeatures;
  theme: ThemeTokens;
  dataAdapter: "mock" | "strapi";
}

export interface TenantFeatures {
  blog: boolean;
  booking: boolean;
  reviews: boolean;
  search: boolean;
  newsletter: boolean;
  [key: string]: boolean;
}

export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    [key: string]: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
}
```

```ts
// src/tenants/registry.ts
import type { TenantConfig } from "@core/types/tenant";

import resortConfig from "./resort-example/config";
import bikesConfig from "./vukans-bike/config";

export const tenantRegistry: Record<string, TenantConfig> = {
  "resort-example": resortConfig,
  "vukans-bike": bikesConfig,
};

export function getTenantConfig(tenantId: string): TenantConfig {
  const config = tenantRegistry[tenantId];
  if (!config) throw new Error(`Unknown tenant: ${tenantId}`);
  return config;
}
```

```ts
// src/tenants/resort-example/config.ts
import type { TenantConfig } from "@core/types/tenant";

const config: TenantConfig = {
  id: "resort-example",
  name: "Kope",
  domains: ["resort.localhost", "alpineresort.com"],
  defaultLocale: "en",
  locales: ["en", "de", "sl"],
  features: {
    blog: true,
    booking: true,
    reviews: true,
    search: false,
    newsletter: true,
  },
  theme: {
    colors: {
      primary: "#1B4D3E",
      secondary: "#8B7355",
      accent: "#D4A574",
      background: "#FAFAF8",
      foreground: "#1A1A1A",
      muted: "#F3F0EB",
      border: "#E5E0D8",
    },
    fonts: {
      heading: "var(--font-playfair)",
      body: "var(--font-inter)",
    },
    borderRadius: "0.5rem",
  },
  dataAdapter: "mock",
};

export default config;
```

---

## 5. Page Data Model

Every page across all tenants follows a single contract. This is what the CMS (mock or Strapi) returns.

```ts
// src/core/types/page.ts
export interface PageData {
  slug: string;
  locale: string;
  template: string;
  blocks: BlockInstance[];
  seo: PageSeo;
  navigation?: NavigationData;
  breadcrumbs?: Breadcrumb[];
}

export interface BlockInstance {
  id: string;
  type: string;
  props: Record<string, unknown>;
  dataContract?: string;
  visibility?: BlockVisibility;
}

export interface BlockVisibility {
  devices?: ("mobile" | "tablet" | "desktop")[];
  locales?: string[];
  dateRange?: { from?: string; to?: string };
}

export interface PageSeo {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

export interface NavigationData {
  header: NavItem[];
  footer: NavItem[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  isExternal?: boolean;
}

export interface Breadcrumb {
  label: string;
  href: string;
}
```

Example mock JSON:

```jsonc
// src/tenants/resort-example/mock-data/pages/home.json
{
  "slug": "/",
  "locale": "en",
  "template": "landing",
  "blocks": [
    {
      "id": "hero-1",
      "type": "hero",
      "props": {
        "title": "Welcome to Kope",
        "subtitle": "Luxury in the mountains",
        "backgroundImage": "/images/hero.jpg",
        "cta": { "label": "Book Now", "href": "/booking" }
      }
    },
    {
      "id": "rooms-1",
      "type": "room-list",
      "props": { "limit": 6, "layout": "grid" },
      "dataContract": "rooms"
    },
    {
      "id": "reviews-1",
      "type": "reviews",
      "props": { "limit": 3 },
      "dataContract": "reviews",
      "visibility": { "devices": ["tablet", "desktop"] }
    }
  ],
  "seo": {
    "title": "Kope — Luxury Mountain Retreat",
    "description": "Experience luxury accommodation in the heart of the Alps.",
    "ogImage": "/images/og-home.jpg"
  },
  "navigation": {
    "header": [
      { "label": "Home", "href": "/" },
      { "label": "Rooms", "href": "/rooms" },
      { "label": "Booking", "href": "/booking" }
    ],
    "footer": [
      { "label": "Privacy", "href": "/privacy" },
      { "label": "Terms", "href": "/terms" }
    ]
  }
}
```

---

## 6. Block-Based Page Composition

This is the core concept. A page is not a monolithic template — it is an **ordered array of small, focused blocks** defined in JSON. The CMS renders them top-to-bottom. Content editors (or Strapi) control the order, content, and which blocks appear on which page.

```
JSON response                 Rendered page
────────────────              ────────────────────────────────────
{ type: "hero" }          →   ┌─────────────────────────────────┐
{ type: "stats-bar" }     →   │  Big hero image + headline       │
{ type: "rich-text" }     →   ├─────────────────────────────────┤
{ type: "image-text" }    →   │  3 stat numbers across           │
{ type: "card-grid" }     →   ├─────────────────────────────────┤
{ type: "testimonials" }  →   │  Body copy paragraph             │
{ type: "cta-banner" }    →   ├─────────────────────────────────┤
                              │  Image left + text right         │
                              ├─────────────────────────────────┤
                              │  3-column card grid              │
                              ├─────────────────────────────────┤
                              │  Testimonial carousel            │
                              ├─────────────────────────────────┤
                              │  Full-width CTA banner           │
                              └─────────────────────────────────┘
```

The **template** is just the outer shell — it sets the page's max-width, background, and section spacing. The **blocks fill the content**. Templates rarely need to change; blocks are where all the variety lives.

---

### 6a. Block Anatomy

Every block is a folder with exactly three files:

```
blocks/hero/
├── hero.tsx        ← React component (server or client)
├── schema.ts       ← Zod schema for props validation
└── types.ts        ← TypeScript interfaces for props
```

The component is small and focused — it renders one section of a page. Nothing else.

---

### 6b. Block Catalogue

These are the common building blocks. Shared blocks live in `src/shared/components/blocks/` and work for any tenant. Tenant-specific blocks override or extend them.

**Layout & Structure**
| Block type | What it renders |
|---|---|
| `hero` | Full-width hero with image, headline, subtitle, CTA button |
| `hero-video` | Same but with background video |
| `section-header` | Centred heading + subtext, used between sections |
| `divider` | Decorative horizontal rule / spacer |
| `spacer` | Configurable empty space |

**Content**
| Block type | What it renders |
|---|---|
| `rich-text` | Markdown / HTML body copy |
| `image-text` | Image + text side by side (layout: left/right) |
| `image-gallery` | Responsive image grid or lightbox |
| `video-embed` | YouTube / Vimeo / self-hosted video player |
| `accordion` | Expandable FAQ list |
| `tabs` | Tabbed content panels |

**Data-driven**
| Block type | What it renders | dataContract |
|---|---|---|
| `card-grid` | Generic card grid (fetches a collection) | any collection |
| `room-list` | Hotel room cards | `rooms` |
| `blog-posts` | Blog post previews | `posts` |
| `team-members` | Staff / team cards | `team` |
| `testimonials` | Review / testimonial cards | `reviews` |
| `product-list` | Product cards | `products` |

**Conversion**
| Block type | What it renders |
|---|---|
| `cta-banner` | Full-width call-to-action with heading + button |
| `newsletter-form` | Email capture form (client component) |
| `contact-form` | Contact form with validation (client component) |
| `booking-widget` | Availability / booking widget (tenant-specific, client) |

---

### 6c. Realistic Page JSON

A full home page composed of 8 blocks. Every block is independently renderable with its own data.

```jsonc
// src/tenants/resort-example/mock-data/pages/home.json
{
  "slug": "/",
  "locale": "en",
  "template": "default",
  "seo": {
    "title": "Kope — Luxury Mountain Retreat",
    "description": "Experience luxury accommodation in the heart of the Alps.",
    "ogImage": "/images/og-home.jpg"
  },
  "blocks": [
    {
      "id": "hero-1",
      "type": "hero",
      "props": {
        "headline": "Escape to the Alps",
        "subheadline": "Luxury rooms, mountain air, unforgettable views.",
        "backgroundImage": "/images/hero-mountain.jpg",
        "cta": { "label": "Explore Rooms", "href": "/rooms" },
        "secondaryCta": { "label": "Check Availability", "href": "/booking" },
        "overlay": 0.4
      }
    },
    {
      "id": "stats-1",
      "type": "stats-bar",
      "props": {
        "stats": [
          { "value": "47", "label": "Rooms & Suites" },
          { "value": "4.9★", "label": "Average Rating" },
          { "value": "1,200m", "label": "Altitude" },
          { "value": "Since 1987", "label": "Family-run" }
        ]
      }
    },
    {
      "id": "intro-text-1",
      "type": "image-text",
      "props": {
        "layout": "image-right",
        "image": { "src": "/images/lobby.jpg", "alt": "Resort lobby" },
        "heading": "A place to truly rest",
        "body": "Nestled in the Slovenian Alps, our resort blends alpine tradition with modern comfort. Every detail is designed to help you unwind.",
        "cta": { "label": "Our Story", "href": "/about" }
      }
    },
    {
      "id": "rooms-1",
      "type": "room-list",
      "props": {
        "heading": "Our Rooms",
        "subheading": "From cosy doubles to panoramic suites.",
        "limit": 3,
        "layout": "grid",
        "cta": { "label": "View All Rooms", "href": "/rooms" }
      },
      "dataContract": "rooms"
    },
    {
      "id": "booking-1",
      "type": "booking-widget",
      "props": {
        "heading": "Check Availability",
        "layout": "inline"
      }
    },
    {
      "id": "testimonials-1",
      "type": "testimonials",
      "props": {
        "heading": "What Our Guests Say",
        "limit": 3,
        "layout": "carousel"
      },
      "dataContract": "reviews"
    },
    {
      "id": "gallery-1",
      "type": "image-gallery",
      "props": {
        "images": [
          { "src": "/images/pool.jpg", "alt": "Outdoor pool" },
          { "src": "/images/dining.jpg", "alt": "Restaurant" },
          { "src": "/images/spa.jpg", "alt": "Spa" },
          { "src": "/images/suite.jpg", "alt": "Alpine Suite" }
        ],
        "columns": 4,
        "lightbox": true
      }
    },
    {
      "id": "cta-1",
      "type": "cta-banner",
      "props": {
        "heading": "Ready to book your stay?",
        "subheading": "Special rates available for direct bookings.",
        "cta": { "label": "Book Direct", "href": "/booking" },
        "background": "primary"
      }
    }
  ]
}
```

---

### 6d. Block Component Examples

Each block component accepts its `props` directly — no boilerplate, no wrappers. Small and focused.

```tsx
// src/tenants/resort-example/blocks/hero/hero.tsx
import Image from "next/image";
import { cn } from "@shared/utils/cn";
import type { HeroProps } from "./types";

export async function Hero({ headline, subheadline, backgroundImage, cta, secondaryCta, overlay = 0.3 }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <Image
        src={backgroundImage}
        alt={headline}
        fill
        priority
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlay }}
      />
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight">
          {headline}
        </h1>
        {subheadline && (
          <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
            {subheadline}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={cta.href}
            className="bg-[var(--color-primary)] hover:opacity-90 text-white px-8 py-4 rounded-[var(--radius)] font-semibold transition-opacity"
          >
            {cta.label}
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-[var(--radius)] font-semibold transition-colors"
            >
              {secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
```

```ts
// src/tenants/resort-example/blocks/hero/types.ts
export interface HeroProps {
  headline: string;
  subheadline?: string;
  backgroundImage: string;
  overlay?: number;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}
```

```ts
// src/tenants/resort-example/blocks/hero/schema.ts
import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const heroSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  backgroundImage: z.string().min(1),
  overlay: z.number().min(0).max(1).optional().default(0.3),
  cta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
});
```

---

```tsx
// src/shared/components/blocks/cta-banner.tsx
// Shared block — usable by any tenant
import { cn } from "@shared/utils/cn";

interface CtaBannerProps {
  heading: string;
  subheading?: string;
  cta: { label: string; href: string };
  background?: "primary" | "muted" | "dark";
}

export function CtaBanner({ heading, subheading, cta, background = "primary" }: CtaBannerProps) {
  const bgClass = {
    primary: "bg-[var(--color-primary)] text-white",
    muted: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
    dark: "bg-gray-900 text-white",
  }[background];

  return (
    <section className={cn("py-20 px-4 text-center", bgClass)}>
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">{heading}</h2>
        {subheading && <p className="text-lg mb-8 opacity-80">{subheading}</p>}
        <a
          href={cta.href}
          className="inline-block bg-white text-gray-900 hover:bg-opacity-90 px-8 py-4 rounded-[var(--radius)] font-semibold transition-opacity"
        >
          {cta.label}
        </a>
      </div>
    </section>
  );
}
```

---

```tsx
// src/tenants/resort-example/blocks/room-list/room-list.tsx
// Data-driven block — receives resolved data from its dataContract
import type { Room } from "../../integrations/booking/types";

interface RoomListProps {
  heading?: string;
  subheading?: string;
  layout?: "grid" | "list";
  cta?: { label: string; href: string };
  // Injected by dataContract, not from JSON props
  rooms: Room[];
}

export function RoomList({ heading, subheading, layout = "grid", cta, rooms }: RoomListProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">{heading}</h2>
            {subheading && <p className="text-[var(--color-muted-foreground)] text-lg">{subheading}</p>}
          </div>
        )}
        <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
          {rooms.map((room) => (
            <a key={room.id} href={`/rooms/${room.slug}`} className="group block rounded-[var(--radius)] overflow-hidden border border-[var(--color-border)] hover:shadow-lg transition-shadow">
              <img src={room.image} alt={room.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-5">
                <h3 className="font-heading text-xl font-semibold mb-1">{room.name}</h3>
                <p className="text-[var(--color-muted-foreground)] text-sm mb-3">{room.shortDescription}</p>
                <span className="font-semibold text-[var(--color-primary)]">From €{room.priceFrom} / night</span>
              </div>
            </a>
          ))}
        </div>
        {cta && (
          <div className="text-center mt-10">
            <a href={cta.href} className="inline-block border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-8 py-3 rounded-[var(--radius)] font-semibold hover:bg-[var(--color-primary)] hover:text-white transition-colors">
              {cta.label}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
```

---

### 6e. Template Role (Minimal by Design)

Templates are thin wrappers. They do not contain content — they define the page's structural shell: max-width, section spacing, and optional persistent elements like a page-specific hero area.

```tsx
// src/tenants/resort-example/templates/default.tsx
interface DefaultTemplateProps {
  children: React.ReactNode;
}

// The simplest template — blocks fill the page with no constraints
export default function DefaultTemplate({ children }: DefaultTemplateProps) {
  return <div className="flex flex-col">{children}</div>;
}
```

```tsx
// src/tenants/resort-example/templates/detail.tsx
// Used for room detail, blog post, etc — constrained reading width with sidebar
interface DetailTemplateProps {
  children: React.ReactNode;
}

export default function DetailTemplate({ children }: DetailTemplateProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <main className="min-w-0">{children}</main>
        <aside className="hidden lg:block">
          {/* Sidebar populated by a sticky block in JSON */}
        </aside>
      </div>
    </div>
  );
}
```

Templates are swapped via the `template` field in the page JSON. If no matching template is found, falls back to `DefaultTemplate`.

---

## 7. Data Fetching — Adapter Pattern

The data layer uses an adapter interface so swapping mock → Strapi requires zero changes in pages or blocks.

```ts
// src/core/data/contracts.ts
import type { PageData } from "@core/types/page";

export interface CmsAdapter {
  getPage(tenant: string, slug: string, locale: string): Promise<PageData | null>;
  getCollection<T = unknown>(tenant: string, collection: string, params?: CollectionParams): Promise<T[]>;
  getEntry<T = unknown>(tenant: string, collection: string, id: string): Promise<T | null>;
  getNavigation(tenant: string, locale: string): Promise<NavigationData | null>;
}

export interface CollectionParams {
  locale?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  filters?: Record<string, unknown>;
}
```

```ts
// src/core/data/fetcher.ts
import type { CmsAdapter } from "./contracts";
import { MockAdapter } from "./adapters/mock.adapter";
import { StrapiAdapter } from "./adapters/strapi.adapter";
import { getTenantConfig } from "@tenants/registry";

const adapters: Record<string, CmsAdapter> = {
  mock: new MockAdapter(),
  strapi: new StrapiAdapter(),
};

export function getAdapter(tenantId: string): CmsAdapter {
  const config = getTenantConfig(tenantId);
  return adapters[config.dataAdapter];
}
```

```ts
// src/core/data/adapters/mock.adapter.ts
import type { CmsAdapter, CollectionParams } from "../contracts";
import type { PageData, NavigationData } from "@core/types/page";

export class MockAdapter implements CmsAdapter {
  async getPage(tenant: string, slug: string, locale: string): Promise<PageData | null> {
    const normalised = slug === "/" ? "home" : slug.replace(/^\//, "").replace(/\//g, "--");
    try {
      const mod = await import(`@mock-data/pages/${normalised}.json`);
      return mod.default as PageData;
    } catch {
      return null;
    }
  }

  async getCollection<T>(tenant: string, collection: string, params?: CollectionParams): Promise<T[]> {
    try {
      const mod = await import(`@mock-data/collections/${collection}.json`);
      const data = mod.default as T[];
      return params?.limit ? data.slice(0, params.limit) : data;
    } catch {
      return [];
    }
  }

  async getEntry<T>(tenant: string, collection: string, id: string): Promise<T | null> {
    const items = await this.getCollection<T & { id: string }>(tenant, collection);
    return items.find((item) => item.id === id) ?? null;
  }

  async getNavigation(tenant: string, locale: string): Promise<NavigationData | null> {
    try {
      const mod = await import(`@mock-data/navigation.json`);
      return mod.default as NavigationData;
    } catch {
      return null;
    }
  }
}
```

```ts
// src/core/data/adapters/strapi.adapter.ts
import type { CmsAdapter, CollectionParams } from "../contracts";
import type { PageData, NavigationData } from "@core/types/page";
import { apiClient } from "@shared/lib/api-client";

export class StrapiAdapter implements CmsAdapter {
  private baseUrl = process.env.STRAPI_URL!;
  private token = process.env.STRAPI_API_TOKEN!;

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  async getPage(tenant: string, slug: string, locale: string): Promise<PageData | null> {
    const res = await apiClient(`${this.baseUrl}/api/pages`, {
      params: {
        "filters[tenant][$eq]": tenant,
        "filters[slug][$eq]": slug,
        locale,
        "populate": "deep",
      },
      headers: this.headers(),
      next: { revalidate: 60, tags: [`page-${tenant}-${slug}`] },
    });

    return res.data?.[0] ?? null;
  }

  async getCollection<T>(tenant: string, collection: string, params?: CollectionParams): Promise<T[]> {
    const res = await apiClient(`${this.baseUrl}/api/${collection}`, {
      params: {
        "filters[tenant][$eq]": tenant,
        locale: params?.locale,
        "pagination[limit]": params?.limit,
        "pagination[start]": params?.offset,
        sort: params?.sort,
        ...params?.filters,
      },
      headers: this.headers(),
      next: { revalidate: 60, tags: [`collection-${tenant}-${collection}`] },
    });

    return res.data ?? [];
  }

  async getEntry<T>(tenant: string, collection: string, id: string): Promise<T | null> {
    const res = await apiClient(`${this.baseUrl}/api/${collection}/${id}`, {
      params: { populate: "deep" },
      headers: this.headers(),
      next: { revalidate: 60, tags: [`entry-${tenant}-${collection}-${id}`] },
    });

    return res.data ?? null;
  }

  async getNavigation(tenant: string, locale: string): Promise<NavigationData | null> {
    const res = await apiClient(`${this.baseUrl}/api/navigations`, {
      params: {
        "filters[tenant][$eq]": tenant,
        locale,
        populate: "deep",
      },
      headers: this.headers(),
      next: { revalidate: 300, tags: [`nav-${tenant}`] },
    });

    return res.data?.[0] ?? null;
  }
}
```

---

## 8. Block System

### 8a. Block Types & Registration

Every block type is a React Server Component (or client where interactivity is needed). Tenant blocks are registered per-tenant; unknown types fall back to shared defaults.

```ts
// src/core/blocks/types.ts
import type { ComponentType } from "react";

export interface BlockDefinition {
  component: ComponentType<any>;
  schema?: ZodSchema;
  dataContract?: DataContractFn;
}

export type DataContractFn = (
  props: Record<string, unknown>,
  ctx: { tenant: string; locale: string }
) => Promise<Record<string, unknown>>;

export type BlockRegistry = Record<string, BlockDefinition>;
```

```ts
// src/core/blocks/registry.ts
import type { BlockRegistry } from "./types";

const sharedBlocks: BlockRegistry = {};
const tenantBlocks: Record<string, BlockRegistry> = {};

export function registerSharedBlocks(blocks: BlockRegistry) {
  Object.assign(sharedBlocks, blocks);
}

export function registerTenantBlocks(tenantId: string, blocks: BlockRegistry) {
  tenantBlocks[tenantId] = { ...tenantBlocks[tenantId], ...blocks };
}

export function resolveBlock(tenantId: string, blockType: string) {
  return tenantBlocks[tenantId]?.[blockType] ?? sharedBlocks[blockType] ?? null;
}
```

```ts
// src/tenants/resort-example/blocks/index.ts
import { registerTenantBlocks } from "@core/blocks/registry";
import { Hero } from "./hero/hero";
import { heroSchema } from "./hero/schema";
import { RoomList } from "./room-list/room-list";
import { roomListSchema } from "./room-list/schema";
import { BookingWidget } from "./booking-widget/booking-widget";

registerTenantBlocks("resort-example", {
  hero: { component: Hero, schema: heroSchema },
  "room-list": {
    component: RoomList,
    schema: roomListSchema,
    dataContract: async (props, ctx) => {
      const { getAdapter } = await import("@core/data/fetcher");
      const rooms = await getAdapter(ctx.tenant).getCollection(ctx.tenant, "rooms", {
        limit: (props.limit as number) ?? 6,
        locale: ctx.locale,
      });
      return { rooms };
    },
  },
  "booking-widget": { component: BookingWidget },
});
```

### 8b. Block Renderer

Server component that resolves and renders blocks with data fetching.

```tsx
// src/core/blocks/renderer.tsx
import { Suspense } from "react";
import type { BlockInstance } from "@core/types/page";
import { resolveBlock } from "./registry";

interface Props {
  blocks: BlockInstance[];
  tenant: string;
  locale: string;
}

export async function BlockRenderer({ blocks, tenant, locale }: Props) {
  return (
    <>
      {blocks.map(async (block) => {
        const definition = resolveBlock(tenant, block.type);
        if (!definition) {
          if (process.env.NODE_ENV === "development") {
            return <UnknownBlock key={block.id} type={block.type} />;
          }
          return null;
        }

        let extraData = {};
        if (definition.dataContract) {
          extraData = await definition.dataContract(block.props, { tenant, locale });
        }

        const Component = definition.component;

        return (
          <Suspense key={block.id} fallback={<BlockSkeleton />}>
            <Component {...block.props} {...extraData} blockId={block.id} />
          </Suspense>
        );
      })}
    </>
  );
}

function UnknownBlock({ type }: { type: string }) {
  return (
    <div className="border-2 border-dashed border-amber-400 bg-amber-50 p-4 rounded-lg text-sm text-amber-800">
      Unknown block type: <code>{type}</code>
    </div>
  );
}

function BlockSkeleton() {
  return <div className="animate-pulse bg-muted h-48 rounded-lg" />;
}
```

---

## 9. Dynamic Page Route

Thin page shell — all logic lives in `core/`.

```tsx
// src/app/[domain]/[[...slug]]/page.tsx
import { notFound } from "next/navigation";
import { getAdapter } from "@core/data/fetcher";
import { getTenantConfig } from "@tenants/registry";
import { BlockRenderer } from "@core/blocks/renderer";
import { resolveTemplate } from "@core/routing/resolver";
import { buildMetadata } from "@core/seo/metadata";

interface Props {
  params: Promise<{ domain: string; slug?: string[] }>;
}

export async function generateMetadata({ params }: Props) {
  const { domain, slug } = await params;
  const slugPath = slug ? `/${slug.join("/")}` : "/";
  const config = getTenantConfig(domain);
  const adapter = getAdapter(domain);
  const page = await adapter.getPage(domain, slugPath, config.defaultLocale);

  if (!page) return {};
  return buildMetadata(page.seo, config);
}

export default async function TenantPage({ params }: Props) {
  const { domain, slug } = await params;
  const slugPath = slug ? `/${slug.join("/")}` : "/";
  const config = getTenantConfig(domain);
  const adapter = getAdapter(domain);

  const page = await adapter.getPage(domain, slugPath, config.defaultLocale);
  if (!page) notFound();

  const Template = await resolveTemplate(domain, page.template);

  return (
    <Template page={page} tenant={config}>
      <BlockRenderer
        blocks={page.blocks}
        tenant={domain}
        locale={page.locale}
      />
    </Template>
  );
}
```

```tsx
// src/app/[domain]/layout.tsx
import { getTenantConfig } from "@tenants/registry";
import { ThemeProvider } from "@core/theme/provider";
import { getAdapter } from "@core/data/fetcher";

interface Props {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

export default async function TenantLayout({ children, params }: Props) {
  const { domain } = await params;
  const config = getTenantConfig(domain);
  const adapter = getAdapter(domain);
  const nav = await adapter.getNavigation(domain, config.defaultLocale);

  return (
    <ThemeProvider tokens={config.theme}>
      <div className="min-h-screen flex flex-col">
        {/* Inject shared or tenant-specific header/footer here */}
        <main className="flex-1">{children}</main>
      </div>
    </ThemeProvider>
  );
}
```

---

## 10. Template System

Templates control full-page layout. Each tenant registers its own templates.

```tsx
// src/tenants/resort-example/templates/landing.tsx
import type { PageData } from "@core/types/page";
import type { TenantConfig } from "@core/types/tenant";

interface Props {
  page: PageData;
  tenant: TenantConfig;
  children: React.ReactNode;
}

export default function LandingTemplate({ page, tenant, children }: Props) {
  return (
    <div className="landing-template">
      {page.breadcrumbs && <Breadcrumbs items={page.breadcrumbs} />}
      <div className="space-y-16">{children}</div>
    </div>
  );
}
```

```ts
// src/core/routing/resolver.ts (template resolution)
import type { ComponentType } from "react";

export async function resolveTemplate(tenantId: string, templateName: string): Promise<ComponentType<any>> {
  try {
    const mod = await import(`@tenants/${tenantId}/templates/${templateName}`);
    return mod.default;
  } catch {
    const fallback = await import(`@shared/components/layout/default-template`);
    return fallback.default;
  }
}
```

---

## 11. Theme System

Per-tenant theming via CSS custom properties. No runtime JS overhead.

```tsx
// src/core/theme/provider.tsx
import type { ThemeTokens } from "@core/types/tenant";

export function ThemeProvider({
  tokens,
  children,
}: {
  tokens: ThemeTokens;
  children: React.ReactNode;
}) {
  const cssVars = {
    "--color-primary": tokens.colors.primary,
    "--color-secondary": tokens.colors.secondary,
    "--color-accent": tokens.colors.accent,
    "--color-background": tokens.colors.background,
    "--color-foreground": tokens.colors.foreground,
    "--color-muted": tokens.colors.muted,
    "--color-border": tokens.colors.border,
    "--font-heading": tokens.fonts.heading,
    "--font-body": tokens.fonts.body,
    "--radius": tokens.borderRadius,
  } as React.CSSProperties;

  return <div style={cssVars}>{children}</div>;
}
```

Then in Tailwind config, reference these as `var(--color-primary)` etc., so every tenant's components use the same class names but render with their own colors and fonts.

---

## 12. Third-Party Integrations

Each tenant's integrations are fully isolated. The integration client follows a consistent pattern.

```ts
// src/tenants/resort-example/integrations/booking/client.ts
import { apiClient } from "@shared/lib/api-client";
import type { BookingRequest, BookingResponse, Availability } from "./types";

const BASE_URL = process.env.RESORT_BOOKING_API_URL!;
const API_KEY = process.env.RESORT_BOOKING_API_KEY!;

export async function checkAvailability(from: string, to: string, roomType?: string): Promise<Availability[]> {
  return apiClient(`${BASE_URL}/availability`, {
    params: { from, to, roomType },
    headers: { "X-API-Key": API_KEY },
  });
}

export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
  return apiClient(`${BASE_URL}/bookings`, {
    method: "POST",
    body: data,
    headers: { "X-API-Key": API_KEY },
  });
}
```

```ts
// src/tenants/resort-example/integrations/booking/mock.ts
import type { Availability, BookingResponse } from "./types";

export async function checkAvailability(): Promise<Availability[]> {
  return [
    { date: "2026-04-01", available: true, price: 250 },
    { date: "2026-04-02", available: true, price: 250 },
    { date: "2026-04-03", available: false, price: 0 },
  ];
}
```

Core never imports tenant integrations. Blocks call their own tenant's integrations directly.

---

## 13. SEO & Metadata

Dynamic metadata generation per page using Next.js `generateMetadata`.

```ts
// src/core/seo/metadata.ts
import type { Metadata } from "next";
import type { PageSeo } from "@core/types/page";
import type { TenantConfig } from "@core/types/tenant";

export function buildMetadata(seo: PageSeo, tenant: TenantConfig): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      siteName: tenant.name,
    },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
  };
}
```

---

## 14. Caching & Revalidation

Use Next.js fetch caching + on-demand ISR for content updates.

```ts
// src/app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenant, slug, collection } = await request.json();

  if (slug) revalidateTag(`page-${tenant}-${slug}`);
  if (collection) revalidateTag(`collection-${tenant}-${collection}`);

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

Fetch calls in the Strapi adapter use `next: { revalidate, tags }` for automatic cache management.

---

## 15. Environment Variables

Validate all env vars at build time using Zod.

```ts
// src/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  STRAPI_URL: z.string().url().optional(),
  STRAPI_API_TOKEN: z.string().optional(),
  REVALIDATE_SECRET: z.string().min(16),
  RESORT_BOOKING_API_URL: z.string().url().optional(),
  RESORT_BOOKING_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

```
# .env.local (never commit)
NODE_ENV=development
REVALIDATE_SECRET=your-secret-here-min-16-chars

# Strapi (enable when ready)
# STRAPI_URL=http://localhost:1337
# STRAPI_API_TOKEN=your-strapi-token

# Tenant-specific
# RESORT_BOOKING_API_URL=https://api.booking-provider.com
# RESORT_BOOKING_API_KEY=your-key
```

---

## 16. Shared Utilities

```ts
// src/shared/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```ts
// src/shared/lib/api-client.ts
interface FetchOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  timeout?: number;
}

export async function apiClient<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
  const { params, body, timeout = 10_000, ...init } = options;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value));
    }
    url = `${url}?${searchParams}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...init,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## 17. Build & Deployment

### Per-tenant builds (for separate deployments):

```jsonc
// package.json scripts
{
  "scripts": {
    "dev:resort": "node scripts/prepare-tenant.js && TENANT_ID=resort-example next dev -p 3001",
    "dev:bike": "node scripts/prepare-tenant.js && TENANT_ID=vukans-bike next dev -p 3002",
    "build:resort": "BUILD_CLEAN_ANALYZE=1 TENANT_ID=resort-example node scripts/prepare-tenant.js && TENANT_ID=resort-example next build",
    "build:bike": "BUILD_CLEAN_ANALYZE=1 TENANT_ID=vukans-bike node scripts/prepare-tenant.js && TENANT_ID=vukans-bike next build",
    "build:resort:analyze": "BUILD_CLEAN_ANALYZE=1 TENANT_ID=resort-example node scripts/prepare-tenant.js && TENANT_ID=resort-example ANALYZE=true next build",
    "build:bike:analyze": "BUILD_CLEAN_ANALYZE=1 TENANT_ID=vukans-bike node scripts/prepare-tenant.js && TENANT_ID=vukans-bike ANALYZE=true next build",
    "verify:build": "node scripts/verify-build.js",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Deployment strategies:

| Strategy | When to Use |
|---|---|
| **Single deployment, all tenants** | < 10 tenants, shared infra, simpler CI/CD |
| **Per-tenant deployment** | Isolated scaling, different regions, client SLAs |
| **Hybrid** | Shared core, per-tenant Vercel projects with env vars |

For Vercel, use `vercel.json` with rewrites to map custom domains → tenant paths.

---

## 18. Development Workflow

### Adding a new tenant:

1. Create folder `src/tenants/{tenant-id}/`
2. Add `config.ts` implementing `TenantConfig`
3. Add blocks in `blocks/`, templates in `templates/`
4. Add mock data in `src/core/mock-data.ts/{folder}/` (folder = tenant id, or "resort" for resort-example)
5. Add tenant import to `src/core/init.ts` for block registration
6. Add npm scripts: `dev:{short}`, `build:{short}`, `build:{short}:analyze`
7. Test with `npm run dev:{short}`

### Adding a new block:

1. Create folder `src/tenants/{tenant}/blocks/{block-name}/`
2. Add component (`{block-name}.tsx`) and schema (`schema.ts`)
3. Register in tenant's `blocks/index.ts`
4. Add to page JSON in mock data
5. If the block is useful across tenants, also add a default version in `src/shared/components/blocks/`

### Adding a new integration:

1. Create folder `src/tenants/{tenant}/integrations/{name}/`
2. Add `client.ts`, `types.ts`, and `mock.ts`
3. Add env vars to `.env.local` and `src/env.ts`
4. Use directly in the tenant's blocks — never through core

---

## 19. Verification Checklist

- [ ] Middleware correctly resolves tenants from hostname
- [ ] `[domain]/[[...slug]]` renders the right page for each tenant
- [ ] Mock data pages render all blocks per tenant
- [ ] Unknown block types show debug UI in dev, nothing in prod
- [ ] Each tenant's theme applies correct colors/fonts
- [ ] SEO metadata is unique per page and tenant
- [ ] Switching `dataAdapter` from `mock` to `strapi` requires zero template/block changes
- [ ] Third-party integrations per tenant work independently
- [ ] On-demand revalidation webhook invalidates correct cache tags
- [ ] Unknown slugs → tenant-specific 404
- [ ] Build completes with `tsc --noEmit` (zero type errors)
- [ ] Adding a new tenant requires no changes to core
