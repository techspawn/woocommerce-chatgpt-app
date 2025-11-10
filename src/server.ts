import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { SERVER_CONFIG, getWooCommerceApiUrl } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Add headers for ngrok and ChatGPT compatibility
app.use((req, res, next) => {
  // Bypass ngrok browser warning
  res.setHeader('ngrok-skip-browser-warning', 'true');
  
  // Security headers for ChatGPT
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Allow ChatGPT to access the endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.static('public'));

// MCP Protocol 2024-11-05
const MCP_PROTOCOL_VERSION = '2024-11-05';

/**
 * MCP Endpoint - Get Products
 * 
 * Fetches products from WooCommerce REST API
 */
app.post('/mcp', async (req, res) => {
  try {
    const message = req.body;
    console.log('MCP Request:', message.method);

    let result: any;

    if (message.method === 'initialize') {
      result = {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: 'woocommerce-app-lite', version: '1.0.0' },
      };
    } else if (message.method === 'notifications/initialized') {
      return res.status(200).end();
    } else if (message.method === 'tools/list') {
      result = {
        tools: [
          {
            name: 'get_products',
            description: 'Fetch products from WooCommerce store. Returns product list with names, prices, images, stock status, and direct links to product pages.',
            inputSchema: {
              type: 'object',
              properties: {
                per_page: {
                  type: 'number',
                  description: 'Number of products to fetch (default: 20, max: 100)',
                  default: 20
                },
                page: {
                  type: 'number',
                  description: 'Page number for pagination (default: 1)',
                  default: 1
                },
                category: {
                  type: 'string',
                  description: 'Filter by category slug (optional)'
                },
                search: {
                  type: 'string',
                  description: 'Search products by name (optional)'
                }
              }
            },
            _meta: {
              'openai/outputTemplate': 'ui://widget/product-list-lite.html',
              'openai/toolInvocation/invoking': 'Loading products',
              'openai/toolInvocation/invoked': 'Products ready',
              'openai/widgetAccessible': true,
              'openai/resultCanProduceWidget': true,
            }
          }
        ]
      };
    } else if (message.method === 'resources/list') {
      result = {
        resources: [
          {
            uri: 'widget://product-list-lite',
            name: 'Product List',
            description: 'Interactive UI for browsing WooCommerce products',
            mimeType: 'text/html',
          },
        ],
      };
    } else if (message.method === 'resources/read') {
      const { uri } = message.params;

      let widgetName = uri.replace('ui://widget/', '').replace('.html', '');
      const jsPath = join(__dirname, '../web/dist', `${widgetName}.js`);

      if (existsSync(jsPath)) {
        const jsContent = readFileSync(jsPath, 'utf-8');
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
${jsContent}
  </script>
</body>
</html>`;
        result = {
          contents: [
            {
              uri,
              mimeType: 'text/html',
              text: html,
            },
          ],
        };
      } else {
        throw new Error(`Widget not found: ${widgetName}`);
      }
    } else if (message.method === 'tools/call') {
      const { name, arguments: args } = message.params;

      if (name === 'get_products') {
        const perPage = args?.per_page || 20;
        const page = args?.page || 1;
        const category = args?.category || '';
        const search = args?.search || '';

        // Build WooCommerce API URL with parameters
        let apiUrl = getWooCommerceApiUrl('/products');
        const queryParams = new URLSearchParams({
          per_page: perPage.toString(),
          page: page.toString(),
          consumer_key: SERVER_CONFIG.WOOCOMMERCE.CONSUMER_KEY,
          consumer_secret: SERVER_CONFIG.WOOCOMMERCE.CONSUMER_SECRET,
        });

        if (category) {
          queryParams.append('category', category);
        }
        if (search) {
          queryParams.append('search', search);
        }

        apiUrl += `?${queryParams.toString()}`;

        console.log('Fetching products from WooCommerce API...');
        
        // Fetch products from WooCommerce with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25 second timeout
        
        try {
          const response = await fetch(apiUrl, {
            signal: controller.signal
          });
          clearTimeout(timeout);
          
          if (!response.ok) {
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
          }

          const products: any = await response.json();
          console.log(`Successfully fetched ${products.length} products`);

          const summary = search 
            ? `Found ${products.length} products matching "${search}"`
            : `Showing ${products.length} products`;

          // Return products in MCP format with widget metadata
          result = {
            content: [
              {
                type: 'text',
                text: summary
              }
            ],
            structuredContent: {
              products: products,
              searchTerm: search,
              category: category,
              page: page,
              per_page: perPage
            },
            _meta: {
              'openai/outputTemplate': 'ui://widget/product-list-lite.html',
              'openai/toolInvocation/invoking': 'Loading products',
              'openai/toolInvocation/invoked': 'Products ready',
              'openai/widgetAccessible': true,
              'openai/resultCanProduceWidget': true,
              total: products.length,
              page: page,
              per_page: perPage
            }
          };
        } catch (fetchError: any) {
          clearTimeout(timeout);
          console.error('WooCommerce API fetch error:', fetchError);
          throw new Error(`Failed to fetch products: ${fetchError.message}`);
        }
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    } else {
      throw new Error(`Unsupported method: ${message.method}`);
    }

    res.json({ jsonrpc: '2.0', id: message.id, result });
  } catch (error: any) {
    console.error('MCP Error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: error.message,
      },
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'WooCommerce ChatGPT App',
    version: '1.0.0',
    status: 'running',
    protocol: MCP_PROTOCOL_VERSION,
    store: SERVER_CONFIG.WOOCOMMERCE.SITE_URL,
    endpoints: {
      mcp: '/mcp',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: MCP_PROTOCOL_VERSION,
    store: SERVER_CONFIG.WOOCOMMERCE.SITE_URL
  });
});

// Start server
const PORT = SERVER_CONFIG.PORT;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   WooCommerce ChatGPT App                    ║
╚═══════════════════════════════════════════════╝

MCP Server running on port ${PORT}
Store: ${SERVER_CONFIG.WOOCOMMERCE.SITE_URL}
Protocol: ${MCP_PROTOCOL_VERSION}

Endpoints:
  POST /mcp          - MCP protocol endpoint
  GET  /health       - Health check
  
Ready to accept connections!
  `);
});
