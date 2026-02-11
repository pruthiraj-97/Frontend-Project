#!/bin/bash

echo "=== Fixing NPM Proxy Configuration ==="
echo ""

echo "Step 1: Backing up your global .npmrc"
cp ~/.npmrc ~/.npmrc.backup.$(date +%Y%m%d_%H%M%S)

echo "Step 2: Temporarily overriding global npm config"
npm config set registry https://registry.npmjs.org --location=user
npm config delete proxy --location=user 2>/dev/null
npm config delete https-proxy --location=user 2>/dev/null
npm config delete http-proxy --location=user 2>/dev/null

echo "Step 3: Clearing environment variables"
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy

echo "Step 4: Installing backend dependencies"
cd backend
npm install --registry=https://registry.npmjs.org

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed!"
    
    echo "Step 5: Installing frontend dependencies"
    cd ..
    npm install --registry=https://registry.npmjs.org
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed!"
        echo ""
        echo "=== Installation Complete! ==="
        echo ""
        echo "To start the servers:"
        echo "Terminal 1: cd backend && npm start"
        echo "Terminal 2: npm start"
        echo ""
        echo "To restore your corporate proxy:"
        echo "mv ~/.npmrc.backup.* ~/.npmrc"
    else
        echo "❌ Frontend installation failed"
    fi
else
    echo "❌ Backend installation failed"
fi

