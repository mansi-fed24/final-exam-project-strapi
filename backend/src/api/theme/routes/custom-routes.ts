export default {
  routes: [
    {
      method: 'GET',
      path: '/active-theme',
      handler: 'theme.getActiveTheme',
      config: {
        auth: false,
      },
    },
  ],
};
// This code defines a custom route for the theme API in Strapi. It adds a new GET endpoint at `/active-theme` that calls the `getActiveTheme` method in the theme controller. The route is configured to not require authentication.
// This allows users to fetch the active theme without needing to be logged in. The controller method is responsible for retrieving the active theme from the database and sending it back in the response.