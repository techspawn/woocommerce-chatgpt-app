/**
 * Server Configuration
 * 
 * Configure your WooCommerce store settings here.
 * You can use environment variables or hardcode the values.
 */

export const SERVER_CONFIG = {
  // Server Port
  PORT: process.env.PORT || 3000,

  // WooCommerce Store Settings
  WOOCOMMERCE: {
    // Your WooCommerce store URL (without trailing slash)
    SITE_URL: process.env.WC_SITE_URL || 'https://yourwoocommercestore',
    
    // WooCommerce REST API Consumer Key
    CONSUMER_KEY: process.env.WC_CONSUMER_KEY || 'ck_yourconsumerkey',
    
    // WooCommerce REST API Consumer Secret
    CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET || 'cs_yourconsumersecret',
  },

  // CORS Settings
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || '*',
  }
};

// Helper function to build WooCommerce API URL
export function getWooCommerceApiUrl(endpoint: string): string {
  const baseUrl = SERVER_CONFIG.WOOCOMMERCE.SITE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/wp-json/wc/v3${cleanEndpoint}`;
}
