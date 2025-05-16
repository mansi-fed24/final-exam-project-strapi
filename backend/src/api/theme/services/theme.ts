/**
 * theme service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::theme.theme', ({ strapi }) => ({
  async getActiveTheme() {
    const activeTheme = await strapi.db.query('api::theme.theme').findOne({
      where: { isActive: true },
    });

    return activeTheme;
  },
}));
