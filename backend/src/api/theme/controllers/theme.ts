/**
 * theme controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::theme.theme', ({ strapi }) => ({
  
  // Extend the default controller with the custom getActiveTheme method
  async getActiveTheme(ctx) {
    try {
      const activeTheme = await strapi.service('api::theme.theme').getActiveTheme();
      ctx.send(activeTheme);
    } catch (error) {
      ctx.send({ error: 'Unable to fetch active theme' });
    }
  },

}));