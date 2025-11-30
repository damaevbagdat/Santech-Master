#!/bin/bash

# Deploy script for Santech-Master
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project directory?${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
git pull origin main

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# Build project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

# Restart PM2 process
echo -e "${YELLOW}🔄 Restarting PM2 process...${NC}"
if pm2 list | grep -q "santech-master"; then
    pm2 restart santech-master
else
    pm2 start npm --name "santech-master" -- run preview -- --port 4321 --host 0.0.0.0
fi

# Save PM2 configuration
pm2 save

# Check status
echo -e "${YELLOW}📊 Checking PM2 status...${NC}"
pm2 status santech-master

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Site is live at: http://santech-master.com${NC}"
