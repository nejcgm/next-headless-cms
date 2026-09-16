import type { ComponentType } from 'react';
import type { StrapiApp } from '@strapi/strapi/admin';
import { PageCompositionHost } from './page-composition/PageCompositionHost';

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    app.addFields({
      type: 'dynamiczone',
      Component: PageCompositionHost as ComponentType,
    });
  },
};
