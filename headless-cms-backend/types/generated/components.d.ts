import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAccordion extends Struct.ComponentSchema {
  collectionName: 'components_blocks_accordions';
  info: {
    description: 'Single expandable panel (title + content)';
    displayName: 'Accordion';
    icon: 'bulletList';
  };
  attributes: {
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    defaultOpen: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
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
    backgroundColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    height: Schema.Attribute.String;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary']> &
      Schema.Attribute.DefaultTo<'primary'>;
    width: Schema.Attribute.String;
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
    backgroundColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    direction: Schema.Attribute.Enumeration<['row', 'column']> &
      Schema.Attribute.DefaultTo<'row'>;
    gap: Schema.Attribute.Enumeration<['sm', 'md', 'lg']>;
    height: Schema.Attribute.String;
    justify: Schema.Attribute.Enumeration<
      ['start', 'center', 'end', 'between']
    >;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    slots: Schema.Attribute.JSON;
    width: Schema.Attribute.String;
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
    backgroundColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    columns: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<2>;
    gap: Schema.Attribute.Enumeration<['sm', 'md', 'lg']>;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    slots: Schema.Attribute.JSON;
    width: Schema.Attribute.String;
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
    backgroundColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    height: Schema.Attribute.String;
    label: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    name: Schema.Attribute.Enumeration<['map-pin', 'phone', 'mail']> &
      Schema.Attribute.Required;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    size: Schema.Attribute.Enumeration<['sm', 'md', 'lg']> &
      Schema.Attribute.DefaultTo<'md'>;
    width: Schema.Attribute.String;
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
    backgroundColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    src: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.String;
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
    backgroundColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    fit: Schema.Attribute.Enumeration<['cover', 'contain']> &
      Schema.Attribute.DefaultTo<'cover'>;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    src: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.String;
  };
}

export interface BlocksLink extends Struct.ComponentSchema {
  collectionName: 'components_blocks_links';
  info: {
    description: 'Text link leaf (accent or muted)';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    fontSize: Schema.Attribute.String;
    fontWeight: Schema.Attribute.String;
    height: Schema.Attribute.String;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    showArrow: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    textAlign: Schema.Attribute.Enumeration<['left', 'center', 'right']>;
    variant: Schema.Attribute.Enumeration<['accent', 'muted']> &
      Schema.Attribute.DefaultTo<'accent'>;
    width: Schema.Attribute.String;
  };
}

export interface BlocksPartnerItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_partner_items';
  info: {
    description: 'A single brand/partner entry with logo, description, and optional URL';
    displayName: 'Partners Gallery \u2014 Partner';
    icon: 'handshake';
    name: 'PartnerItem';
  };
  attributes: {
    about: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    linkLabel: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface BlocksPartnersGallery extends Struct.ComponentSchema {
  collectionName: 'components_blocks_partners_galleries';
  info: {
    description: 'Brand / partner logos grid with eyebrow badge, heading, and partner cards';
    displayName: 'Partners Gallery';
    icon: 'briefcase';
    name: 'PartnersGallery';
  };
  attributes: {
    defaultPartnerLinkLabel: Schema.Attribute.String &
      Schema.Attribute.Required;
    eyebrowBadge: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    partners: Schema.Attribute.Component<'blocks.partner-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    subheading: Schema.Attribute.String;
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
    category: Schema.Attribute.String;
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
    backgroundColor: Schema.Attribute.String;
    backgroundFit: Schema.Attribute.Enumeration<['cover', 'contain']> &
      Schema.Attribute.DefaultTo<'cover'>;
    backgroundImage: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    height: Schema.Attribute.String;
    justify: Schema.Attribute.Enumeration<['start', 'center', 'end']>;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
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
    surface: Schema.Attribute.String & Schema.Attribute.DefaultTo<'default'>;
    width: Schema.Attribute.String;
  };
}

export interface BlocksServicePackage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_service_packages';
  info: {
    description: 'A single service pricing tier with features list';
    displayName: 'Service \u2014 Package';
    icon: 'tag';
    name: 'ServicePackage';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    features: Schema.Attribute.Text & Schema.Attribute.Required;
    label: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    priceDisplay: Schema.Attribute.String;
    priceNote: Schema.Attribute.String;
    turnaround: Schema.Attribute.String;
  };
}

export interface BlocksServicePricing extends Struct.ComponentSchema {
  collectionName: 'components_blocks_service_pricings';
  info: {
    description: 'Service pricing table with package tiers and optional bottom note / CTA';
    displayName: 'Service \u2014 Pricing';
    icon: 'euro-sign';
    name: 'ServicePricing';
  };
  attributes: {
    contactCta: Schema.Attribute.String;
    contactHref: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    note: Schema.Attribute.String;
    packages: Schema.Attribute.Component<'blocks.service-package', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    subheading: Schema.Attribute.String;
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
    backgroundColor: Schema.Attribute.String;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    color: Schema.Attribute.String;
    gap: Schema.Attribute.Enumeration<['sm', 'md', 'lg']>;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    slots: Schema.Attribute.JSON;
    width: Schema.Attribute.String;
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
    backgroundColor: Schema.Attribute.String;
    bold: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    border: Schema.Attribute.String;
    borderRadius: Schema.Attribute.String;
    borderTop: Schema.Attribute.String;
    color: Schema.Attribute.String;
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    fontSize: Schema.Attribute.String;
    fontWeight: Schema.Attribute.String;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    maxWidth: Schema.Attribute.String;
    minHeight: Schema.Attribute.String;
    overflow: Schema.Attribute.Enumeration<['visible', 'hidden', 'auto']>;
    padding: Schema.Attribute.String;
    textAlign: Schema.Attribute.Enumeration<['left', 'center', 'right']>;
    variant: Schema.Attribute.Enumeration<
      ['body', 'lead', 'caption', 'label']
    > &
      Schema.Attribute.DefaultTo<'body'>;
    width: Schema.Attribute.String;
  };
}

export interface SharedCtaLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_links';
  info: {
    description: 'Label + href pair \u2014 used as CTA buttons inside blocks';
    displayName: 'CTA Link';
    icon: 'cursor';
    name: 'CtaLink';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface SharedStatItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat_items';
  info: {
    description: 'A single social-proof statistic: value + label';
    displayName: 'Stat Item';
    icon: 'chart-bar';
    name: 'StatItem';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
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
      'blocks.partner-item': BlocksPartnerItem;
      'blocks.partners-gallery': BlocksPartnersGallery;
      'blocks.product-list': BlocksProductList;
      'blocks.section': BlocksSection;
      'blocks.service-package': BlocksServicePackage;
      'blocks.service-pricing': BlocksServicePricing;
      'blocks.stack': BlocksStack;
      'blocks.text': BlocksText;
      'shared.cta-link': SharedCtaLink;
      'shared.footer-copy': SharedFooterCopy;
      'shared.image-item': SharedImageItem;
      'shared.nav-item': SharedNavItem;
      'shared.nav-item-child': SharedNavItemChild;
      'shared.seo': SharedSeo;
      'shared.stat-item': SharedStatItem;
    }
  }
}
