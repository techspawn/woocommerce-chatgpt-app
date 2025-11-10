#!/bin/bash

set -e

echo "WooCommerce ChatGPT App - Setup"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env if missing
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
    else
        cat > .env << EOF
PORT=3000
WC_SITE_URL=https://your-store.com
WC_CONSUMER_KEY=ck_your_consumer_key_here
WC_CONSUMER_SECRET=cs_your_consumer_secret_here
CORS_ORIGIN=*
EOF
        echo "✅ Created .env file"
    fi
    echo "⚠️  Make sure to edit .env with your WooCommerce credentials"
    echo ""
else
    echo "ℹ️  .env file already exists"
    echo ""
fi

# Build
echo "🔨 Building application..."
npm run build
echo "✅ Build complete"
echo ""

echo "Setup complete! Next steps:"
echo "1. Edit .env with your WooCommerce credentials (if not done)"
echo "2. Run 'npm start' to start the server"
echo ""
