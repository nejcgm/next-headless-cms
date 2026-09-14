import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAccordion extends Struct.ComponentSchema {
  collectionName: 'components_blocks_accordions';
  info: {
    description: 'Single expandable panel (title + content)';
    displayName: 'Accordion';
    icon: 'bulletList';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    defaultOpen: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    margin: Schema.Attribute.String;
    padding: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksBikeDetail extends Struct.ComponentSchema {
  collectionName: 'components_blocks_bike_details';
  info: {
    description: 'Single bike product page layout \u2014 labels only. Bike data is loaded at runtime from the products collection via dataContract.';
    displayName: 'Bike Detail';
    icon: 'bicycle';
    name: 'BikeDetail';
  };
  attributes: {
    labels: Schema.Attribute.Component<'blocks.bike-detail-labels', false> &
      Schema.Attribute.Required;
  };
}

export interface BlocksBikeDetailLabels extends Struct.ComponentSchema {
  collectionName: 'components_blocks_bike_detail_labels';
  info: {
    description: 'Translatable UI strings for the bike detail page';
    displayName: 'Bike Detail \u2014 UI Labels';
    icon: 'translate';
    name: 'BikeDetailLabels';
  };
  attributes: {
    breadcrumbBikes: Schema.Attribute.String & Schema.Attribute.Required;
    breadcrumbBikesHref: Schema.Attribute.String & Schema.Attribute.Required;
    breadcrumbHome: Schema.Attribute.String & Schema.Attribute.Required;
    breadcrumbHomeHref: Schema.Attribute.String & Schema.Attribute.Required;
    contactCtaHref: Schema.Attribute.String & Schema.Attribute.Required;
    contactCtaLabel: Schema.Attribute.String & Schema.Attribute.Required;
    contactPhoneHref: Schema.Attribute.String & Schema.Attribute.Required;
    contactPhoneLabel: Schema.Attribute.String & Schema.Attribute.Required;
    contactTeaser: Schema.Attribute.String & Schema.Attribute.Required;
    descriptionHeading: Schema.Attribute.String & Schema.Attribute.Required;
    notFoundBody: Schema.Attribute.String & Schema.Attribute.Required;
    notFoundCtaHref: Schema.Attribute.String & Schema.Attribute.Required;
    notFoundCtaLabel: Schema.Attribute.String & Schema.Attribute.Required;
    notFoundTitle: Schema.Attribute.String & Schema.Attribute.Required;
    outOfStock: Schema.Attribute.String & Schema.Attribute.Required;
    specsHeading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksButton extends Struct.ComponentSchema {
  collectionName: 'components_blocks_buttons';
  info: {
    description: 'Button / link leaf';
    displayName: 'Button';
    icon: 'cursor';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    height: Schema.Attribute.String;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary', 'outline']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface BlocksFlex extends Struct.ComponentSchema {
  collectionName: 'components_blocks_flexes';
  info: {
    description: 'Flex layout';
    displayName: 'Flex';
    icon: 'arrows';
  };
  attributes: {
    align: Schema.Attribute.Enumeration<['start', 'center', 'end', 'stretch']>;
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    direction: Schema.Attribute.Enumeration<['row', 'column']> &
      Schema.Attribute.DefaultTo<'row'>;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    gap: Schema.Attribute.Enumeration<['sm', 'md', 'lg']>;
    height: Schema.Attribute.String;
    justify: Schema.Attribute.Enumeration<
      ['start', 'center', 'end', 'between']
    >;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    slots: Schema.Attribute.JSON;
    wrap: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface BlocksGallery extends Struct.ComponentSchema {
  collectionName: 'components_blocks_galleries';
  info: {
    description: 'Photo gallery with lightbox, show-more/less controls, and translatable labels';
    displayName: 'Gallery';
    icon: 'images';
    name: 'Gallery';
  };
  attributes: {
    defaultImageAlt: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    images: Schema.Attribute.Component<'shared.image-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    lightboxAltPrefix: Schema.Attribute.String & Schema.Attribute.Required;
    showLessLabel: Schema.Attribute.String & Schema.Attribute.Required;
    showMorePrefix: Schema.Attribute.String & Schema.Attribute.Required;
    showMoreSuffix: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.String;
  };
}

export interface BlocksGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_grids';
  info: {
    description: 'CSS grid layout';
    displayName: 'Grid';
    icon: 'grid';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    columnsDesktop: Schema.Attribute.Enumeration<['1', '2', '3', '4']>;
    columnsMobile: Schema.Attribute.Enumeration<['1', '2', '3', '4']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'1'>;
    columnsTablet: Schema.Attribute.Enumeration<['1', '2', '3', '4']>;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    gap: Schema.Attribute.Enumeration<['sm', 'md', 'lg']>;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    slots: Schema.Attribute.JSON;
  };
}

export interface BlocksIcon extends Struct.ComponentSchema {
  collectionName: 'components_blocks_icons';
  info: {
    description: 'Decorative icon leaf (map-pin, phone, mail)';
    displayName: 'Icon';
    icon: 'bulletList';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    height: Schema.Attribute.String;
    label: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    name: Schema.Attribute.Enumeration<['map-pin', 'phone', 'mail']> &
      Schema.Attribute.Required;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    size: Schema.Attribute.Enumeration<['sm', 'md', 'lg']> &
      Schema.Attribute.DefaultTo<'md'>;
  };
}

export interface BlocksIframe extends Struct.ComponentSchema {
  collectionName: 'components_blocks_iframes';
  info: {
    description: 'Embed leaf (maps, video, etc.)';
    displayName: 'Iframe';
    icon: 'landscape';
  };
  attributes: {
    allowFullscreen: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    aspect: Schema.Attribute.Enumeration<['video', 'map', 'square']> &
      Schema.Attribute.DefaultTo<'map'>;
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    src: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksImage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_images';
  info: {
    description: 'Image leaf';
    displayName: 'Image';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    fit: Schema.Attribute.Enumeration<['cover', 'contain']> &
      Schema.Attribute.DefaultTo<'cover'>;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    src: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksLink extends Struct.ComponentSchema {
  collectionName: 'components_blocks_links';
  info: {
    description: 'Text link leaf (primary or muted)';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    fontSize: Schema.Attribute.String;
    fontWeight: Schema.Attribute.String;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    height: Schema.Attribute.String;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    showArrow: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    textAlign: Schema.Attribute.Enumeration<['left', 'center', 'right']>;
    variant: Schema.Attribute.Enumeration<['primary', 'muted']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface BlocksProductList extends Struct.ComponentSchema {
  collectionName: 'components_blocks_product_lists';
  info: {
    description: 'Bike listing block \u2014 products are loaded at runtime from the products collection. Only config is stored here.';
    displayName: 'Product List';
    icon: 'shopping-cart';
    name: 'ProductList';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<['grid', 'list']> &
      Schema.Attribute.DefaultTo<'grid'>;
    limit: Schema.Attribute.Integer;
    outOfStockLabel: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.String;
  };
}

export interface BlocksSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_sections';
  info: {
    description: 'Layout band with optional background; nesting via slots JSON';
    displayName: 'Section';
    icon: 'layout';
  };
  attributes: {
    align: Schema.Attribute.Enumeration<['start', 'center', 'end']>;
    anchorId: Schema.Attribute.String;
    backgroundFit: Schema.Attribute.Enumeration<['cover', 'contain']> &
      Schema.Attribute.DefaultTo<'cover'>;
    backgroundImage: Schema.Attribute.String;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    dividerTop: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    height: Schema.Attribute.String;
    heroHeight: Schema.Attribute.Enumeration<['standard', 'tall']>;
    justify: Schema.Attribute.Enumeration<['start', 'center', 'end']>;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    overlay: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      >;
    padding: Schema.Attribute.Enumeration<['sm', 'md', 'lg']>;
    slots: Schema.Attribute.JSON;
    surface: Schema.Attribute.Enumeration<
      ['background', 'muted', 'accent', 'foreground']
    >;
  };
}

export interface BlocksStack extends Struct.ComponentSchema {
  collectionName: 'components_blocks_stacks';
  info: {
    description: 'Vertical stack layout';
    displayName: 'Stack';
    icon: 'layer';
  };
  attributes: {
    align: Schema.Attribute.Enumeration<['start', 'center', 'end', 'stretch']>;
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    gap: Schema.Attribute.Enumeration<['sm', 'md', 'lg']>;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    slots: Schema.Attribute.JSON;
  };
}

export interface BlocksText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_texts';
  info: {
    description: 'Body / lead / caption / label leaf';
    displayName: 'Text';
    icon: 'bold';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    bold: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    border: Schema.Attribute.Enumeration<
      ['none', 'hairline', 'invertedOutline']
    >;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.Enumeration<
      [
        'primary',
        'secondary',
        'accent',
        'background',
        'foreground',
        'muted',
        'border',
        'text-primary',
      ]
    >;
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    customFontSize: Schema.Attribute.String;
    dividerTop: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    fontSize: Schema.Attribute.Enumeration<
      [
        'cardTitle',
        'sectionTitle',
        'priceCompact',
        'pageTitle',
        'price',
        'display',
        'statement',
        'custom',
      ]
    >;
    fontWeight: Schema.Attribute.String;
    fullWidth: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    textAlign: Schema.Attribute.Enumeration<['left', 'center', 'right']>;
    variant: Schema.Attribute.Enumeration<
      ['body', 'lead', 'caption', 'label']
    > &
      Schema.Attribute.DefaultTo<'body'>;
  };
}

export interface SharedFooterCopy extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_copies';
  info: {
    description: 'Text labels shown in the site footer: tagline, headings, copyright';
    displayName: 'Footer Copy';
    icon: 'feather';
    name: 'FooterCopy';
  };
  attributes: {
    contactHeading: Schema.Attribute.String & Schema.Attribute.Required;
    contactPlaceholder: Schema.Attribute.String & Schema.Attribute.Required;
    copyrightReserved: Schema.Attribute.String & Schema.Attribute.Required;
    linksHeading: Schema.Attribute.String & Schema.Attribute.Required;
    tagline: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedImageItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_image_items';
  info: {
    description: 'Image URL + alt text \u2014 used in galleries and image arrays';
    displayName: 'Image Item';
    icon: 'picture';
    name: 'ImageItem';
  };
  attributes: {
    alt: Schema.Attribute.String;
    src: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    description: 'Top-level navigation link with optional child links';
    displayName: 'Nav Item';
    icon: 'layer';
    name: 'NavItem';
  };
  attributes: {
    children: Schema.Attribute.Component<'shared.nav-item-child', true>;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavItemChild extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_item_children';
  info: {
    description: 'Second-level nav link \u2014 nested inside a parent NavItem';
    displayName: 'Nav Item (child)';
    icon: 'arrow-right';
    name: 'NavItemChild';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Matches frontend PageSeo (title, description, ogImage, \u2026)';
    displayName: 'Seo';
    icon: 'search';
    name: 'Seo';
  };
  attributes: {
    canonical: Schema.Attribute.String;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    jsonLd: Schema.Attribute.JSON;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogImage: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.accordion': BlocksAccordion;
      'blocks.bike-detail': BlocksBikeDetail;
      'blocks.bike-detail-labels': BlocksBikeDetailLabels;
      'blocks.button': BlocksButton;
      'blocks.flex': BlocksFlex;
      'blocks.gallery': BlocksGallery;
      'blocks.grid': BlocksGrid;
      'blocks.icon': BlocksIcon;
      'blocks.iframe': BlocksIframe;
      'blocks.image': BlocksImage;
      'blocks.link': BlocksLink;
      'blocks.product-list': BlocksProductList;
      'blocks.section': BlocksSection;
      'blocks.stack': BlocksStack;
      'blocks.text': BlocksText;
      'shared.footer-copy': SharedFooterCopy;
      'shared.image-item': SharedImageItem;
      'shared.nav-item': SharedNavItem;
      'shared.nav-item-child': SharedNavItemChild;
      'shared.seo': SharedSeo;
    }
  }
}
