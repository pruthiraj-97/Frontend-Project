#!/bin/bash

echo "Installing backend dependencies..."
cd backend
npm config set registry https://registry.npmjs.org
npm config delete proxy
npm config delete https-proxy
npm install --no-proxy --registry=https://registry.npmjs.org

echo ""
echo "Installing frontend dependencies..."
cd ..
npm config set registry https://registry.npmjs.org
npm config delete proxy
npm config delete https-proxy
npm install --no-proxy --registry=https://registry.npmjs.org

echo ""
echo "Installation complete!"
echo ""
echo "To start backend: cd backend && npm start"
echo "To start frontend: npm start"

