import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { convertPageBlocks } from './page-composition/convert-section-children';
import { stripUnpersistedRootIds } from './page-composition/sanitize-root-ids';
import { validatePageBlocks } from './page-composition/validate';

const PAGE_UID = 'api::page.page';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (context, next) => {
      if (
        context.uid !== PAGE_UID ||
        (context.action !== 'create' && context.action !== 'update')
      ) {
        return next();
      }

      const data = (
        context.params as { data?: { blocks?: unknown; tenant?: string } }
      ).data;
      if (!data || data.blocks === undefined) {
        return next();
      }

      try {
        data.blocks = stripUnpersistedRootIds(
          convertPageBlocks(data.blocks),
          context.action === 'create' ? { persisted: [] } : undefined
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Invalid page composition';
        throw new errors.ValidationError(message, {
          errors: [{ path: ['blocks'], message }],
        });
      }

      const result = validatePageBlocks(data.blocks, data.tenant);
      if (result.ok === false) {
        throw new errors.ValidationError(result.message, {
          errors: [{ path: ['blocks'], message: result.message }],
        });
      }

      return next();
    });
  },

  bootstrap() {},
};
