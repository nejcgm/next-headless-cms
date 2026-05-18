# Project State & Architecture Documentation

## Next.js Multi-Tenant Headless CMS

A fully dynamic, multi-tenant CMS with block-based page composition, multi-site capabilities, dynamic slugs, and third-party API integrations.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Route Structure](#route-structure)
4. [Multi-Tenancy System](#multi-tenancy-system)
5. [Block System](#block-system)
6. [Data Layer](#data-layer)
7. [Theme System](#theme-system)
8. [Third-Party Integrations](#third-party-integrations)
9. [Environment Configuration](#environment-configuration)
10. [Development Workflow](#development-workflow)
11. [Deployment](#deployment)

---

## Architecture Overview

### Core Philosophy

- **Multi-Tenancy**: Single codebase serving multiple independent sites
- **Block-Based Composition**: Pages built from reusable JSON-configured blocks
- **Type Safety**: Strict TypeScript with Zod validation
- **Server-First**: Leverages Next.js App Router with React Server Components
- **API Agnostic**: Adapter pattern supports multiple CMS backends

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS + CSS Custom Properties (theming)
- **Validation**: Zod (runtime schema validation)
- **Deployment**: Docker-ready, Vercel-compatible

---

## Folder Structure

```
next-headless-cms/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [domain]/                 # Dynamic tenant routes
│   │   │   ├── [[...slug]]/         # Catch-all page route
│   │   │   │   └── page.tsx         # Main dynamic page renderer
│   │   │   ├── layout.tsx           # Tenant-specific layout
│   │   │   └── rooms/               # (removed - now uses slug pattern)
│   │   ├── api/                     # API routes
│   │   │   ├── revalidate/          # ISR revalidation
│   │   │   └── webhooks/            # CMS webhooks
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   │
│   ├── core/                        # Shared core logic
│   │   ├── blocks/                  # Block system
│   │   │   ├── registry.ts          # Block registration
│   │   │   ├── renderer.tsx         # Block renderer
│   │   │   └── types.ts             # Block type definitions
│   │   ├── data/                    # Data layer
│   │   │   ├── adapters/            # CMS adapters
│   │   │   │   ├── mock.adapter.ts  # Mock JSON adapter
│   │   │   │   └── strapi.adapter.ts # Strapi adapter
│   │   │   ├── contracts.ts         # Adapter interfaces
│   │   │   └── fetcher.ts           # Data fetching utilities
│   │   ├── routing/                 # Routing utilities
│   │   │   ├── resolver.ts          # Tenant/template resolution
│   │   │   └── redirects.ts           # Redirect handling
│   │   ├── seo/                     # SEO utilities
│   │   │   ├── metadata.ts          # Meta tag generation
│   │   │   └── json-ld.ts           # Structured data
│   │   ├── theme/                   # Theming system
│   │   │   ├── provider.tsx         # Theme provider
│   │   │   └── (tokens from @core/types/tenant)
│   │   ├── mock-data.ts/            # Per-tenant mock data (@mock-data alias)
│   │   │   ├── resort/              # resort-example tenant
│   │   │   │   ├── pages/
│   │   │   │   ├── collections/
│   │   │   │   └── navigation.json
│   │   │   └── vukans-bike/         # vukans-bike tenant
│   │   │       ├── pages/
│   │   │       ├── collections/
│   │   │       └── navigation.json
│   │   ├── types/                   # Core types
│   │   │   ├── page.ts              # Page data structures
│   │   │   ├── tenant.ts            # Tenant configuration
│   │   │   └── block.ts             # Block type definitions
│   │   └── mock-data.ts/            # Per-tenant mock data (@mock-data alias)
│   │       ├── resort/              # resort-example (pages/, collections/, navigation.json)
│   │       └── vukans-bike/         # vukans-bike (pages/, collections/, navigation.json)
│   │
│   ├── shared/                      # Shared UI components
│   │   ├── components/
│   │   │   ├── blocks/              # Default/shared blocks
│   │   │   │   ├── cta-banner.tsx
│   │   │   │   ├── stats-bar.tsx
│   │   │   │   └── ...
│   │   │   └── layout/              # Layout components
│   │   │       ├── header.tsx
│   │   │       └── footer.tsx
│   │   └── lib/                     # Shared utilities
│   │       ├── api-client.ts        # Generic API client
│   │       ├── logger.ts            # Logging utility
│   │       └── utils.ts             # General utilities
│   │
│   ├── tenants/                     # Tenant-specific code
│   │   ├── resort-example/          # Resort tenant
│   │   │   ├── blocks/              # Tenant-specific blocks
│   │   │   │   ├── hero/
│   │   │   │   ├── room-list/
│   │   │   │   ├── room-detail/
│   │   │   │   ├── hotel-info/
│   │   │   │   ├── booking-widget/
│   │   │   │   ├── testimonials/
│   │   │   │   ├── about-story/     # NEW: About page block
│   │   │   │   ├── location-contact/ # NEW: Contact page block
│   │   │   │   ├── amenities-grid/  # NEW: Amenities block
│   │   │   │   ├── team-gallery/    # NEW: Team block
│   │   │   │   └── index.ts         # Block registration
│   │   │   ├── integrations/        # Third-party APIs
│   │   │   │   ├── grmovsek-hotel/  # Hotel API integration
│   │   │   │   │   ├── client.ts    # API client
│   │   │   │   │   ├── types.ts     # Type definitions
│   │   │   │   │   └── ...
│   │   │   │   ├── booking/         # Booking integration
│   │   │   │   └── reviews/         # Reviews integration
│   │   │   ├── services/            # Business logic services
│   │   │   │   └── roomDetail.service.ts
│   │   │   └── config.ts            # Tenant configuration
│   │   │
│   │   ├── vukans-bike/             # Bike rental tenant
│   │   │   ├── blocks/
│   │   │   └── config.ts
│   │   │
│   │   └── registry.ts              # Tenant registry
│   │
│   ├── middleware.ts                # Next.js middleware
│   └── env.ts                       # Environment validation
│
├── scripts/
│   ├── prepare-tenant.js            # Updates tsconfig + cleans analyze before build
│   ├── clean-analyze.js             # Removes old analyze output
│   └── verify-build.js              # Verifies tenant isolation
│
├── public/                          # Static assets
├── .env.local                       # Environment variables
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── deploy.md                        # Deployment guide
└── projectstate.md                  # This file
```

---

## Route Structure

### Dynamic Route Pattern

The app uses a single dynamic route to handle all pages across all tenants:

```
/[domain]/[[...slug]]
```

**Examples:**

| URL | Domain | Slug | Resolved Page |
|-----|--------|------|---------------|
| `resort.localhost:3000/` | `resort` | `/` | `home.json` |
| `resort.localhost:3000/about` | `resort` | `/about` | `about.json` |
| `resort.localhost:3000/rooms/123` | `resort` | `/rooms/123` | `room-detail.json` (pattern match) |
| `bike.localhost:3000/rentals` | `bike` | `/rentals` | `rentals.json` |

### Route Resolution Flow

1. **Middleware** intercepts request
2. **Domain resolution**: Build-time tenant from `@tenant/config`; path rewritten with tenant id
3. **Slug resolution**: Combines path segments into slug
4. **Data fetching**: Adapter fetches page data for `tenant + slug`
5. **Block rendering**: Page renders blocks from JSON

### Special Route Patterns

```typescript
// Pattern-based routing (in mock adapter)
"/rooms/:roomId"  → matches /rooms/123, /rooms/456
```

---

## Multi-Tenancy System

### Tenant Configuration

Each tenant has a configuration in `src/tenants/{tenant}/config.ts`:

```typescript
interface TenantConfig {
  id: string;              // Unique identifier
  name: string;            // Display name
  domains: string[];         // Allowed hostnames
  defaultLocale: string;     // Default language
  theme: ThemeTokens;      // CSS custom properties
  adapter: string;           // Data adapter type
}
```

### Tenant Resolution

- **Build time**: `TENANT_ID` selects which tenant is built. Only that tenant's code is included.
- **Runtime**: Middleware rewrites path with tenant id (e.g. `/` → `/vukans-bike/`). Layout imports from `@tenant/config`.

### Tenant Isolation

- **Code**: Each tenant has isolated blocks folder. Build includes only selected tenant via `@tenant` alias.
- **Data**: Mock data in `src/core/mock-data.ts/{tenant}/` (vukans-bike, resort). Resolved by `@mock-data` alias.
- **Styling**: Per-tenant CSS custom properties
- **Navigation**: Independent navigation structures

---

## Block System

### Block Definition

Blocks are registered in `src/tenants/{tenant}/blocks/index.ts`:

```typescript
registerTenantBlocks("resort-example", {
  "hero": {
    component: Hero,
    schema: heroSchema,      // Zod validation (optional)
    dataContract: async (props, ctx) => {
      // Fetch external data
      return { rooms: await fetchRooms() };
    },
  },
});
```

### Block Structure

```typescript
interface BlockDefinition {
  component: ComponentType<any>;
  schema?: ZodSchema;                    // Props validation
  dataContract?: DataContractFn;         // Data fetching
}

type DataContractFn = (
  props: Record<string, unknown>,       // Block props from JSON
  ctx: { tenant: string; locale: string; slug?: string }
) => Promise<Record<string, unknown>>;
```

### Block Data Flow

1. Page JSON defines blocks array
2. BlockRenderer iterates over blocks
3. For each block:
   - Resolve block definition from registry
   - Execute dataContract (if present) with props + context
   - Merge props + contract data
   - Render component

### Built-in Blocks

**Shared/Default Blocks:**
- `cta-banner` — Call-to-action section
- `stats-bar` — Statistics display
- `rich-text` — Markdown content
- `section-header` — Section heading
- `image-text` — Two-column image + text
- `image-gallery` — Photo grid

**Resort-Specific Blocks:**
- `hero` — Full-width hero banner
- `room-list` — Room cards grid
- `room-detail` — Single room detail with availability
- `hotel-info` — Hotel overview with images
- `booking-widget` — Date picker + booking form
- `testimonials` — Guest reviews
- `about-story` — About page content
- `location-contact` — Contact info + map
- `amenities-grid` — Services grid
- `team-gallery` — Staff showcase

---

## Data Layer

### Adapter Pattern

```typescript
interface CmsAdapter {
  getPage(tenant, slug, locale): Promise<PageData | null>;
  getCollection(tenant, collection, params): Promise<T[]>;
  getEntry(tenant, collection, id): Promise<T | null>;
  getNavigation(tenant, locale): Promise<NavigationData | null>;
}
```

### Built-in Adapters

1. **MockAdapter** — JSON files in `src/core/mock-data.ts/{tenant}/` (via `@mock-data` alias)
2. **StrapiAdapter** — Strapi CMS integration

### Page Data Structure

```typescript
interface PageData {
  slug: string;
  locale: string;
  template: string;
  seo: SeoData;
  blocks: BlockInstance[];
}

interface BlockInstance {
  id: string;              // Unique block ID
  type: string;            // Block type name
  props: Record<string, unknown>; // Block configuration
  visibility?: {
    locales?: string[];    // Locale restrictions
  };
}
```

### Services Pattern

Complex data logic is extracted to services:

```typescript
// src/tenants/resort-example/services/roomDetail.service.ts
export async function fetchRoomDetailData(
  slug: string | undefined,
  props: Record<string, unknown>
): Promise<RoomDetailData> {
  // Complex data fetching logic
  // Returns normalized data for block
}
```

---

## Theme System

### CSS Custom Properties

Themes defined as token objects:

```typescript
interface ThemeTokens {
  "color-primary": string;
  "color-background": string;
  "color-foreground": string;
  "font-heading": string;
  "radius": string;
  // ... more tokens
}
```

### Theme Application

```tsx
<ThemeProvider tokens={config.theme}>
  <div style={{ "--color-primary": theme["color-primary"] }}>
    {children}
  </div>
</ThemeProvider>
```

### Tailwind Integration

```css
/* CSS variables referenced in Tailwind classes */
.bg-[var(--color-primary)]
.text-[var(--color-foreground)]
```

---

## Third-Party Integrations

### Grmovsek Hotel API (LiteAPI)

**Location**: `src/tenants/resort-example/integrations/grmovsek-hotel/`

**Features:**
- Hotel details fetch (`/data/hotel`)
- Room listing from hotel data
- Real-time availability check (`/hotels/rates`)
- 60-day availability calendar

**Functions:**
```typescript
getHotel(hotelId): Promise<Hotel | null>
checkAvailability(params): Promise<AvailabilityResult | null>
fetchAvailabilityCalendar(params): Promise<AvailabilityCalendar | null>
```

### Other Integrations

- **Booking API** — Reservation system
- **Reviews API** — Guest testimonials

---

## Environment Configuration

### Required Variables

```bash
# Core
NODE_ENV=development

# Tenant (build-time, set by npm scripts)
# TENANT_ID=resort-example or TENANT_ID=vukans-bike

# Grmovsek Hotel API (LiteAPI)
LITEAPI_URL=https://api.liteapi.travel/v3.0
LITEAPI_KEY=sand_xxxxx
LITEAPI_HOTEL_ID=lp65866c0e

# Strapi (optional)
STRAPI_URL=https://cms.example.com
STRAPI_TOKEN=xxx

# ISR
REVALIDATE_SECRET=dev-secret-key
```

### Environment Validation

Zod schema in `src/env.ts` validates all required variables at startup.

---

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Run specific tenant (runs prepare-tenant first)
npm run dev:resort    # resort-example on port 3001
npm run dev:bike     # vukans-bike on port 3002
```

### Adding a New Tenant

1. Create folder: `src/tenants/{tenant}/`
2. Add `config.ts` with tenant settings
3. Create `blocks/index.ts` and register blocks
4. Add mock data in `src/core/mock-data.ts/{folder}/` (folder = tenant id, or "resort" for resort-example)
5. Add tenant to `src/core/init.ts` for block registration
6. Add npm scripts: `dev:{short}`, `build:{short}`, `build:{short}:analyze`

### Adding a New Block

1. Create folder: `src/tenants/{tenant}/blocks/{block-name}/`
2. Add component: `{block-name}.tsx`
3. Add types: `types.ts`
4. Register in `blocks/index.ts`

---

## Deployment

### Build Per Tenant

```bash
# Build specific tenant (cleans analyze, runs prepare-tenant)
npm run build:resort
npm run build:bike

# Build with bundle analysis
npm run build:resort:analyze
npm run build:bike:analyze

# Verify build isolation (auto-detects tenant)
npm run verify:build
```

### Docker Multi-Tenant

```dockerfile
ARG TENANT=resort-example
ENV TENANT_ID=${TENANT}
RUN node scripts/prepare-tenant.js && npm run build
```

Build images:
```bash
docker build --build-arg TENANT=resort-example -t cms:resort .
docker build --build-arg TENANT=vukans-bike -t cms:bike .
```

### Vercel Deployment

1. Set `TENANT_ID` in project environment variables
2. Run `prepare-tenant` before build (or use `npm run build:resort` / `build:bike`)

See full details in `deploy.md`.

---

## API Reference

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/revalidate` | POST | Trigger ISR revalidation |
| `/api/webhooks/strapi` | POST | Strapi webhook handler |

### Internal Utilities

| Function | Location | Purpose |
|----------|----------|---------|
| `getTenantConfig(domain)` | `core/routing/resolver.ts` | Get tenant by domain |
| `getAdapter(tenant)` | `core/data/fetcher.ts` | Get CMS adapter |
| `resolveBlock(tenant, type)` | `core/blocks/registry.ts` | Get block definition |
| `apiClient(url, options)` | `shared/lib/api-client.ts` | Generic API fetcher |

---

## Troubleshooting

### Common Issues

**Hydration Mismatch:**
- Browser extensions modifying DOM
- Fixed: Added `suppressHydrationWarning` to layouts

**Tenant Not Found:**
- Ensure you ran `npm run dev:resort` or `dev:bike` (runs prepare-tenant)
- Verify tenant exists in `src/tenants/{tenant}/`

**Blocks Not Loading:**
- Ensure `registerTenantBlocks()` called
- Check block type name matches JSON

**API Errors:**
- Validate `LITEAPI_KEY` in `.env.local`
- Check API rate limits

---

## Future Enhancements

- [ ] Add more CMS adapters (Contentful, Sanity)
- [ ] Implement preview mode for drafts
- [ ] Add analytics integration
- [ ] Create visual block builder
- [ ] Add i18n with next-intl
- [ ] Implement user authentication
- [ ] Add form builder blocks

---

## Architecture Principles

1. **Composition over Inheritance**: Blocks compose pages
2. **Adapter Pattern**: Swappable data sources
3. **Type Safety**: Strict TypeScript throughout
4. **Server-First**: RSC for data, client for interactivity
5. **Isolation**: Tenants don't share state
6. **Extensibility**: Easy to add blocks/adapters/tenants

---

*Generated: March 2026*
*Project: next-headless-cms*
