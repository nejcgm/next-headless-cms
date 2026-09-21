import accordionJson from '../../../components/blocks/accordion.json';
import bikeDetailJson from '../../../components/blocks/bike-detail.json';
import bikeDetailLabelsJson from '../../../components/blocks/bike-detail-labels.json';
import buttonJson from '../../../components/blocks/button.json';
import flexJson from '../../../components/blocks/flex.json';
import galleryJson from '../../../components/blocks/gallery.json';
import gridJson from '../../../components/blocks/grid.json';
import iframeJson from '../../../components/blocks/iframe.json';
import iconJson from '../../../components/blocks/icon.json';
import imageJson from '../../../components/blocks/image.json';
import linkJson from '../../../components/blocks/link.json';
import productListJson from '../../../components/blocks/product-list.json';
import sectionJson from '../../../components/blocks/section.json';
import textJson from '../../../components/blocks/text.json';
import type { CompositionNode } from '../../../page-composition/types';
import { componentTypeName, isContainerType, toComponentUid } from '../../../page-composition/nest-rules';

export type FieldGroupName = 'content' | 'behavior' | 'layout' | 'typography' | 'spacing' | 'appearance';

export type FieldDef = {
  name: string;
  type: string;
  enum?: string[];
  required?: boolean;
  default?: unknown;
  group: FieldGroupName;
  label: string;
};

export const FIELD_GROUP_ORDER: FieldGroupName[] = [
  'content',
  'behavior',
  'layout',
  'typography',
  'spacing',
  'appearance',
];

const GROUP_TITLES: Record<FieldGroupName, string> = {
  content: 'Content',
  behavior: 'Behavior',
  layout: 'Layout',
  typography: 'Typography',
  spacing: 'Spacing',
  appearance: 'Appearance',
};

export function titleForGroup(group: FieldGroupName): string {
  return GROUP_TITLES[group];
}

const BEHAVIOR_FIELDS = new Set([
  'target',
  'showArrow',
  'allowFullscreen',
  'disabled',
  'type',
  'defaultOpen',
  'fit',
  'position',
  'anchorId',
]);

const LAYOUT_FIELDS = new Set([
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'direction',
  'justify',
  'align',
  'wrap',
  'gap',
  'columnsMobile',
  'columnsTablet',
  'columnsDesktop',
  'aspect',
  'size',
  'layout',
]);

const TYPOGRAPHY_FIELDS = new Set([
  'as',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'bold',
  'uppercase',
]);

const SPACING_FIELDS = new Set(['padding', 'margin']);

const APPEARANCE_FIELDS = new Set([
  'backgroundColor',
  'color',
  'borderWidth',
  'borderStyle',
  'borderColor',
  'borderRadius',
  'overflow',
  'surface',
  'backgroundImage',
  'backgroundFit',
  'backgroundPosition',
  'overlay',
  'variant',
  'divider',
]);

function groupFor(name: string): FieldGroupName {
  if (BEHAVIOR_FIELDS.has(name)) return 'behavior';
  if (LAYOUT_FIELDS.has(name)) return 'layout';
  if (TYPOGRAPHY_FIELDS.has(name)) return 'typography';
  if (SPACING_FIELDS.has(name)) return 'spacing';
  if (APPEARANCE_FIELDS.has(name)) return 'appearance';
  return 'content';
}

const LABEL_OVERRIDES: Record<string, string> = {
  columnsMobile: 'Columns (mobile)',
  columnsTablet: 'Columns (tablet)',
  columnsDesktop: 'Columns (desktop)',
  anchorId: 'Anchor ID',
  backgroundImage: 'Background image',
  backgroundFit: 'Background fit',
  backgroundPosition: 'Background position',
  outOfStockLabel: 'Out of stock label',
  accessibleLabel: 'Accessible label',
  allowFullscreen: 'Allow fullscreen',
  defaultOpen: 'Open by default',
  adminName: 'Admin label',
};

