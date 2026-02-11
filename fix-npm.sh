#!/bin/bash

# HouseMate - NPM Installation Fix Script
# This script fixes the corporate proxy issue

echo "🔧 Fixing NPM Configuration..."
echo ""

# Backup global npmrc
if [ -f ~/.npmrc ]; then
    echo "📦 Backing up global .npmrc to ~/.npmrc.backup"
    cp ~/.npmrc ~/.npmrc.backup
fi

# Temporarily override global npm config
echo "⚙️  Setting npm to use public registry..."
npm config set registry https://registry.npmjs.org/ --location=user
npm config delete proxy --location=user 2>/dev/null
npm config delete https-proxy --location=user 2>/dev/null
npm config delete http-proxy --location=user 2>/dev/null

echo ""
echo "✅ NPM configuration updated!"
echo ""
echo "📦 Now installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend dependencies installed successfully!"
    echo ""
    echo "📦 Now installing frontend dependencies..."
    cd ..
    npm install
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Frontend dependencies installed successfully!"
        echo ""
        echo "🎉 Installation Complete!"
        echo ""
        echo "To start the servers:"
        echo ""
        echo "Terminal 1 - Backend:"
        echo "  cd backend"
        echo "  npm start"
        echo ""
        echo "Terminal 2 - Frontend:"
        echo "  npm start"
        echo ""
    else
        echo ""
        echo "❌ Frontend installation failed"
        echo "Try using yarn instead: brew install yarn && yarn install"
    fi
else
    echo ""
    echo "❌ Backend installation failed"
    echo "Try using yarn instead: brew install yarn && cd backend && yarn install"
fi

echo ""
echo "To restore your original npm config:"
echo "  mv ~/.npmrc.backup ~/.npmrc"

