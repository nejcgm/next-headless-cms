import type { Core } from '@strapi/strapi';

const PAGE_UID = 'api::page.page';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: [env('PREVIEW_BASE_URL')],
      async handler(uid, { documentId, locale, status }) {
        if (uid !== PAGE_UID || !documentId) return undefined;

        const page = await strapi.documents(PAGE_UID).findOne({
          documentId,
          locale,
          fields: ['slug'],
        });
        if (!page?.slug) return undefined;

        void status;
        const params = new URLSearchParams({
          secret: env('PREVIEW_SECRET'),
          slug: page.slug,
        });
        return `${env('PREVIEW_BASE_URL')}/api/preview?${params.toString()}`;
      },
    },
  },
});

export default config;
