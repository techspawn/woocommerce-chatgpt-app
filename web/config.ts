/**
 * Client Configuration
 * 
 * Configure the MCP server and WooCommerce store URLs here.
 */

export const CONFIG = {
  // MCP Server URL (where your Node.js server is running)
  MCP_URL: 'Your_MCP_Server_URL_Here',
  
  // WooCommerce Store URL (for direct product links)
  STORE_URL: 'Your_WooCommerce_Store_URL_Here',
  
  // WooCommerce REST API Credentials (needed for API calls)
  CONSUMER_KEY: 'ck_yourconsumerkey',
  CONSUMER_SECRET: 'cs_yourconsumersecret',
};

// Helper function to get product URL on WooCommerce store
export function getProductUrl(slug: string): string {
  return `${CONFIG.STORE_URL}/product/${slug}`;
}

// Helper function to build WooCommerce API URLs
export function getWooCommerceApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${CONFIG.STORE_URL}/wp-json/wc/v3${cleanEndpoint}?consumer_key=${CONFIG.CONSUMER_KEY}&consumer_secret=${CONFIG.CONSUMER_SECRET}`;
}
