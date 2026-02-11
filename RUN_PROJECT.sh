#!/bin/bash

# HouseMate - Project Startup Script
# This script will install dependencies and start both backend and frontend servers

echo "🏠 HouseMate - Starting Project Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install Backend Dependencies
echo -e "${BLUE}📦 Step 1: Installing Backend Dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend installation had issues. Please check manually.${NC}"
fi
echo ""

# Step 2: Install Frontend Dependencies
echo -e "${BLUE}📦 Step 2: Installing Frontend Dependencies...${NC}"
cd ..
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend installation had issues. Please check manually.${NC}"
fi
echo ""

# Step 3: Instructions to start servers
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo "======================================"
echo "🚀 How to Start the Servers:"
echo "======================================"
echo ""
echo -e "${BLUE}Terminal 1 - Backend Server:${NC}"
echo "  cd backend"
echo "  npm start"
echo "  → Backend will run on http://localhost:3000"
echo ""
echo -e "${BLUE}Terminal 2 - Frontend Server:${NC}"
echo "  npm start"
echo "  → Frontend will run on http://localhost:4200"
echo ""
echo "======================================"
echo "🌐 Access URLs:"
echo "======================================"
echo ""
echo "  Frontend: http://localhost:4200"
echo "  Backend:  http://localhost:3000"
echo ""
echo "======================================"
echo "👥 Test Accounts:"
echo "======================================"
echo ""
echo "  Customer:"
echo "    Phone: +919876543210"
echo "    Password: Str0ngP@ssw0rd!"
echo ""
echo "  Expert:"
echo "    Phone: +919876543211"
echo "    Password: Str0ngP@ssw0rd!"
echo ""
echo "======================================"
echo -e "${GREEN}🎉 Setup Complete! Follow the instructions above to start the servers.${NC}"
echo "======================================"

