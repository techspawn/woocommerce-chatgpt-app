# WooCommerce ChatGPT App 🛍️

**Start selling your WooCommerce store items on ChatGPT with 800 million monthly active users!**

This app integrates your WooCommerce store with ChatGPT using Apps SDK, allowing users to browse and discover your products directly within ChatGPT conversations. Perfect for reaching a massive audience and driving traffic to your store.

## 🎮 Demo

- **ChatGPT SDK App / MCP Link**: [https://woo-chatgpt-app.up.railway.app/mcp](https://woo-chatgpt-app.up.railway.app/mcp)
- **WooCommerce Site**: [https://woochatgptapp.techspawn.com](https://woochatgptapp.techspawn.com)

> **Note**: Demo MCP server is connected to the WooCommerce site. Connect it to ChatGPT using the MCP link above to test.

## 🎯 What This App Does

Transform ChatGPT into a powerful shopping assistant for your WooCommerce store. Users can:
- 📦 Browse your entire product catalog
- 🔍 Search for specific products
- 💰 View prices, images, and descriptions
- 📊 Check real-time stock availability
- ⭐ See product ratings and reviews
- 🏷️ Filter by categories
- 🔗 Click through to your store to complete purchases

## 📦 Versions

### Free Version (Catalog Mode)
This is the **free catalog mode** version that displays your products in ChatGPT with direct links to your WooCommerce store.

**Features:**
- ✅ Product listing and browsing
- ✅ Product search and filtering
- ✅ Category filtering
- ✅ Product images, prices, and descriptions
- ✅ Support variations products
- ✅ Direct links to your store

**Limitations:**
- ❌ No shopping cart functionality
- ❌ No checkout integration
- ❌ Products redirect to your store for purchase

### Pro Version (Beta - Paid)
The **paid/pro version** includes everything from Lite plus:

**Additional Features:**
- ✅ Shopping cart functionality
- ✅ Direct checkout integration
- ✅ Add to cart from ChatGPT
- ✅ Product variations support
- ✅ Full product details view
- ✅ Complete purchase flow within ChatGPT

**Interested in Pro Version?** [Contact us](https://techspawn.com/connect-with-techspawn/)

---

## 🚀 Setup (4 Steps)

### Step 1: Clone & Install

```bash
git clone https://github.com/techspawn/woocommerce-chatgpt-app.git
cd woocommerce-chatgpt-app
```

### Step 2: Get WooCommerce API Credentials

1. WordPress Admin → **WooCommerce** → **Settings** → **Advanced** → **REST API**
2. Click **Add Key** → Description: `ChatGPT App` → Permissions: `Read`
3. Copy **Consumer Key** and **Consumer Secret**

### Step 3: Configure .env

```bash
cp .env.example .env
```

Edit `.env` file:
```env
WC_SITE_URL=https://your-store.com
WC_CONSUMER_KEY=ck_your_key_here
WC_CONSUMER_SECRET=cs_your_secret_here
PORT=3000
```

### Step 4: Run Setup & Start

**Using setup script:**
```bash
chmod +x setup.sh && ./setup.sh
npm start
```

**Or manually:**
```bash
npm install
npm run build
npm start
```

Visit `http://localhost:3000/index.html` to test.

---

## 🤖 Connect to ChatGPT

This is a **ChatGPT App** using the [OpenAI Apps SDK](https://openai.com/index/introducing-apps-in-chatgpt/). Follow these steps to enable Developer Mode and connect your app:

### Step 1: Enable Developer Mode

1. Go to [ChatGPT](https://chat.openai.com/) and log in
2. Click your **profile icon** (top-right corner)
3. Select **Settings**
4. Navigate to **Apps & Connectors**
5. Scroll down to **Advanced Settings**
6. Toggle **Developer Mode** to **On**

⚠️ **Note**: Developer Mode is available for ChatGPT Plus, Pro, Go, and Free plans. Business, Enterprise, or Education plans do not currently support ChatGPT Apps.

### Step 2: Create Your App Connector

1. With Developer Mode enabled, go back to **Apps & Connectors**
2. Click **Create** button
3. Fill in your app details:
   - **Name**: Your Store Name - Products
   - **Description**: `Browse products from [Your Store Name]`
   - **MCP Server URL**: Your deployed server URL (e.g., `https://yourapp.railway.app`)

### Step 3: Configure API Integration

1. In your connector settings, add the API schema:
2. Paste this schema (replace `YOUR_SERVER_URL` with your deployed server URL):

```json
{
  "openapi": "3.1.0",
  "info": {"title": "WooCommerce Products API", "version": "1.0.0"},
  "servers": [{"url": "YOUR_SERVER_URL"}],
  "paths": {
    "/mcp": {
      "post": {
        "operationId": "getProducts",
        "summary": "Get products from WooCommerce",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["method", "params"],
                "properties": {
                  "method": {"type": "string", "enum": ["tools/call"]},
                  "params": {
                    "type": "object",
                    "required": ["name", "arguments"],
                    "properties": {
                      "name": {"type": "string", "enum": ["get_products"]},
                      "arguments": {
                        "type": "object",
                        "properties": {
                          "per_page": {"type": "number"},
                          "search": {"type": "string"},
                          "category": {"type": "string"}
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {"200": {"description": "Success"}}
      }
    }
  }
}
```

3. Click **Save**

### Step 4: Test Your App

1. Open a **new chat** in ChatGPT
2. Select your newly created connector from the available tools
3. Test with prompts like:
   - "Show me your products"
   - "Search for iPhone"
   - "What products do you have?"
4. Verify products are displayed correctly

### Step 5: Submit to ChatGPT App Store

Once tested and working, you can submit your app to the ChatGPT App Store for public use.

## 📸 Screenshot

![WooCommerce ChatGPT App Screenshot 1](https://techspawn.com/wp-content/uploads/2025/11/Screenshot-2025-11-17-at-1.08.35-PM.png)

![WooCommerce ChatGPT App Screenshot 2](https://techspawn.com/wp-content/uploads/2025/11/Screenshot-2025-11-17-at-1.08.56-PM.png)

![WooCommerce ChatGPT App Screenshot 3](https://techspawn.com/wp-content/uploads/2025/11/Screenshot-2025-11-17-at-1.06.00-PM.png)

![WooCommerce ChatGPT App Screenshot 4](https://techspawn.com/wp-content/uploads/2025/11/Screenshot-2025-11-17-at-1.06.37-PM.png)

![WooCommerce ChatGPT App Screenshot 5](https://techspawn.com/wp-content/uploads/2025/11/Screenshot-2025-11-17-at-1.06.57-PM.png)

**Learn more:** 
- [Introducing Apps in ChatGPT](https://openai.com/index/introducing-apps-in-chatgpt/)
- [OpenAI Apps SDK Documentation](https://developers.openai.com/apps-sdk)

---

## 🐛 Troubleshooting

- **Server won't start?** Check Node.js v16+, run `npm run build` first
- **Products not loading?** Verify `.env` file has correct credentials
- **ChatGPT can't connect?** Make sure server URL uses HTTPS, test at `/health`

[Need Help?](https://techspawn.com/connect-with-techspawn/)

---

**Built with ❤️ for the WooCommerce community**

---

## 🚀 Deploy on Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/woocommerce-chatgpt-app?referralCode=NFPJfk&utm_medium=integration&utm_source=template&utm_campaign=generic)
