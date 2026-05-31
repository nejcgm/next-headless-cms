import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAboutPerson extends Struct.ComponentSchema {
  collectionName: 'components_blocks_about_persons';
  info: {
    description: 'Owner / team member bio with photo and optional CTA';
    displayName: 'About \u2014 Person';
    icon: 'user';
    name: 'AboutPerson';
  };
  attributes: {
    bio: Schema.Attribute.Text & Schema.Attribute.Required;
    cta: Schema.Attribute.Component<'shared.cta-link', false>;
    image: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    role: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksAboutStory extends Struct.ComponentSchema {
  collectionName: 'components_blocks_about_stories';
  info: {
    description: 'Brand narrative with kicker, headline, pull quote, body paragraphs, and optional image';
    displayName: 'About \u2014 Story';
    icon: 'book';
    name: 'AboutStory';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.String;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'right'>;
    kicker: Schema.Attribute.String;
    quote: Schema.Attribute.String;
  };
}

export interface BlocksAboutValueItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_about_value_items';
  info: {
    description: 'A single brand value card: icon name, title, description';
    displayName: 'About \u2014 Value Item';
    icon: 'award';
    name: 'AboutValueItem';
  };
  attributes: {
    description: Schema.Attribute.String & Schema.Attribute.Required;
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksAboutValues extends Struct.ComponentSchema {
  collectionName: 'components_blocks_about_values';
  info: {
    description: 'Brand values grid with eyebrow badge, heading, and value cards';
    displayName: 'About \u2014 Values';
    icon: 'star';
    name: 'AboutValues';
  };
  attributes: {
    eyebrowBadge: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'blocks.about-value-item', true> &
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

export interface BlocksBikeSchoolIntro extends Struct.ComponentSchema {
  collectionName: 'components_blocks_bike_school_intros';
  info: {
    description: 'Bike school intro section with date range, location, and CTAs';
    displayName: 'Bike School \u2014 Intro';
    icon: 'bicycle';
    name: 'BikeSchoolIntro';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.cta-link', false> &
      Schema.Attribute.Required;
    dateRange: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    kicker: Schema.Attribute.String;
    location: Schema.Attribute.String & Schema.Attribute.Required;
    secondaryCta: Schema.Attribute.Component<'shared.cta-link', false>;
    subheading: Schema.Attribute.String;
  };
}

export interface BlocksBikeSchoolProgram extends Struct.ComponentSchema {
  collectionName: 'components_blocks_bike_school_programs';
  info: {
    description: 'Bike school program tiers / schedule with heading and level items';
    displayName: 'Bike School \u2014 Program';
    icon: 'clipboard-list';
    name: 'BikeSchoolProgram';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'blocks.bike-school-program-item', true> &
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

export interface BlocksBikeSchoolProgramItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_bike_school_program_items';
  info: {
    description: 'A single program tier/level with title, level badge, description, and bullet highlights';
    displayName: 'Bike School \u2014 Program Item';
    icon: 'list';
    name: 'BikeSchoolProgramItem';
  };
  attributes: {
    bullets: Schema.Attribute.Text & Schema.Attribute.Required;
    ctaHref: Schema.Attribute.String;
    ctaLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    level: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksContact extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contacts';
  info: {
    description: 'Contact section with address, map embed, phone, email and opening hours';
    displayName: 'Contact';
    icon: 'phone';
    name: 'Contact';
  };
  attributes: {
    address: Schema.Attribute.Component<'blocks.contact-address', false> &
      Schema.Attribute.Required;
    directionsLink: Schema.Attribute.String & Schema.Attribute.Required;
    email: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    hoursNote: Schema.Attribute.String;
    labels: Schema.Attribute.Component<'blocks.contact-labels', false> &
      Schema.Attribute.Required;
    mapEmbedUrl: Schema.Attribute.String;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
    phoneHref: Schema.Attribute.String;
    subheading: Schema.Attribute.String;
  };
}

export interface BlocksContactAddress extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contact_addresses';
  info: {
    description: 'Structured postal address for the contact block';
    displayName: 'Contact \u2014 Address';
    icon: 'map-pin';
    name: 'ContactAddress';
  };
  attributes: {
    city: Schema.Attribute.String & Schema.Attribute.Required;
    country: Schema.Attribute.String;
    postalCode: Schema.Attribute.String & Schema.Attribute.Required;
    street: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksContactLabels extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contact_labels';
  info: {
    description: 'Translatable UI strings for the contact block';
    displayName: 'Contact \u2014 UI Labels';
    icon: 'translate';
    name: 'ContactLabels';
  };
  attributes: {
    addressHeading: Schema.Attribute.String & Schema.Attribute.Required;
    directionsLinkText: Schema.Attribute.String & Schema.Attribute.Required;
    emailHeading: Schema.Attribute.String & Schema.Attribute.Required;
    mapFallbackTitle: Schema.Attribute.String & Schema.Attribute.Required;
    mapFullscreenLink: Schema.Attribute.String & Schema.Attribute.Required;
    mapIframeTitle: Schema.Attribute.String & Schema.Attribute.Required;
    phoneHeading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_blocks_cta_banners';
  info: {
    description: 'Full-width call-to-action strip with heading, optional subheading, and a single CTA';
    displayName: 'CTA Banner';
    icon: 'megaphone';
    name: 'CtaBanner';
  };
  attributes: {
    background: Schema.Attribute.Enumeration<['primary', 'muted', 'dark']> &
      Schema.Attribute.DefaultTo<'primary'>;
    cta: Schema.Attribute.Component<'shared.cta-link', false> &
      Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.String;
  };
}

export interface BlocksFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_faq_items';
  info: {
    description: 'A single FAQ question and answer pair';
    displayName: 'FAQ Item';
    icon: 'question-circle';
    name: 'FaqItem';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface BlocksGuidedTourExperience extends Struct.ComponentSchema {
  collectionName: 'components_blocks_guided_tour_experiences';
  info: {
    description: 'Guided tours section with heading and experience cards';
    displayName: 'Guided Tour \u2014 Experience';
    icon: 'map';
    name: 'GuidedTourExperience';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'blocks.guided-tour-item', true> &
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

export interface BlocksGuidedTourItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_guided_tour_items';
  info: {
    description: 'A single tour experience card with icon, title, and description';
    displayName: 'Guided Tour \u2014 Item';
    icon: 'route';
    name: 'GuidedTourItem';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.Enumeration<['route', 'coach', 'group', 'safety']> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    description: 'Full-viewport hero with headline, optional subheadline, background image, and CTA buttons';
    displayName: 'Hero';
    icon: 'landscape';
    name: 'Hero';
  };
  attributes: {
    backgroundFit: Schema.Attribute.Enumeration<['cover', 'contain']> &
      Schema.Attribute.DefaultTo<'cover'>;
    backgroundImage: Schema.Attribute.String & Schema.Attribute.Required;
    cta: Schema.Attribute.Component<'shared.cta-link', false> &
      Schema.Attribute.Required;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    overlay: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0.3>;
    secondaryCta: Schema.Attribute.Component<'shared.cta-link', false>;
    subheadline: Schema.Attribute.String;
  };
}

export interface BlocksImageGallery extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_galleries';
  info: {
    description: 'Responsive image grid with optional lightbox';
    displayName: 'Image Gallery';
    icon: 'grid';
    name: 'ImageGallery';
  };
  attributes: {
    columns: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    heading: Schema.Attribute.String;
    images: Schema.Attribute.Component<'shared.image-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    lightbox: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface BlocksImageText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_texts';
  info: {
    description: 'Two-column section with an image and text copy side by side';
    displayName: 'Image + Text';
    icon: 'layout';
    name: 'ImageText';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    cta: Schema.Attribute.Component<'shared.cta-link', false>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Component<'shared.image-item', false> &
      Schema.Attribute.Required;
    layout: Schema.Attribute.Enumeration<['image-left', 'image-right']> &
      Schema.Attribute.DefaultTo<'image-left'>;
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

export interface BlocksProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_blocks_process_steps';
  info: {
    description: 'A single how-it-works step with optional icon, duration, and bullet details';
    displayName: 'Process Step';
    icon: 'check-circle';
    name: 'ProcessStep';
  };
  attributes: {
    description: Schema.Attribute.Text;
    details: Schema.Attribute.Text;
    duration: Schema.Attribute.String;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    description: 'Free-form HTML / rich text content block';
    displayName: 'Rich Text';
    icon: 'file-alt';
    name: 'RichText';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface BlocksSectionHeader extends Struct.ComponentSchema {
  collectionName: 'components_blocks_section_headers';
  info: {
    description: 'Standalone heading + optional subheading, centered or left-aligned';
    displayName: 'Section Header';
    icon: 'heading';
    name: 'SectionHeader';
  };
  attributes: {
    centered: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.String;
  };
}

export interface BlocksServiceContact extends Struct.ComponentSchema {
  collectionName: 'components_blocks_service_contacts';
  info: {
    description: 'Service page contact strip with heading, phone, email, and optional CTA text';
    displayName: 'Service \u2014 Contact CTA';
    icon: 'envelope';
    name: 'ServiceContact';
  };
  attributes: {
    ctaText: Schema.Attribute.String;
    email: Schema.Attribute.String & Schema.Attribute.Required;
    emailHref: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
    phoneHref: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

export interface BlocksServiceFaq extends Struct.ComponentSchema {
  collectionName: 'components_blocks_service_faqs';
  info: {
    description: 'FAQ accordion with heading and optional contact CTA at the bottom';
    displayName: 'Service \u2014 FAQ';
    icon: 'comments';
    name: 'ServiceFaq';
  };
  attributes: {
    contactCtaHref: Schema.Attribute.String;
    contactCtaLabel: Schema.Attribute.String;
    contactCtaText: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'blocks.faq-item', true> &
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

export interface BlocksServiceProcess extends Struct.ComponentSchema {
  collectionName: 'components_blocks_service_processes';
  info: {
    description: 'How-it-works / process steps section with numbered step cards';
    displayName: 'Service \u2014 Process';
    icon: 'tasks';
    name: 'ServiceProcess';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    steps: Schema.Attribute.Component<'blocks.process-step', true> &
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

export interface BlocksStatsBar extends Struct.ComponentSchema {
  collectionName: 'components_blocks_stats_bars';
  info: {
    description: 'Social-proof strip with a row of stat value + label pairs';
    displayName: 'Stats Bar';
    icon: 'chart-bar';
    name: 'StatsBar';
  };
  attributes: {
    stats: Schema.Attribute.Component<'shared.stat-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
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
      'blocks.about-person': BlocksAboutPerson;
      'blocks.about-story': BlocksAboutStory;
      'blocks.about-value-item': BlocksAboutValueItem;
      'blocks.about-values': BlocksAboutValues;
      'blocks.bike-detail': BlocksBikeDetail;
      'blocks.bike-detail-labels': BlocksBikeDetailLabels;
      'blocks.bike-school-intro': BlocksBikeSchoolIntro;
      'blocks.bike-school-program': BlocksBikeSchoolProgram;
      'blocks.bike-school-program-item': BlocksBikeSchoolProgramItem;
      'blocks.contact': BlocksContact;
      'blocks.contact-address': BlocksContactAddress;
      'blocks.contact-labels': BlocksContactLabels;
      'blocks.cta-banner': BlocksCtaBanner;
      'blocks.faq-item': BlocksFaqItem;
      'blocks.gallery': BlocksGallery;
      'blocks.guided-tour-experience': BlocksGuidedTourExperience;
      'blocks.guided-tour-item': BlocksGuidedTourItem;
      'blocks.hero': BlocksHero;
      'blocks.image-gallery': BlocksImageGallery;
      'blocks.image-text': BlocksImageText;
      'blocks.partner-item': BlocksPartnerItem;
      'blocks.partners-gallery': BlocksPartnersGallery;
      'blocks.process-step': BlocksProcessStep;
      'blocks.product-list': BlocksProductList;
      'blocks.rich-text': BlocksRichText;
      'blocks.section-header': BlocksSectionHeader;
      'blocks.service-contact': BlocksServiceContact;
      'blocks.service-faq': BlocksServiceFaq;
      'blocks.service-package': BlocksServicePackage;
      'blocks.service-pricing': BlocksServicePricing;
      'blocks.service-process': BlocksServiceProcess;
      'blocks.stats-bar': BlocksStatsBar;
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
