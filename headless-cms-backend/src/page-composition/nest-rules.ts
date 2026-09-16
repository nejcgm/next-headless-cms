export const LAYOUT_NEST_ALLOW = [
  'flex',
  'grid',
  'text',
  'image',
  'iframe',
  'icon',
  'button',
  'link',
  'accordion',
] as const;

export const GRID_NEST_ALLOW = [
  'flex',
  'text',
  'image',
  'iframe',
  'icon',
  'button',
  'link',
  'accordion',
] as const;

export const GALLERY_NEST_ALLOW = ['image'] as const;

export const LINK_BUTTON_NEST_ALLOW = ['icon', 'text'] as const;

export const KEEP_TYPES = ['product-list', 'bike-detail'] as const;

export const ROOT_COMPONENTS = [
  'blocks.section',
  'blocks.flex',
  'blocks.grid',
  'blocks.text',
  'blocks.image',
  'blocks.iframe',
  'blocks.icon',
  'blocks.button',
  'blocks.link',
  'blocks.accordion',
  'blocks.product-list',
  'blocks.bike-detail',
  'blocks.gallery',
] as const;

export const LEAF_TYPES = [
  'text',
  'image',
  'iframe',
  'icon',
  'product-list',
  'bike-detail',
] as const;

const MAX_DEPTH: Record<string, number> = {
  section: 7,
  grid: 6,
  flex: 5,
  accordion: 4,
  gallery: 2,
  link: 2,
  button: 2,
};

const VUKANS_BIKE = 'vukans-bike';

export function componentTypeName(component: string): string {
  return component.includes('.') ? component.split('.').pop()! : component;
}

export function toComponentUid(type: string): string {
  return type.includes('.') ? type : `blocks.${type}`;
}

export function maxDepthFor(type: string): number {
  const name = componentTypeName(type);
  return MAX_DEPTH[name] ?? 1;
}

export function isLeafType(type: string): boolean {
  return (LEAF_TYPES as readonly string[]).includes(componentTypeName(type));
}

export function isContainerType(type: string): boolean {
  const name = componentTypeName(type);
  return (
    name === 'section' ||
    name === 'flex' ||
    name === 'grid' ||
    name === 'accordion' ||
    name === 'gallery' ||
    name === 'link' ||
    name === 'button'
  );
}

export function allowlistFor(parentType: string, tenant?: string): string[] {
  const name = componentTypeName(parentType);
  let allow: string[];

  if (name === 'gallery') {
    return [...GALLERY_NEST_ALLOW];
  }
  if (name === 'link' || name === 'button') {
    return [...LINK_BUTTON_NEST_ALLOW];
  }
  if (name === 'grid') {
    allow = [...GRID_NEST_ALLOW];
  } else if (name === 'section' || name === 'flex' || name === 'accordion') {
    allow = [...LAYOUT_NEST_ALLOW];
  } else {
    return [];
  }

  if (tenant === VUKANS_BIKE) {
    allow = [...new Set([...allow, ...KEEP_TYPES])];
  }

  return allow;
}

export function rootTypesForTenant(tenant?: string): string[] {
  const types = ROOT_COMPONENTS.map(componentTypeName);
  if (tenant && tenant !== VUKANS_BIKE) {
    return types.filter((t) => !(KEEP_TYPES as readonly string[]).includes(t));
  }
  return types;
}

export function displayNameFor(type: string): string {
  const name = componentTypeName(type);
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