function plainLanguageLabel(name: string): string {
  const override = LABEL_OVERRIDES[name];
  if (override) return override;
  const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

type ComponentSchema = {
  info: { displayName?: string };
  attributes: Record<string, { type: string; enum?: string[]; required?: boolean; default?: unknown }>;
};

const SCHEMAS: Record<string, ComponentSchema> = {
  section: sectionJson as ComponentSchema,
  flex: flexJson as ComponentSchema,
  grid: gridJson as ComponentSchema,
  text: textJson as ComponentSchema,
  image: imageJson as ComponentSchema,
  iframe: iframeJson as ComponentSchema,
  icon: iconJson as ComponentSchema,
  button: buttonJson as ComponentSchema,
  link: linkJson as ComponentSchema,
  accordion: accordionJson as ComponentSchema,
  'product-list': productListJson as ComponentSchema,
  gallery: galleryJson as ComponentSchema,
  'bike-detail': bikeDetailJson as ComponentSchema,
  'bike-detail-labels': bikeDetailLabelsJson as ComponentSchema,
};

const SKIP = new Set(['slots', 'children']);

export function fieldsFor(type: string): FieldDef[] {
  const schema = SCHEMAS[componentTypeName(type)];
  if (!schema) return [];
  const fields = Object.entries(schema.attributes)
    .filter(([name]) => !SKIP.has(name))
    .map(
      ([name, attr]): FieldDef => ({
        name,
        type: attr.type,
        enum: attr.enum,
        required: attr.required,
        default: attr.default,
        group: groupFor(name),
        label: plainLanguageLabel(name),
      })
    );
  return FIELD_GROUP_ORDER.flatMap((group) => fields.filter((f) => f.group === group));
}

export function displayNameForType(type: string): string {
  const schema = SCHEMAS[componentTypeName(type)];
  return schema?.info.displayName ?? componentTypeName(type);
}

function emptyLabels(): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const name of Object.keys(bikeDetailLabelsJson.attributes)) {
    labels[name] = '';
  }
  return labels;
}

export function createDefaultNode(
  type: string,
  options: { id?: number; tempKey?: string }
): CompositionNode {
  const name = componentTypeName(type);
  const node: CompositionNode = {
    __component: toComponentUid(name),
  };
  if (options.id != null) node.id = options.id;
  if (options.tempKey) node.__temp_key__ = options.tempKey;

  if (isContainerType(name)) {
    node.slots = { default: [] };
  }

  switch (name) {
    case 'text':
      node.content = 'Text';
      node.as = 'p';
      node.fontSize = 16;
      node.color = 'foreground';
      break;
    case 'button':
      node.href = '/';
      node.variant = 'primary';
      node.slots = {
        default: [{ __component: 'blocks.text', content: 'Button', color: 'background' }],
      };
      break;
    case 'link':
      node.href = '/';
      node.variant = 'primary';
      node.slots = {
        default: [{ __component: 'blocks.text', content: 'Link', color: 'primary' }],
      };
      break;
    case 'image':
      node.src = '';
      node.alt = '';
      node.fit = 'cover';
      break;
    case 'iframe':
      node.src = '';
      node.title = '';
      node.aspect = '16:9';
      break;
    case 'icon':
      node.name = 'map-pin';
      node.size = 24;
      break;
    case 'accordion':
      node.title = 'Section title';
      node.defaultOpen = false;
      node.slots = { default: [{ __component: 'blocks.text', content: 'Panel content' }] };
      break;
    case 'product-list':
      node.outOfStockLabel = 'Out of stock';
      node.layout = 'grid';
      break;
    case 'gallery':
      node.layout = 'grid';
      node.columnsMobile = '2';
      node.columnsTablet = '3';
      node.columnsDesktop = '4';
      node.gap = '16';
      break;
    case 'bike-detail':
      node.labels = emptyLabels();
      break;
    case 'grid':
      node.columnsMobile = '1';
      node.columnsTablet = '2';
      node.columnsDesktop = '3';
      node.gap = '16';
      break;
    case 'flex':
      node.direction = 'row';
      node.gap = '16';
      break;
    case 'section':
      node.padding = '48';
      node.surface = 'background';
      node.width = 'contained';
      break;
    default:
      break;
  }

  return node;
}
