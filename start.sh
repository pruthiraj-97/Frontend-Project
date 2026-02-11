#!/bin/bash

# HouseMate Quick Start Script
# This script helps you get the application running quickly

echo "🏠 HouseMate - Quick Start Script"
echo "=================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo "This may take a few minutes..."
    echo ""
    
    # Try npm install first
    if npm install --registry=https://registry.npmjs.org/; then
        echo "✅ Dependencies installed successfully!"
    else
        echo "⚠️  npm install failed. Trying with yarn..."
        if command -v yarn &> /dev/null; then
            yarn install
            echo "✅ Dependencies installed with yarn!"
        else
            echo "❌ Installation failed. Please run 'npm install' manually."
            exit 1
        fi
    fi
else
    echo "✅ Dependencies already installed (node_modules found)"
fi

echo ""
echo "🚀 Starting HouseMate..."
echo ""
echo "📍 Frontend will be available at: http://localhost:4200"
echo "📍 Backend API will be available at: http://localhost:3000"
echo ""
echo "🔑 Test Credentials:"
echo "   Customer - Phone: 9876543210, Password: password123"
echo "   Expert   - Phone: 9876543211, Password: password123"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start both servers
npm run dev

